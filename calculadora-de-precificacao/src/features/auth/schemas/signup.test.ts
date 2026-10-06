import { accessSchema, confirmSchema, fieldErrors, studioSchema } from './signup';

describe('cadastro por etapas', () => {
  it('exige senhas iguais na etapa de acesso', () => {
    const parsed = accessSchema.safeParse({
      name: 'Lia',
      email: 'lia@exemplo.com',
      password: '12345678',
      confirmPassword: '87654321',
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrors(parsed.error)).toEqual({ confirmPassword: 'As senhas não conferem.' });
    }
  });

  it('exige a cidade na etapa do estúdio', () => {
    const parsed = studioSchema.safeParse({
      businessName: 'Lia Filmes',
      headline: 'Casamentos',
      city: null,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(Object.keys(fieldErrors(parsed.error))).toEqual(['city']);
  });

  it('aceita telefone vazio, mas não incompleto, e exige os termos', () => {
    expect(confirmSchema.safeParse({ phone: '', acceptTerms: true }).success).toBe(true);
    expect(confirmSchema.safeParse({ phone: '(11) 9999', acceptTerms: true }).success).toBe(false);
    expect(confirmSchema.safeParse({ phone: '', acceptTerms: false }).success).toBe(false);
  });
});
