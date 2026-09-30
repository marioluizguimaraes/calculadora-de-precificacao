/**
 * Modelo de domínio da precificação.
 * Todos os valores monetários são inteiros em CENTAVOS; horas são números decimais.
 */

export type Stage = 'pre' | 'producao' | 'pos';

/** Tier de complexidade (Forasteiro): 1 redes sociais · 2 institucional · 3 publicidade/cinema. */
export type Tier = 1 | 2 | 3;

export type LocationScope = 'cidade' | 'regional' | 'estadual';

export type TaxRegime = 'mei' | 'simples' | 'pessoa-fisica' | 'outro';

export type EquipmentCategory =
  'camera' | 'lente' | 'luz' | 'audio' | 'suporte' | 'drone' | 'computador' | 'outro';

export interface PlaceRef {
  id: number;
  name: string;
}

export interface StateRef extends PlaceRef {
  uf: string;
}

export interface CityRef extends PlaceRef {
  uf: string;
}

export interface FixedCost {
  id: string;
  label: string;
  monthlyCents: number;
}

/** Equipamento próprio cadastrado uma vez no perfil e reaproveitado nos orçamentos. */
export interface KitItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  purchaseCents: number;
  resaleCents: number;
  lifespanYears: number;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  document: string;
  email: string;
  phone: string;
  website: string;
  logoDataUrl: string | null;
  baseCity: CityRef | null;
  fixedCosts: FixedCost[];
  proLaboreCents: number;
  workDaysPerMonth: number;
  hoursPerDay: number;
  /** Dias por ano em que o equipamento é efetivamente usado — base da depreciação diária. */
  equipmentUseDaysPerYear: number;
  taxRegime: TaxRegime;
  taxRatePct: number;
  paymentFeePct: number;
  defaultProfitPct: number;
  paymentTerms: string;
  proposalValidityDays: number;
  kit: KitItem[];
}

export interface SelectedService {
  serviceId: string;
  stage: Stage;
  label: string;
  hours: number;
}

export interface QuoteEquipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  stage: Stage;
  kind: 'owned' | 'rented';
  kitId: string | null;
  purchaseCents: number;
  resaleCents: number;
  lifespanYears: number;
  dailyRentCents: number;
  /** `null` = acompanha os dias da etapa. */
  days: number | null;
}

export interface TeamMember {
  id: string;
  role: string;
  stage: Stage;
  dailyRateCents: number;
  count: number;
  /** `null` = acompanha os dias da etapa. */
  days: number | null;
}

export interface ExtraCost {
  id: string;
  label: string;
  cents: number;
}

/** Como a equipe chega ao set: no próprio veículo (combustível) ou por valor fixo (Uber, ônibus…). */
export type TransportMode = 'proprio' | 'fixo';

export interface LogisticsCosts {
  /** `null` = automático (1 viagem se houver hospedagem, senão uma por dia de gravação). */
  tripsCount: number | null;
  transportMode: TransportMode;
  /** Modo fixo: valor de cada viagem de ida e volta (corrida, passagem…). */
  fareCents: number;
  /** Modo fixo: o valor é por pessoa no set (ex.: passagem de ônibus), não por viagem. */
  farePerPerson: boolean;
  fuelPricePerLiterCents: number;
  kmPerLiter: number;
  tollsPerTripCents: number;
  mealPerPersonDayCents: number;
  lodgingNights: number;
  lodgingPerNightCents: number;
  insuranceCents: number;
  venueCents: number;
  licensesCents: number;
  extras: ExtraCost[];
}

export interface PricingOptions {
  profitPct: number;
  taxRatePct: number;
  paymentFeePct: number;
  commissionPct: number;
  /** Arredonda o preço sugerido para cima, em reais (0 = sem arredondamento). */
  roundToReais: 0 | 10 | 50 | 100;
}

export interface QuoteLocation {
  scope: LocationScope;
  state: StateRef | null;
  region: PlaceRef | null;
  city: CityRef | null;
  /** Distância de ida, em km, da cidade-base até o local. */
  distanceKm: number | null;
  distanceSource: 'rota' | 'estimativa' | 'manual' | null;
}

export interface QuoteDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  presetId: string | null;
  client: {
    name: string;
    company: string;
    email: string;
  };
  project: {
    title: string;
    tier: Tier;
    deliverables: string;
    notes: string;
  };
  location: QuoteLocation;
  services: SelectedService[];
  equipment: QuoteEquipment[];
  team: TeamMember[];
  logistics: LogisticsCosts;
  pricing: PricingOptions;
}

export type CostGroup = 'trabalho' | 'equipe' | 'equipamentos' | 'logistica' | 'impostos' | 'lucro';

export interface StageSummary {
  stage: Stage;
  hours: number;
  days: number;
  laborCents: number;
  teamCents: number;
  equipmentCents: number;
  /** Custo direto atribuído à etapa (logística entra na gravação). */
  costCents: number;
  /** Parcela do preço final proporcional ao custo — usada na proposta. */
  priceCents: number;
}

export interface PricingWarning {
  code:
    | 'perfil-incompleto'
    | 'sem-servicos'
    | 'sem-distancia'
    | 'margem-baixa'
    | 'percentuais-invalidos';
  message: string;
}

export interface PricingResult {
  hourlyCostCents: number;
  productiveHoursPerMonth: number;
  totalHours: number;
  captureDays: number;
  peopleOnSet: number;
  trips: number;
  stages: Record<Stage, StageSummary>;
  equipmentItems: { id: string; name: string; cents: number }[];
  logistics: {
    fuelCents: number;
    tollsCents: number;
    /** Transporte por valor fixo (zero quando é veículo próprio). */
    fareCents: number;
    mealsCents: number;
    lodgingCents: number;
    insuranceCents: number;
    venueCents: number;
    licensesCents: number;
    extrasCents: number;
    totalCents: number;
  };
  laborCents: number;
  teamCents: number;
  equipmentCents: number;
  directCostCents: number;
  markup: number;
  minimumPriceCents: number;
  suggestedPriceCents: number;
  taxesCents: number;
  feesCents: number;
  commissionCents: number;
  profitCents: number;
  contributionMarginCents: number;
  effectiveHourlyCents: number;
  composition: Record<CostGroup, number>;
  warnings: PricingWarning[];
}
