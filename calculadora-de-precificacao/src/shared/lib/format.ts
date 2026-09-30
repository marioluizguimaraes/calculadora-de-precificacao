import { env } from '@/shared/config/env';

const currency = new Intl.NumberFormat(env.VITE_DEFAULT_LOCALE, {
  style: 'currency',
  currency: env.VITE_DEFAULT_CURRENCY,
});

const currencyCompact = new Intl.NumberFormat(env.VITE_DEFAULT_LOCALE, {
  style: 'currency',
  currency: env.VITE_DEFAULT_CURRENCY,
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat(env.VITE_DEFAULT_LOCALE, { maximumFractionDigits: 1 });

const percent = new Intl.NumberFormat(env.VITE_DEFAULT_LOCALE, {
  style: 'percent',
  maximumFractionDigits: 1,
});

const date = new Intl.DateTimeFormat(env.VITE_DEFAULT_LOCALE, { dateStyle: 'long' });
const dateShort = new Intl.DateTimeFormat(env.VITE_DEFAULT_LOCALE, { dateStyle: 'short' });

/** Centavos → "R$ 1.234,56". */
export function formatMoney(cents: number): string {
  return currency.format(cents / 100);
}

/** Centavos → "R$ 1.235" (sem centavos, para destaques). */
export function formatMoneyShort(cents: number): string {
  return currencyCompact.format(Math.round(cents / 100));
}

export function formatNumber(value: number): string {
  return decimal.format(value);
}

/** 0.253 → "25,3%". */
export function formatPercent(ratio: number): string {
  return percent.format(ratio);
}

export function formatHours(hours: number): string {
  return `${decimal.format(hours)} h`;
}

/** Horas → timecode "HH:MM" (linguagem de ilha de edição). */
export function formatTimecode(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDate(iso: string | Date): string {
  return date.format(typeof iso === 'string' ? new Date(iso) : iso);
}

export function formatDateShort(iso: string | Date): string {
  return dateShort.format(typeof iso === 'string' ? new Date(iso) : iso);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

export const toCents = (reais: number) => Math.round(reais * 100);
export const toReais = (cents: number) => cents / 100;
