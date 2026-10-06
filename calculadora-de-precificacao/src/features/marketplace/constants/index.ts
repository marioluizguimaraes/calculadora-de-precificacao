import type { ListingSort } from '../types';

export const SORT_OPTIONS: { id: ListingSort; label: string }[] = [
  { id: 'recentes', label: 'Mais recentes' },
  { id: 'menor-preco', label: 'Menor preço' },
  { id: 'maior-preco', label: 'Maior preço' },
];

export const UFS = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const;

export const MAX_MESSAGE_LENGTH = 1_000;

/** Capa de cada complexidade: âmbar (simples), laranja (intermediária), grafite (complexa). */
export const TIER_COVER: Record<1 | 2 | 3, string> = {
  1: 'bg-[radial-gradient(120%_90%_at_85%_20%,rgb(255_236_190/0.55),transparent_55%),linear-gradient(150deg,#f6bd57,#e89a2c)] text-[#2a1a0a]',
  2: 'bg-[radial-gradient(120%_90%_at_85%_20%,rgb(255_190_110/0.45),transparent_55%),linear-gradient(150deg,#f37a2c,#e05a12)] text-white',
  3: 'bg-[radial-gradient(120%_90%_at_85%_20%,rgb(236_106_31/0.35),transparent_60%),linear-gradient(150deg,#3b2a1d,#1f150e)] text-[#fbf3ea]',
};

/** Atalhos da busca na vitrine. */
export const QUICK_SEARCHES = [
  'Casamento',
  'Institucional',
  'Reels',
  'Drone',
  'Evento',
  'Transmissão',
  'Motion',
] as const;
