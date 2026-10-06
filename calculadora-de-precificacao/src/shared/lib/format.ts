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

const time = new Intl.DateTimeFormat(env.VITE_DEFAULT_LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
});
const relative = new Intl.RelativeTimeFormat(env.VITE_DEFAULT_LOCALE, { numeric: 'auto' });

/** ISO → "14:05". */
export function formatTime(iso: string): string {
  return time.format(new Date(iso));
}

/** ISO → "agora", "há 5 minutos", "ontem"… (até uma semana; depois, a data curta). */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return 'agora';
  if (abs < 3_600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return relative.format(Math.round(seconds / 3_600), 'hour');
  if (abs < 7 * 86_400) return relative.format(Math.round(seconds / 86_400), 'day');
  return formatDateShort(iso);
}

const monthYear = new Intl.DateTimeFormat(env.VITE_DEFAULT_LOCALE, {
  month: 'long',
  year: 'numeric',
});

/** ISO → "setembro de 2026". */
export function formatMonthYear(iso: string): string {
  return monthYear.format(new Date(iso));
}
