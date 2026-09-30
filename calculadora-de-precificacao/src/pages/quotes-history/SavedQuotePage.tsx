import { Button, toast } from '@heroui/react';
import { Calculator, Copy, FileDown, PencilLine } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { calculatePricing, useDraftStore } from '@/features/pricing';
import { ProposalDialog, QuoteSummary, useHistoryStore } from '@/features/quote';
import { formatDateShort } from '@/shared/lib/format';
import { createId } from '@/shared/lib/id';

import { NotFoundPage } from '../not-found/NotFoundPage';

export function SavedQuotePage() {
  const { id } = useParams();
  const quote = useHistoryStore((s) => s.quotes.find((q) => q.id === id));
  const replace = useDraftStore((s) => s.replace);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!quote) return <NotFoundPage message="Esse orçamento não está no seu histórico." />;

  const edit = (asCopy: boolean) => {
    const now = new Date().toISOString();
    replace(
      asCopy
        ? {
            ...quote.draft,
            id: createId(),
            createdAt: now,
            updatedAt: now,
            project: { ...quote.draft.project, title: `${quote.draft.project.title} (cópia)` },
          }
        : quote.draft,
    );
    if (asCopy) toast.success('Cópia criada', { description: 'Ajuste o que mudou e salve.' });
    void navigate('/orcamento?etapa=projeto');
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6">
      <QuoteSummary
        draft={quote.draft}
        profile={quote.profile}
        eyebrow={`Salvo em ${formatDateShort(quote.savedAt)} · custos da época`}
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-full bg-surface"
              onPress={() => {
                void navigate(`/orcamentos/${quote.id}/calculo`);
              }}
            >
              <Calculator className="size-4" /> Como chegamos no preço
            </Button>
            <Button
              variant="tertiary"
              onPress={() => {
                edit(false);
              }}
            >
              <PencilLine className="size-4" /> Editar
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                edit(true);
              }}
            >
              <Copy className="size-4" /> Duplicar
            </Button>
            <Button
              onPress={() => {
                setDialogOpen(true);
              }}
            >
              <FileDown className="size-4" /> Gerar proposta
            </Button>
          </>
        }
      />
      <ProposalDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        draft={quote.draft}
        result={calculatePricing(quote.draft, quote.profile)}
      />
    </div>
  );
}
