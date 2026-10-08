import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { env } from '@/shared/config/env';

import { createEmptyDraft, normalizeDraft } from '../constants/defaults';
import type { BusinessProfile, QuoteDraft } from '../types';

import { useProfileStore } from './profile-store';

type Section = 'client' | 'project' | 'location' | 'logistics' | 'pricing';
type ListKey = 'services' | 'equipment' | 'team';

interface DraftState {
  draft: QuoteDraft;
  /** Aplica uma transformação imutável ao rascunho. */
  update: (recipe: (draft: QuoteDraft) => QuoteDraft) => void;
  patch: <K extends Section>(section: K, value: Partial<QuoteDraft[K]>) => void;
  setList: <K extends ListKey>(key: K, updater: (list: QuoteDraft[K]) => QuoteDraft[K]) => void;
  replace: (draft: QuoteDraft) => void;
  reset: (profile?: BusinessProfile) => void;
}

const touch = (draft: QuoteDraft): QuoteDraft => ({
  ...draft,
  updatedAt: new Date().toISOString(),
});

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      draft: createEmptyDraft(useProfileStore.getState().profile),
      update: (recipe) => {
        set((state) => ({ draft: touch(recipe(state.draft)) }));
      },
      patch: (section, value) => {
        set((state) => ({
          draft: touch({ ...state.draft, [section]: { ...state.draft[section], ...value } }),
        }));
      },
      setList: (key, updater) => {
        set((state) => ({ draft: touch({ ...state.draft, [key]: updater(state.draft[key]) }) }));
      },
      replace: (draft) => {
        set({ draft });
      },
      reset: (profile = useProfileStore.getState().profile) => {
        set({ draft: createEmptyDraft(profile) });
      },
    }),
    {
      name: `${env.VITE_STORAGE_KEY}:rascunho`,
      // v2: modo de transporte (próprio ou valor fixo) na logística.
      // v3: equipe cobrando por diária ou por hora.
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ draft: state.draft }),
      migrate: (persisted) => {
        const state = persisted as { draft: QuoteDraft };
        return { ...state, draft: normalizeDraft(state.draft) };
      },
    },
  ),
);

/** O rascunho tem conteúdo suficiente para ser retomado? */
export function hasDraftContent(draft: QuoteDraft): boolean {
  return draft.services.length > 0 || draft.project.title.trim() !== '' || draft.client.name !== '';
}
