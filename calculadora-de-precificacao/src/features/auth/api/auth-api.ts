import { apiRequest } from '@/shared/api/client';

import { authHandlers } from '../mocks/handlers';
import type { AuthSession, LoginInput, ProfileInput, SignUpInput, User } from '../types';

/** Contrato com a API de contas. Sem `VITE_API_URL`, responde com os dados de `mocks/`. */
export const authApi = {
  login: (input: LoginInput) =>
    apiRequest<AuthSession>({ method: 'POST', path: '/auth/login', body: input }, () =>
      authHandlers.login(input),
    ),

  emailAvailable: (email: string) =>
    apiRequest<{ available: boolean }>({ path: '/auth/email-disponivel', query: { email } }, () =>
      authHandlers.emailAvailable(email),
    ),

  signUp: (input: SignUpInput) =>
    apiRequest<AuthSession>({ method: 'POST', path: '/auth/cadastro', body: input }, () =>
      authHandlers.signUp(input),
    ),

  updateProfile: (input: ProfileInput) =>
    apiRequest<User>({ method: 'PATCH', path: '/me', body: input }, () =>
      authHandlers.updateProfile(input),
    ),
};
