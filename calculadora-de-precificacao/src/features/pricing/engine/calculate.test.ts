import { makeDraft, makeProfile } from '@/test/fixtures/pricing';

import { calculatePricing } from './calculate';

describe('calculatePricing — cenário de referência', () => {
  const profile = makeProfile();
  const result = calculatePricing(makeDraft(profile), profile);

  it('calcula o custo da hora a partir do perfil', () => {
    expect(result.productiveHoursPerMonth).toBe(160);
    expect(result.hourlyCostCents).toBe(5_000);
  });

  it('soma horas e diárias por etapa', () => {
    expect(result.totalHours).toBe(24);
    expect(result.stages.pre.days).toBe(1);
    expect(result.stages.producao.days).toBe(1);
    expect(result.stages.pos.days).toBe(2);
    expect(result.captureDays).toBe(1);
    expect(result.peopleOnSet).toBe(2);
  });

  it('compõe o custo direto', () => {
    expect(result.laborCents).toBe(120_000);
    expect(result.teamCents).toBe(75_000);
    expect(result.equipmentCents).toBe(32_500);
    expect(result.logistics).toMatchObject({
      fuelCents: 6_000,
      tollsCents: 1_000,
      mealsCents: 10_000,
      lodgingCents: 0,
      extrasCents: 3_000,
      totalCents: 20_000,
    });
    expect(result.directCostCents).toBe(247_500);
  });

  it('aplica o markup e separa impostos e lucro', () => {
    expect(result.markup).toBeCloseTo(100 / 70);
    expect(result.suggestedPriceCents).toBe(353_571);
    expect(result.minimumPriceCents).toBe(263_298);
    expect(result.taxesCents).toBe(21_214);
    expect(result.profitCents).toBe(84_857);
    expect(result.contributionMarginCents).toBe(207_357);
    expect(result.effectiveHourlyCents).toBe(14_732);
  });

  it('fecha a composição exatamente no preço', () => {
    const total = Object.values(result.composition).reduce((a, b) => a + b, 0);
    expect(total).toBe(result.suggestedPriceCents);
  });

  it('rateia o preço entre as etapas sem perder centavos', () => {
    const { pre, producao, pos } = result.stages;
    expect(pre.costCents).toBe(20_000);
    expect(producao.costCents).toBe(127_500);
    expect(pos.costCents).toBe(100_000);
    expect(pre.priceCents + producao.priceCents + pos.priceCents).toBe(result.suggestedPriceCents);
  });

  it('não gera alertas quando o orçamento está completo', () => {
    expect(result.warnings).toEqual([]);
  });
});

describe('calculatePricing — regras e alertas', () => {
  it('usa uma única viagem quando há hospedagem', () => {
    const profile = makeProfile();
    const draft = makeDraft(profile);
    draft.logistics.lodgingNights = 2;
    const result = calculatePricing(draft, profile);
    expect(result.trips).toBe(1);
    expect(result.logistics.lodgingCents).toBe(25_000 * 2 * 2);
  });

  it('respeita o número de viagens informado', () => {
    const profile = makeProfile();
    const draft = makeDraft(profile);
    draft.logistics.tripsCount = 3;
    expect(calculatePricing(draft, profile).trips).toBe(3);
  });

  it('arredonda o preço para cima e mantém a soma exata', () => {
    const profile = makeProfile();
    const draft = makeDraft(profile);
    draft.pricing.roundToReais = 50;
    const result = calculatePricing(draft, profile);
    expect(result.suggestedPriceCents).toBe(355_000);
    const total = Object.values(result.composition).reduce((a, b) => a + b, 0);
    expect(total).toBe(355_000);
  });

  it('avisa quando o perfil está incompleto e não há serviços', () => {
    const profile = makeProfile({ fixedCosts: [], proLaboreCents: 0 });
    const draft = { ...makeDraft(profile), services: [] };
    const codes = calculatePricing(draft, profile).warnings.map((w) => w.code);
    expect(codes).toContain('perfil-incompleto');
    expect(codes).toContain('sem-servicos');
  });

  it('avisa quando falta a distância e há gravação', () => {
    const profile = makeProfile();
    const draft = makeDraft(profile);
    draft.location.distanceKm = null;
    const result = calculatePricing(draft, profile);
    expect(result.logistics.fuelCents).toBe(0);
    expect(result.warnings.map((w) => w.code)).toContain('sem-distancia');
  });

  it('transporte por valor fixo substitui combustível e pedágio', () => {
    const profile = makeProfile();
    const draft = makeDraft(profile);
    draft.logistics = { ...draft.logistics, transportMode: 'fixo', fareCents: 4_000 };
    const result = calculatePricing(draft, profile);
    // 1 viagem (1 diária de set), valor para a equipe toda
    expect(result.logistics).toMatchObject({
      fuelCents: 0,
      tollsCents: 0,
      fareCents: 4_000,
      totalCents: 17_000,
    });
  });

  it('transporte por pessoa multiplica pelas pessoas no set', () => {
    const profile = makeProfile();
    const draft = makeDraft(profile);
    draft.logistics = {
      ...draft.logistics,
      transportMode: 'fixo',
      fareCents: 4_000,
      farePerPerson: true,
    };
    expect(calculatePricing(draft, profile).logistics.fareCents).toBe(8_000);
  });

  it('com valor fixo, não avisa sobre a distância', () => {
    const profile = makeProfile();
    const draft = makeDraft(profile);
    draft.location.distanceKm = null;
    draft.logistics = { ...draft.logistics, transportMode: 'fixo', fareCents: 4_000 };
    const codes = calculatePricing(draft, profile).warnings.map((w) => w.code);
    expect(codes).not.toContain('sem-distancia');
  });

  it('avisa sobre lucro abaixo da referência de mercado', () => {
    const profile = makeProfile();
    const draft = makeDraft(profile);
    draft.pricing.profitPct = 10;
    expect(calculatePricing(draft, profile).warnings.map((w) => w.code)).toContain('margem-baixa');
  });

  it('não quebra quando os percentuais somam 100% ou mais', () => {
    const profile = makeProfile();
    const draft = makeDraft(profile);
    draft.pricing = { ...draft.pricing, taxRatePct: 50, profitPct: 50 };
    const result = calculatePricing(draft, profile);
    expect(result.warnings.map((w) => w.code)).toContain('percentuais-invalidos');
    expect(Number.isFinite(result.suggestedPriceCents)).toBe(true);
  });

  it('não conta viagens sem dias de gravação', () => {
    const profile = makeProfile();
    const draft = makeDraft(profile);
    draft.services = draft.services.filter((s) => s.stage !== 'producao');
    const result = calculatePricing(draft, profile);
    expect(result.trips).toBe(0);
    expect(result.effectiveHourlyCents).toBeGreaterThan(0);
  });
});

describe('normalizeDraft — rascunhos salvos antes do modo de transporte', () => {
  it('completa com "veículo próprio" sem mudar o preço', async () => {
    const { normalizeDraft } = await import('../constants/defaults');
    const profile = makeProfile();
    const draft = makeDraft(profile);
    // Simula o formato antigo: logística sem os campos de transporte.
    const legacyLogistics: Partial<typeof draft.logistics> = { ...draft.logistics };
    delete legacyLogistics.transportMode;
    delete legacyLogistics.fareCents;
    delete legacyLogistics.farePerPerson;
    const legacy = { ...draft, logistics: legacyLogistics } as unknown as typeof draft;
    const migrated = normalizeDraft(legacy);
    expect(migrated.logistics.transportMode).toBe('proprio');
    expect(calculatePricing(migrated, profile).suggestedPriceCents).toBe(
      calculatePricing(draft, profile).suggestedPriceCents,
    );
  });
});
