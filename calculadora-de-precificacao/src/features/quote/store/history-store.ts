import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  calculatePricing,
  normalizeDraft,
  type BusinessProfile,
  type QuoteDraft,
} from '@/features/pricing';
import { env } from '@/shared/config/env';

export interface SavedQuote {
  id: string;
  savedAt: string;
  draft: QuoteDraft;
  /** Foto do perfil no momento do salvamento: mudar custos depois não altera propostas antigas. */
  profile: BusinessProfile;
  priceCents: number;
}

interface HistoryState {
  quotes: SavedQuote[];
  save: (draft: QuoteDraft, profile: BusinessProfile) => SavedQuote;
  remove: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      quotes: [],
      save: (draft, profile) => {
        const quote: SavedQuote = {
          id: draft.id,
          savedAt: new Date().toISOString(),
          draft,
          profile: { ...profile, logoDataUrl: null },
          priceCents: calculatePricing(draft, profile).suggestedPriceCents,
        };
        set((state) => ({
          quotes: [quote, ...state.quotes.filter((q) => q.id !== quote.id)],
        }));
        return quote;
      },
      remove: (id) => {
        set((state) => ({ quotes: state.quotes.filter((q) => q.id !== id) }));
      },
    }),
    {
      name: `${env.VITE_STORAGE_KEY}:historico`,
      // v2: orçamentos antigos ganham o modo de transporte "veículo próprio" (preço inalterado).
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => {
        const state = persisted as { quotes: SavedQuote[] };
        return {
          ...state,
          quotes: state.quotes.map((q) => ({ ...q, draft: normalizeDraft(q.draft) })),
        };
      },
    },
  ),
);
