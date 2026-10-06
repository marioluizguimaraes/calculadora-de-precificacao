import { HttpError } from './http';
import { createMockTable, mockError, mockRequest } from './mock';

beforeEach(() => {
  localStorage.clear();
});

describe('createMockTable', () => {
  it('começa com as sementes e persiste as alterações', () => {
    const table = createMockTable('teste', [{ id: 'a', n: 1 }]);
    table.insert({ id: 'b', n: 2 });
    table.update('a', { n: 10 });

    const reopened = createMockTable('teste', [{ id: 'a', n: 1 }]);
    expect(reopened.all()).toEqual([
      { id: 'a', n: 10 },
      { id: 'b', n: 2 },
    ]);
  });

  it('não altera as sementes originais', () => {
    const initial = [{ id: 'a', n: 1 }];
    createMockTable('teste', initial).update('a', { n: 5 });
    expect(initial[0]?.n).toBe(1);
  });

  it('remove registros', () => {
    const table = createMockTable('teste', [{ id: 'a' }, { id: 'b' }]);
    table.remove('a');
    expect(table.all()).toEqual([{ id: 'b' }]);
  });
});

describe('mockRequest', () => {
  it('converte o erro do mock em HttpError, como a API real', async () => {
    const request = mockRequest('GET /x', () => mockError(404, 'Sumiu'));
    await expect(request).rejects.toBeInstanceOf(HttpError);
    await expect(request).rejects.toMatchObject({ status: 404, message: 'Sumiu' });
  });

  it('devolve uma cópia (a UI não altera o "banco")', async () => {
    const row = { id: 'a', tags: ['x'] };
    const result = await mockRequest('GET /a', () => row);
    result.tags.push('y');
    expect(row.tags).toEqual(['x']);
  });
});
