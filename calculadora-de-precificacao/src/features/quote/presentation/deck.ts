import {
  STAGE_META,
  STAGES,
  type BusinessProfile,
  type PricingResult,
  type QuoteDraft,
  type Stage,
} from '@/features/pricing';

import { addDays } from '../utils/describe';

/**
 * Roteiro da apresentação: quais slides entram e em que ordem.
 * Função pura — o deck só mostra slides que têm conteúdo neste orçamento.
 */

export type SlideSpec =
  | { kind: 'capa' }
  | { kind: 'projeto' }
  | { kind: 'processo' }
  | { kind: 'etapa'; stage: Stage }
  /** Serviços da etapa em detalhe, poucos por slide para caber com folga. */
  | { kind: 'servicos'; stage: Stage; part: number; parts: number; serviceIds: string[] }
  | { kind: 'cronograma' }
  | { kind: 'equipe' }
  | { kind: 'incluso' }
  | { kind: 'investimento' }
  | { kind: 'condicoes' }
  | { kind: 'encerramento' };

export interface DeckData {
  draft: QuoteDraft;
  identity: BusinessProfile;
  result: PricingResult;
  issuedAt: Date;
}

export type IncludedKey =
  'deslocamento' | 'alimentacao' | 'hospedagem' | 'seguro' | 'locacao' | 'licencas' | 'extras';

/** Itens de logística que o cliente não paga à parte — mostrados como "já incluso". */
export function includedLogistics(result: PricingResult): { key: IncludedKey; label: string }[] {
  const l = result.logistics;
  const items: [number, IncludedKey, string][] = [
    [l.fuelCents + l.tollsCents + l.fareCents, 'deslocamento', 'Deslocamento da equipe'],
    [l.mealsCents, 'alimentacao', 'Alimentação no set'],
    [l.lodgingCents, 'hospedagem', 'Hospedagem'],
    [l.insuranceCents, 'seguro', 'Seguro dos equipamentos'],
    [l.venueCents, 'locacao', 'Locação do espaço'],
    [l.licensesCents, 'licencas', 'Licenças e autorizações'],
    [l.extrasCents, 'extras', 'Custos extras de produção'],
  ];
  return items.filter(([cents]) => cents > 0).map(([, key, label]) => ({ key, label }));
}

export function stagesWithServices(draft: QuoteDraft): Stage[] {
  return STAGES.filter((stage) => draft.services.some((s) => s.stage === stage));
}

export function peopleInvolved(draft: QuoteDraft): number {
  // Quem orça + profissionais contratados.
  return 1 + draft.team.reduce((acc, m) => acc + Math.max(0, m.count), 0);
}

export function validUntil(identity: BusinessProfile, issuedAt: Date): Date {
  return addDays(issuedAt, identity.proposalValidityDays);
}

export const SERVICES_PER_SLIDE = 3;

/** Divide em grupos de no máximo `size`, equilibrados (7 → 3, 2, 2 em vez de 3, 3, 1). */
export function chunkEvenly<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [];
  const groups = Math.ceil(items.length / size);
  const base = Math.floor(items.length / groups);
  const extra = items.length % groups;
  const result: T[][] = [];
  let cursor = 0;
  for (let i = 0; i < groups; i++) {
    const length = base + (i < extra ? 1 : 0);
    result.push(items.slice(cursor, cursor + length));
    cursor += length;
  }
  return result;
}

export function buildSlides(draft: QuoteDraft, result: PricingResult): SlideSpec[] {
  const stages = stagesWithServices(draft);
  const slides: SlideSpec[] = [{ kind: 'capa' }, { kind: 'projeto' }];

  if (stages.length > 0) {
    slides.push({ kind: 'processo' });
    for (const stage of stages) {
      slides.push({ kind: 'etapa', stage });
      const ids = draft.services.filter((s) => s.stage === stage).map((s) => s.serviceId);
      const groups = chunkEvenly(ids, SERVICES_PER_SLIDE);
      groups.forEach((serviceIds, i) => {
        slides.push({ kind: 'servicos', stage, part: i + 1, parts: groups.length, serviceIds });
      });
    }
  }
  if (result.totalHours > 0) slides.push({ kind: 'cronograma' });
  if (draft.team.length > 0 || draft.equipment.length > 0) slides.push({ kind: 'equipe' });
  if (includedLogistics(result).length > 0) slides.push({ kind: 'incluso' });

  slides.push({ kind: 'investimento' });
  slides.push({ kind: 'condicoes' }, { kind: 'encerramento' });
  return slides;
}

const SLIDE_LABEL: Record<Exclude<SlideSpec['kind'], 'etapa' | 'servicos'>, string> = {
  capa: 'Capa',
  projeto: 'O projeto',
  processo: 'Como trabalhamos',
  cronograma: 'Linha do tempo',
  equipe: 'Equipe e estrutura',
  incluso: 'Tudo incluso',
  investimento: 'Investimento',
  condicoes: 'Condições',
  encerramento: 'Próximos passos',
};

export function slideLabel(slide: SlideSpec): string {
  if (slide.kind === 'etapa') return STAGE_META[slide.stage].label;
  if (slide.kind === 'servicos') {
    const part = slide.parts > 1 ? ` ${slide.part}/${slide.parts}` : '';
    return `${STAGE_META[slide.stage].short} · serviços${part}`;
  }
  return SLIDE_LABEL[slide.kind];
}

export function slideKey(slide: SlideSpec): string {
  if (slide.kind === 'etapa') return `etapa-${slide.stage}`;
  if (slide.kind === 'servicos') return `servicos-${slide.stage}-${slide.part}`;
  return slide.kind;
}

export type SlideTone = 'cream' | 'ink';

/** Abertura, capítulos e fechamento em marrom-café; o miolo em creme, para ler bem no projetor. */
export function slideTone(slide: SlideSpec): SlideTone {
  return slide.kind === 'capa' || slide.kind === 'encerramento' || slide.kind === 'etapa'
    ? 'ink'
    : 'cream';
}
