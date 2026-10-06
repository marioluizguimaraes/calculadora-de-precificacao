import { apiRequest } from '@/shared/api/client';

import { marketplaceHandlers as mock } from '../mocks/handlers';
import type {
  ChatMessage,
  ConversationSummary,
  Listing,
  ListingPatch,
  ListingSearch,
  PublishListingInput,
  SendMessageInput,
} from '../types';

/** Ofertas públicas de serviço. Sem `VITE_API_URL`, responde com os dados de `mocks/`. */
export const listingsApi = {
  search: (params: ListingSearch) =>
    apiRequest<Listing[]>(
      {
        path: '/ofertas',
        query: { q: params.q, tier: params.tier, uf: params.uf, ordem: params.sort },
      },
      () => mock.search(params),
    ),

  get: (id: string) => apiRequest<Listing>({ path: `/ofertas/${id}` }, () => mock.get(id)),

  mine: () => apiRequest<Listing[]>({ path: '/me/ofertas' }, () => mock.mine()),

  publish: (input: PublishListingInput) =>
    apiRequest<Listing>({ method: 'POST', path: '/ofertas', body: input }, () =>
      mock.publish(input),
    ),

  update: ({ id, patch }: { id: string; patch: ListingPatch }) =>
    apiRequest<Listing>({ method: 'PATCH', path: `/ofertas/${id}`, body: patch }, () =>
      mock.update(id, patch),
    ),

  remove: (id: string) =>
    apiRequest<undefined>({ method: 'DELETE', path: `/ofertas/${id}` }, () => {
      mock.remove(id);
      return undefined;
    }),
};

/** Chat preso a cada oferta: uma conversa por oferta e por interessado. */
export const chatApi = {
  conversations: () =>
    apiRequest<ConversationSummary[]>({ path: '/me/conversas' }, () => mock.conversations()),

  listingConversations: (listingId: string) =>
    apiRequest<ConversationSummary[]>({ path: `/ofertas/${listingId}/conversas` }, () =>
      mock.listingConversations(listingId),
    ),

  messages: (conversationId: string) =>
    apiRequest<ChatMessage[]>({ path: `/conversas/${conversationId}/mensagens` }, () =>
      mock.messages(conversationId),
    ),

  send: (input: SendMessageInput) =>
    apiRequest<{ conversation: ConversationSummary; message: ChatMessage }>(
      { method: 'POST', path: `/ofertas/${input.listingId}/mensagens`, body: input },
      () => mock.send(input),
    ),

  markRead: (conversationId: string) =>
    apiRequest<undefined>({ method: 'POST', path: `/conversas/${conversationId}/lida` }, () => {
      mock.markRead(conversationId);
      return undefined;
    }),
};
