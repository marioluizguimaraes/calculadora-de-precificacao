import type { BusinessProfile, QuoteDraft } from '@/features/pricing';
import { createDefaultProfile, createEmptyDraft } from '@/features/pricing';

/** Perfil com R$ 8.000/mês de custo e 160 h produtivas → hora de R$ 50,00. */
export function makeProfile(overrides: Partial<BusinessProfile> = {}): BusinessProfile {
  return {
    ...createDefaultProfile(),
    fixedCosts: [{ id: 'f1', label: 'Fixos', monthlyCents: 300_000 }],
    proLaboreCents: 500_000,
    workDaysPerMonth: 20,
    hoursPerDay: 8,
    equipmentUseDaysPerYear: 120,
    ...overrides,
  };
}

/** Orçamento de referência usado nos testes do motor (valores conferidos à mão). */
export function makeDraft(profile: BusinessProfile = makeProfile()): QuoteDraft {
  const draft = createEmptyDraft(profile);
  return {
    ...draft,
    location: { ...draft.location, distanceKm: 50, distanceSource: 'manual' },
    services: [
      { serviceId: 'roteiro', stage: 'pre', label: 'Roteiro', hours: 4 },
      { serviceId: 'captacao', stage: 'producao', label: 'Captação', hours: 8 },
      { serviceId: 'edicao', stage: 'pos', label: 'Edição', hours: 12 },
    ],
    team: [
      {
        id: 't1',
        role: 'Assistente',
        stage: 'producao',
        dailyRateCents: 35_000,
        count: 1,
        days: null,
      },
      { id: 't2', role: 'Editor', stage: 'pos', dailyRateCents: 40_000, count: 1, days: 1 },
    ],
    equipment: [
      {
        id: 'e1',
        name: 'Câmera',
        category: 'camera',
        stage: 'producao',
        kind: 'owned',
        kitId: null,
        purchaseCents: 1_500_000,
        resaleCents: 300_000,
        lifespanYears: 4,
        dailyRentCents: 0,
        days: null,
      },
      {
        id: 'e2',
        name: 'Drone',
        category: 'drone',
        stage: 'producao',
        kind: 'rented',
        kitId: null,
        purchaseCents: 0,
        resaleCents: 0,
        lifespanYears: 0,
        dailyRentCents: 30_000,
        days: 1,
      },
    ],
    logistics: {
      ...draft.logistics,
      kmPerLiter: 10,
      fuelPricePerLiterCents: 600,
      tollsPerTripCents: 1_000,
      mealPerPersonDayCents: 5_000,
      lodgingNights: 0,
      extras: [{ id: 'x1', label: 'Estacionamento', cents: 3_000 }],
    },
    pricing: { profitPct: 24, taxRatePct: 6, paymentFeePct: 0, commissionPct: 0, roundToReais: 0 },
  };
}
