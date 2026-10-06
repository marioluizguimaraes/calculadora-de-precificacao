import type { Listing } from '../types';

import { normalizeText, searchListings } from './search';

function listing(overrides: Partial<Listing>): Listing {
  return {
    id: 'x',
    owner: {
      id: 'u',
      name: 'Lia',
      businessName: 'Lia Filmes',
      headline: '',
      city: { name: 'São Paulo', uf: 'SP' },
    },
    quoteId: null,
    title: 'Oferta',
    description: '',
    tier: 1,
    services: [],
    deliverables: '',
    priceCents: 100_000,
    showPrice: true,
    tags: [],
    status: 'ativa',
    publishedAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

const ALL = { q: '', tier: null, uf: null, sort: 'recentes' } as const;

describe('searchListings', () => {
  const casamento = listing({ id: 'a', title: 'Filme de casamento', tier: 2, priceCents: 500_000 });
  const reels = listing({
    id: 'b',
    title: 'Pacote de reels',
    tags: ['Edição e color'],
    owner: { ...casamento.owner, city: { name: 'Curitiba', uf: 'PR' } },
    priceCents: 200_000,
    publishedAt: '2026-09-10T00:00:00.000Z',
  });
  const consulta = listing({ id: 'c', title: 'Evento', showPrice: false, priceCents: 0 });
  const pausada = listing({ id: 'd', title: 'Casamento antigo', status: 'pausada' });
  const all = [casamento, reels, consulta, pausada];
  const ids = (list: Listing[]) => list.map((l) => l.id);

  it('ignora acentos e exige todas as palavras', () => {
    expect(ids(searchListings(all, { ...ALL, q: 'edicao' }))).toEqual(['b']);
    expect(ids(searchListings(all, { ...ALL, q: 'filme casamento' }))).toEqual(['a']);
  });

  it('nunca mostra ofertas pausadas', () => {
    expect(ids(searchListings(all, { ...ALL, q: 'casamento' }))).toEqual(['a']);
  });

  it('filtra por complexidade e por estado', () => {
    expect(ids(searchListings(all, { ...ALL, tier: 2 }))).toEqual(['a']);
    expect(ids(searchListings(all, { ...ALL, uf: 'PR' }))).toEqual(['b']);
  });

  it('ordena por preço com "sob consulta" no fim', () => {
    expect(ids(searchListings(all, { ...ALL, sort: 'menor-preco' }))).toEqual(['b', 'a', 'c']);
    expect(ids(searchListings(all, { ...ALL, sort: 'maior-preco' }))).toEqual(['a', 'b', 'c']);
  });

  it('ordena por mais recente por padrão', () => {
    expect(ids(searchListings(all, ALL))[0]).toBe('b');
  });
});

it('normaliza texto', () => {
  expect(normalizeText('  Edição ÁUDIO ')).toBe('edicao audio');
});
