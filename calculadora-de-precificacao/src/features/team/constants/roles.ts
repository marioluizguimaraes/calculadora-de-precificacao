import type { Stage } from '@/features/pricing';

export interface RoleDefinition {
  id: string;
  label: string;
  stage: Stage;
  /** Diária de referência em centavos — ajuste para a sua praça. */
  dailyRateCents: number;
}

export const TEAM_ROLES: RoleDefinition[] = [
  { id: 'assistente', label: 'Assistente de câmera', stage: 'producao', dailyRateCents: 35000 },
  { id: 'cinegrafista', label: 'Segundo cinegrafista', stage: 'producao', dailyRateCents: 60000 },
  {
    id: 'diretor-fotografia',
    label: 'Diretor(a) de fotografia',
    stage: 'producao',
    dailyRateCents: 120000,
  },
  { id: 'gaffer', label: 'Eletricista / gaffer', stage: 'producao', dailyRateCents: 50000 },
  { id: 'som-direto', label: 'Técnico(a) de som direto', stage: 'producao', dailyRateCents: 60000 },
  { id: 'maquiagem', label: 'Maquiador(a)', stage: 'producao', dailyRateCents: 45000 },
  { id: 'piloto-drone', label: 'Piloto de drone', stage: 'producao', dailyRateCents: 70000 },
  { id: 'produtor', label: 'Produtor(a)', stage: 'pre', dailyRateCents: 45000 },
  { id: 'roteirista', label: 'Roteirista', stage: 'pre', dailyRateCents: 50000 },
  { id: 'editor', label: 'Editor(a) freelancer', stage: 'pos', dailyRateCents: 45000 },
  { id: 'motion-designer', label: 'Motion designer', stage: 'pos', dailyRateCents: 55000 },
  { id: 'colorista', label: 'Colorista', stage: 'pos', dailyRateCents: 70000 },
  { id: 'locutor', label: 'Locutor(a)', stage: 'pos', dailyRateCents: 40000 },
];

export const ROLE_BY_ID = new Map(TEAM_ROLES.map((r) => [r.id, r]));
