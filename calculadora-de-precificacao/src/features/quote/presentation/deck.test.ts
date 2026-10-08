import { calculatePricing } from '@/features/pricing';
import { makeDraft, makeProfile } from '@/test/fixtures/pricing';

import {
  buildSlides,
  chunkEvenly,
  includedLogistics,
  peopleInvolved,
  slideKey,
  slideLabel,
  validUntil,
} from './deck';

const profile = makeProfile();

describe('buildSlides', () => {
  it('monta o roteiro completo de um orçamento com tudo preenchido', () => {
    const draft = makeDraft(profile);
    const slides = buildSlides(draft, calculatePricing(draft, profile));
    expect(slides.map(slideKey)).toEqual([
      'capa',
      'projeto',
      'processo',
      'etapa-pre',
      'servicos-pre-1',
      'etapa-producao',
      'servicos-producao-1',
      'etapa-pos',
      'servicos-pos-1',
      'cronograma',
      'equipe',
      'incluso',
      'investimento',
      'condicoes',
      'encerramento',
    ]);
  });

  it('pula etapas, equipe e logística que não fazem parte do orçamento', () => {
    const base = makeDraft(profile);
    const draft = {
      ...base,
      services: base.services.filter((s) => s.stage === 'pos'),
      team: [],
      equipment: [],
      location: { ...base.location, distanceKm: 0 },
      logistics: { ...base.logistics, mealPerPersonDayCents: 0, tollsPerTripCents: 0, extras: [] },
    };
    const result = calculatePricing(draft, profile);
    const keys = buildSlides(draft, result).map(slideKey);
    expect(keys).toContain('etapa-pos');
    expect(keys).not.toContain('etapa-pre');
    expect(keys).not.toContain('equipe');
    expect(keys).not.toContain('incluso');
  });

  it('sem serviços, ainda apresenta capa, investimento e condições', () => {
    const draft = { ...makeDraft(profile), services: [] };
    const keys = buildSlides(draft, calculatePricing(draft, profile)).map(slideKey);
    expect(keys).not.toContain('processo');
    expect(keys).not.toContain('cronograma');
    expect(keys).toEqual(expect.arrayContaining(['capa', 'investimento', 'condicoes']));
  });
});

describe('chunkEvenly', () => {
  it('reparte os serviços em páginas equilibradas de até 3', () => {
    const sizes = (n: number) =>
      chunkEvenly(
        Array.from({ length: n }, (_, i) => i),
        3,
      ).map((g) => g.length);
    expect(sizes(0)).toEqual([]);
    expect(sizes(3)).toEqual([3]);
    expect(sizes(4)).toEqual([2, 2]);
    expect(sizes(7)).toEqual([3, 2, 2]);
    expect(sizes(12)).toEqual([3, 3, 3, 3]);
  });
});

describe('apoios do deck', () => {
  it('lista como "incluso" só a logística que tem custo', () => {
    const draft = makeDraft(profile);
    const items = includedLogistics(calculatePricing(draft, profile)).map((i) => i.key);
    expect(items).toEqual(['deslocamento', 'alimentacao', 'extras']);
  });

  it('conta quem orça mais os profissionais contratados', () => {
    const draft = makeDraft(profile);
    expect(peopleInvolved(draft)).toBe(3);
    expect(peopleInvolved({ ...draft, team: [] })).toBe(1);
  });

  it('calcula a validade a partir da emissão', () => {
    const until = validUntil(makeProfile({ proposalValidityDays: 10 }), new Date(2026, 9, 8, 12));
    expect(until.getDate()).toBe(18);
  });

  it('nomeia cada slide de etapa pela etapa', () => {
    expect(slideLabel({ kind: 'etapa', stage: 'producao' })).toBe('Gravação');
    expect(slideLabel({ kind: 'investimento' })).toBe('Investimento');
    expect(slideLabel({ kind: 'servicos', stage: 'pos', part: 2, parts: 3, serviceIds: [] })).toBe(
      'Pós · serviços 2/3',
    );
  });
});
