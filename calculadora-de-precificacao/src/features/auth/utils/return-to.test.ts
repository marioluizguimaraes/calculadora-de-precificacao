import { initials, loginPath, safeReturnTo } from './return-to';

describe('safeReturnTo', () => {
  it('aceita caminhos internos', () => {
    expect(safeReturnTo('/orcamento/resumo?x=1')).toBe('/orcamento/resumo?x=1');
  });

  it('recusa endereços externos e vazios', () => {
    expect(safeReturnTo('https://golpe.com')).toBe('/');
    expect(safeReturnTo('//golpe.com')).toBe('/');
    expect(safeReturnTo(null, '/conta')).toBe('/conta');
  });
});

it('monta o link de login com motivo e volta', () => {
  expect(loginPath('pdf', '/orcamento/resumo')).toBe(
    '/entrar?motivo=pdf&voltar=%2Forcamento%2Fresumo',
  );
});

it('gera iniciais', () => {
  expect(initials('Lia Campos')).toBe('LC');
  expect(initials('  beatriz  ')).toBe('B');
  expect(initials('Ana Maria de Souza')).toBe('AS');
  expect(initials('')).toBe('?');
});
