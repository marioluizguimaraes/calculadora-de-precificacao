import type { ChatMessage } from '../types';

import { dayLabel, groupMessages } from './chat';

const msg = (id: string, senderId: string, createdAt: string): ChatMessage => ({
  id,
  conversationId: 'c',
  senderId,
  text: id,
  createdAt,
});

const NOW = new Date('2026-09-29T15:00:00');

describe('groupMessages', () => {
  it('separa por dia e agrupa sequências do mesmo remetente', () => {
    const days = groupMessages(
      [
        msg('a', 'u1', '2026-09-28T10:00:00'),
        msg('b', 'u1', '2026-09-29T10:00:00'),
        msg('c', 'u1', '2026-09-29T10:02:00'),
        msg('d', 'u2', '2026-09-29T10:03:00'),
        msg('e', 'u2', '2026-09-29T11:00:00'),
      ],
      NOW,
    );
    expect(days.map((d) => d.label)).toEqual(['Ontem', 'Hoje']);
    const today = days[1]?.rows.map((r) => [r.message.id, r.startsGroup, r.endsGroup]);
    expect(today).toEqual([
      ['b', true, false],
      ['c', false, true],
      ['d', true, true],
      // Quase uma hora depois: começa outra sequência.
      ['e', true, true],
    ]);
  });
});

it('rotula dias antigos com a data', () => {
  expect(dayLabel('2026-09-29T08:00:00', NOW)).toBe('Hoje');
  expect(dayLabel('2026-09-20T08:00:00', NOW)).toMatch(/20 de setembro/);
});
