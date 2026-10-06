import { formatDate } from '@/shared/lib/format';

import type { ChatMessage } from '../types';

export interface MessageRow {
  message: ChatMessage;
  /** Primeira mensagem de uma sequência do mesmo remetente. */
  startsGroup: boolean;
  /** Última da sequência — é nela que aparecem horário e avatar. */
  endsGroup: boolean;
}

export interface MessageDay {
  key: string;
  label: string;
  rows: MessageRow[];
}

/** Mensagens do mesmo remetente com menos que isso entre si ficam "coladas". */
const GROUP_GAP_MS = 5 * 60_000;

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function dayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(date) === dayKey(now)) return 'Hoje';
  if (dayKey(date) === dayKey(yesterday)) return 'Ontem';
  return formatDate(date);
}

/** Separa por dia e marca as sequências do mesmo remetente (visual de mensageiro). */
export function groupMessages(messages: ChatMessage[], now: Date = new Date()): MessageDay[] {
  const days: MessageDay[] = [];
  messages.forEach((message, i) => {
    const key = dayKey(new Date(message.createdAt));
    let day = days.at(-1);
    if (day?.key !== key) {
      day = { key, label: dayLabel(message.createdAt, now), rows: [] };
      days.push(day);
    }
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const close = (a: ChatMessage | undefined, b: ChatMessage | undefined) => {
      if (!a || !b) return false;
      if (a.senderId !== b.senderId) return false;
      if (dayKey(new Date(a.createdAt)) !== dayKey(new Date(b.createdAt))) return false;
      return Math.abs(Date.parse(b.createdAt) - Date.parse(a.createdAt)) < GROUP_GAP_MS;
    };
    day.rows.push({
      message,
      startsGroup: !close(prev, message),
      endsGroup: !close(message, next),
    });
  });
  return days;
}
