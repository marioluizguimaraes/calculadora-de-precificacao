import { Spinner } from '@heroui/react';
import { ArrowLeft, ArrowUpRight, MessagesSquare, Search, Store } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router';

import { UserAvatar, useAuth } from '@/features/auth';
import { EmptyScene } from '@/shared/components/layout/EmptyScene';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { formatMoneyShort, formatRelative } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { TIER_COVER } from '../../constants';
import { useConversations, useListing } from '../../hooks/useMarketplace';
import type { ConversationSummary } from '../../types';
import { normalizeText } from '../../utils/search';

import { ChatThread } from './ChatThread';

type Filter = 'todas' | 'nao-lidas' | 'dono' | 'interessado';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'nao-lidas', label: 'Não lidas' },
  { id: 'dono', label: 'Minhas ofertas' },
  { id: 'interessado', label: 'Contratando' },
];

function matches(c: ConversationSummary, filter: Filter, query: string): boolean {
  if (filter === 'nao-lidas' && c.unread === 0) return false;
  if (filter === 'dono' && c.role !== 'dono') return false;
  if (filter === 'interessado' && c.role !== 'interessado') return false;
  if (!query) return true;
  const text = normalizeText(
    [
      c.counterpart.name,
      c.counterpart.businessName,
      c.listingTitle,
      c.lastMessage?.text ?? '',
    ].join(' '),
  );
  return normalizeText(query)
    .split(/\s+/)
    .every((word) => text.includes(word));
}

function ConversationItem({
  conversation: c,
  meId,
  active,
  onSelect,
}: {
  conversation: ConversationSummary;
  meId: string;
  active: boolean;
  onSelect: () => void;
}) {
  const mine = c.lastMessage?.senderId === meId;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus',
        active ? 'bg-accent/10' : 'hover:bg-surface-secondary',
      )}
    >
      {active && (
        <motion.span
          layoutId="conversa-ativa"
          className="absolute inset-y-3 left-0 w-1 rounded-full bg-accent"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative">
        <UserAvatar name={c.counterpart.name} />
        {c.unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-accent" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm text-foreground',
              c.unread > 0 ? 'font-semibold' : 'font-medium',
            )}
          >
            {c.counterpart.businessName || c.counterpart.name}
          </span>
          <span
            className={cn(
              'shrink-0 text-[11px]',
              c.unread > 0 ? 'font-semibold text-accent' : 'text-muted',
            )}
          >
            {formatRelative(c.updatedAt)}
          </span>
        </span>
        <span className="flex items-center gap-1.5 truncate text-xs text-muted">
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 py-px text-[10px] font-semibold',
              c.role === 'dono' ? 'bg-accent/12 text-accent' : 'bg-surface-secondary text-muted',
            )}
          >
            {c.role === 'dono' ? 'Sua oferta' : 'Contratando'}
          </span>
          <span className="truncate">{c.listingTitle}</span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-sm', c.unread > 0 ? 'text-foreground' : 'text-muted')}>
            {c.lastMessage ? `${mine ? 'Você: ' : ''}${c.lastMessage.text}` : 'Sem mensagens'}
          </span>
          {c.unread > 0 && (
            <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1.5 text-[10px] leading-5 font-semibold text-accent-foreground tabular">
              {c.unread}
              <span className="sr-only"> não lidas</span>
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

/** Cabeçalho da conversa: quem é a pessoa e de qual oferta é o chat. */
function ConversationHeader({
  conversation,
  onBack,
}: {
  conversation: ConversationSummary;
  onBack?: () => void;
}) {
  const { data: listing } = useListing(conversation.listingId);
  const { counterpart } = conversation;
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-separator px-4 py-3">
      {onBack && (
        <button
          type="button"
          aria-label="Voltar para as conversas"
          onClick={onBack}
          className="grid size-9 place-items-center rounded-full text-muted outline-none hover:bg-surface-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus"
        >
          <ArrowLeft className="size-4" />
        </button>
      )}
      <UserAvatar name={counterpart.name} />
      <div className="flex min-w-0 flex-1 basis-40 flex-col">
        <span className="truncate font-semibold text-foreground">
          {counterpart.businessName || counterpart.name}
        </span>
        <span className="truncate text-xs text-muted">
          {counterpart.headline || counterpart.name}
          {counterpart.city && ` · ${counterpart.city.name}/${counterpart.city.uf}`}
        </span>
      </div>
      <Link
        to={`/servicos/${conversation.listingId}?conversa=${conversation.id}`}
        className="group flex w-full min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface p-1.5 pr-3 transition-all outline-none hover:-translate-y-0.5 hover:border-accent/40 focus-visible:ring-2 focus-visible:ring-focus sm:w-auto sm:max-w-72"
      >
        <span
          aria-hidden
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-xl',
            listing ? TIER_COVER[listing.tier] : 'bg-surface-secondary text-muted',
          )}
        >
          <Store className="size-4" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
            Chat da oferta
            {listing?.showPrice && ` · ${formatMoneyShort(listing.priceCents)}`}
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {conversation.listingTitle}
          </span>
        </span>
        <ArrowUpRight
          className="size-4 shrink-0 text-muted transition-transform group-hover:rotate-45 group-hover:text-accent"
          aria-hidden
        />
      </Link>
    </header>
  );
}

interface InboxProps {
  selectedId: string | null;
  onSelect: (conversationId: string | null) => void;
  onExplore: () => void;
}

/**
 * Caixa de mensagens em duas colunas. Cada conversa continua presa à sua oferta — o cabeçalho
 * mostra de qual oferta é o chat e leva até ela.
 */
export function Inbox({ selectedId, onSelect, onExplore }: InboxProps) {
  const { user } = useAuth();
  const { data: conversations = [], isLoading } = useConversations();
  const [filter, setFilter] = useState<Filter>('todas');
  const [query, setQuery] = useState('');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (!user) return null;
  if (isLoading) {
    return (
      <div className="grid min-h-80 place-items-center">
        <Spinner aria-label="Carregando conversas" />
      </div>
    );
  }
  if (conversations.length === 0) {
    return (
      <EmptyScene
        compact
        title="Nenhuma conversa"
        message="Encontre um serviço e mande uma mensagem pelo chat da oferta."
        action={{ label: 'Buscar serviços', onPress: onExplore }}
      />
    );
  }

  const visible = conversations.filter((c) => matches(c, filter, query));
  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread, 0);
  // No desktop sempre há uma conversa aberta; no celular, a lista vem primeiro.
  const selected =
    conversations.find((c) => c.id === selectedId) ?? (isDesktop ? conversations[0] : undefined);

  return (
    <div className="grid h-[calc(100dvh-18rem)] min-h-[26rem] grid-cols-[minmax(0,1fr)] overflow-hidden card-soft lg:h-[calc(100dvh-14rem)] lg:grid-cols-[24rem_minmax(0,1fr)]">
      <aside
        aria-label="Conversas"
        className={cn(
          'flex min-h-0 flex-col border-separator lg:border-r',
          selected && !isDesktop && 'hidden',
        )}
      >
        <div className="flex flex-col gap-3 border-b border-separator p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Conversas</h2>
            {unreadTotal > 0 && (
              <span className="rounded-full bg-accent/12 px-2 py-0.5 text-xs font-semibold text-accent">
                {unreadTotal} não {unreadTotal === 1 ? 'lida' : 'lidas'}
              </span>
            )}
          </div>
          <label className="bg-field-background flex h-10 items-center gap-2 rounded-full border border-field-border px-3.5 transition-shadow focus-within:border-accent/50">
            <Search className="size-4 text-muted" aria-hidden />
            <span className="sr-only">Buscar conversa</span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Buscar pessoa ou oferta"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-field-placeholder"
            />
          </label>
          <div
            role="radiogroup"
            aria-label="Filtrar conversas"
            className="-mx-1 flex gap-1 overflow-x-auto px-1"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={filter === f.id}
                onClick={() => {
                  setFilter(f.id);
                }}
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  filter === f.id
                    ? 'bg-foreground text-background'
                    : 'bg-surface-secondary text-muted hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto p-2">
          <AnimatePresence initial={false}>
            {visible.map((c) => (
              <motion.li
                key={c.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ConversationItem
                  conversation={c}
                  meId={user.id}
                  active={c.id === selected?.id}
                  onSelect={() => {
                    onSelect(c.id);
                  }}
                />
              </motion.li>
            ))}
          </AnimatePresence>
          {visible.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-muted">
              Nenhuma conversa com esse filtro.
            </li>
          )}
        </ul>
      </aside>

      <section
        aria-label="Conversa aberta"
        className={cn('min-h-0 min-w-0', !selected && !isDesktop && 'hidden')}
      >
        {selected ? (
          <ChatThread
            key={selected.id}
            layout="fill"
            listingId={selected.listingId}
            meId={user.id}
            conversation={selected}
            counterpart={selected.counterpart}
            header={
              <ConversationHeader
                conversation={selected}
                onBack={
                  isDesktop
                    ? undefined
                    : () => {
                        onSelect(null);
                      }
                }
              />
            }
          />
        ) : (
          <div className="grid h-full place-items-center p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <MessagesSquare className="size-8 text-muted" aria-hidden />
              <p className="text-sm text-muted">Escolha uma conversa.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
