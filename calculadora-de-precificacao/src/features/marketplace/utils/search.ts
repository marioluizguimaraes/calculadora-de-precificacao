import type { Listing, ListingSearch } from '../types';

/** Minúsculas e sem acento: "Edição" encontra "edicao". */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function haystack(listing: Listing): string {
  return normalizeText(
    [
      listing.title,
      listing.description,
      listing.deliverables,
      listing.owner.businessName,
      listing.owner.name,
      listing.owner.headline,
      listing.owner.city?.name ?? '',
      ...listing.tags,
      ...listing.services.map((s) => s.label),
    ].join(' '),
  );
}

/**
 * Busca das ofertas públicas — o que a API faria no servidor. Todas as palavras da busca
 * precisam aparecer (em qualquer campo). Ofertas pausadas não entram.
 */
export function searchListings(listings: Listing[], search: ListingSearch): Listing[] {
  const words = normalizeText(search.q).split(/\s+/).filter(Boolean);
  const found = listings.filter((listing) => {
    if (listing.status !== 'ativa') return false;
    if (search.tier !== null && listing.tier !== search.tier) return false;
    if (search.uf !== null && listing.owner.city?.uf !== search.uf) return false;
    if (words.length === 0) return true;
    const text = haystack(listing);
    return words.every((word) => text.includes(word));
  });

  return found.sort((a, b) => {
    if (search.sort === 'recentes') return b.publishedAt.localeCompare(a.publishedAt);
    // "Sob consulta" vai para o fim quando a ordem é por preço.
    if (a.showPrice !== b.showPrice) return a.showPrice ? -1 : 1;
    const diff = a.priceCents - b.priceCents;
    return search.sort === 'menor-preco' ? diff : -diff;
  });
}
