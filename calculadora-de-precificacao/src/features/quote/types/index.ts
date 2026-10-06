import type { BusinessProfile, QuoteDraft } from '@/features/pricing';

export interface SavedQuote {
  id: string;
  savedAt: string;
  draft: QuoteDraft;
  /** Foto do perfil no momento do salvamento: mudar custos depois não altera propostas antigas. */
  profile: BusinessProfile;
  priceCents: number;
}

export interface SaveQuoteInput {
  draft: QuoteDraft;
  profile: BusinessProfile;
  /** Só para importar históricos antigos com a data original. */
  savedAt?: string;
}
