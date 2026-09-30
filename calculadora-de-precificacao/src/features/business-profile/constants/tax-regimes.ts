import type { TaxRegime } from '@/features/pricing';

export interface TaxRegimeDefinition {
  id: TaxRegime;
  label: string;
  hint: string;
  suggestedRatePct: number;
}

/** Alíquotas de partida — confirme sempre com seu contador. */
export const TAX_REGIMES: TaxRegimeDefinition[] = [
  {
    id: 'mei',
    label: 'MEI',
    hint: 'O DAS mensal entra nos custos fixos; não há imposto por nota.',
    suggestedRatePct: 0,
  },
  {
    id: 'simples',
    label: 'Simples Nacional',
    hint: 'Anexo III começa em 6% sobre o faturamento.',
    suggestedRatePct: 6,
  },
  {
    id: 'pessoa-fisica',
    label: 'Pessoa física (RPA)',
    hint: 'INSS e IR retidos; informe a alíquota efetiva.',
    suggestedRatePct: 11,
  },
  {
    id: 'outro',
    label: 'Outro regime',
    hint: 'Lucro presumido ou real: informe a alíquota efetiva.',
    suggestedRatePct: 14,
  },
];
