/**
 * Sessão vista pela camada de API. A feature de autenticação registra aqui quem está logado;
 * o cliente HTTP usa o token e o mock usa a identidade (o "servidor" falso não tem outra fonte).
 * `shared` não importa de `features`, por isso a sessão é empurrada para cá, e não lida de lá.
 */
export interface ApiIdentity {
  id: string;
  name: string;
  businessName: string;
  headline: string;
  city: { name: string; uf: string } | null;
}

export interface ApiSession {
  token: string;
  user: ApiIdentity;
}

let current: ApiSession | null = null;

export function setApiSession(session: ApiSession | null) {
  current = session;
}

export function getApiSession(): ApiSession | null {
  return current;
}
