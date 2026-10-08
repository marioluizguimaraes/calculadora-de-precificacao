import type {
  BusinessProfile,
  CostGroup,
  PricingResult,
  PricingWarning,
  QuoteDraft,
  Stage,
  StageSummary,
} from '../types';

import {
  allocate,
  dailyDepreciation,
  daysFromHours,
  fuelCost,
  hourlyCost,
  markup,
  productiveHours,
  roundUpPrice,
  teamMemberCost,
} from './formulas';

export const STAGES: readonly Stage[] = ['pre', 'producao', 'pos'];

/** Margem de lucro abaixo disso fica fora da referência de mercado (20–30%). */
export const LOW_PROFIT_THRESHOLD_PCT = 15;

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

/**
 * Calcula o preço de um orçamento a partir do perfil do negócio e do rascunho.
 *
 * custo unitário = mão de obra (custo/hora × horas) + equipe + equipamentos + logística
 * preço          = custo unitário × markup, com markup = 100 ÷ [100 − (DV + LP)]
 */
export function calculatePricing(draft: QuoteDraft, profile: BusinessProfile): PricingResult {
  const warnings: PricingWarning[] = [];

  // 1. Custo da hora
  const monthlyCents = sum(profile.fixedCosts.map((c) => c.monthlyCents)) + profile.proLaboreCents;
  const productiveHoursPerMonth = productiveHours(profile.workDaysPerMonth, profile.hoursPerDay);
  const hourlyCostCents = hourlyCost(monthlyCents, productiveHoursPerMonth);
  if (hourlyCostCents <= 0) {
    warnings.push({
      code: 'perfil-incompleto',
      message: 'Informe seus custos mensais e sua jornada para calcular o valor da sua hora.',
    });
  }

  // 2. Horas e dias por etapa
  const hoursBy = (stage: Stage) =>
    sum(draft.services.filter((s) => s.stage === stage).map((s) => Math.max(0, s.hours)));
  const stageHours = { pre: hoursBy('pre'), producao: hoursBy('producao'), pos: hoursBy('pos') };
  const stageDays = {
    pre: daysFromHours(stageHours.pre, profile.hoursPerDay),
    producao: daysFromHours(stageHours.producao, profile.hoursPerDay),
    pos: daysFromHours(stageHours.pos, profile.hoursPerDay),
  };
  const totalHours = stageHours.pre + stageHours.producao + stageHours.pos;
  if (draft.services.length === 0) {
    warnings.push({
      code: 'sem-servicos',
      message: 'Escolha ao menos um serviço para montar o orçamento.',
    });
  }
  const captureDays = stageDays.producao;

  // 3. Equipe
  const teamCost = (stage: Stage) =>
    sum(
      draft.team
        .filter((m) => m.stage === stage)
        .map((m) => teamMemberCost(m, { days: stageDays[m.stage], hours: stageHours[m.stage] })),
    );
  const peopleOnSet =
    1 + sum(draft.team.filter((m) => m.stage === 'producao').map((m) => Math.max(0, m.count)));

  // 4. Equipamentos: depreciação (próprio) ou diária de locação
  const equipmentItems = draft.equipment.map((item) => {
    const days = item.days ?? stageDays[item.stage];
    const daily =
      item.kind === 'owned'
        ? dailyDepreciation(
            item.purchaseCents,
            item.resaleCents,
            item.lifespanYears,
            profile.equipmentUseDaysPerYear,
          )
        : item.dailyRentCents;
    return { id: item.id, name: item.name, stage: item.stage, cents: Math.round(daily * days) };
  });
  const equipmentCost = (stage: Stage) =>
    sum(equipmentItems.filter((e) => e.stage === stage).map((e) => e.cents));

  // 5. Logística (custos variáveis do set)
  const l = draft.logistics;
  const trips = l.tripsCount ?? (captureDays === 0 ? 0 : l.lodgingNights > 0 ? 1 : captureDays);
  const distanceKm = draft.location.distanceKm ?? 0;
  const ownVehicle = l.transportMode === 'proprio';
  if (ownVehicle && draft.location.distanceKm === null && captureDays > 0) {
    warnings.push({
      code: 'sem-distancia',
      message: 'Sem a distância até o local, o deslocamento não entra no preço.',
    });
  }
  const logistics = {
    // Veículo próprio: combustível + pedágio. Valor fixo: tarifa × viagens (× pessoas, se for por pessoa).
    fuelCents: ownVehicle
      ? Math.round(fuelCost(distanceKm, trips, l.kmPerLiter, l.fuelPricePerLiterCents))
      : 0,
    tollsCents: ownVehicle ? l.tollsPerTripCents * trips : 0,
    fareCents: ownVehicle ? 0 : l.fareCents * trips * (l.farePerPerson ? peopleOnSet : 1),
    mealsCents: l.mealPerPersonDayCents * peopleOnSet * captureDays,
    lodgingCents: l.lodgingPerNightCents * l.lodgingNights * peopleOnSet,
    insuranceCents: l.insuranceCents,
    venueCents: l.venueCents,
    licensesCents: l.licensesCents,
    extrasCents: sum(l.extras.map((e) => e.cents)),
  };
  const logisticsTotal = sum(Object.values(logistics));

  // 6. Resumo por etapa (custo direto)
  const stageCosts = STAGES.map((stage) => {
    const laborCents = Math.round(hourlyCostCents * stageHours[stage]);
    const teamCents = teamCost(stage);
    const equipmentCents = equipmentCost(stage);
    const costCents =
      laborCents + teamCents + equipmentCents + (stage === 'producao' ? logisticsTotal : 0);
    return { stage, laborCents, teamCents, equipmentCents, costCents };
  });
  const laborCents = sum(stageCosts.map((s) => s.laborCents));
  const teamCents = sum(stageCosts.map((s) => s.teamCents));
  const equipmentCents = sum(stageCosts.map((s) => s.equipmentCents));
  const directCostCents = laborCents + teamCents + equipmentCents + logisticsTotal;

  // 7. Markup e preço (Sebrae, etapas 5–7)
  const p = draft.pricing;
  const variablePct = p.taxRatePct + p.paymentFeePct + p.commissionPct;
  const minMarkup = markup(variablePct, 0);
  const fullMarkup = markup(variablePct, p.profitPct);
  if (fullMarkup === null || minMarkup === null) {
    warnings.push({
      code: 'percentuais-invalidos',
      message: 'Impostos, taxas e lucro somam 100% ou mais — reduza algum percentual.',
    });
  } else if (p.profitPct < LOW_PROFIT_THRESHOLD_PCT) {
    warnings.push({
      code: 'margem-baixa',
      message: `Lucro de ${p.profitPct}% está abaixo da referência de mercado (20–30%).`,
    });
  }
  const safeMarkup = fullMarkup ?? 1;
  const minimumPriceCents = Math.round(directCostCents * (minMarkup ?? 1));
  const suggestedPriceCents = roundUpPrice(directCostCents * safeMarkup, p.roundToReais);

  const taxesCents = Math.round((suggestedPriceCents * p.taxRatePct) / 100);
  const feesCents = Math.round((suggestedPriceCents * p.paymentFeePct) / 100);
  const commissionCents = Math.round((suggestedPriceCents * p.commissionPct) / 100);
  // O lucro é o que sobra: garante que a composição some exatamente o preço.
  const profitCents =
    suggestedPriceCents - directCostCents - taxesCents - feesCents - commissionCents;

  // Margem de contribuição: o que sobra após custos e despesas variáveis (Sebrae, etapa 4).
  const rentedCents = sum(
    draft.equipment
      .filter((e) => e.kind === 'rented')
      .map((e) => equipmentItems.find((i) => i.id === e.id)?.cents ?? 0),
  );
  const contributionMarginCents =
    suggestedPriceCents -
    (teamCents + rentedCents + logisticsTotal + taxesCents + feesCents + commissionCents);

  const stagePrices = allocate(
    suggestedPriceCents,
    stageCosts.map((s) => s.costCents),
  );
  const stages = Object.fromEntries(
    stageCosts.map((s, i) => [
      s.stage,
      {
        ...s,
        hours: stageHours[s.stage],
        days: stageDays[s.stage],
        priceCents: stagePrices[i] ?? 0,
      } satisfies StageSummary,
    ]),
  ) as Record<Stage, StageSummary>;

  const composition: Record<CostGroup, number> = {
    trabalho: laborCents,
    equipe: teamCents,
    equipamentos: equipmentCents,
    logistica: logisticsTotal,
    impostos: taxesCents + feesCents + commissionCents,
    lucro: profitCents,
  };

  return {
    hourlyCostCents: Math.round(hourlyCostCents),
    productiveHoursPerMonth,
    totalHours,
    captureDays,
    peopleOnSet,
    trips,
    stages,
    equipmentItems: equipmentItems.map(({ id, name, cents }) => ({ id, name, cents })),
    logistics: { ...logistics, totalCents: logisticsTotal },
    laborCents,
    teamCents,
    equipmentCents,
    directCostCents,
    markup: safeMarkup,
    minimumPriceCents,
    suggestedPriceCents,
    taxesCents,
    feesCents,
    commissionCents,
    profitCents,
    contributionMarginCents,
    effectiveHourlyCents: totalHours > 0 ? Math.round(suggestedPriceCents / totalHours) : 0,
    composition,
    warnings,
  };
}
