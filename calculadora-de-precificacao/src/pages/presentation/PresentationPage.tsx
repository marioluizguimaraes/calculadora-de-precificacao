import { Spinner } from '@heroui/react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import {
  calculatePricing,
  useDraftStore,
  useProfileStore,
  type BusinessProfile,
  type QuoteDraft,
} from '@/features/pricing';
import { ProposalDeck, useSavedQuote } from '@/features/quote';

import { NotFoundPage } from '../not-found/NotFoundPage';

function Deck({
  draft,
  costProfile,
  exitTo,
}: {
  draft: QuoteDraft;
  /** Perfil usado no cálculo — num orçamento salvo, a foto da época. */
  costProfile: BusinessProfile;
  exitTo: string;
}) {
  // Identidade e condições vêm do estúdio atual, como na proposta em PDF.
  const identity = useProfileStore((s) => s.profile);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [issuedAt] = useState(() => new Date());
  const data = useMemo(
    () => ({ draft, identity, result: calculatePricing(draft, costProfile), issuedAt }),
    [draft, identity, costProfile, issuedAt],
  );

  // O slide atual fica na URL: recarregar a página não volta para a capa.
  const handleIndexChange = useCallback((index: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('slide', String(index + 1));
    window.history.replaceState(window.history.state, '', url);
  }, []);

  return (
    <ProposalDeck
      data={data}
      initialIndex={Number(searchParams.get('slide') ?? 1) - 1 || 0}
      onIndexChange={handleIndexChange}
      onExit={() => {
        if (document.fullscreenElement) void document.exitFullscreen();
        void navigate(exitTo);
      }}
    />
  );
}

function DraftPresentation() {
  const draft = useDraftStore((s) => s.draft);
  const profile = useProfileStore((s) => s.profile);
  return <Deck draft={draft} costProfile={profile} exitTo="/orcamento/resumo" />;
}

function SavedPresentation({ id }: { id: string }) {
  const { data: quote, isLoading } = useSavedQuote(id);
  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner aria-label="Carregando apresentação" />
      </div>
    );
  }
  if (!quote) return <NotFoundPage message="Esse orçamento não está na sua conta." />;
  return <Deck draft={quote.draft} costProfile={quote.profile} exitTo={`/orcamentos/${id}`} />;
}

/** Proposta em slides, em tela cheia, para apresentar ao cliente numa reunião. */
export function PresentationPage() {
  const { id } = useParams();
  return id ? <SavedPresentation id={id} /> : <DraftPresentation />;
}
