export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Fator rodoviário: estradas raramente são linha reta. 1,25 é uma aproximação usual
 * para o Brasil quando não há rota calculada.
 */
export const ROAD_FACTOR = 1.25;

/** Distância em linha reta (haversine), em km. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Estimativa rodoviária a partir da linha reta. */
export function estimateRoadKm(a: LatLng, b: LatLng): number {
  return haversineKm(a, b) * ROAD_FACTOR;
}

/**
 * Distância média estimada da base até um conjunto de cidades (atuação regional/estadual).
 * Usa a mediana para não deixar uma cidade muito distante distorcer a média.
 */
export function typicalDistanceKm(origin: LatLng, destinations: LatLng[]): number | null {
  if (destinations.length === 0) return null;
  const distances = destinations.map((d) => estimateRoadKm(origin, d)).sort((x, y) => x - y);
  const mid = Math.floor(distances.length / 2);
  const median =
    distances.length % 2 === 0
      ? ((distances[mid - 1] ?? 0) + (distances[mid] ?? 0)) / 2
      : (distances[mid] ?? 0);
  return Math.round(median);
}
