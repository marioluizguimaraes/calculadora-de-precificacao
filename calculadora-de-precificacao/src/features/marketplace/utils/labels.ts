import type { Participant } from '../types';

export function cityLabel(city: Participant['city']): string {
  return city ? `${city.name}/${city.uf}` : 'Atende remoto';
}
