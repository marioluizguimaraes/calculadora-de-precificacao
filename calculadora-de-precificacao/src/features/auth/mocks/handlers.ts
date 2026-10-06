import { createMockTable, mockError, requireMockUser, seed } from '@/shared/api/mock';
import { createId } from '@/shared/lib/id';

import type { AuthSession, LoginInput, ProfileInput, SignUpInput, User } from '../types';

import usersSeed from './users.json';

/** Só o mock guarda senha em texto: a API real recebe a senha e nunca a devolve. */
interface StoredUser extends User {
  password: string;
}

const users = createMockTable<StoredUser>('usuarios', seed<StoredUser>(usersSeed));

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function toPublic({ password: _password, ...user }: StoredUser): User {
  return user;
}

function session(user: StoredUser): AuthSession {
  return { token: `mock-token.${user.id}`, user: toPublic(user) };
}

export const authHandlers = {
  login({ email, password }: LoginInput): AuthSession {
    const user = users.all().find((u) => sameEmail(u.email, email));
    if (user?.password !== password) mockError(401, 'E-mail ou senha incorretos.');
    return session(user);
  },

  emailAvailable(email: string): { available: boolean } {
    return { available: !users.all().some((u) => sameEmail(u.email, email)) };
  },

  signUp(input: SignUpInput): AuthSession {
    if (!authHandlers.emailAvailable(input.email).available) {
      mockError(409, 'Já existe uma conta com esse e-mail.');
    }
    const user = users.insert({
      ...input,
      id: createId(),
      email: input.email.trim(),
      createdAt: new Date().toISOString(),
    });
    return session(user);
  },

  updateProfile(input: ProfileInput): User {
    const { id } = requireMockUser();
    return toPublic(users.update(id, input));
  },
};
