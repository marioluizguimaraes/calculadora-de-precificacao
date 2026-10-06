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

interface JsonRequestOptions extends RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

/** Requisição JSON autenticada (qualquer método). A mensagem de erro vem do corpo `{ message }`. */
export async function requestJson<T>(
  url: string,
  { method = 'GET', body, token, signal, timeoutMs = 15_000 }: JsonRequestOptions = {},
) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new HttpError(
      payload?.message ?? 'Não foi possível completar a ação.',
      response.status,
      url,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
