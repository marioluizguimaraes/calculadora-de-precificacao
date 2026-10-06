import { Spinner, toast } from '@heroui/react';
import { CheckCheck, MessageCircleMore, SendHorizontal } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';

import { UserAvatar } from '@/features/auth';
import { formatRelative, formatTime } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { MAX_MESSAGE_LENGTH } from '../../constants';
import { useMarkRead, useMessages, useSendMessage } from '../../hooks/useMarketplace';
import type { ConversationSummary, Participant } from '../../types';
import { groupMessages } from '../../utils/chat';

/** Primeiras mensagens prontas para quem ainda não sabe como começar. */
const SUGGESTIONS = [
  'Oi! Você tem disponibilidade para a data que preciso?',
  'O valor inclui deslocamento?',
  'Pode me mandar a proposta em PDF?',
];

interface ChatThreadProps {
  listingId: string;
  meId: string;
  /** `null` = ainda não existe conversa: a primeira mensagem a cria. */
  conversation: ConversationSummary | null;
  counterpart: Participant;
  onConversationStarted?: (conversationId: string) => void;
  /** Substitui o cabeçalho padrão (ex.: na caixa de mensagens, com a oferta ao lado). */
  header?: ReactNode;
  /** `fill` ocupa toda a altura do pai (caixa de mensagens); `panel` tem altura fixa. */
  layout?: 'panel' | 'fill';
}

function DefaultHeader({ counterpart }: { counterpart: Participant }) {
  return (
    <header className="flex items-center gap-3 border-b border-separator px-4 py-3">
      <UserAvatar name={counterpart.name} size="sm" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-foreground">
          {counterpart.businessName || counterpart.name}
        </span>
        <span className="truncate text-xs text-muted">{counterpart.headline}</span>
      </div>
    </header>
  );
}

export function ChatThread({
  listingId,
  meId,
  conversation,
  counterpart,
  onConversationStarted,
  header,
  layout = 'panel',
}: ChatThreadProps) {
  const [text, setText] = useState('');
  const { data: messages = [], isLoading } = useMessages(conversation?.id ?? null);
  const send = useSendMessage();
  const { mutate: markAsRead } = useMarkRead();
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const unread = conversation?.unread ?? 0;
  const days = groupMessages(messages);
  const lastMine = messages.filter((m) => m.senderId === meId).at(-1);
  const counterpartReadAt = conversation?.lastReadAt[counterpart.id] ?? '';

  // Rola para a última mensagem sempre que chega uma nova.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [messages.length, reduce]);

  useEffect(() => {
    if (conversation && unread > 0) markAsRead(conversation.id);
  }, [conversation, unread, markAsRead]);

  // A caixa de texto cresce com o conteúdo (até 5 linhas).
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 132)}px`;
  }, [text]);

  const submit = (e?: SyntheticEvent) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || send.isPending) return;
    send.mutate(
      { listingId, conversationId: conversation?.id ?? null, text: body },
      {
        onSuccess: ({ conversation: saved }) => {
          setText('');
          if (!conversation) onConversationStarted?.(saved.id);
        },
        onError: (error) => {
          toast.danger('Mensagem não enviada', { description: error.message });
        },
      },
    );
  };

  const remaining = MAX_MESSAGE_LENGTH - text.length;

  return (
    <div className={cn('flex flex-col', layout === 'fill' ? 'h-full min-h-0' : 'h-[34rem]')}>
      {header ?? <DefaultHeader counterpart={counterpart} />}

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label={`Conversa com ${counterpart.name}`}
        className="relative min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1.5px)] [background-size:18px_18px] px-4 py-4"
      >
        {isLoading && (
          <div className="grid h-full place-items-center">
            <Spinner aria-label="Carregando mensagens" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-accent/12 text-accent">
              <MessageCircleMore className="size-6" aria-hidden />
            </span>
            <div className="flex max-w-xs flex-col gap-1">
              <p className="font-semibold text-foreground">Comece a conversa</p>
              <p className="text-sm text-muted">
                Conte a data, o local e o que você imagina. Só vocês dois veem este chat.
              </p>
            </div>
            <div className="flex max-w-sm flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setText(s);
                    inputRef.current?.focus();
                  }}
                  className="rounded-2xl border border-border bg-surface px-3.5 py-2 text-left text-sm text-foreground shadow-[var(--surface-shadow)] outline-none hover:border-accent/40 focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {days.map((day) => (
          <section key={day.key} aria-label={day.label} className="flex flex-col">
            <div className="sticky top-0 z-10 my-3 flex justify-center">
              <span className="rounded-full border border-border bg-surface/95 px-3 py-1 text-[11px] font-medium text-muted shadow-[var(--surface-shadow)]">
                {day.label}
              </span>
            </div>
            <ol className="flex flex-col">
              <AnimatePresence initial={false}>
                {day.rows.map(({ message, startsGroup, endsGroup }) => {
                  const mine = message.senderId === meId;
                  const isLastMine = message.id === lastMine?.id;
                  return (
                    <motion.li
                      key={message.id}
                      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      className={cn(
                        'flex items-end gap-2',
                        mine ? 'justify-end' : 'justify-start',
                        startsGroup ? 'mt-3' : 'mt-1',
                      )}
                    >
                      {!mine && (
                        <span className="w-8 shrink-0">
                          {endsGroup && <UserAvatar name={counterpart.name} size="sm" />}
                        </span>
                      )}
                      <div
                        className={cn(
                          'flex max-w-[78%] flex-col gap-1',
                          mine ? 'items-end' : 'items-start',
                        )}
                      >
                        <span className="sr-only">{mine ? 'Você' : counterpart.name}:</span>
                        <p
                          title={formatRelative(message.createdAt)}
                          className={cn(
                            'px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                            mine
                              ? 'rounded-2xl bg-[linear-gradient(160deg,#f37a2c,#e05a12)] text-white shadow-[0_10px_20px_-14px_rgb(236_106_31/0.9)]'
                              : 'rounded-2xl border border-border bg-surface text-foreground shadow-[var(--surface-shadow)]',
                            mine && endsGroup && 'rounded-br-md',
                            !mine && endsGroup && 'rounded-bl-md',
                          )}
                        >
                          {message.text}
                        </p>
                        {endsGroup && (
                          <span className="flex items-center gap-1 px-1 font-mono text-[10px] text-muted tabular">
                            <time dateTime={message.createdAt}>
                              {formatTime(message.createdAt)}
                            </time>
                            {isLastMine && (
                              <span
                                className={cn(
                                  'flex items-center gap-0.5 font-sans',
                                  counterpartReadAt >= message.createdAt && 'text-accent',
                                )}
                              >
                                <CheckCheck className="size-3" aria-hidden />
                                {counterpartReadAt >= message.createdAt ? 'Lida' : 'Enviada'}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ol>
          </section>
        ))}
      </div>

      <form onSubmit={submit} className="border-t border-separator p-3">
        <div className="bg-field-background flex items-end gap-2 rounded-3xl border border-field-border py-1.5 pr-1.5 pl-4 transition-shadow focus-within:border-accent/50 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_16%,transparent)]">
          <label htmlFor={`mensagem-${listingId}`} className="sr-only">
            Mensagem
          </label>
          <textarea
            id={`mensagem-${listingId}`}
            ref={inputRef}
            rows={1}
            value={text}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => {
              setText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Escreva sua mensagem…"
            className="max-h-33 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-field-placeholder"
          />
          <motion.button
            type="submit"
            aria-label="Enviar mensagem"
            disabled={!text.trim() || send.isPending}
            whileTap={{ scale: 0.9 }}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_10px_20px_-10px_rgb(236_106_31/0.9)] transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40"
          >
            {send.isPending ? (
              <Spinner size="sm" color="current" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
          </motion.button>
        </div>
        <p className="mt-1.5 flex justify-between px-2 text-[11px] text-muted">
          <span>Enter envia · Shift + Enter quebra a linha</span>
          {remaining < 200 && <span className="tabular">{remaining}</span>}
        </p>
      </form>
    </div>
  );
}
