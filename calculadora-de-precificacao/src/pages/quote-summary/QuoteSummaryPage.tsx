import { Button, Spinner, toast } from '@heroui/react';
import { Calculator, FileDown, PencilLine, Presentation, Save } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuthGate } from '@/features/auth';
import { calculatePricing, useDraftStore, useProfileStore } from '@/features/pricing';
import { ProposalDialog, QuoteSummary, useSavedQuotes, useSaveQuote } from '@/features/quote';

export function QuoteSummaryPage() {
  const draft = useDraftStore((s) => s.draft);
  const profile = useProfileStore((s) => s.profile);
  const { quotes } = useSavedQuotes();
  const save = useSaveQuote();
  const gate = useAuthGate();
  const isSaved = quotes.some((q) => q.id === draft.id && q.draft.updatedAt === draft.updatedAt);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Sem conta, nada é salvo: salvar e baixar o PDF levam ao login e voltam para cá.
  const handleSave = () => {
    if (!gate('salvar')) return;
    save.mutate(
      { draft, profile },
      {
        onSuccess: () => {
          toast.success('Orçamento salvo', { description: 'Está nos orçamentos da sua conta.' });
        },
        onError: (error) => {
          toast.danger('Não foi possível salvar', { description: error.message });
        },
      },
    );
  };

  const handleProposal = () => {
    if (!gate('pdf')) return;
    if (!isSaved) save.mutate({ draft, profile });
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6">
      <QuoteSummary
        draft={draft}
        profile={profile}
        eyebrow="Resumo do orçamento"
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-full bg-surface"
              onPress={() => {
                void navigate('/calculo');
              }}
            >
              <Calculator className="size-4" /> Como chegamos no preço
            </Button>
            <Button
              variant="tertiary"
              onPress={() => {
                void navigate('/orcamento');
              }}
            >
              <PencilLine className="size-4" /> Editar
            </Button>
            <Button variant="secondary" isDisabled={isSaved || save.isPending} onPress={handleSave}>
              {save.isPending ? <Spinner size="sm" color="current" /> : <Save className="size-4" />}
              {isSaved ? 'Salvo' : 'Salvar'}
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                void navigate('/apresentacao');
              }}
            >
              <Presentation className="size-4" /> Apresentação
            </Button>
            <Button onPress={handleProposal}>
              <FileDown className="size-4" /> Gerar proposta
            </Button>
          </>
        }
      />
      <ProposalDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        draft={draft}
        result={calculatePricing(draft, profile)}
      />
    </div>
  );
}
