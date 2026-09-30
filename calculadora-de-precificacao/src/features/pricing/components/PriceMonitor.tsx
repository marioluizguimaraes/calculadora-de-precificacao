import { TriangleAlert } from 'lucide-react';
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

import { Coin } from '@/shared/components/brand/Decor';
import { formatMoney, formatNumber, formatTimecode, pluralize } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import type { PricingResult } from '../types';

import { CompositionBar } from './CompositionBar';

interface PriceMonitorProps {
  result: PricingResult;
  className?: string;
}

const priceParts = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Divide o valor em reais e centavos já formatados ("1.234" e ",56"). */
function splitPrice(cents: number) {
  const [int = '0', dec = '00'] = priceParts.format(Math.round(cents) / 100).split(',');
  return { int, dec: `,${dec}` };
}

/**
 * Preço exato, com centavos, e contagem animada até o novo valor.
 * Só o texto muda a cada quadro (MotionValue), sem re-renderizar o componente.
 */
export function AnimatedPrice({ cents, className }: { cents: number; className?: string }) {
  const reduce = useReducedMotion();
  const value = useSpring(cents, { stiffness: 140, damping: 26 });
  const int = useTransform(value, (v) => splitPrice(v).int);
  const dec = useTransform(value, (v) => splitPrice(v).dec);

  useEffect(() => {
    if (reduce) value.jump(cents);
    else value.set(cents);
  }, [cents, reduce, value]);

  return (
    <span aria-hidden className={cn('inline-flex items-baseline gap-1.5 tabular', className)}>
      <span className="text-[0.5em] font-semibold opacity-80">R$</span>
      <span>
        <motion.span>{int}</motion.span>
        <motion.span className="text-[0.6em] opacity-90">{dec}</motion.span>
      </span>
    </span>
  );
}

/**
 * Preço recalculado ao vivo enquanto a pessoa preenche. O cartão laranja é o único destaque da
 * tela; abaixo, a composição e os números de apoio ficam num cartão neutro.
 */
export function PriceMonitor({ result, className }: PriceMonitorProps) {
  const warning = result.warnings[0];
  const stats = [
    { label: 'Sua hora custa', value: formatMoney(result.hourlyCostCents) },
    { label: 'Horas suas', value: formatTimecode(result.totalHours) },
    { label: 'Diárias de set', value: pluralize(result.captureDays, 'dia', 'dias') },
    { label: 'Lucro', value: formatMoney(result.profitCents) },
  ];

  return (
    <section aria-label="Preço calculado ao vivo" className={cn('flex flex-col gap-3', className)}>
      <div className="card-hero p-6">
        <Coin className="absolute -right-10 -bottom-14 w-32 opacity-80" withCheck={false} />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="size-2 rounded-full bg-white shadow-[0_0_0_4px_rgb(255_255_255/0.25)]" />
              Preço <span className="text-on-hero-soft">ao vivo</span>
            </span>
            <span className="rounded-full bg-white/18 px-2.5 py-1 text-xs font-medium tabular">
              ×{formatNumber(Math.round(result.markup * 100) / 100)} markup
            </span>
          </div>
          <div>
            <p className="sr-only" aria-live="polite">
              {formatMoney(result.suggestedPriceCents)}
            </p>
            <AnimatedPrice
              cents={result.suggestedPriceCents}
              className="font-display text-[2.75rem] leading-none"
            />
            <p className="mt-2 text-sm text-white/80">
              Mínimo sem lucro:{' '}
              <span className="font-semibold text-white tabular">
                {formatMoney(result.minimumPriceCents)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 card-soft p-5">
        <CompositionBar composition={result.composition} compact />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted">{s.label}</dt>
              <dd className="text-base font-semibold text-foreground tabular">{s.value}</dd>
            </div>
          ))}
        </dl>
        {warning && (
          <p className="flex items-start gap-2 rounded-2xl bg-ink px-3.5 py-2.5 text-xs text-ink-foreground">
            <TriangleAlert className="mt-px size-3.5 shrink-0 text-amber" aria-hidden />
            <span>
              <span className="sr-only">Atenção: </span>
              {warning.message}
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
