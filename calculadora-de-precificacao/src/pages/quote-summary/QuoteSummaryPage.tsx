import { Button, toast } from '@heroui/react';
import { Calculator, FileDown, PencilLine, Save } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { calculatePricing, useDraftStore, useProfileStore } from '@/features/pricing';
import { ProposalDialog, QuoteSummary, useHistoryStore } from '@/features/quote';

export function QuoteSummaryPage() {
  const draft = useDraftStore((s) => s.draft);
  const profile = useProfileStore((s) => s.profile);
  const save = useHistoryStore((s) => s.save);
  const isSaved = useHistoryStore((s) =>
    s.quotes.some((q) => q.id === draft.id && q.draft.updatedAt === draft.updatedAt),
  );
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = () => {
    save(draft, profile);
    toast.success('Orçamento salvo', { description: 'Está no seu histórico de orçamentos.' });
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
            <Button variant="secondary" isDisabled={isSaved} onPress={handleSave}>
              <Save className="size-4" /> {isSaved ? 'Salvo' : 'Salvar'}
            </Button>
            <Button
              onPress={() => {
                if (!isSaved) save(draft, profile);
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
        draft={draft}
        result={calculatePricing(draft, profile)}
      />
    </div>
  );
}
