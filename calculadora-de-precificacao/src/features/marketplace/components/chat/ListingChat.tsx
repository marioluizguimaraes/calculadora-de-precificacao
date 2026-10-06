import { Button, Spinner } from '@heroui/react';
import { LogIn, MessagesSquare } from 'lucide-react';
import { useSearchParams } from 'react-router';

import { UserAvatar, useAuth, useAuthGate } from '@/features/auth';
import { formatRelative } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { useListingConversations } from '../../hooks/useMarketplace';
import type { Listing } from '../../types';

import { ChatThread } from './ChatThread';

/**
 * Chat da oferta. Cada interessado tem a própria conversa com quem oferece, e ela só existe
 * aqui, dentro da oferta. O dono vê a lista de interessados e alterna entre as conversas.
 */
export function ListingChat({ listing }: { listing: Listing }) {
  const { user } = useAuth();
  const gate = useAuthGate();
  const [params, setParams] = useSearchParams();
  const { data: conversations = [], isLoading } = useListingConversations(listing.id);

  const select = (conversationId: string) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('conversa', conversationId);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <MessagesSquare className="size-8 text-accent" aria-hidden />
        <p className="max-w-xs text-sm text-muted">
          Entre na sua conta para conversar com {listing.owner.businessName} sobre este serviço.
        </p>
        <Button
          className="rounded-full"
          onPress={() => {
            gate('chat', `/servicos/${listing.id}#chat`);
          }}
        >
          <LogIn className="size-4" /> Entrar para conversar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid min-h-[20rem] place-items-center">
        <Spinner aria-label="Carregando conversas" />
      </div>
    );
  }

  // Interessado: uma única conversa (a dele) com quem oferece.
  if (listing.owner.id !== user.id) {
    return (
      <ChatThread
        listingId={listing.id}
        meId={user.id}
        conversation={conversations[0] ?? null}
        counterpart={listing.owner}
      />
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <MessagesSquare className="size-8 text-muted" aria-hidden />
        <p className="max-w-xs text-sm text-muted">
          Ninguém escreveu ainda. Quando alguém se interessar por esta oferta, a conversa aparece
          aqui.
        </p>
      </div>
    );
  }

  const selected =
    conversations.find((c) => c.id === params.get('conversa')) ?? conversations[0] ?? null;

  return (
    <div className="flex flex-col">
      <nav
        aria-label="Interessados"
        className="flex gap-1 overflow-x-auto border-b border-separator p-2"
      >
        {conversations.map((c) => {
          const active = c.id === selected?.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-current={active ? 'true' : undefined}
              onClick={() => {
                select(c.id);
              }}
              className={cn(
                'flex max-w-56 shrink-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus',
                active ? 'bg-accent/10' : 'hover:bg-surface-secondary',
              )}
            >
              <UserAvatar name={c.buyer.name} size="sm" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">{c.buyer.name}</span>
                <span className="truncate text-xs text-muted">
                  {c.lastMessage ? formatRelative(c.lastMessage.createdAt) : 'sem mensagens'}
                </span>
              </span>
              {c.unread > 0 && (
                <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground tabular">
                  {c.unread}
                  <span className="sr-only"> não lidas</span>
                </span>
              )}
            </button>
          );
        })}
      </nav>
      {selected && (
        <ChatThread
          key={selected.id}
          listingId={listing.id}
          meId={user.id}
          conversation={selected}
          counterpart={selected.buyer}
        />
      )}
    </div>
  );
}
