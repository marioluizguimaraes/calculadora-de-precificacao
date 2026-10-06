import type { CityRef } from '@/features/pricing';

/** Perfil público de quem usa o sistema (nunca inclui a senha). */
export interface User {
  id: string;
  name: string;
  email: string;
  /** Nome do estúdio ou nome artístico — é o que aparece nas ofertas. */
  businessName: string;
  /** Uma linha sobre o trabalho (ex.: "Videomaker de casamentos"). */
  headline: string;
  city: CityRef | null;
  specialties: string[];
  bio: string;
  phone: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  businessName: string;
  headline: string;
  city: CityRef | null;
  specialties: string[];
  bio: string;
  phone: string;
}

export type ProfileInput = Omit<SignUpInput, 'email' | 'password'>;

/** Por que a pessoa foi mandada para o login — muda a mensagem da tela. */
export type AuthReason = 'pdf' | 'salvar' | 'chat' | 'publicar' | 'conta';
