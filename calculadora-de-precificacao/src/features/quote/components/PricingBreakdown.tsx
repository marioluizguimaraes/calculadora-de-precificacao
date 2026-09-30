import { ArrowLeft, ArrowRight, PencilLine, TriangleAlert } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import {
  calculatePricing,
  profitStatus,
  type BusinessProfile,
  type QuoteDraft,
} from '@/features/pricing';
import { TIER_META } from '@/features/services';
import { Coin, NumberedPoint, Pill, TwoToneHeading } from '@/shared/components/brand/Decor';
import { FloatingPills, type FloatingPillSpec } from '@/shared/components/motion/FloatingPills';
import { Reveal } from '@/shared/components/motion/Reveal';
import { Tilt } from '@/shared/components/motion/Tilt';
import { formatMoney, formatNumber, formatPercent, pluralize } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { clientLabel, describeLocation, quoteTitle } from '../utils/describe';
import {
  buildFormulaModel,
  KIND_META,
  VAR_KINDS,
  type FormulaVar,
  type Token,
  type VarKind,
} from '../utils/formula-model';

/* ------------------------------------------------------------------------------------------ */
/* Peças                                                                                       */
/* ------------------------------------------------------------------------------------------ */

const KIND_CHIP: Record<VarKind, string> = {
  fixo: 'border-transparent bg-ink text-ink-foreground',
  estudio: 'border-amber bg-amber/20 text-foreground',
  orcamento: 'border-accent/60 bg-accent/10 text-foreground',
  calculado: 'border-dashed border-foreground/35 bg-surface text-foreground',
};

const KIND_DOT: Record<VarKind, string> = {
  fixo: 'bg-ink',
  estudio: 'bg-amber',
  orcamento: 'bg-accent',
  calculado: 'border border-dashed border-foreground/50 bg-surface',
};

function KindDot({ kind, className }: { kind: VarKind; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2.5 shrink-0 rounded-full', KIND_DOT[kind], className)}
    />
  );
}

interface ChipState {
  hovered: string | null;
  setHovered: (id: string | null) => void;
  filter: VarKind | null;
}

/** Uma peça da fórmula: rótulo pequeno em cima, valor embaixo, cor pelo tipo. */
function VarChip({
  id,
  label,
  value,
  kind,
  state,
  size = 'md',
}: {
  id?: string;
  label: string;
  value: string;
  kind: VarKind;
  state: ChipState;
  size?: 'md' | 'lg';
}) {
  const active = id !== undefined && state.hovered === id;
  const dimmed = state.filter !== null && state.filter !== kind;
  const body = (
    <>
      <span
        className={cn(
          'text-[10px] leading-tight',
          kind === 'fixo' ? 'text-ink-muted' : 'text-muted',
        )}
      >
        {label}
      </span>
      <span className={cn('font-semibold tabular', size === 'lg' ? 'text-lg' : 'text-sm')}>
        {value}
      </span>
    </>
  );
  const className = cn(
    'inline-flex flex-col items-start rounded-lg border px-2.5 py-1.5 text-left transition-all duration-200',
    KIND_CHIP[kind],
    active &&
      'z-10 -translate-y-0.5 shadow-[0_0_0_2px_var(--accent),0_10px_20px_-10px_rgb(236_106_31/0.6)]',
    dimmed && 'opacity-25',
  );
  if (id === undefined) return <span className={className}>{body}</span>;
  return (
    <button
      type="button"
      className={cn(className, 'outline-none focus-visible:ring-2 focus-visible:ring-focus')}
      onPointerEnter={() => {
        state.setHovered(id);
      }}
      onFocus={() => {
        state.setHovered(id);
      }}
      aria-label={`${label}: ${value}`}
    >
      {body}
    </button>
  );
}

function Expression({
  tokens,
  vars,
  state,
  size,
}: {
  tokens: Token[];
  vars: Record<string, FormulaVar>;
  state: ChipState;
  size?: 'md' | 'lg';
}) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {tokens.map((tok, i) => {
        if (tok.t === 'op')
          return (
            <span key={i} aria-hidden className="px-0.5 text-lg font-light text-muted">
              {tok.op}
            </span>
          );
        if (tok.t === 'val')
          return (
            <VarChip
              key={i}
              label={tok.label}
              value={tok.value}
              kind={tok.kind}
              state={state}
              size={size}
            />
          );
        const variable = vars[tok.id];
        if (!variable) return null;
        return (
          <VarChip
            key={i}
            id={variable.id}
            label={variable.label}
            value={variable.value}
            kind={variable.kind}
            state={state}
            size={size}
          />
        );
      })}
    </span>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Tela                                                                                       */
/* ------------------------------------------------------------------------------------------ */

interface PricingBreakdownProps {
  draft: QuoteDraft;
  profile: BusinessProfile;
  /** Contexto acima do título (ex.: "Orçamento em andamento"). */
  eyebrow: string;
  actions?: ReactNode;
  /** Mostra links "alterar" (desligado em orçamentos salvos, que são fotografias). */
  editable?: boolean;
}

/**
 * Como o preço foi gerado: cada fórmula montada com peças, cada peça dizendo se é um valor
 * fixo do método, do estúdio, uma resposta deste orçamento ou o resultado de outra fórmula.
 */
export function PricingBreakdown({
  draft,
  profile,
  eyebrow,
  actions,
  editable = true,
}: PricingBreakdownProps) {
  const reduce = useReducedMotion();
  // Memorizado: passar o mouse nas peças muda estado, mas não deve recalcular o preço.
  const result = useMemo(() => calculatePricing(draft, profile), [draft, profile]);
  const { vars, formulas } = useMemo(
    () => buildFormulaModel(draft, profile, result),
    [draft, profile, result],
  );
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [filter, setFilter] = useState<VarKind | null>(null);
  const state: ChipState = { hovered, setHovered, filter };

  const formula = formulas[index] ?? formulas[0];
  const resultVar = formula ? vars[formula.resultId] : undefined;
  const focusVar = hovered ? vars[hovered] : undefined;
  const p = draft.pricing;
  const status = profitStatus(p.profitPct);
  const variablePct = p.taxRatePct + p.paymentFeePct + p.commissionPct;
  const profitShare =
    result.suggestedPriceCents > 0 ? result.profitCents / result.suggestedPriceCents : 0;
  const catalog = Object.values(vars);

  const checks = [
    {
      title: `Lucro de ${formatNumber(p.profitPct)}%`,
      detail: `${status.label} · referência 20–30%`,
      ok: status.color === 'success',
    },
    {
      title: 'Percentuais abaixo de 100%',
      detail: `${formatNumber(variablePct)}% de impostos, taxas e comissão + ${formatNumber(p.profitPct)}% de lucro`,
      ok: !result.warnings.some((w) => w.code === 'percentuais-invalidos'),
    },
    {
      title: 'Distância até o local',
      detail:
        draft.logistics.transportMode === 'fixo'
          ? 'Transporte por valor fixo — a distância não entra na conta'
          : draft.location.distanceKm === null
            ? 'Não definida — o deslocamento ficou fora do preço'
            : `${formatNumber(draft.location.distanceKm)} km de ida`,
      ok:
        draft.logistics.transportMode === 'fixo' ||
        draft.location.distanceKm !== null ||
        result.captureDays === 0,
    },
    {
      title: 'Custo da hora calculado',
      detail:
        result.hourlyCostCents > 0
          ? `${formatMoney(result.hourlyCostCents)} por hora`
          : 'Preencha custos e jornada em Meu estúdio',
      ok: result.hourlyCostCents > 0,
    },
  ];
  const pending = checks.filter((c) => !c.ok).length;

  const pills = useMemo<FloatingPillSpec[]>(
    () => [
      {
        text: `Hora ${formatMoney(result.hourlyCostCents)}`,
        tone: 'amber',
        tilt: -9,
        className: 'left-[4%] top-[8%]',
        depth: 1.2,
      },
      {
        text: 'Fixo do método',
        tone: 'ink',
        tilt: 7,
        className: 'left-[14%] top-[34%]',
        depth: 0.7,
      },
      {
        text: `Markup ${vars.markup?.value ?? ''}`,
        tone: 'accent',
        tilt: 4,
        className: 'left-[3%] top-[58%]',
        depth: 1.5,
      },
      {
        text: pluralize(result.captureDays, 'diária de set', 'diárias de set'),
        tone: 'cream',
        tilt: -4,
        className: 'left-[10%] top-[84%]',
        depth: 0.9,
      },
      {
        text: `Lucro ${formatNumber(p.profitPct)}%`,
        tone: 'cream',
        tilt: 5,
        className: 'right-[6%] top-[10%]',
        depth: 1,
      },
      {
        text: 'Deste orçamento',
        tone: 'accent',
        tilt: -6,
        className: 'right-[3%] top-[38%]',
        depth: 1.4,
      },
      {
        text: 'Do seu estúdio',
        tone: 'amber',
        tilt: 3,
        className: 'right-[9%] top-[64%]',
        depth: 0.8,
      },
      {
        text: `Custo ${formatMoney(result.directCostCents)}`,
        tone: 'cream',
        tilt: -5,
        className: 'right-[18%] top-[86%]',
        depth: 1.1,
      },
    ],
    [result, vars, p.profitPct],
  );

  return (
    <div className="flex flex-col gap-16">
      {/* Cabeçalho */}
      <Reveal>
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-4xl flex-col gap-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-accent">
              <span aria-hidden className="h-px w-6 bg-accent" />
              {eyebrow}
            </p>
            <TwoToneHeading
              soft="Como o preço foi gerado —"
              strong="cada fórmula, cada variável"
              className="text-[clamp(2.4rem,5.5vw,4.5rem)]"
            />
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-muted">
              <span className="font-medium text-foreground">{quoteTitle(draft)}</span>
              <span aria-hidden>·</span>
              <span>{clientLabel(draft)}</span>
              <span aria-hidden>·</span>
              <span>{describeLocation(draft.location)}</span>
              <Pill tone="soft" className="ml-1 px-3 py-1 text-xs">
                Tier {draft.project.tier} · {TIER_META[draft.project.tier].label}
              </Pill>
            </p>
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      </Reveal>

      {/* Resumo */}
      <section
        aria-label="Resumo"
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]"
      >
        <Reveal className="flex flex-col justify-between gap-4 card-soft p-5 transition-transform hover:-translate-y-1">
          <p className="text-sm font-medium text-foreground">Sua hora custa</p>
          <p className="font-display text-3xl text-foreground tabular">
            {formatMoney(result.hourlyCostCents)}
          </p>
          <p className="text-xs text-muted">
            Custo direto do projeto:{' '}
            <span className="font-semibold text-foreground">
              {formatMoney(result.directCostCents)}
            </span>
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <Tilt className="h-full rounded-2xl">
            <div className="card-hero flex h-full min-h-60 flex-col justify-between gap-5 p-6 sm:p-7">
              <Coin className="absolute top-1/2 -right-10 w-40 -translate-y-1/2 opacity-90 sm:-right-2 sm:w-48" />
              <div className="relative z-10 flex flex-col gap-2">
                <p className="text-base font-medium">
                  Preço sugerido para <span className="text-on-hero-soft">este projeto</span>
                </p>
                <p className="font-display text-[clamp(2.4rem,4vw,3.5rem)] leading-none tabular">
                  {formatMoney(result.suggestedPriceCents)}
                </p>
              </div>
              <p className="relative z-10 max-w-[70%] text-sm text-white/85">
                {formatMoney(result.directCostCents)} de custo × markup{' '}
                <span className="font-semibold text-white">{vars.markup?.value}</span> · mínimo sem
                lucro {formatMoney(result.minimumPriceCents)}
              </p>
            </div>
          </Tilt>
        </Reveal>
        <Reveal
          delay={0.16}
          className="flex flex-col justify-between gap-4 card-soft p-5 transition-transform hover:-translate-y-1"
        >
          <p className="flex items-baseline justify-between text-sm font-medium text-foreground">
            Lucro{' '}
            <span className="text-xs font-normal text-muted">
              {formatPercent(profitShare)} do preço
            </span>
          </p>
          <p className="font-display text-3xl text-foreground tabular">
            {formatMoney(result.profitCents)}
          </p>
          <p className="text-xs text-muted">
            Sua hora sai por{' '}
            <span className="font-semibold text-accent">
              {formatMoney(result.effectiveHourlyCents)}
            </span>
          </p>
        </Reveal>
      </section>

      {/* Explorador de fórmulas */}
      <section aria-labelledby="formulas" className="flex flex-col gap-6">
        <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <TwoToneHeading
              as="h2"
              id="formulas"
              soft="As fórmulas,"
              strong="peça por peça"
              className="text-4xl sm:text-5xl"
            />
            <p className="text-base text-muted">
              Passe o mouse numa peça para ver de onde vem o valor. Toque num tipo para destacar.
            </p>
          </div>
          <div role="group" aria-label="Destacar tipo de variável" className="flex flex-wrap gap-2">
            {VAR_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                aria-pressed={filter === kind}
                title={KIND_META[kind].description}
                onClick={() => {
                  setFilter((f) => (f === kind ? null : kind));
                }}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  filter === kind
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-surface text-foreground hover:-translate-y-0.5',
                )}
              >
                <KindDot kind={kind} />
                {KIND_META[kind].label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
          {/* Lista de fórmulas */}
          <nav
            aria-label="Fórmulas"
            className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
          >
            {formulas.map((f, i) => {
              const active = i === index;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-current={active ? 'step' : undefined}
                  onClick={() => {
                    setIndex(i);
                    setHovered(null);
                  }}
                  className={cn(
                    'flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    active
                      ? 'border-transparent bg-accent text-accent-foreground shadow-[0_12px_24px_-14px_rgb(236_106_31/0.9)]'
                      : 'border-border bg-surface text-foreground hover:translate-x-1',
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-semibold tabular',
                      active ? 'text-white/80' : 'text-accent',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{f.title}</span>
                    <span
                      className={cn('text-xs tabular', active ? 'text-white/80' : 'text-muted')}
                    >
                      {vars[f.resultId]?.value}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Fórmula selecionada */}
          <div
            className="relative overflow-hidden card-soft p-5 sm:p-7"
            onPointerLeave={() => {
              setHovered(null);
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {formula && (
                <motion.div
                  key={formula.id}
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-accent tabular">
                      Fórmula {String(index + 1).padStart(2, '0')} de{' '}
                      {String(formulas.length).padStart(2, '0')}
                    </p>
                    <h3 className="font-display text-3xl text-foreground">{formula.title}</h3>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted">{formula.why}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-secondary p-4 sm:p-5">
                    {resultVar && (
                      <>
                        <VarChip
                          id={resultVar.id}
                          label={resultVar.label}
                          value={resultVar.value}
                          kind={resultVar.kind}
                          state={state}
                          size="lg"
                        />
                        <span aria-hidden className="text-2xl font-light text-accent">
                          =
                        </span>
                      </>
                    )}
                    <Expression tokens={formula.tokens} vars={vars} state={state} size="lg" />
                  </div>

                  {/* De onde vem a peça em foco */}
                  <p
                    className="flex min-h-11 flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-dashed border-border px-4 py-2 text-sm"
                    aria-live="polite"
                  >
                    {focusVar ? (
                      <>
                        <KindDot kind={focusVar.kind} />
                        <span className="font-semibold text-foreground">{focusVar.label}</span>
                        <span className="text-muted">
                          · {KIND_META[focusVar.kind].label} · {focusVar.source}
                        </span>
                        {editable && focusVar.editHref && (
                          <Link
                            to={focusVar.editHref}
                            className="ml-auto flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                          >
                            <PencilLine className="size-3.5" aria-hidden /> Alterar
                          </Link>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">
                        Passe o mouse (ou use Tab) sobre uma peça para ver de onde ela vem.
                      </span>
                    )}
                  </p>

                  {formula.details.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        Como cada parte foi obtida
                      </p>
                      <ul className="flex flex-col divide-y divide-separator">
                        {formula.details.map((d, i) => (
                          <li
                            key={`${d.label}-${i}`}
                            className="grid gap-2 py-3 md:grid-cols-[11rem_minmax(0,1fr)_auto] md:items-center"
                          >
                            <span className="text-sm text-foreground">{d.label}</span>
                            <Expression tokens={d.tokens} vars={vars} state={state} />
                            <span className="text-sm font-semibold text-foreground tabular md:text-right">
                              = {d.result}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 border-t border-separator pt-4">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        setIndex((i) => Math.max(0, i - 1));
                      }}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowLeft className="size-4" aria-hidden /> Anterior
                    </button>
                    <button
                      type="button"
                      disabled={index === formulas.length - 1}
                      onClick={() => {
                        setIndex((i) => Math.min(formulas.length - 1, i + 1));
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground transition-transform hover:translate-x-0.5 disabled:opacity-30"
                    >
                      Próxima <ArrowRight className="size-4" aria-hidden />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </section>

      {/* Catálogo de variáveis */}
      <section aria-labelledby="variaveis" className="flex flex-col gap-6">
        <Reveal className="flex max-w-2xl flex-col gap-3">
          <TwoToneHeading
            as="h2"
            id="variaveis"
            soft="Todas as variáveis,"
            strong="separadas pela origem"
            className="text-4xl sm:text-5xl"
          />
          <p className="text-base text-muted">
            O que é regra fixa, o que vem do seu estúdio e o que muda a cada orçamento com as suas
            respostas.
          </p>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {VAR_KINDS.map((kind, i) => {
            const items = catalog.filter((x) => x.kind === kind);
            const ink = kind === 'fixo';
            return (
              <Reveal
                key={kind}
                delay={i * 0.06}
                className={cn(
                  'flex flex-col gap-3 p-5 transition-opacity',
                  ink ? 'card-ink' : 'card-soft',
                  filter !== null && filter !== kind && 'opacity-35',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-base font-semibold">
                    <KindDot kind={kind} className={ink ? 'bg-amber' : undefined} />
                    {KIND_META[kind].label}
                  </p>
                  <span className={cn('text-xs tabular', ink ? 'text-ink-muted' : 'text-muted')}>
                    {items.length}
                  </span>
                </div>
                <p className={cn('text-xs', ink ? 'text-ink-muted' : 'text-muted')}>
                  {KIND_META[kind].description}
                </p>
                <ul
                  className={cn(
                    'flex flex-col divide-y',
                    ink ? 'divide-ink-foreground/10' : 'divide-separator',
                  )}
                >
                  {items.map((item) => (
                    <li key={item.id} className="flex items-baseline justify-between gap-3 py-2">
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm">{item.label}</span>
                        <span
                          className={cn(
                            'truncate text-[11px]',
                            ink ? 'text-ink-muted' : 'text-muted',
                          )}
                          title={item.source}
                        >
                          {item.source}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Critérios */}
      <section
        aria-labelledby="criterios"
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]"
      >
        <Reveal className="flex flex-col gap-4 card-ink p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 id="criterios" className="flex items-center gap-2 text-lg font-semibold">
              Critérios checados{' '}
              <span aria-hidden className="text-amber">
                ✦
              </span>
            </h2>
            <span className="rounded-full border border-amber/60 px-2.5 py-0.5 text-xs text-amber">
              {pending === 0 ? 'tudo certo' : pluralize(pending, 'pendência', 'pendências')}
            </span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {checks.map((c) => (
              <li
                key={c.title}
                className="rounded-xl border border-ink-foreground/12 bg-ink-raised/60 px-4 py-3"
              >
                <p
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-semibold',
                    c.ok ? 'text-ink-foreground' : 'text-amber',
                  )}
                >
                  {!c.ok && <TriangleAlert className="size-3.5 shrink-0" aria-hidden />}
                  {c.title}
                </p>
                <p className="text-xs text-ink-muted">{c.detail}</p>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.08} className="grid gap-6 card-soft p-5 sm:grid-cols-2 sm:p-6">
          <NumberedPoint index={1} title="Nada é cobrado duas vezes">
            Custos fixos já estão na hora — por isso despesas fixas valem 0% no markup.
          </NumberedPoint>
          <NumberedPoint index={2} title="Diária parcial conta inteira">
            Horas da etapa ÷ horas por dia, sempre arredondado para cima.
          </NumberedPoint>
          <NumberedPoint index={3} title="Percentuais sobre o preço">
            Impostos, taxas e lucro incidem sobre a venda. A soma precisa ficar abaixo de 100%.
          </NumberedPoint>
          <NumberedPoint index={4} title="Somas que fecham">
            O arredondamento vira lucro, e as partes sempre batem com o preço final.
          </NumberedPoint>
        </Reveal>
      </section>

      {/* Fechamento com pílulas interativas */}
      <FloatingPills pills={pills} className="-mx-4 px-4 py-24 sm:-mx-6 sm:px-6 sm:py-32">
        <Reveal className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.75rem)] text-balance text-foreground">
            O sistema não mostra só um preço.{' '}
            <span className="text-accent">Ele mostra o caminho.</span>
          </h2>
          <p className="max-w-lg text-lg text-muted">
            Arraste as peças — cada uma é uma regra que você pode explicar ao cliente.
          </p>
        </Reveal>
      </FloatingPills>
    </div>
  );
}
