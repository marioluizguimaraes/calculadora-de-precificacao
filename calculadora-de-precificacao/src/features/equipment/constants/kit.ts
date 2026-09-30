import type { EquipmentCategory, Stage } from '@/features/pricing';

export const CATEGORY_META: Record<EquipmentCategory, { label: string; stage: Stage }> = {
  camera: { label: 'Câmera', stage: 'producao' },
  lente: { label: 'Lente', stage: 'producao' },
  luz: { label: 'Iluminação', stage: 'producao' },
  audio: { label: 'Áudio', stage: 'producao' },
  suporte: { label: 'Suporte e estabilização', stage: 'producao' },
  drone: { label: 'Drone', stage: 'producao' },
  computador: { label: 'Computador de edição', stage: 'pos' },
  outro: { label: 'Outro', stage: 'producao' },
};

export interface KitSuggestion {
  name: string;
  category: EquipmentCategory;
  purchaseCents: number;
  resalePct: number;
  lifespanYears: number;
  dailyRentCents: number;
}

/** Sugestões para montar o kit rápido — valores de mercado aproximados, editáveis. */
export const KIT_SUGGESTIONS: KitSuggestion[] = [
  {
    name: 'Câmera mirrorless full frame',
    category: 'camera',
    purchaseCents: 1800000,
    resalePct: 35,
    lifespanYears: 4,
    dailyRentCents: 35000,
  },
  {
    name: 'Câmera de cinema',
    category: 'camera',
    purchaseCents: 4500000,
    resalePct: 40,
    lifespanYears: 5,
    dailyRentCents: 90000,
  },
  {
    name: 'Lente zoom 24-70mm f/2.8',
    category: 'lente',
    purchaseCents: 900000,
    resalePct: 50,
    lifespanYears: 6,
    dailyRentCents: 15000,
  },
  {
    name: 'Lente fixa 50mm f/1.8',
    category: 'lente',
    purchaseCents: 250000,
    resalePct: 50,
    lifespanYears: 6,
    dailyRentCents: 6000,
  },
  {
    name: 'Kit de iluminação LED (3 pontos)',
    category: 'luz',
    purchaseCents: 450000,
    resalePct: 25,
    lifespanYears: 4,
    dailyRentCents: 20000,
  },
  {
    name: 'Microfone lapela sem fio (duplo)',
    category: 'audio',
    purchaseCents: 250000,
    resalePct: 30,
    lifespanYears: 4,
    dailyRentCents: 8000,
  },
  {
    name: 'Microfone shotgun + gravador',
    category: 'audio',
    purchaseCents: 350000,
    resalePct: 30,
    lifespanYears: 5,
    dailyRentCents: 12000,
  },
  {
    name: 'Gimbal / estabilizador',
    category: 'suporte',
    purchaseCents: 350000,
    resalePct: 30,
    lifespanYears: 4,
    dailyRentCents: 10000,
  },
  {
    name: 'Tripé de vídeo com cabeça fluida',
    category: 'suporte',
    purchaseCents: 180000,
    resalePct: 40,
    lifespanYears: 6,
    dailyRentCents: 5000,
  },
  {
    name: 'Drone com câmera 4K',
    category: 'drone',
    purchaseCents: 900000,
    resalePct: 30,
    lifespanYears: 3,
    dailyRentCents: 30000,
  },
  {
    name: 'Computador de edição',
    category: 'computador',
    purchaseCents: 1400000,
    resalePct: 25,
    lifespanYears: 4,
    dailyRentCents: 0,
  },
];
