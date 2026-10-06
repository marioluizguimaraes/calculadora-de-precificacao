import type { QuoteDraft } from '@/features/pricing';
import { quoteTitle, type SavedQuote } from '@/features/quote';

import type { PublishListingInput } from '../types';

/** Sugestão de descrição: entregáveis e observações do projeto, sem nada do cliente. */
function describe(draft: QuoteDraft): string {
  return [draft.project.deliverables, draft.project.notes]
    .map((t) => t.trim())
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Transforma um orçamento salvo em oferta pública. Leva só o que descreve o serviço
 * (serviços, horas, entregáveis e preço) — nome, empresa e e-mail do cliente ficam de fora.
 */
export function listingFromQuote(quote: SavedQuote): PublishListingInput {
  const { draft } = quote;
  return {
    quoteId: quote.id,
    title: quoteTitle(draft),
    description: describe(draft),
    tier: draft.project.tier,
    services: draft.services
      .filter((s) => s.hours > 0)
      .map(({ label, stage, hours }) => ({ label, stage, hours })),
    deliverables: draft.project.deliverables.trim(),
    priceCents: quote.priceCents,
    showPrice: true,
    tags: [],
  };
}
