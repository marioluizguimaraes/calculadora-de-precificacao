import {
  allocate,
  annualDepreciation,
  dailyDepreciation,
  daysFromHours,
  fuelCost,
  hourlyCost,
  markup,
  productiveHours,
  roundUpPrice,
} from './formulas';

describe('custo da hora', () => {
  it('divide o custo mensal pelas horas produtivas', () => {
    expect(productiveHours(20, 8)).toBe(160);
    expect(hourlyCost(800_000, 160)).toBe(5_000);
  });

  it('retorna zero sem horas produtivas', () => {
    expect(productiveHours(-1, 8)).toBe(0);
    expect(hourlyCost(800_000, 0)).toBe(0);
  });
});

describe('depreciação', () => {
  it('aplica a depreciação linear (compra − revenda) ÷ vida útil', () => {
    expect(annualDepreciation(1_500_000, 300_000, 4)).toBe(300_000);
  });

  it('distribui a depreciação anual pelos dias de uso', () => {
    expect(dailyDepreciation(1_500_000, 300_000, 4, 120)).toBe(2_500);
  });

  it('nunca fica negativa e trata divisores inválidos', () => {
    expect(annualDepreciation(100, 500, 2)).toBe(0);
    expect(annualDepreciation(100, 0, 0)).toBe(0);
    expect(dailyDepreciation(100, 0, 1, 0)).toBe(0);
  });
});

describe('dias por etapa', () => {
  it('arredonda diárias parciais para cima', () => {
    expect(daysFromHours(8, 8)).toBe(1);
    expect(daysFromHours(9, 8)).toBe(2);
    expect(daysFromHours(0.5, 8)).toBe(1);
  });

  it('retorna zero sem horas', () => {
    expect(daysFromHours(0, 8)).toBe(0);
    expect(daysFromHours(4, 0)).toBe(0);
  });
});

describe('markup (Sebrae)', () => {
  it('calcula 100 ÷ [100 − (DV + LP)]', () => {
    expect(markup(6, 24)).toBeCloseTo(100 / 70);
  });

  it('equivale ao gross-up de impostos quando não há lucro', () => {
    expect(markup(6, 0)).toBeCloseTo(1 / (1 - 0.06));
  });

  it('é indefinido quando os percentuais chegam a 100%', () => {
    expect(markup(40, 60)).toBeNull();
  });
});

describe('combustível', () => {
  it('considera ida e volta em cada viagem', () => {
    // 100 km × 2 × 2 viagens ÷ 10 km/l × R$ 6,00
    expect(fuelCost(100, 2, 10, 600)).toBe(24_000);
  });

  it('ignora consumo inválido', () => {
    expect(fuelCost(100, 1, 0, 600)).toBe(0);
  });
});

describe('arredondamento do preço', () => {
  it('arredonda para cima no múltiplo pedido', () => {
    expect(roundUpPrice(123_401, 10)).toBe(124_000);
    expect(roundUpPrice(123_000, 10)).toBe(123_000);
    expect(roundUpPrice(123_456.4, 0)).toBe(123_456);
  });
});

describe('rateio', () => {
  it('distribui proporcionalmente e fecha a soma exata', () => {
    const parts = allocate(1_000, [1, 1, 1]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1_000);
    expect(parts).toEqual([334, 333, 333]);
  });

  it('coloca tudo no primeiro item quando não há pesos', () => {
    expect(allocate(500, [0, 0])).toEqual([500, 0]);
  });
});
