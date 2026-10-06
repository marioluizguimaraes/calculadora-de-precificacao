import { setApiSession, type ApiIdentity } from '@/shared/api/session';

/** Simula quem está logado para os handlers do mock. `null` = visitante. */
export function actAs(user: Partial<ApiIdentity> & { id: string }) {
  setApiSession({
    token: `mock-token.${user.id}`,
    user: { name: user.id, businessName: user.id, headline: '', city: null, ...user },
  });
}

export function actAsVisitor() {
  setApiSession(null);
}
