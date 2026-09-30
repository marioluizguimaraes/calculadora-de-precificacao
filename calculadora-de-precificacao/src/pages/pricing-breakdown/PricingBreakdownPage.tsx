import { Button } from '@heroui/react';
import { ArrowLeft, PencilLine } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import { useDraftStore, useProfileStore } from '@/features/pricing';
import { PricingBreakdown, useHistoryStore } from '@/features/quote';
import { formatDateShort } from '@/shared/lib/format';

import { NotFoundPage } from '../not-found/NotFoundPage';

/** "Como o preço foi gerado" — do rascunho atual ou de um orçamento salvo (`:id`). */
export function PricingBreakdownPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const draft = useDraftStore((s) => s.draft);
  const profile = useProfileStore((s) => s.profile);
  const saved = useHistoryStore((s) => (id ? s.quotes.find((q) => q.id === id) : undefined));

  if (id && !saved) return <NotFoundPage message="Esse orçamento não está no seu histórico." />;

  const backTo = saved ? `/orcamentos/${saved.id}` : '/orcamento/resumo';

  return (
    <div className="mx-auto max-w-[90rem] overflow-x-clip px-4 py-8 sm:px-6 lg:py-10">
      <PricingBreakdown
        draft={saved?.draft ?? draft}
        profile={saved?.profile ?? profile}
        editable={!saved}
        eyebrow={
          saved
            ? `Salvo em ${formatDateShort(saved.savedAt)} · custos da época`
            : 'Orçamento em andamento'
        }
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-full bg-surface"
              onPress={() => {
                void navigate(backTo);
              }}
            >
              <ArrowLeft className="size-4" /> Resumo
            </Button>
            {!saved && (
              <Button
                className="rounded-full"
                onPress={() => {
                  void navigate('/orcamento?etapa=margem');
                }}
              >
                <PencilLine className="size-4" /> Ajustar parâmetros
              </Button>
            )}
          </>
        }
      />
    </div>
  );
}
