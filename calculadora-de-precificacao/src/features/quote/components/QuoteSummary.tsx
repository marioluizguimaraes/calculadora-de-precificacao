import { Button } from '@heroui/react';
import { Info, Table2, TriangleAlert } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { TIER_META } from '@/features/services';
import {
  AnimatedPrice,
  calculatePricing,
  COST_GROUP_BG,
  COST_GROUP_ORDER,
  COST_GROUP_META,
  CompositionBar,
  ProductionTimeline,
  STAGE_BG,
  STAGE_META,
  STAGES,
  type BusinessProfile,
  type PricingResult,
  type QuoteDraft,
} from '@/features/pricing';
import { Coin, Pill } from '@/shared/components/brand/Decor';
import { Panel } from '@/shared/components/layout/Panel';
import { HoverCard, HoverCardTrigger } from '@/shared/components/ui/hover-card';
import {
  formatHours,
  formatMoney,
  formatNumber,
  formatPercent,
  pluralize,
} from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { clientLabel, describeLocation, quoteTitle } from '../utils/describe';

const SOURCES = {
  sebrae: {
    label: 'Sebrae — 7 etapas da precificação',
    href: 'https://www.sebraeplay.com.br/content/precificacao-de-servicos-7-etapas-para-chegar-ao-preco-ideal',
  },
  forasteiro: {
    label: 'Forasteiro — quanto cobrar',
    href: 'https://forasteiroproducoes.com/blog/videomaker-quanto-cobrar-producao-video/',
  },
  impulso: {
    label: 'Impulso Filmes — tabela de preços',
    href: 'https://www.impulsofilmes.com.br/como-funciona-a-tabela-de-precos-de-uma-produtora-de-video/',
  },
};

function Explain({ children, source }: { children: ReactNode; source: keyof typeof SOURCES }) {
  return (
    <HoverCardTrigger delay={150}>
      <Button isIconOnly size="sm" variant="ghost" aria-label="Como essa etapa é calculada">
        <Info className="size-3.5" />
      </Button>
      <HoverCard className="w-72 p-4" placement="top">
        <div className="flex flex-col gap-2 text-sm">
          {children}
          <a
            href={SOURCES[source].href}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-accent underline-offset-2 hover:underline"
          >
            Fonte: {SOURCES[source].label}
          </a>
        </div>
      </HoverCard>
    </HoverCardTrigger>
  );
}

function FormulaStep({
  op,
  label,
  value,
  detail,
  explain,
  emphasis,
}: {
  op: string;
  label: string;
  value: string;
  detail: string;
  explain?: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <li
      className={cn(
        'grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 py-3',
        emphasis && '-mx-3 rounded-2xl bg-accent/10 px-3',
      )}
    >
      <span className="text-center font-mono text-sm text-muted">{op}</span>
      <span className="flex flex-col">
        <span className="flex items-center gap-1 text-sm font-medium text-foreground">
          {label} {explain}
        </span>
        <span className="font-mono text-[11px] text-muted">{detail}</span>
      </span>
      <span
        className={cn(
          'text-right tabular',
          emphasis ? 'font-display text-xl text-foreground' : 'font-mono text-sm text-foreground',
        )}
      >
        {value}
      </span>
    </li>
  );
}

function CostTable({ result }: { result: PricingResult }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Composição do preço</caption>
      <thead>
        <tr className="border-b border-border text-left text-xs text-muted">
          <th className="py-2 font-medium">Grupo</th>
          <th className="py-2 text-right font-medium">Valor</th>
          <th className="py-2 text-right font-medium">Parte do preço</th>
        </tr>
      </thead>
      <tbody>
        {COST_GROUP_ORDER.map((g) => (
          <tr key={g} className="border-b border-border last:border-0">
            <td className="py-2.5">
              <span className="flex items-center gap-2">
                <span aria-hidden className={cn('size-2.5 rounded-[3px]', COST_GROUP_BG[g])} />
                {COST_GROUP_META[g].label}
              </span>
            </td>
            <td className="py-2.5 text-right font-mono tabular">
              {formatMoney(result.composition[g])}
            </td>
            <td className="py-2.5 text-right text-muted tabular">
              {formatPercent(result.composition[g] / Math.max(1, result.suggestedPriceCents))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface QuoteSummaryProps {
  draft: QuoteDraft;
  profile: BusinessProfile;
  actions: ReactNode;
  eyebrow: string;
}

export function QuoteSummary({ draft, profile, actions, eyebrow }: QuoteSummaryProps) {
  const [showTable, setShowTable] = useState(false);
  const result = calculatePricing(draft, profile);
  const variablePct =
    draft.pricing.taxRatePct + draft.pricing.paymentFeePct + draft.pricing.commissionPct;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-3xl flex-col gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-accent">
            <span aria-hidden className="h-px w-6 bg-accent" />
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl text-balance text-foreground sm:text-6xl">
            {quoteTitle(draft)}
          </h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{clientLabel(draft)}</span>
            <span aria-hidden>·</span>
            <span>{describeLocation(draft.location)}</span>
            <Pill tone="soft" className="px-3 py-1 text-xs">
              Tier {draft.project.tier} · {TIER_META[draft.project.tier].label}
            </Pill>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </header>

      {result.warnings.length > 0 && (
        <section
          aria-label="Revise antes de enviar"
          className="flex flex-col gap-3 card-ink p-5 sm:flex-row sm:items-start sm:gap-5"
        >
          <p className="flex shrink-0 items-center gap-2 text-base font-semibold">
            <TriangleAlert className="size-4 text-amber" aria-hidden />
            Revise antes de enviar
          </p>
          <ul className="flex flex-wrap gap-2">
            {result.warnings.map((w) => (
              <li
                key={w.code}
                className="rounded-2xl border border-ink-foreground/12 bg-ink-raised/60 px-3.5 py-2 text-sm text-ink-foreground"
              >
                {w.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section aria-label="Preço" className="card-hero flex flex-col justify-between gap-8 p-7">
          <Coin className="absolute top-6 -right-10 w-48 sm:right-4 sm:w-56" />
          <div className="relative">
            <p className="text-base font-medium">
              Preço sugerido para <span className="text-on-hero-soft">este projeto</span>
            </p>
            <p className="sr-only">{formatMoney(result.suggestedPriceCents)}</p>
            <AnimatedPrice
              cents={result.suggestedPriceCents}
              className="mt-3 font-display text-6xl sm:text-7xl"
            />
          </div>
          <dl className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ['Preço mínimo', formatMoney(result.minimumPriceCents), 'Lucro zero'],
              [
                'Lucro',
                formatMoney(result.profitCents),
                formatPercent(result.profitCents / Math.max(1, result.suggestedPriceCents)),
              ],
              [
                'Sua hora sai por',
                formatMoney(result.effectiveHourlyCents),
                `custo: ${formatMoney(result.hourlyCostCents)}`,
              ],
            ].map(([label, value, hint]) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 rounded-2xl border border-white/30 bg-white/10 px-3.5 py-3"
              >
                <dt className="text-xs text-white/80">{label}</dt>
                <dd className="text-lg font-semibold tabular">{value}</dd>
                <dd className="text-xs text-white/75">{hint}</dd>
              </div>
            ))}
          </dl>
        </section>

        <Panel title="Linha do tempo" description="Suas horas por etapa, em sequência.">
          <ProductionTimeline services={draft.services} />
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {STAGES.map((stage) => {
              const s = result.stages[stage];
              return (
                <li
                  key={stage}
                  className="flex flex-col gap-1 rounded-2xl bg-surface-secondary p-4"
                >
                  <p className="flex items-center gap-2 text-xs text-muted">
                    <span aria-hidden className={cn('size-2 rounded-full', STAGE_BG[stage])} />
                    {STAGE_META[stage].label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground tabular">
                    {formatMoney(s.priceCents)}
                  </p>
                  <p className="text-xs text-muted">
                    {formatHours(s.hours)} · {pluralize(s.days, 'diária', 'diárias')}
                  </p>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Para onde vai cada real"
        description="Composição do preço sugerido."
        actions={
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={showTable}
            onPress={() => {
              setShowTable((v) => !v);
            }}
          >
            <Table2 className="size-4" /> {showTable ? 'Ver gráfico' : 'Ver tabela'}
          </Button>
        }
      >
        {showTable ? (
          <CostTable result={result} />
        ) : (
          <CompositionBar composition={result.composition} />
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Como chegamos nesse número"
          description="Custo + markup, o método do Sebrae aplicado ao audiovisual."
        >
          <ol className="flex flex-col divide-y divide-separator">
            <FormulaStep
              op=""
              label="Custo da sua hora"
              value={formatMoney(result.hourlyCostCents)}
              detail={`custos fixos + pró-labore ÷ ${formatHours(result.productiveHoursPerMonth)}/mês`}
              explain={
                <Explain source="sebrae">
                  Tudo o que o estúdio custa por mês, dividido pelas horas em que você realmente
                  produz. É o piso de qualquer orçamento.
                </Explain>
              }
            />
            <FormulaStep
              op="×"
              label="Horas de trabalho"
              value={formatMoney(result.laborCents)}
              detail={`${formatHours(result.totalHours)} somando pré, set e pós`}
            />
            <FormulaStep
              op="+"
              label="Equipe"
              value={formatMoney(result.teamCents)}
              detail="diária × pessoas × diárias"
              explain={
                <Explain source="impulso">
                  O tamanho da equipe é um dos principais fatores do preço de uma produtora.
                </Explain>
              }
            />
            <FormulaStep
              op="+"
              label="Equipamentos"
              value={formatMoney(result.equipmentCents)}
              detail="depreciação do kit + locações"
              explain={
                <Explain source="forasteiro">
                  Depreciação linear: (valor de compra − valor de revenda) ÷ anos de vida útil,
                  dividida pelos dias de uso no ano.
                </Explain>
              }
            />
            <FormulaStep
              op="+"
              label="Logística"
              value={formatMoney(result.logistics.totalCents)}
              detail="deslocamento, alimentação, hospedagem e extras"
            />
            <FormulaStep
              op="="
              label="Custo direto"
              value={formatMoney(result.directCostCents)}
              detail="o custo unitário do serviço"
            />
            <FormulaStep
              op="×"
              label="Markup"
              value={result.markup.toFixed(3).replace('.', ',')}
              detail={`100 ÷ [100 − (${formatNumber(variablePct)}% + ${formatNumber(draft.pricing.profitPct)}% lucro)]`}
              explain={
                <Explain source="sebrae">
                  O markup embute no preço os impostos, taxas e o lucro desejado, calculados sobre o
                  valor de venda — não sobre o custo.
                </Explain>
              }
            />
            <FormulaStep
              op="="
              label="Preço sugerido"
              value={formatMoney(result.suggestedPriceCents)}
              detail={
                draft.pricing.roundToReais > 0
                  ? `arredondado para cima em R$ ${draft.pricing.roundToReais}`
                  : 'sem arredondamento'
              }
              emphasis
            />
          </ol>
        </Panel>

        <Panel title="O que está incluído">
          <div className="flex flex-col gap-5">
            {STAGES.map((stage) => {
              const items = draft.services.filter((s) => s.stage === stage);
              if (items.length === 0) return null;
              return (
                <div key={stage}>
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
                    <span aria-hidden className={cn('size-2 rounded-full', STAGE_BG[stage])} />
                    {STAGE_META[stage].label}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {items.map((i) => i.label).join(' · ')}
                  </p>
                </div>
              );
            })}
            {draft.team.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-muted">Equipe</p>
                <p className="text-sm text-foreground">
                  {draft.team
                    .map((m) => (m.count > 1 ? `${m.count}× ${m.role}` : m.role))
                    .join(' · ')}
                </p>
              </div>
            )}
            {draft.equipment.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-muted">Equipamentos</p>
                <p className="text-sm text-foreground">
                  {draft.equipment.map((e) => e.name).join(' · ')}
                </p>
              </div>
            )}
            {draft.project.deliverables && (
              <div>
                <p className="mb-2 text-xs font-semibold text-muted">Entrega</p>
                <p className="text-sm text-foreground">{draft.project.deliverables}</p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
