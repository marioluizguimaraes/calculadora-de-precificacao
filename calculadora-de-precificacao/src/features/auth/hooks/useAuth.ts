import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router';

import { useProfileStore } from '@/features/pricing';

import { authApi } from '../api/auth-api';
import { useSessionStore } from '../store/session-store';
import type { AuthReason, AuthSession, User } from '../types';
import { loginPath } from '../utils/return-to';

/** Dados que pertencem à conta ficam sob esta chave — somem do cache ao trocar de usuário. */
export const ACCOUNT_QUERY_KEY = 'conta';

export function useAuth() {
  const user = useSessionStore((s) => s.user);
  return { user, isAuthenticated: user !== null };
}

/** Completa a identidade da proposta (PDF) com os dados da conta, sem apagar o que já existe. */
function fillBusinessProfile(user: User) {
  const { profile, update } = useProfileStore.getState();
  update({
    businessName: profile.businessName || user.businessName,
    ownerName: profile.ownerName || user.name,
    email: profile.email || user.email,
    phone: profile.phone || user.phone,
    baseCity: profile.baseCity ?? user.city,
  });
}

function useStartSession() {
  const setSession = useSessionStore((s) => s.setSession);
  const queryClient = useQueryClient();
  return (session: AuthSession) => {
    queryClient.removeQueries({ queryKey: [ACCOUNT_QUERY_KEY] });
    setSession(session);
    fillBusinessProfile(session.user);
  };
}

export function useLogin() {
  const start = useStartSession();
  return useMutation({ mutationFn: authApi.login, onSuccess: start });
}

export function useSignUp() {
  const start = useStartSession();
  return useMutation({ mutationFn: authApi.signUp, onSuccess: start });
}

export function useUpdateProfile() {
  const setUser = useSessionStore((s) => s.setUser);
  return useMutation({ mutationFn: authApi.updateProfile, onSuccess: setUser });
}

export function useLogout() {
  const clear = useSessionStore((s) => s.clear);
  const queryClient = useQueryClient();
  return () => {
    clear();
    queryClient.removeQueries({ queryKey: [ACCOUNT_QUERY_KEY] });
  };
}

/**
 * Portão para ações que exigem conta: devolve `true` se já está logado; senão manda para o
 * login (com o motivo e o caminho de volta) e devolve `false`.
 */
export function useAuthGate() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  return (reason: AuthReason, returnTo = location.pathname + location.search) => {
    if (isAuthenticated) return true;
    void navigate(loginPath(reason, returnTo));
    return false;
  };
}
