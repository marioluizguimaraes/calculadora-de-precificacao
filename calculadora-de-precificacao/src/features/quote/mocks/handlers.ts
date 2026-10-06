import { calculatePricing, normalizeDraft } from '@/features/pricing';
import { createMockTable, mockError, requireMockUser, seed } from '@/shared/api/mock';

import type { SavedQuote, SaveQuoteInput } from '../types';

import quotesSeed from './quotes.json';

interface StoredQuote extends SavedQuote {
  ownerId: string;
}

const quotes = createMockTable<StoredQuote>('orcamentos', seed<StoredQuote>(quotesSeed));

function toSaved({ ownerId: _ownerId, ...quote }: StoredQuote): SavedQuote {
  return { ...quote, draft: normalizeDraft(quote.draft) };
}

function findOwned(id: string): StoredQuote {
  const { id: userId } = requireMockUser();
  const quote = quotes.find(id);
  // Orçamento de outra conta responde como inexistente — não revela que o id existe.
  if (quote?.ownerId !== userId) mockError(404, 'Esse orçamento não está na sua conta.');
  return quote;
}

export const quoteHandlers = {
  list(): SavedQuote[] {
    const { id: userId } = requireMockUser();
    return quotes
      .all()
      .filter((q) => q.ownerId === userId)
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
      .map(toSaved);
  },

  get(id: string): SavedQuote {
    return toSaved(findOwned(id));
  },

  save({ draft, profile, savedAt = new Date().toISOString() }: SaveQuoteInput): SavedQuote {
    const { id: userId } = requireMockUser();
    const existing = quotes.find(draft.id);
    if (existing && existing.ownerId !== userId) mockError(403, 'Esse orçamento é de outra conta.');
    const quote: StoredQuote = {
      id: draft.id,
      ownerId: userId,
      savedAt,
      draft,
      profile: { ...profile, logoDataUrl: null },
      priceCents: calculatePricing(draft, profile).suggestedPriceCents,
    };
    if (existing) quotes.update(quote.id, quote);
    else quotes.insert(quote);
    return toSaved(quote);
  },

  remove(id: string): void {
    quotes.remove(findOwned(id).id);
  },
};
