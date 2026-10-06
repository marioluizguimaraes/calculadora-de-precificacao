import { env } from '@/shared/config/env';

import { requestJson } from './http';
import { mockRequest } from './mock';
import { getApiSession } from './session';

export interface ApiRequest {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** Caminho REST, ex.: `/ofertas/123`. */
  path: string;
  query?: Record<string, string | number | null | undefined>;
  body?: unknown;
}

/**
 * Ponto único de troca entre mock e API real. Cada chamada descreve o endpoint REST **e** o
 * handler do mock; com `VITE_API_URL` definido, o mock é ignorado e a requisição vai para a API.
 */
export function apiRequest<T>(request: ApiRequest, mock: () => T | Promise<T>): Promise<T> {
  const route = `${request.method ?? 'GET'} ${request.path}`;
  if (!env.VITE_API_URL) return mockRequest(route, mock);

  const url = new URL(env.VITE_API_URL.replace(/\/$/, '') + request.path);
  for (const [name, value] of Object.entries(request.query ?? {})) {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(name, String(value));
    }
  }
  return requestJson<T>(url.toString(), {
    method: request.method,
    body: request.body,
    token: getApiSession()?.token,
  });
}
