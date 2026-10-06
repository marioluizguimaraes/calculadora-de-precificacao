import { actAs, actAsVisitor } from '@/test/fixtures/session';

import { marketplaceHandlers as api } from './handlers';

const LIA_LISTING = 'of-lia-casamento';

beforeEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe('chat por oferta', () => {
  it('cria uma conversa por interessado e a mantém presa à oferta', () => {
    actAs({ id: 'u-ana', name: 'Ana Souza' });
    const first = api.send({ listingId: LIA_LISTING, conversationId: null, text: 'Oi!' });
    const again = api.send({ listingId: LIA_LISTING, conversationId: null, text: 'Tudo bem?' });
    expect(again.conversation.id).toBe(first.conversation.id);
    expect(first.conversation.role).toBe('interessado');

    actAs({ id: 'u-joao', name: 'João' });
    const other = api.send({ listingId: LIA_LISTING, conversationId: null, text: 'Olá' });
    expect(other.conversation.id).not.toBe(first.conversation.id);

    // A dona da oferta vê as duas conversas separadas (mais a de exemplo).
    actAs({ id: 'u-lia' });
    const buyers = api.listingConversations(LIA_LISTING).map((c) => c.buyer.id);
    expect(buyers).toEqual(expect.arrayContaining(['u-ana', 'u-joao', 'u-demo']));
    expect(api.listingConversations(LIA_LISTING).every((c) => c.role === 'dono')).toBe(true);
  });

  it('só os dois participantes leem a conversa', () => {
    actAs({ id: 'u-ana' });
    const { conversation } = api.send({ listingId: LIA_LISTING, conversationId: null, text: 'Oi' });

    actAs({ id: 'u-intruso' });
    expect(() => api.messages(conversation.id)).toThrow('Conversa não encontrada.');
    expect(api.listingConversations(LIA_LISTING)).toEqual([]);
  });

  it('conta não lidas e zera ao marcar como lida', () => {
    actAs({ id: 'u-ana' });
    const { conversation } = api.send({ listingId: LIA_LISTING, conversationId: null, text: 'Oi' });

    actAs({ id: 'u-lia' });
    const seen = api.conversations().find((c) => c.id === conversation.id);
    expect(seen?.unread).toBe(1);
    api.markRead(conversation.id);
    expect(api.conversations().find((c) => c.id === conversation.id)?.unread).toBe(0);
  });

  it('a resposta automática do mock só aparece depois do atraso', () => {
    vi.useFakeTimers({ now: new Date('2026-09-29T12:00:00.000Z') });
    actAs({ id: 'u-ana', name: 'Ana Souza' });
    const { conversation } = api.send({ listingId: LIA_LISTING, conversationId: null, text: 'Oi' });
    expect(api.messages(conversation.id)).toHaveLength(1);

    vi.advanceTimersByTime(3_000);
    const messages = api.messages(conversation.id);
    expect(messages).toHaveLength(2);
    expect(messages[1]?.senderId).toBe('u-lia');
    expect(messages[1]?.text).toContain('Oi, Ana!');
  });

  it('não deixa abrir conversa com a própria oferta nem sem login', () => {
    actAs({ id: 'u-lia' });
    expect(() => api.send({ listingId: LIA_LISTING, conversationId: null, text: 'Oi' })).toThrow(
      'própria oferta',
    );
    actAsVisitor();
    expect(() => api.send({ listingId: LIA_LISTING, conversationId: null, text: 'Oi' })).toThrow(
      'Entre na sua conta',
    );
  });
});

describe('ofertas', () => {
  it('publica com o perfil de quem está logado e pausa só para o dono', () => {
    actAs({
      id: 'u-ana',
      name: 'Ana',
      businessName: 'Ana Filmes',
      city: { name: 'Recife', uf: 'PE' },
    });
    const listing = api.publish({
      quoteId: 'q1',
      title: 'Timelapse de obra',
      description: 'Registro mensal da obra em timelapse, com edição.',
      tier: 2,
      services: [],
      deliverables: '',
      priceCents: 300_000,
      showPrice: true,
      tags: [],
    });
    expect(listing.owner).toMatchObject({ id: 'u-ana', businessName: 'Ana Filmes' });
    expect(api.search({ q: 'timelapse', tier: null, uf: 'PE', sort: 'recentes' })).toHaveLength(1);

    api.update(listing.id, { status: 'pausada' });
    expect(api.search({ q: 'timelapse', tier: null, uf: null, sort: 'recentes' })).toHaveLength(0);
    expect(api.get(listing.id).status).toBe('pausada');

    actAs({ id: 'u-outro' });
    expect(() => api.get(listing.id)).toThrow();
    expect(() => api.update(listing.id, { status: 'ativa' })).toThrow('Oferta não encontrada.');
  });
});
