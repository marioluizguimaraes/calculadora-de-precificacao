import { makeDraft, makeProfile } from '@/test/fixtures/pricing';
import { actAs, actAsVisitor } from '@/test/fixtures/session';

import { quoteHandlers as api } from './handlers';

beforeEach(() => {
  localStorage.clear();
});

describe('orçamentos na conta', () => {
  it('cada conta só enxerga os próprios orçamentos', () => {
    const draft = makeDraft();
    actAs({ id: 'u-ana' });
    const saved = api.save({ draft, profile: makeProfile() });
    expect(saved.priceCents).toBeGreaterThan(0);
    expect(api.list()).toHaveLength(1);

    actAs({ id: 'u-joao' });
    expect(api.list()).toEqual([]);
    expect(() => api.get(saved.id)).toThrow('não está na sua conta');
    expect(() => api.save({ draft, profile: makeProfile() })).toThrow('outra conta');
  });

  it('salvar de novo atualiza em vez de duplicar', () => {
    actAs({ id: 'u-ana' });
    const draft = makeDraft();
    api.save({ draft, profile: makeProfile() });
    api.save({
      draft: { ...draft, project: { ...draft.project, title: 'Novo' } },
      profile: makeProfile(),
    });
    expect(api.list().map((q) => q.draft.project.title)).toEqual(['Novo']);
  });

  it('sem login não salva nada', () => {
    actAsVisitor();
    expect(() => api.save({ draft: makeDraft(), profile: makeProfile() })).toThrow(
      'Entre na sua conta',
    );
  });
});
