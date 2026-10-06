import type { CityRef, StateRef } from '@/features/pricing';

import { accessSchema, confirmSchema, specialtiesSchema, studioSchema } from '../../schemas/signup';

export interface SignUpForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  headline: string;
  state: StateRef | null;
  city: CityRef | null;
  specialties: string[];
  bio: string;
  phone: string;
  acceptTerms: boolean;
}

export const EMPTY_SIGN_UP: SignUpForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  businessName: '',
  headline: '',
  state: null,
  city: null,
  specialties: [],
  bio: '',
  phone: '',
  acceptTerms: false,
};

export interface StepProps {
  form: SignUpForm;
  errors: Record<string, string>;
  set: (patch: Partial<SignUpForm>) => void;
}

/** Cadastro em quatro etapas curtas — cada uma valida só os próprios campos. */
export const SIGN_UP_STEPS = [
  {
    id: 'acesso',
    label: 'Acesso',
    title: 'Primeiro, seu acesso',
    description: 'Nome, e-mail e uma senha. É com eles que você entra depois.',
    schema: accessSchema,
  },
  {
    id: 'estudio',
    label: 'Estúdio',
    title: 'Como seus clientes te conhecem?',
    description: 'O nome e a cidade aparecem nas suas ofertas de serviço.',
    schema: studioSchema,
  },
  {
    id: 'especialidades',
    label: 'Especialidades',
    title: 'Em que você é bom?',
    description: 'Ajuda quem procura serviço a encontrar você. Dá para mudar depois.',
    schema: specialtiesSchema,
  },
  {
    id: 'revisao',
    label: 'Revisão',
    title: 'Tudo certo?',
    description: 'Confira os dados, deixe um contato se quiser e crie sua conta.',
    schema: confirmSchema,
  },
] as const;
