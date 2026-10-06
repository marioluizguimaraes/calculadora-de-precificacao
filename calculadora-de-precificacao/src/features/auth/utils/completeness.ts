import type { User } from '../types';

/** Seções do formulário de perfil (ids usados para rolar até o campo certo). */
export type ProfileSection = 'identidade' | 'local' | 'especialidades' | 'contato';

/** Id do elemento de cada seção — a página rola até ele pelos atalhos de "perfil completo". */
export const profileSectionId = (section: ProfileSection) => `perfil-${section}`;

export interface ProfileCheck {
  id: string;
  label: string;
  section: ProfileSection;
  done: boolean;
}

type ProfileFields = Pick<
  User,
  'businessName' | 'headline' | 'city' | 'specialties' | 'bio' | 'phone'
>;

/** O que falta para o perfil ficar completo — perfis completos passam mais confiança. */
export function profileCompleteness(profile: ProfileFields) {
  const checks: ProfileCheck[] = [
    {
      id: 'estudio',
      label: 'Nome do estúdio',
      section: 'identidade',
      done: profile.businessName.trim().length >= 2,
    },
    {
      id: 'frase',
      label: 'Frase sobre o seu trabalho',
      section: 'identidade',
      done: profile.headline.trim().length >= 3,
    },
    { id: 'cidade', label: 'Cidade onde atende', section: 'local', done: profile.city !== null },
    {
      id: 'especialidades',
      label: 'Ao menos 3 especialidades',
      section: 'especialidades',
      done: profile.specialties.length >= 3,
    },
    {
      id: 'bio',
      label: 'Uma bio de pelo menos 40 caracteres',
      section: 'especialidades',
      done: profile.bio.trim().length >= 40,
    },
    {
      id: 'telefone',
      label: 'Telefone / WhatsApp',
      section: 'contato',
      done: profile.phone.replace(/\D/g, '').length >= 10,
    },
  ];
  const done = checks.filter((c) => c.done).length;
  return { checks, pct: Math.round((done / checks.length) * 100) };
}
