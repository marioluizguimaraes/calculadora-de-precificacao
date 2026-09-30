import { formatHours, formatMoney, formatTimecode, pluralize, toCents } from './format';

describe('formatadores', () => {
  it('formata centavos como real brasileiro', () => {
    expect(formatMoney(123_456).replace(/\s/g, ' ')).toBe('R$ 1.234,56');
  });

  it('converte horas em timecode', () => {
    expect(formatTimecode(1.5)).toBe('01:30');
    expect(formatTimecode(26.25)).toBe('26:15');
  });

  it('formata horas e plurais', () => {
    expect(formatHours(2.5)).toBe('2,5 h');
    expect(pluralize(1, 'dia', 'dias')).toBe('1 dia');
    expect(pluralize(3, 'dia', 'dias')).toBe('3 dias');
  });

  it('converte reais em centavos sem erro de ponto flutuante', () => {
    expect(toCents(19.99)).toBe(1_999);
  });
});
