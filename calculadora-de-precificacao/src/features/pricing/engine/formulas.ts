/**
 * Fórmulas isoladas do motor de precificação (ver docs/PRICING-MODEL.md).
 * Funções puras: recebem números, devolvem números. Valores monetários em centavos.
 */

/** Horas produtivas no mês = dias trabalhados × horas por dia. */
export function productiveHours(workDaysPerMonth: number, hoursPerDay: number): number {
  return Math.max(0, workDaysPerMonth) * Math.max(0, hoursPerDay);
}

/** Custo da hora = (custos fixos mensais + pró-labore) ÷ horas produtivas (Sebrae, etapa 1–2). */
export function hourlyCost(monthlyCostCents: number, hours: number): number {
  if (hours <= 0) return 0;
  return monthlyCostCents / hours;
}

/** Depreciação linear anual = (valor de compra − valor de revenda) ÷ anos de vida útil. */
export function annualDepreciation(
  purchaseCents: number,
  resaleCents: number,
  lifespanYears: number,
): number {
  if (lifespanYears <= 0) return 0;
  return Math.max(0, purchaseCents - resaleCents) / lifespanYears;
}

/** Custo diário do equipamento próprio = depreciação anual ÷ dias de uso por ano. */
export function dailyDepreciation(
  purchaseCents: number,
  resaleCents: number,
  lifespanYears: number,
  useDaysPerYear: number,
): number {
  if (useDaysPerYear <= 0) return 0;
  return annualDepreciation(purchaseCents, resaleCents, lifespanYears) / useDaysPerYear;
}

/** Dias de trabalho de uma etapa, arredondados para cima (uma diária parcial conta inteira). */
export function daysFromHours(hours: number, hoursPerDay: number): number {
  if (hours <= 0 || hoursPerDay <= 0) return 0;
  return Math.ceil(hours / hoursPerDay - 1e-9);
}

/**
 * Markup divisor (Sebrae, etapa 5): 100 ÷ [100 − (DV + DF + LP)].
 * Custos fixos já estão no custo da hora, então DF = 0 aqui.
 * Retorna `null` quando os percentuais somam 100% ou mais (preço indefinido).
 */
export function markup(variablePct: number, profitPct: number): number | null {
  const total = variablePct + profitPct;
  if (total >= 100) return null;
  return 100 / (100 - total);
}

/** Combustível de ida e volta: km × 2 × viagens ÷ km/l × preço do litro. */
export function fuelCost(
  distanceKm: number,
  trips: number,
  kmPerLiter: number,
  pricePerLiterCents: number,
): number {
  if (kmPerLiter <= 0) return 0;
  return ((Math.max(0, distanceKm) * 2 * Math.max(0, trips)) / kmPerLiter) * pricePerLiterCents;
}

/** Arredonda para cima em múltiplos de `stepReais` (0 = sem arredondamento). */
export function roundUpPrice(cents: number, stepReais: number): number {
  if (stepReais <= 0) return Math.round(cents);
  const step = stepReais * 100;
  return Math.ceil(Math.round(cents) / step) * step;
}

/** Distribui `total` proporcionalmente aos pesos, garantindo que a soma bata exatamente. */
export function allocate(total: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, w) => acc + Math.max(0, w), 0);
  if (sum <= 0 || weights.length === 0) return weights.map((_, i) => (i === 0 ? total : 0));
  const parts = weights.map((w) => Math.floor((total * Math.max(0, w)) / sum));
  const remainder = total - parts.reduce((acc, p) => acc + p, 0);
  const largest = weights.indexOf(Math.max(...weights));
  parts[largest] = (parts[largest] ?? 0) + remainder;
  return parts;
}
