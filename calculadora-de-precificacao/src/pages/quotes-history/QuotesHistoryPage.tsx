import { Button } from '@heroui/react';
import { ArrowUpRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

import { STAGE_META, STAGES } from '@/features/pricing';
import { clientLabel, describeLocation, quoteTitle, useHistoryStore } from '@/features/quote';
import { EmptyScene } from '@/shared/components/layout/EmptyScene';
import { SceneHeading } from '@/shared/components/layout/SceneHeading';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/shared/components/ui/item';
import { formatDateShort, formatMoney } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

const STAGE_BG = { pre: 'bg-stage-pre', producao: 'bg-stage-producao', pos: 'bg-stage-pos' };

export function QuotesHistoryPage() {
  const quotes = useHistoryStore((s) => s.quotes);
  const remove = useHistoryStore((s) => s.remove);
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <SceneHeading
        eyebrow="Arquivo"
        title="Orçamentos salvos"
        description="Cada orçamento guarda os custos do estúdio da época em que foi salvo."
      />

      {quotes.length === 0 ? (
        <EmptyScene
          title="Nada salvo ainda"
          message="Monte um orçamento e toque em Salvar no resumo para ele aparecer aqui."
          action={{
            label: 'Montar orçamento',
            onPress: () => {
              void navigate('/orcamento');
            },
          }}
        />
      ) : (
        <ItemGroup className="gap-3">
          {quotes.map((q) => {
            const hours = STAGES.map((st) =>
              q.draft.services.filter((s) => s.stage === st).reduce((a, s) => a + s.hours, 0),
            );
            const total = Math.max(
              1,
              hours.reduce((a, b) => a + b, 0),
            );
            return (
              <Item key={q.id} role="listitem" variant="outline" className="card-soft p-5">
                <ItemMedia className="hidden w-28 flex-col gap-1.5 sm:flex">
                  <span
                    className="flex h-2 w-full gap-[2px] overflow-hidden rounded-full"
                    aria-hidden
                  >
                    {STAGES.map((st, i) => (
                      <span
                        key={st}
                        className={cn('h-full', STAGE_BG[st])}
                        style={{ flexGrow: (hours[i] ?? 0) / total, flexBasis: 0 }}
                        title={STAGE_META[st].label}
                      />
                    ))}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {formatDateShort(q.savedAt)}
                  </span>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-base text-foreground">{quoteTitle(q.draft)}</ItemTitle>
                  <ItemDescription className="text-muted">
                    {clientLabel(q.draft)} · {describeLocation(q.draft.location)}
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="gap-3">
                  <span className="font-display text-xl text-foreground tabular">
                    {formatMoney(q.priceCents)}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => {
                      void navigate(`/orcamentos/${q.id}`);
                    }}
                  >
                    Abrir <ArrowUpRight className="size-3.5" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={`Excluir ${quoteTitle(q.draft)}`}
                    onPress={() => {
                      remove(q.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      )}
    </div>
  );
}
