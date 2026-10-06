import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { setApiSession } from '@/shared/api/session';
import { env } from '@/shared/config/env';

import type { AuthSession, User } from '../types';

interface SessionState {
  token: string | null;
  user: User | null;
  setSession: (session: AuthSession) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => {
        set({ token, user });
      },
      setUser: (user) => {
        set({ user });
      },
      clear: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: `${env.VITE_STORAGE_KEY}:sessao`,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ token, user }) => ({ token, user }),
    },
  ),
);

/** Mantém a camada de API (token + identidade) em dia com a sessão. */
function syncApiSession({ token, user }: Pick<SessionState, 'token' | 'user'>) {
  setApiSession(
    token && user
      ? {
          token,
          user: {
            id: user.id,
            name: user.name,
            businessName: user.businessName,
            headline: user.headline,
            city: user.city ? { name: user.city.name, uf: user.city.uf } : null,
          },
        }
      : null,
  );
}

syncApiSession(useSessionStore.getState());
useSessionStore.subscribe(syncApiSession);
