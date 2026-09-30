import { Button } from '@heroui/react';
import { Calculator } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'motion/react';
import { useRef, type ReactNode } from 'react';

import {
  AnimatedPrice,
  CompositionBar,
  ProductionTimeline,
  type PricingResult,
  type QuoteDraft,
} from '@/features/pricing';
import { Coin } from '@/shared/components/brand/Decor';
import { formatMoney, formatNumber, formatTimecode, pluralize } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Uma camada da vitrine: segue o cursor com sua própria profundidade (paralaxe) e tem sua
 * própria animação ao passar o mouse (variants "hover" propagadas pelo pai).
 */
function Layer({
  children,
  depth,
  mx,
  my,
  variants,
  className,
}: {
  children: ReactNode;
  depth: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  variants?: Variants;
  className?: string;
}) {
  const x = useTransform(mx, (v) => v * depth * 28);
  const y = useTransform(my, (v) => v * depth * 22);
  return (
    <motion.div style={{ x, y }} className={className}>
      <motion.div variants={variants} className="h-full">
        {children}
      </motion.div>
    </motion.div>
  );
}

const backSheet = (i: number): Variants => ({
  rest: { rotate: 0, y: 0, x: 0 },
  hover: {
    rotate: i === 1 ? -6 : 5,
    y: i === 1 ? -26 : -14,
    x: i === 1 ? -28 : 30,
    transition: { duration: 0.5, ease: EASE, delay: 0.04 * i },
  },
});

const lift = (dx: number, dy: number, rotate = 0, delay = 0): Variants => ({
  rest: { x: 0, y: 0, rotate: 0, scale: 1 },
  hover: {
    x: dx,
    y: dy,
    rotate,
    scale: 1.03,
    transition: { type: 'spring', stiffness: 220, damping: 18, delay },
  },
});

/** Vitrine da home: um orçamento de exemplo em camadas que ganham vida com o mouse. */
export function HeroShowcase({
  draft,
  result,
  onExplain,
}: {
  draft: QuoteDraft;
  result: PricingResult;
  onExplain: () => void;
}) {
  const reduce = useReducedMotion();
  const rect = useRef<DOMRect | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 90, damping: 16 });
  const my = useSpring(rawY, { stiffness: 90, damping: 16 });
  const still = useMotionValue(0);
  const px = reduce ? still : mx;
  const py = reduce ? still : my;

  const stats = [
    { label: 'Sua hora custa', value: formatMoney(result.hourlyCostCents) },
    { label: 'Horas suas', value: formatTimecode(result.totalHours) },
    { label: 'Diárias de set', value: pluralize(result.captureDays, 'dia', 'dias') },
    { label: 'Lucro', value: formatMoney(result.profitCents) },
  ];

  return (
    <motion.figure
      aria-label="Exemplo de orçamento"
      initial="rest"
      animate="rest"
      whileHover={reduce ? undefined : 'hover'}
      onPointerEnter={(e) => {
        rect.current = e.currentTarget.getBoundingClientRect();
      }}
      onPointerMove={(e) => {
        const r = rect.current;
        if (!r) return;
        rawX.set((e.clientX - r.left) / r.width - 0.5);
        rawY.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        rect.current = null;
        rawX.set(0);
        rawY.set(0);
      }}
      className="relative mx-auto w-full max-w-[40rem] pt-8 [perspective:1200px]"
    >
      {/* Folhas de trás: abrem em leque */}
      {[1, 2].map((i) => (
        <Layer
          key={i}
          depth={0.3 * i}
          mx={px}
          my={py}
          variants={backSheet(i)}
          className={cn(
            'absolute inset-x-0 bottom-10 origin-bottom',
            i === 1 ? 'top-0 mx-10' : 'top-3 mx-5',
          )}
        >
          <div
            className={cn(
              'h-full rounded-2xl border border-border',
              i === 1 ? 'bg-surface/50' : 'bg-surface/75',
            )}
          />
        </Layer>
      ))}

      <div className="relative grid gap-3 card-soft p-4 sm:grid-cols-2 sm:p-5">
        {/* Cartão laranja: sobe e inclina; a moeda gira */}
        <Layer depth={1.4} mx={px} my={py} variants={lift(-10, -18, -2)} className="relative z-10">
          <div className="card-hero flex h-full flex-col gap-4 p-5">
            <motion.div
              variants={{
                rest: { rotate: 0, scale: 1, x: 0 },
                hover: {
                  rotate: 200,
                  scale: 1.15,
                  x: -14,
                  transition: { duration: 0.9, ease: EASE },
                },
              }}
              className="absolute -right-8 -bottom-10 w-32"
            >
              <Coin className="w-full opacity-85" withCheck={false} />
            </motion.div>
            <div className="relative flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="size-2 rounded-full bg-white shadow-[0_0_0_4px_rgb(255_255_255/0.25)]" />
                Preço <span className="text-on-hero-soft">ao vivo</span>
              </span>
              <span className="rounded-full bg-white/18 px-2.5 py-1 text-xs font-medium tabular">
                ×{formatNumber(Math.round(result.markup * 100) / 100)} markup
              </span>
            </div>
            <div className="relative">
              <AnimatedPrice
                cents={result.suggestedPriceCents}
                className="font-display text-[2.6rem] leading-none"
              />
              <p className="mt-2 text-sm text-white/80">
                Mínimo sem lucro:{' '}
                <span className="font-semibold text-white tabular">
                  {formatMoney(result.minimumPriceCents)}
                </span>
              </p>
            </div>
          </div>
        </Layer>

        {/* Linha do tempo: desliza para a direita */}
        <Layer
          depth={0.7}
          mx={px}
          my={py}
          variants={lift(14, -8, 1.5, 0.05)}
          className="sm:row-span-1"
        >
          <div className="h-full rounded-xl border border-border bg-surface-secondary p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">Linha do tempo</p>
            <ProductionTimeline services={draft.services} compact />
          </div>
        </Layer>

        {/* Números: descem para a esquerda */}
        <Layer depth={0.9} mx={px} my={py} variants={lift(-14, 10, 1, 0.08)}>
          <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-4">
            <CompositionBar composition={result.composition} compact />
            <dl className="grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={{
                    rest: { y: 0, opacity: 1 },
                    hover: { y: [0, -6, 0], transition: { duration: 0.5, delay: 0.1 + i * 0.06 } },
                  }}
                  className="flex flex-col gap-0.5"
                >
                  <dt className="text-xs text-muted">{s.label}</dt>
                  <dd className="text-sm font-semibold text-foreground tabular">{s.value}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </Layer>

        {/* Painel escuro: desce e gira de leve */}
        <Layer depth={1.1} mx={px} my={py} variants={lift(12, 14, -1.5, 0.1)}>
          <div className="flex h-full flex-col gap-2 card-ink p-4">
            <p className="text-sm font-semibold">
              Por que esse valor?{' '}
              <motion.span
                aria-hidden
                className="inline-block text-amber"
                variants={{
                  rest: { rotate: 0, scale: 1 },
                  hover: { rotate: 180, scale: 1.4, transition: { duration: 0.6 } },
                }}
              >
                ✦
              </motion.span>
            </p>
            <p className="text-xs text-ink-muted">Veja cada fórmula e de onde vem cada variável.</p>
            <Button
              size="sm"
              className="mt-auto rounded-full bg-ink-foreground text-ink"
              onPress={onExplain}
            >
              <Calculator className="size-3.5" /> Como o preço foi gerado
            </Button>
          </div>
        </Layer>
      </div>

      <figcaption className="mt-3 text-center text-xs text-muted">
        Exemplo: vídeo institucional a 94 km da base · passe o mouse
      </figcaption>
    </motion.figure>
  );
}
