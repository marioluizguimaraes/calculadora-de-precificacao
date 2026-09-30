import { getJson } from '@/shared/api/http';
import { env } from '@/shared/config/env';

import type { LatLng } from '../utils/geo';

interface OsrmResponse {
  code: string;
  routes: { distance: number; duration: number }[];
}

export interface Route {
  distanceKm: number;
  durationMin: number;
}

/** Rota rodoviária real (OSRM). Retorna `null` quando não há rota. */
export async function fetchRoute(from: LatLng, to: LatLng, signal?: AbortSignal) {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const data = await getJson<OsrmResponse>(
    `${env.VITE_ROUTING_API_URL}/route/v1/driving/${coords}?overview=false`,
    { signal, timeoutMs: 10_000 },
  );
  const route = data.routes[0];
  if (data.code !== 'Ok' || !route) return null;
  return {
    distanceKm: Math.round(route.distance / 1000),
    durationMin: Math.round(route.duration / 60),
  } satisfies Route;
}
