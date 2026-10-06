import { env } from '@/shared/config/env';

import { HttpError } from './http';
import { getApiSession, type ApiIdentity } from './session';

/**
 * "Servidor" falso para desenvolver sem backend. Cada feature guarda as sementes em
 * `features/<nome>/mocks/*.json` e as regras em `mocks/handlers.ts`; as alterações ficam no
 * localStorage, então sobrevivem ao recarregar a página (e aparecem em outras abas).
 */

const LATENCY_MS: [number, number] = import.meta.env.MODE === 'test' ? [0, 0] : [150, 450];

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/** Executa o handler como se fosse uma chamada de rede: com latência e resposta copiada. */
export async function mockRequest<T>(route: string, handler: () => T | Promise<T>): Promise<T> {
  const [min, max] = LATENCY_MS;
  await wait(min + Math.random() * (max - min));
  try {
    return structuredClone(await handler());
  } catch (error) {
    if (error instanceof MockError)
      throw new HttpError(error.message, error.status, `mock:${route}`);
    throw error;
  }
}

class MockError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Erro HTTP simulado — chega na UI como `HttpError`, igual ao da API real. */
export function mockError(status: number, message: string): never {
  throw new MockError(status, message);
}

/** Quem está chamando. Na API real, o servidor descobre isso pelo token. */
export function requireMockUser(): ApiIdentity {
  const session = getApiSession();
  if (!session) mockError(401, 'Entre na sua conta para continuar.');
  return session.user;
}

export function mockUserOrNull(): ApiIdentity | null {
  return getApiSession()?.user ?? null;
}

/** Converte o JSON importado no tipo da tabela (os JSON são escritos à mão, sem validação). */
export function seed<T>(data: unknown): T[] {
  return data as T[];
}

export interface MockTable<T extends { id: string }> {
  all: () => T[];
  find: (id: string) => T | undefined;
  insert: (row: T) => T;
  update: (id: string, patch: Partial<T>) => T;
  remove: (id: string) => void;
}

/** Tabela persistida no localStorage, iniciada com as sementes na primeira leitura. */
export function createMockTable<T extends { id: string }>(
  name: string,
  initial: readonly T[],
): MockTable<T> {
  const key = `${env.VITE_STORAGE_KEY}:mock:${name}`;

  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T[];
    } catch {
      // JSON corrompido: volta para as sementes.
    }
    return structuredClone([...initial]);
  };
  const write = (rows: T[]) => {
    localStorage.setItem(key, JSON.stringify(rows));
  };

  return {
    all: read,
    find: (id) => read().find((row) => row.id === id),
    insert: (row) => {
      write([...read(), row]);
      return row;
    },
    update: (id, patch) => {
      const rows = read();
      const index = rows.findIndex((row) => row.id === id);
      const existing = rows[index];
      if (!existing) mockError(404, 'Registro não encontrado.');
      const next = { ...existing, ...patch };
      rows[index] = next;
      write(rows);
      return next;
    },
    remove: (id) => {
      write(read().filter((row) => row.id !== id));
    },
  };
}
