import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { env } from '@/shared/config/env';

import { createDefaultProfile } from '../constants/defaults';
import type { BusinessProfile } from '../types';

interface ProfileState {
  profile: BusinessProfile;
  /** O usuário já passou pelo "Seu estúdio" ao menos uma vez. */
  onboarded: boolean;
  update: (patch: Partial<BusinessProfile>) => void;
  completeOnboarding: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: createDefaultProfile(),
      onboarded: false,
      update: (patch) => {
        set((state) => ({ profile: { ...state.profile, ...patch } }));
      },
      completeOnboarding: () => {
        set({ onboarded: true });
      },
    }),
    {
      name: `${env.VITE_STORAGE_KEY}:perfil`,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const saved = persisted as Partial<ProfileState> | undefined;
        return {
          ...current,
          ...saved,
          // Campos novos do perfil ganham o valor padrão ao carregar dados antigos.
          profile: { ...current.profile, ...saved?.profile },
        };
      },
    },
  ),
);
