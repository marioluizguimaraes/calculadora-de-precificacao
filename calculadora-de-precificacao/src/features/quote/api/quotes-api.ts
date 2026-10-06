import { apiRequest } from '@/shared/api/client';

import { quoteHandlers } from '../mocks/handlers';
import type { SavedQuote, SaveQuoteInput } from '../types';

/** Orçamentos salvos na conta. Sem `VITE_API_URL`, responde com os dados de `mocks/`. */
export const quotesApi = {
  list: () => apiRequest<SavedQuote[]>({ path: '/me/orcamentos' }, () => quoteHandlers.list()),

  get: (id: string) =>
    apiRequest<SavedQuote>({ path: `/me/orcamentos/${id}` }, () => quoteHandlers.get(id)),

  save: (input: SaveQuoteInput) =>
    apiRequest<SavedQuote>(
      { method: 'PUT', path: `/me/orcamentos/${input.draft.id}`, body: input },
      () => quoteHandlers.save(input),
    ),

  remove: (id: string) =>
    apiRequest<undefined>({ method: 'DELETE', path: `/me/orcamentos/${id}` }, () => {
      quoteHandlers.remove(id);
      return undefined;
    }),
};
