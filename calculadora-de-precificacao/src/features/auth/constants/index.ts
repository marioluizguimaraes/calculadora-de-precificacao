import type { AuthReason } from '../types';

export const SPECIALTIES = [
  'Casamentos',
  'Eventos corporativos',
  'Institucional',
  'Publicidade',
  'Redes sociais',
  'Documentário',
  'Videoclipe',
  'Imagens aéreas (drone)',
  'Edição e color',
  'Motion design',
  'Transmissão ao vivo',
  'Fotografia',
] as const;

export const AUTH_REASON_MESSAGE: Record<AuthReason, string> = {
  pdf: 'Entre para baixar a proposta em PDF.',
  salvar: 'Entre para salvar seus orçamentos na sua conta.',
  chat: 'Entre para conversar com quem oferece o serviço.',
  publicar: 'Entre para publicar seus serviços no marketplace.',
  conta: 'Entre para acessar essa área da sua conta.',
};

/** Conta pronta dos dados simulados — só aparece quando não há API configurada. */
export const DEMO_CREDENTIALS = { email: 'demo@claquete.app', password: 'claquete123' };
