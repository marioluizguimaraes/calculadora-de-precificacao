export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
}

interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

/** GET JSON com timeout e erro tipado. */
export async function getJson<T>(url: string, { signal, timeoutMs = 15_000 }: RequestOptions = {}) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const response = await fetch(url, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new HttpError(`Falha ao consultar ${new URL(url).host}`, response.status, url);
  }
  return (await response.json()) as T;
}
