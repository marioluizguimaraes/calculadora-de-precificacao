import type { CityRef, QuoteLocation } from '@/features/pricing';

import { estimateRoadKm, typicalDistanceKm } from '../utils/geo';

import { useCities, useCoordinates, useRoute } from './useLocalidades';

export interface DistanceEstimate {
  km: number | null;
  source: 'rota' | 'estimativa' | null;
  durationMin: number | null;
  isLoading: boolean;
  /** Explicação curta de como a distância foi obtida. */
  detail: string | null;
}

/**
 * Distância de ida da cidade-base até o local de atuação.
 * - cidade: rota rodoviária real (OSRM); sem rota, linha reta × fator rodoviário;
 * - regional/estadual: mediana das distâncias estimadas até os municípios da área.
 */
export function useDistance(location: QuoteLocation, base: CityRef | null): DistanceEstimate {
  const coords = useCoordinates(Boolean(base));
  const cities = useCities(location.scope === 'cidade' ? null : location.state?.uf);

  const origin = base ? coords.data?.get(base.id) : undefined;
  const target =
    location.scope === 'cidade' && location.city ? coords.data?.get(location.city.id) : undefined;
  const route = useRoute(origin, target);

  const empty: DistanceEstimate = {
    km: null,
    source: null,
    durationMin: null,
    isLoading: false,
    detail: null,
  };
  if (!base) return empty;
  if (coords.isLoading) return { ...empty, isLoading: true };
  if (!origin) return empty;

  if (location.scope === 'cidade') {
    if (!location.city || !target) return empty;
    if (location.city.id === base.id) {
      return { ...empty, km: 15, source: 'estimativa', detail: 'Mesma cidade da sua base' };
    }
    if (route.isLoading) return { ...empty, isLoading: true };
    if (route.data) {
      return {
        km: route.data.distanceKm,
        source: 'rota',
        durationMin: route.data.durationMin,
        isLoading: false,
        detail: 'Rota rodoviária calculada (OSRM)',
      };
    }
    return {
      ...empty,
      km: Math.round(estimateRoadKm(origin, target)),
      source: 'estimativa',
      detail: 'Linha reta × 1,25 (rota indisponível)',
    };
  }

  if (!location.state) return empty;
  if (cities.isLoading) return { ...empty, isLoading: true };
  const area = (cities.data ?? []).filter(
    (c) => location.scope === 'estadual' || c.intermediateRegionId === location.region?.id,
  );
  if (location.scope === 'regional' && !location.region) return empty;
  const points = area.flatMap((c) => {
    const p = coords.data?.get(c.id);
    return p ? [p] : [];
  });
  const km = typicalDistanceKm(origin, points);
  return {
    ...empty,
    km,
    source: km === null ? null : 'estimativa',
    detail: `Distância típica até ${points.length} municípios da área`,
  };
}
