import { getJson } from '@/shared/api/http';
import { env } from '@/shared/config/env';

import type { LatLng } from '../utils/geo';

export interface IbgeState {
  id: number;
  uf: string;
  name: string;
  region: string;
}

export interface IbgeCity {
  id: number;
  name: string;
  uf: string;
  intermediateRegionId: number;
  intermediateRegionName: string;
}

interface RawState {
  id: number;
  sigla: string;
  nome: string;
  regiao: { nome: string };
}

interface RawCityFlat {
  'municipio-id': number;
  'municipio-nome': string;
  'UF-sigla': string;
  'regiao-intermediaria-id': number;
  'regiao-intermediaria-nome': string;
}

interface RawCoords {
  codigo_ibge: number;
  latitude: number;
  longitude: number;
}

/** Estados (IBGE — API de Localidades). */
export async function fetchStates(signal?: AbortSignal): Promise<IbgeState[]> {
  const data = await getJson<RawState[]>(`${env.VITE_IBGE_API_URL}/estados?orderBy=nome`, {
    signal,
  });
  return data.map((s) => ({ id: s.id, uf: s.sigla, name: s.nome, region: s.regiao.nome }));
}

/**
 * Municípios de uma UF já com a região geográfica intermediária de cada um
 * (visão "nivelada" do IBGE — uma chamada resolve cidades e regiões).
 */
export async function fetchCities(uf: string, signal?: AbortSignal): Promise<IbgeCity[]> {
  const data = await getJson<RawCityFlat[]>(
    `${env.VITE_IBGE_API_URL}/estados/${uf}/municipios?view=nivelado`,
    { signal },
  );
  return data
    .map((c) => ({
      id: c['municipio-id'],
      name: c['municipio-nome'],
      uf: c['UF-sigla'],
      intermediateRegionId: c['regiao-intermediaria-id'],
      intermediateRegionName: c['regiao-intermediaria-nome'],
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

/** Coordenadas de todos os municípios, indexadas pelo código IBGE (dataset aberto, ~1,5 MB). */
export async function fetchCoordinates(signal?: AbortSignal): Promise<Map<number, LatLng>> {
  const data = await getJson<RawCoords[]>(env.VITE_MUNICIPALITIES_COORDS_URL, {
    signal,
    timeoutMs: 30_000,
  });
  return new Map(data.map((c) => [c.codigo_ibge, { lat: c.latitude, lng: c.longitude }]));
}
