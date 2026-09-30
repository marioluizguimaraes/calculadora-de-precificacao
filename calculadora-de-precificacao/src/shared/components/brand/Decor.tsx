import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

/**
 * Elementos decorativos da identidade visual: moeda, pílulas flutuantes, títulos em dois tons,
 * pontos numerados e marca d'água. Todos são puramente visuais (aria-hidden quando não
 * carregam informação).
 */

/** Moeda "R$" em relevo, feita só com gradientes — o ícone do cartão de destaque. */
export function Coin({ className, withCheck = true }: { className?: string; withCheck?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        '[container-type:inline-size] pointer-events-none relative aspect-square',
        className,
      )}
    >
      {/* Aro externo */}
      <div className="absolute inset-0 -rotate-12 rounded-full bg-[radial-gradient(circle_at_30%_25%,#ffd38a,#f59a3a_45%,#c94f0c_100%)] shadow-[inset_-10px_-14px_24px_rgb(150_50_0/0.45),inset_8px_10px_18px_rgb(255_230_170/0.7),0_20px_40px_-10px_rgb(120_40_0/0.45)]" />
      {/* Face */}
      <div className="absolute inset-[11%] -rotate-12 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffbf66,#f2842b_55%,#d9620f_100%)] shadow-[inset_6px_8px_14px_rgb(255_220_160/0.55),inset_-8px_-10px_16px_rgb(160_60_0/0.4)]" />
      {/* Símbolo */}
      <div className="absolute inset-0 grid -rotate-12 place-items-center">
        <span className="font-display text-[36cqw] leading-none text-[#ffcf85] [text-shadow:-2px_-2px_0_rgb(255_235_190/0.7),3px_4px_0_rgb(170_65_0/0.55)]">
          R$
        </span>
      </div>
      {withCheck && (
        <svg
          viewBox="0 0 100 100"
          className="absolute -right-[8%] -bottom-[4%] w-[46%] drop-shadow-[0_10px_16px_rgb(120_40_0/0.35)]"
        >
          <defs>
            <linearGradient id="coin-check" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff4dc" stopOpacity="0.95" />
              <stop offset="1" stopColor="#ffb25a" stopOpacity="0.75" />
            </linearGradient>
          </defs>
          <path
            d="M10 55 L38 82 L92 22"
            fill="none"
            stroke="url(#coin-check)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

const PILL_TONES = {
  accent: 'bg-accent text-accent-foreground shadow-[0_14px_28px_-12px_rgb(236_106_31/0.7)]',
  amber: 'bg-amber text-amber-foreground shadow-[0_14px_28px_-14px_rgb(200_130_30/0.6)]',
  cream:
    'border border-border bg-surface text-foreground shadow-[0_14px_28px_-16px_rgb(92_58_30/0.35)]',
  ink: 'bg-ink text-ink-foreground',
  soft: 'bg-accent/12 text-accent',
} as const;

export type PillTone = keyof typeof PILL_TONES;

interface PillProps {
  children: ReactNode;
  tone?: PillTone;
  /** Inclinação em graus — as pílulas do print parecem "jogadas" na mesa. */
  tilt?: number;
  className?: string;
  style?: CSSProperties;
}

/** Etiqueta em pílula. Com `tilt`, vira elemento decorativo flutuante. */
export function Pill({ children, tone = 'cream', tilt, className, style }: PillProps) {
  return (
    <span
      className={cn('pill', PILL_TONES[tone], className)}
      style={tilt ? { rotate: `${tilt}deg`, ...style } : style}
    >
      {children}
    </span>
  );
}

/** Manchete em dois tons: primeira parte suave, segunda forte (ou laranja). */
export function TwoToneHeading({
  soft,
  strong,
  accent,
  as: Tag = 'h1',
  className,
  id,
}: {
  soft: ReactNode;
  strong: ReactNode;
  /** Pinta a parte forte de laranja. */
  accent?: boolean;
  as?: 'h1' | 'h2';
  className?: string;
  id?: string;
}) {
  return (
    <Tag id={id} className={cn('font-display text-balance', className)}>
      <span className="text-headline-soft">{soft}</span>{' '}
      <span className={accent ? 'text-accent' : 'text-foreground'}>{strong}</span>
    </Tag>
  );
}

/** Ponto numerado "01 Título" + explicação, usado nas listas de princípios e critérios. */
export function NumberedPoint({
  index,
  title,
  children,
}: {
  index: number;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        <span className="mr-2 text-accent tabular">{String(index).padStart(2, '0')}</span>
        {title}
      </h3>
      <div className="text-base leading-relaxed text-pretty text-muted">{children}</div>
    </div>
  );
}

/** Brilho âmbar difuso. Posicione com classes (top/left/size). */
export function Glow({ className }: { className?: string }) {
  return <span aria-hidden className={cn('glow-blob', className)} />;
}
