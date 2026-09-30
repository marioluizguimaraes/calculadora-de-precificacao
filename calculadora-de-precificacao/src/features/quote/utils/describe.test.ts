import { createDefaultProfile, createEmptyDraft } from '@/features/pricing';

import { clientLabel, describeLocation, slugify } from './describe';

describe('descrições da proposta', () => {
  const draft = createEmptyDraft(createDefaultProfile());

  it('descreve cada tipo de área de atuação', () => {
    const base = draft.location;
    expect(describeLocation(base)).toBe('Local a definir');
    expect(
      describeLocation({ ...base, scope: 'cidade', city: { id: 1, name: 'Campinas', uf: 'SP' } }),
    ).toBe('Campinas/SP');
    expect(
      describeLocation({
        ...base,
        scope: 'regional',
        state: { id: 35, uf: 'SP', name: 'São Paulo' },
        region: { id: 3502, name: 'Sorocaba' },
      }),
    ).toBe('Região de Sorocaba (SP)');
    expect(
      describeLocation({
        ...base,
        scope: 'estadual',
        state: { id: 31, uf: 'MG', name: 'Minas Gerais' },
      }),
    ).toBe('Estado de Minas Gerais');
  });

  it('monta o nome do cliente', () => {
    expect(clientLabel({ ...draft, client: { name: 'Ana', company: 'ACME', email: '' } })).toBe(
      'Ana · ACME',
    );
    expect(clientLabel(draft)).toBe('Cliente a definir');
  });

  it('gera nomes de arquivo seguros', () => {
    expect(slugify('Vídeo Institucional — 2026!')).toBe('video-institucional-2026');
  });
});
