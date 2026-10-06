import { profileCompleteness } from './completeness';

const base = {
  businessName: 'Lia Filmes',
  headline: 'Casamentos',
  city: { id: 1, name: 'São Paulo', uf: 'SP' },
  specialties: ['A', 'B', 'C'],
  bio: 'Oito anos filmando casamentos em SP e no litoral paulista.',
  phone: '(11) 98888-1111',
};

it('perfil completo vale 100%', () => {
  expect(profileCompleteness(base).pct).toBe(100);
});

it('aponta o que falta e em qual seção', () => {
  const { pct, checks } = profileCompleteness({ ...base, bio: 'curta', phone: '', city: null });
  expect(pct).toBe(50);
  expect(checks.filter((c) => !c.done).map((c) => c.section)).toEqual([
    'local',
    'especialidades',
    'contato',
  ]);
});
