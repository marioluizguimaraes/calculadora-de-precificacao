import type { CostGroup, Stage } from '../types';

/**
 * Identidade de cada etapa. As cores seguem a temperatura de cor do set:
 * pré = luz do dia (planejamento), gravação = tungstênio, pós = verde da ilha.
 * Paleta validada (CVD + contraste) nos dois temas — ver --stage-* no global.css.
 */
export const STAGE_META: Record<Stage, { label: string; short: string; track: string }> = {
  pre: { label: 'Pré-produção', short: 'Pré', track: 'V1' },
  producao: { label: 'Gravação', short: 'Set', track: 'V2' },
  pos: { label: 'Pós-produção', short: 'Pós', track: 'V3' },
};

/** Grupos da composição do preço, na ordem fixa validada da paleta (--cost-*). */
export const COST_GROUP_META: Record<CostGroup, { label: string; description: string }> = {
  trabalho: { label: 'Seu trabalho', description: 'Custo da sua hora × horas por etapa' },
  equipe: { label: 'Equipe', description: 'Diárias dos profissionais contratados' },
  equipamentos: {
    label: 'Equipamentos',
    description: 'Depreciação do seu kit + locações',
  },
  logistica: {
    label: 'Logística',
    description: 'Deslocamento, alimentação, hospedagem e extras',
  },
  impostos: { label: 'Impostos e taxas', description: 'Tributos, taxas de pagamento e comissão' },
  lucro: { label: 'Lucro', description: 'O que sobra para reinvestir no negócio' },
};

/** Ordem fixa da paleta validada — a cor segue o grupo, nunca o ranking. */
export const COST_GROUP_ORDER: CostGroup[] = [
  'trabalho',
  'equipe',
  'equipamentos',
  'logistica',
  'impostos',
  'lucro',
];

export const COST_GROUP_BG: Record<CostGroup, string> = {
  trabalho: 'bg-cost-trabalho',
  equipe: 'bg-cost-equipe',
  equipamentos: 'bg-cost-equipamentos',
  logistica: 'bg-cost-logistica',
  impostos: 'bg-cost-impostos',
  lucro: 'bg-cost-lucro',
};

/** Faixas da margem de lucro em relação à referência de mercado (20–30%). */
export function profitStatus(pct: number) {
  if (pct < 15) return { color: 'danger' as const, label: 'Abaixo do mercado' };
  if (pct < 20) return { color: 'warning' as const, label: 'Um pouco abaixo' };
  if (pct <= 30) return { color: 'success' as const, label: 'Na referência de mercado' };
  return { color: 'accent' as const, label: 'Acima da média — justifique o valor' };
}

export const STAGE_BG: Record<Stage, string> = {
  pre: 'bg-stage-pre',
  producao: 'bg-stage-producao',
  pos: 'bg-stage-pos',
};
