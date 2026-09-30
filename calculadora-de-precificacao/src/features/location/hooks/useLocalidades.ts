import { useQuery } from '@tanstack/react-query';

import { fetchCities, fetchCoordinates, fetchStates } from '../api/localidades';
import { fetchRoute } from '../api/routing';
import type { LatLng } from '../utils/geo';

// Localidades mudam raramente: cache "para sempre" durante a sessão.
const STATIC = { staleTime: Infinity, gcTime: Infinity } as const;

export function useStates() {
  return useQuery({
    queryKey: ['ibge', 'estados'],
    queryFn: ({ signal }) => fetchStates(signal),
    ...STATIC,
  });
}

export function useCities(uf: string | null | undefined) {
  return useQuery({
    queryKey: ['ibge', 'municipios', uf],
    queryFn: ({ signal }) => fetchCities(uf ?? '', signal),
    enabled: Boolean(uf),
    ...STATIC,
  });
}

export function useCoordinates(enabled = true) {
  return useQuery({
    queryKey: ['municipios', 'coordenadas'],
    queryFn: ({ signal }) => fetchCoordinates(signal),
    enabled,
    ...STATIC,
  });
}

export function useRoute(from: LatLng | undefined, to: LatLng | undefined) {
  return useQuery({
    queryKey: ['rota', from, to],
    queryFn: ({ signal }) => (from && to ? fetchRoute(from, to, signal) : null),
    enabled: Boolean(from && to),
    retry: 1,
    ...STATIC,
  });
}
