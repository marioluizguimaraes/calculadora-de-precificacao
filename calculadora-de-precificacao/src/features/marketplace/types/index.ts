import type { Stage, Tier } from '@/features/pricing';

/** Retrato público de quem oferece o serviço (copiado no momento da publicação). */
export interface Participant {
  id: string;
  name: string;
  businessName: string;
  headline: string;
  city: { name: string; uf: string } | null;
}

export type ListingStatus = 'ativa' | 'pausada';

export interface ListingService {
  label: string;
  stage: Stage;
  hours: number;
}

/** Oferta de serviço: uma precificação que a pessoa tornou pública. Sem dados do cliente. */
export interface Listing {
  id: string;
  owner: Participant;
  /** Orçamento de origem (só o dono enxerga o orçamento em si). */
  quoteId: string | null;
  title: string;
  description: string;
  tier: Tier;
  services: ListingService[];
  deliverables: string;
  priceCents: number;
  /** `false` = "sob consulta" (o preço só é conversado no chat). */
  showPrice: boolean;
  tags: string[];
  status: ListingStatus;
  publishedAt: string;
  updatedAt: string;
}

export type ListingSort = 'recentes' | 'menor-preco' | 'maior-preco';

export interface ListingSearch {
  q: string;
  tier: Tier | null;
  uf: string | null;
  sort: ListingSort;
}

export interface PublishListingInput {
  quoteId: string | null;
  title: string;
  description: string;
  tier: Tier;
  services: ListingService[];
  deliverables: string;
  priceCents: number;
  showPrice: boolean;
  tags: string[];
}

export type ListingPatch = Partial<
  Pick<Listing, 'title' | 'description' | 'showPrice' | 'status' | 'tags'>
>;

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

/**
 * Conversa entre quem oferece e um interessado, sempre presa a UMA oferta:
 * cada oferta tem um chat separado para cada pessoa que escreve.
 */
export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  owner: Participant;
  buyer: Participant;
  createdAt: string;
  /** Última leitura de cada participante (id → ISO). */
  lastReadAt: Record<string, string>;
}

/** Conversa do ponto de vista de quem pergunta. */
export interface ConversationSummary extends Conversation {
  role: 'dono' | 'interessado';
  counterpart: Participant;
  lastMessage: ChatMessage | null;
  unread: number;
  updatedAt: string;
}

export interface SendMessageInput {
  listingId: string;
  text: string;
  /** Sem id, a primeira mensagem cria a conversa (quem escreve é o interessado). */
  conversationId: string | null;
}
