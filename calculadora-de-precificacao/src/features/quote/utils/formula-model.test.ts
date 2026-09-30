import { calculatePricing } from '@/features/pricing';
import { formatMoney } from '@/shared/lib/format';
import { makeDraft, makeProfile } from '@/test/fixtures/pricing';

import { buildFormulaModel } from './formula-model';

describe('modelo explicável das fórmulas', () => {
  const profile = makeProfile();
  const draft = makeDraft(profile);
  const result = calculatePricing(draft, profile);
  const { vars, formulas } = buildFormulaModel(draft, profile, result);

  it('só referencia variáveis que existem no catálogo', () => {
    const lines = formulas.flatMap((f) => [f.tokens, ...f.details.map((d) => d.tokens)]);
    for (const tokens of lines) {
      for (const token of tokens) {
        if (token.t === 'var') expect(vars[token.id], token.id).toBeDefined();
      }
    }
    for (const f of formulas) expect(vars[f.resultId], f.resultId).toBeDefined();
  });

  it('mostra os mesmos valores calculados pelo motor', () => {
    expect(vars.custoHora?.value).toBe(formatMoney(result.hourlyCostCents));
    expect(vars.custoDireto?.value).toBe(formatMoney(result.directCostCents));
    expect(vars.preco?.value).toBe(formatMoney(result.suggestedPriceCents));
  });

  it('classifica viagens como calculadas quando estão no automático', () => {
    expect(vars.viagens?.kind).toBe(
      draft.logistics.tripsCount === null ? 'calculado' : 'orcamento',
    );
  });
});
