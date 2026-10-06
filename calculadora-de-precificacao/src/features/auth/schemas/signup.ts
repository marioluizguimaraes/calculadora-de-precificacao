import { z } from 'zod';

const city = z.object({ id: z.number(), name: z.string(), uf: z.string() });

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.'),
});

/** Etapa 1 — acesso. */
export const accessSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe seu nome.'),
    email: z.email('Informe um e-mail válido.'),
    password: z.string().min(8, 'Use pelo menos 8 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  });

/** Etapa 2 — estúdio. */
export const studioSchema = z.object({
  businessName: z.string().trim().min(2, 'Informe o nome do estúdio ou o seu nome artístico.'),
  headline: z
    .string()
    .trim()
    .min(3, 'Conte em poucas palavras o que você faz.')
    .max(80, 'Use no máximo 80 caracteres.'),
  city: city.nullable().refine((v) => v !== null, 'Escolha a cidade onde você atende.'),
});

/** Etapa 3 — especialidades. */
export const specialtiesSchema = z.object({
  specialties: z.array(z.string()).min(1, 'Escolha ao menos uma especialidade.'),
  bio: z.string().max(400, 'Use no máximo 400 caracteres.'),
});

/** Etapa 4 — contato e termos. */
export const confirmSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || v.replace(/\D/g, '').length >= 10, 'Telefone incompleto.'),
  acceptTerms: z.literal(true, 'Aceite os termos para criar a conta.'),
});

/** Primeira mensagem de erro de cada campo — formato que os formulários exibem. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    errors[key] ??= issue.message;
  }
  return errors;
}
