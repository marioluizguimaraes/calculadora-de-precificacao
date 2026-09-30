import { createId } from '@/shared/lib/id';

import type { BusinessProfile, LogisticsCosts, PricingOptions, QuoteDraft } from '../types';

/** Custos fixos típicos de um videomaker — valores de partida, sempre editáveis. */
export const DEFAULT_FIXED_COSTS = [
  { label: 'Softwares e assinaturas (edição, trilhas, nuvem)', monthlyCents: 45000 },
  { label: 'Internet e telefone', monthlyCents: 20000 },
  { label: 'Contador e DAS/impostos fixos', monthlyCents: 30000 },
  { label: 'Seguro de equipamentos (mensal)', monthlyCents: 15000 },
  { label: 'Manutenção e reposição', monthlyCents: 20000 },
];

export function createDefaultProfile(): BusinessProfile {
  return {
    businessName: '',
    ownerName: '',
    document: '',
    email: '',
    phone: '',
    website: '',
    logoDataUrl: null,
    baseCity: null,
    fixedCosts: DEFAULT_FIXED_COSTS.map((c) => ({ ...c, id: createId() })),
    proLaboreCents: 500000,
    workDaysPerMonth: 20,
    hoursPerDay: 8,
    equipmentUseDaysPerYear: 120,
    taxRegime: 'simples',
    taxRatePct: 6,
    paymentFeePct: 0,
    defaultProfitPct: 25,
    paymentTerms: '50% na aprovação da proposta e 50% na entrega do material final.',
    proposalValidityDays: 15,
    kit: [],
  };
}

export const DEFAULT_LOGISTICS: LogisticsCosts = {
  tripsCount: null,
  transportMode: 'proprio',
  fareCents: 0,
  farePerPerson: false,
  fuelPricePerLiterCents: 629,
  kmPerLiter: 11,
  tollsPerTripCents: 0,
  mealPerPersonDayCents: 5000,
  lodgingNights: 0,
  lodgingPerNightCents: 25000,
  insuranceCents: 0,
  venueCents: 0,
  licensesCents: 0,
  extras: [],
};

export function createDefaultPricing(profile: BusinessProfile): PricingOptions {
  return {
    profitPct: profile.defaultProfitPct,
    taxRatePct: profile.taxRatePct,
    paymentFeePct: profile.paymentFeePct,
    commissionPct: 0,
    // Exato por padrão: o preço é o resultado do cálculo, com centavos.
    roundToReais: 0,
  };
}

export function createEmptyDraft(profile: BusinessProfile): QuoteDraft {
  const now = new Date().toISOString();
  return {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    presetId: null,
    client: { name: '', company: '', email: '' },
    project: { title: '', tier: 2, deliverables: '', notes: '' },
    location: {
      scope: 'cidade',
      state: null,
      region: null,
      city: null,
      distanceKm: null,
      distanceSource: null,
    },
    services: [],
    equipment: [],
    team: [],
    logistics: { ...DEFAULT_LOGISTICS, extras: [] },
    pricing: createDefaultPricing(profile),
  };
}

/**
 * Completa um rascunho salvo por uma versão anterior com os campos que surgiram depois
 * (ex.: modo de transporte). Mantém tudo o que já existia.
 */
export function normalizeDraft(draft: QuoteDraft): QuoteDraft {
  return { ...draft, logistics: { ...DEFAULT_LOGISTICS, ...draft.logistics } };
}
