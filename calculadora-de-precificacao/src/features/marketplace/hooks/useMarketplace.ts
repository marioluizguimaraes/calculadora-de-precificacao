import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ACCOUNT_QUERY_KEY, useAuth } from '@/features/auth';

import { chatApi, listingsApi } from '../api/marketplace-api';
import type { ChatMessage, ListingSearch } from '../types';

const LISTINGS_KEY = 'ofertas';
/** O chat não tem push no mock: consulta de tempos em tempos (a API real pode usar WebSocket). */
const CHAT_POLL_MS = 3_000;
const INBOX_POLL_MS = 8_000;

export function useListings(search: ListingSearch) {
  return useQuery({
    queryKey: [LISTINGS_KEY, 'busca', search],
    queryFn: () => listingsApi.search(search),
    placeholderData: keepPreviousData,
  });
}

export function useListing(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    // O viewer entra na chave: o dono enxerga a própria oferta mesmo pausada.
    queryKey: [LISTINGS_KEY, id, user?.id],
    queryFn: () => listingsApi.get(id ?? ''),
    enabled: Boolean(id),
    retry: false,
  });
}

function useAccountKey() {
  const { user } = useAuth();
  return { user, key: (...parts: unknown[]) => [ACCOUNT_QUERY_KEY, user?.id, ...parts] };
}

export function useMyListings() {
  const { user, key } = useAccountKey();
  return useQuery({ queryKey: key('ofertas'), queryFn: listingsApi.mine, enabled: Boolean(user) });
}

function useInvalidateListings() {
  const queryClient = useQueryClient();
  const { key } = useAccountKey();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [LISTINGS_KEY] });
    void queryClient.invalidateQueries({ queryKey: key('ofertas') });
  };
}

export function usePublishListing() {
  const invalidate = useInvalidateListings();
  return useMutation({ mutationFn: listingsApi.publish, onSuccess: invalidate });
}

export function useUpdateListing() {
  const invalidate = useInvalidateListings();
  return useMutation({ mutationFn: listingsApi.update, onSuccess: invalidate });
}

export function useRemoveListing() {
  const invalidate = useInvalidateListings();
  return useMutation({ mutationFn: listingsApi.remove, onSuccess: invalidate });
}

/** Todas as conversas da conta (caixa de mensagens e contador de não lidas). */
export function useConversations() {
  const { user, key } = useAccountKey();
  return useQuery({
    queryKey: key('conversas'),
    queryFn: chatApi.conversations,
    enabled: Boolean(user),
    refetchInterval: INBOX_POLL_MS,
  });
}

export function useUnreadCount(): number {
  const { data = [] } = useConversations();
  return data.reduce((sum, c) => sum + c.unread, 0);
}

/** Conversas de uma oferta: o dono vê uma por interessado; o interessado vê só a dele. */
export function useListingConversations(listingId: string) {
  const { user, key } = useAccountKey();
  return useQuery({
    queryKey: key('conversas', 'oferta', listingId),
    queryFn: () => chatApi.listingConversations(listingId),
    enabled: Boolean(user),
    refetchInterval: CHAT_POLL_MS,
  });
}

export function useMessages(conversationId: string | null) {
  const { user, key } = useAccountKey();
  return useQuery({
    queryKey: key('mensagens', conversationId),
    queryFn: () => chatApi.messages(conversationId ?? ''),
    enabled: Boolean(user && conversationId),
    refetchInterval: CHAT_POLL_MS,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { key } = useAccountKey();
  return useMutation({
    mutationFn: chatApi.send,
    onSuccess: ({ conversation, message }) => {
      queryClient.setQueryData<ChatMessage[]>(key('mensagens', conversation.id), (list = []) =>
        list.some((m) => m.id === message.id) ? list : [...list, message],
      );
      void queryClient.invalidateQueries({ queryKey: key('conversas') });
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  const { key } = useAccountKey();
  return useMutation({
    mutationFn: chatApi.markRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: key('conversas') });
    },
  });
}
