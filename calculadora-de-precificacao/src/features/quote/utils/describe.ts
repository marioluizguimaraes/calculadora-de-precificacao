import type { QuoteDraft, QuoteLocation } from '@/features/pricing';

export function describeLocation(location: QuoteLocation): string {
  if (location.scope === 'cidade' && location.city) {
    return `${location.city.name}/${location.city.uf}`;
  }
  if (location.scope === 'regional' && location.region) {
    return `Região de ${location.region.name}${location.state ? ` (${location.state.uf})` : ''}`;
  }
  if (location.state) return `Estado de ${location.state.name}`;
  return 'Local a definir';
}

export function quoteTitle(draft: QuoteDraft): string {
  return draft.project.title.trim() || 'Orçamento sem título';
}

export function clientLabel(draft: QuoteDraft): string {
  const { name, company } = draft.client;
  if (name && company) return `${name} · ${company}`;
  return name || company || 'Cliente a definir';
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
