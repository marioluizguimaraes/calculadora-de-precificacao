import type { DocumentProps } from '@react-pdf/renderer';
import { createElement, type ReactElement } from 'react';

import type { BusinessProfile, PricingResult, QuoteDraft } from '@/features/pricing';

import { quoteTitle, slugify } from '../utils/describe';

import type { ProposalOptions } from './ProposalDocument';

/**
 * Gera e baixa o PDF da proposta. O renderizador de PDF (~1 MB) é carregado sob demanda,
 * só quando a pessoa pede a proposta.
 */
export async function downloadProposal(params: {
  draft: QuoteDraft;
  identity: BusinessProfile;
  result: PricingResult;
  options: ProposalOptions;
}) {
  const [{ pdf }, { ProposalDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./ProposalDocument'),
  ]);
  const blob = await pdf(
    createElement(ProposalDocument, params) as ReactElement<DocumentProps>,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `proposta-${slugify(quoteTitle(params.draft)) || 'orcamento'}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1_000);
}
