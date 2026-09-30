import { AlertDialog, Button, Drawer, ProgressBar } from '@heroui/react';
import { ArrowLeft, ArrowRight, Calculator, Check, ChevronUp, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import {
  AnimatedPrice,
  createDefaultPricing,
  PriceMonitor,
  useDraftStore,
  usePricing,
  useProfileStore,
} from '@/features/pricing';
import { SceneHeading } from '@/shared/components/layout/SceneHeading';
import { formatMoney } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { WIZARD_STEPS } from './steps';

const pad = (n: number) => String(n).padStart(2, '0');

export function QuoteWizardPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const draft = useDraftStore((s) => s.draft);
  const patch = useDraftStore((s) => s.patch);
  const reset = useDraftStore((s) => s.reset);
  const profile = useProfileStore((s) => s.profile);
  const onboarded = useProfileStore((s) => s.onboarded);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);
  const result = usePricing();
  const reduceMotion = useReducedMotion();
  const headingRef = useRef<HTMLDivElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(() => new Set());

  // "Seu estúdio" só entra no fluxo na primeira vez (ou quando pedido explicitamente).
  const requested = params.get('etapa');
  const steps = WIZARD_STEPS.filter(
    (s) => s.id !== 'estudio' || !onboarded || requested === 'estudio',
  );
  const index = Math.max(
    0,
    steps.findIndex((s) => s.id === requested),
  );
  const step = steps[index] ?? steps[0];
  // Marca a etapa como visitada durante a renderização (padrão recomendado pelo React).
  if (step && !visited.has(step.id)) setVisited(new Set(visited).add(step.id));
  const next = steps[index + 1];
  const prev = steps[index - 1];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    headingRef.current?.focus({ preventScroll: true });
  }, [step?.id, reduceMotion]);

  if (!step) return null;
  const { Component } = step;

  const goTo = (id: string) => {
    setParams({ etapa: id });
  };

  const handleNext = () => {
    if (step.id === 'estudio') {
      completeOnboarding();
      // O rascunho herda impostos e margem recém-configurados no estúdio.
      patch('pricing', {
        ...createDefaultPricing(profile),
        commissionPct: draft.pricing.commissionPct,
        roundToReais: draft.pricing.roundToReais,
      });
    }
    if (next) goTo(next.id);
    else void navigate('/orcamento/resumo');
  };

  const nextLabel = next ? `Próximo: ${next.label}` : 'Ver orçamento';

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-6 pb-32 sm:px-6 lg:pb-16">
      {/* Trilho de cenas */}
      <nav aria-label="Etapas do orçamento" className="mb-8">
        <ol className="hidden flex-wrap items-center gap-1.5 lg:flex">
          {steps.map((s, i) => {
            const isCurrent = s.id === step.id;
            const done = visited.has(s.id) && s.isComplete(draft, profile);
            return (
              <li key={s.id} className="flex items-center">
                <Link
                  to={`?etapa=${s.id}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'group flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm font-medium transition-all',
                    isCurrent
                      ? 'border-transparent bg-accent text-accent-foreground shadow-[0_10px_20px_-10px_rgb(236_106_31/0.9)]'
                      : 'border-border bg-surface text-muted hover:-translate-y-0.5 hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-7 place-items-center rounded-full text-[11px] font-semibold tabular',
                      isCurrent
                        ? 'bg-white/25 text-accent-foreground'
                        : done
                          ? 'bg-accent/15 text-accent'
                          : 'bg-surface-secondary',
                    )}
                  >
                    {done && !isCurrent ? (
                      <Check className="size-3" aria-label="concluída" />
                    ) : (
                      pad(i + 1)
                    )}
                  </span>
                  {s.label}
                </Link>
                {i < steps.length - 1 && <span aria-hidden className="mx-0.5 h-px w-2 bg-border" />}
              </li>
            );
          })}
        </ol>
        <div className="flex flex-col gap-2 lg:hidden">
          <ProgressBar
            value={((index + 1) / steps.length) * 100}
            aria-label="Progresso do orçamento"
            size="sm"
          >
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </div>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] xl:gap-12">
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-8"
            >
              <div ref={headingRef} tabIndex={-1} className="outline-none">
                <SceneHeading
                  eyebrow={`Etapa ${pad(index + 1)} de ${pad(steps.length)} · ${step.label}`}
                  title={step.title}
                  description={step.description}
                />
              </div>
              <Component />
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-separator pt-6">
            <div className="flex gap-2">
              {prev && (
                <Button
                  variant="tertiary"
                  onPress={() => {
                    goTo(prev.id);
                  }}
                >
                  <ArrowLeft className="size-4" /> {prev.label}
                </Button>
              )}
              <Button
                variant="ghost"
                className="text-muted"
                onPress={() => {
                  setConfirmReset(true);
                }}
              >
                <RotateCcw className="size-4" /> Começar outro
              </Button>
            </div>
            <Button size="lg" className="rounded-full px-6" onPress={handleNext}>
              {nextLabel} <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <aside className="hidden lg:block" aria-label="Resumo ao vivo">
          <div className="sticky top-24 flex flex-col gap-3">
            <PriceMonitor result={result} />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="rounded-full bg-surface"
                onPress={() => {
                  void navigate('/orcamento/resumo');
                }}
              >
                Ver resumo
              </Button>
              <Button
                variant="outline"
                className="rounded-full bg-surface"
                onPress={() => {
                  void navigate('/calculo');
                }}
              >
                <Calculator className="size-4" /> Cálculo
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Barra inferior (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-separator bg-background/95 lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            className="flex flex-col items-start rounded-lg text-left"
            onClick={() => {
              setDrawerOpen(true);
            }}
            aria-label={`Preço sugerido ${formatMoney(result.suggestedPriceCents)}. Ver detalhes`}
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <span className="rec-dot size-1.5!" aria-hidden /> Preço ao vivo{' '}
              <ChevronUp className="size-3" />
            </span>
            <AnimatedPrice
              cents={result.suggestedPriceCents}
              className="font-display text-2xl text-foreground"
            />
          </button>
          <Button onPress={handleNext}>
            {next ? next.label : 'Resumo'} <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <Drawer.Backdrop isOpen={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content placement="bottom">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.Header>
              <Drawer.Heading>Preço ao vivo</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-5 pb-6">
              <PriceMonitor result={result} />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      <AlertDialog.Backdrop isOpen={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Icon status="warning" />
              <AlertDialog.Heading>Descartar este orçamento?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-muted">
                O rascunho atual será apagado. Orçamentos salvos continuam no histórico, e os dados
                do seu estúdio não mudam.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="tertiary" slot="close">
                Manter rascunho
              </Button>
              <Button
                variant="danger"
                onPress={() => {
                  reset();
                  setConfirmReset(false);
                  goTo(steps.find((s) => s.id !== 'estudio')?.id ?? 'projeto');
                }}
              >
                Descartar e começar outro
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </div>
  );
}
