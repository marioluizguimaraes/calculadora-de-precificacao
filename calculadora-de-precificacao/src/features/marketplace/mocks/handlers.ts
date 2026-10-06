import {
  createMockTable,
  mockError,
  mockUserOrNull,
  requireMockUser,
  seed,
} from '@/shared/api/mock';
import type { ApiIdentity } from '@/shared/api/session';
import { createId } from '@/shared/lib/id';

import { MAX_MESSAGE_LENGTH } from '../constants';
import type {
  ChatMessage,
  Conversation,
  ConversationSummary,
  Listing,
  ListingPatch,
  ListingSearch,
  Participant,
  PublishListingInput,
  SendMessageInput,
} from '../types';
import { searchListings } from '../utils/search';

import conversationsSeed from './conversations.json';
import listingsSeed from './listings.json';
import messagesSeed from './messages.json';

const listings = createMockTable<Listing>('ofertas', seed<Listing>(listingsSeed));
const conversations = createMockTable<Conversation>(
  'conversas',
  seed<Conversation>(conversationsSeed),
);
const messages = createMockTable<ChatMessage>('mensagens', seed<ChatMessage>(messagesSeed));

/** Donos das ofertas de exemplo respondem sozinhos à primeira mensagem — só no mock. */
const AUTO_REPLY_OWNERS = new Set(seed<Listing>(listingsSeed).map((l) => l.owner.id));
const AUTO_REPLY_DELAY_MS = 2_500;

const now = () => new Date().toISOString();

function toParticipant(user: ApiIdentity): Participant {
  return {
    id: user.id,
    name: user.name,
    businessName: user.businessName,
    headline: user.headline,
    city: user.city,
  };
}

/** Mensagens já "entregues" (a resposta automática fica agendada no futuro). */
function visibleMessages(conversationId: string): ChatMessage[] {
  const cutoff = now();
  return messages
    .all()
    .filter((m) => m.conversationId === conversationId && m.createdAt <= cutoff)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function summarize(conversation: Conversation, userId: string): ConversationSummary {
  const list = visibleMessages(conversation.id);
  const lastMessage = list.at(-1) ?? null;
  const readAt = conversation.lastReadAt[userId] ?? '';
  const role = conversation.owner.id === userId ? 'dono' : 'interessado';
  return {
    ...conversation,
    role,
    counterpart: role === 'dono' ? conversation.buyer : conversation.owner,
    lastMessage,
    unread: list.filter((m) => m.senderId !== userId && m.createdAt > readAt).length,
    updatedAt: lastMessage?.createdAt ?? conversation.createdAt,
  };
}

const byUpdatedDesc = (a: ConversationSummary, b: ConversationSummary) =>
  b.updatedAt.localeCompare(a.updatedAt);

const isParticipant = (c: Conversation, userId: string) =>
  c.owner.id === userId || c.buyer.id === userId;

function requireConversation(id: string) {
  const user = requireMockUser();
  const conversation = conversations.find(id);
  if (!conversation || !isParticipant(conversation, user.id)) {
    mockError(404, 'Conversa não encontrada.');
  }
  return { user, conversation };
}

function requireOwnListing(id: string) {
  const user = requireMockUser();
  const listing = listings.find(id);
  if (listing?.owner.id !== user.id) mockError(404, 'Oferta não encontrada.');
  return listing;
}

export const marketplaceHandlers = {
  search(params: ListingSearch): Listing[] {
    return searchListings(listings.all(), params);
  },

  get(id: string): Listing {
    const listing = listings.find(id);
    const viewer = mockUserOrNull();
    // Oferta pausada só aparece para o dono.
    if (!listing || (listing.status !== 'ativa' && listing.owner.id !== viewer?.id)) {
      mockError(404, 'Essa oferta não existe ou foi pausada.');
    }
    return listing;
  },

  mine(): Listing[] {
    const user = requireMockUser();
    return listings
      .all()
      .filter((l) => l.owner.id === user.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  publish(input: PublishListingInput): Listing {
    const user = requireMockUser();
    const timestamp = now();
    return listings.insert({
      ...input,
      id: createId(),
      owner: toParticipant(user),
      status: 'ativa',
      publishedAt: timestamp,
      updatedAt: timestamp,
    });
  },

  update(id: string, patch: ListingPatch): Listing {
    requireOwnListing(id);
    return listings.update(id, { ...patch, updatedAt: now() });
  },

  remove(id: string): void {
    requireOwnListing(id);
    const orphaned = conversations.all().filter((c) => c.listingId === id);
    for (const conversation of orphaned) {
      for (const message of messages.all().filter((m) => m.conversationId === conversation.id)) {
        messages.remove(message.id);
      }
      conversations.remove(conversation.id);
    }
    listings.remove(id);
  },

  conversations(): ConversationSummary[] {
    const user = requireMockUser();
    return conversations
      .all()
      .filter((c) => isParticipant(c, user.id))
      .map((c) => summarize(c, user.id))
      .sort(byUpdatedDesc);
  },

  listingConversations(listingId: string): ConversationSummary[] {
    return marketplaceHandlers.conversations().filter((c) => c.listingId === listingId);
  },

  messages(conversationId: string): ChatMessage[] {
    requireConversation(conversationId);
    return visibleMessages(conversationId);
  },

  send({ listingId, conversationId, text }: SendMessageInput) {
    const user = requireMockUser();
    const body = text.trim();
    if (!body) mockError(422, 'Escreva uma mensagem.');
    if (body.length > MAX_MESSAGE_LENGTH) mockError(422, 'Mensagem longa demais.');

    let conversation: Conversation;
    let isNew = false;
    if (conversationId) {
      conversation = requireConversation(conversationId).conversation;
      if (conversation.listingId !== listingId) mockError(422, 'A conversa é de outra oferta.');
    } else {
      const listing = marketplaceHandlers.get(listingId);
      if (listing.owner.id === user.id) {
        mockError(422, 'Você não pode abrir uma conversa com a sua própria oferta.');
      }
      const existing = conversations
        .all()
        .find((c) => c.listingId === listingId && c.buyer.id === user.id);
      isNew = !existing;
      conversation =
        existing ??
        conversations.insert({
          id: createId(),
          listingId,
          listingTitle: listing.title,
          owner: listing.owner,
          buyer: toParticipant(user),
          createdAt: now(),
          lastReadAt: {},
        });
    }

    const message = messages.insert({
      id: createId(),
      conversationId: conversation.id,
      senderId: user.id,
      text: body,
      createdAt: now(),
    });
    conversation = conversations.update(conversation.id, {
      lastReadAt: { ...conversation.lastReadAt, [user.id]: message.createdAt },
    });

    if (isNew && AUTO_REPLY_OWNERS.has(conversation.owner.id)) {
      messages.insert({
        id: createId(),
        conversationId: conversation.id,
        senderId: conversation.owner.id,
        text: `Oi, ${user.name.split(' ')[0] ?? ''}! Obrigado pelo interesse em "${conversation.listingTitle}". Me conta a data, o local e o que você imagina que eu já te respondo.`,
        createdAt: new Date(Date.now() + AUTO_REPLY_DELAY_MS).toISOString(),
      });
    }

    return { conversation: summarize(conversation, user.id), message };
  },

  markRead(conversationId: string): void {
    const { user, conversation } = requireConversation(conversationId);
    conversations.update(conversationId, {
      lastReadAt: { ...conversation.lastReadAt, [user.id]: now() },
    });
  },
};
