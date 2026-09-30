import { estimateRoadKm, haversineKm, typicalDistanceKm } from './geo';

const saoPaulo = { lat: -23.5329, lng: -46.6395 };
const campinas = { lat: -22.9053, lng: -47.0659 };
const santos = { lat: -23.9535, lng: -46.335 };

describe('geo', () => {
  it('calcula a distância em linha reta', () => {
    expect(haversineKm(saoPaulo, campinas)).toBeCloseTo(82.3, 0);
    expect(haversineKm(saoPaulo, saoPaulo)).toBe(0);
  });

  it('aplica o fator rodoviário na estimativa', () => {
    expect(estimateRoadKm(saoPaulo, campinas)).toBeCloseTo(haversineKm(saoPaulo, campinas) * 1.25);
  });

  it('usa a mediana das distâncias para a região', () => {
    const km = typicalDistanceKm(saoPaulo, [campinas, santos, saoPaulo]);
    expect(km).toBe(Math.round(estimateRoadKm(saoPaulo, santos)));
    expect(typicalDistanceKm(saoPaulo, [campinas, santos])).toBeGreaterThan(0);
    expect(typicalDistanceKm(saoPaulo, [])).toBeNull();
  });
});
