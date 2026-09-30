import { useState } from 'react';

import { formatMoney, formatPercent } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { COST_GROUP_BG, COST_GROUP_META, COST_GROUP_ORDER } from '../constants/meta';
import type { CostGroup } from '../types';

interface CompositionBarProps {
  composition: Record<CostGroup, number>;
  /** Versão fina, sem legenda (monitor). */
  compact?: boolean;
  className?: string;
}

/** Barra empilhada da composição do preço: para onde vai cada real cobrado. */
export function CompositionBar({ composition, compact, className }: CompositionBarProps) {
  const [hovered, setHovered] = useState<CostGroup | null>(null);
  const total = COST_GROUP_ORDER.reduce((acc, g) => acc + Math.max(0, composition[g]), 0);
  const groups = COST_GROUP_ORDER.filter((g) => composition[g] > 0);
  const share = (g: CostGroup) => (total > 0 ? Math.max(0, composition[g]) / total : 0);

  const summary = groups
    .map((g) => `${COST_GROUP_META[g].label}: ${formatPercent(share(g))}`)
    .join(', ');

  return (
    <figure className={cn('flex flex-col gap-4', className)}>
      <div className="relative">
        <div
          role="img"
          aria-label={total > 0 ? `Composição do preço — ${summary}` : 'Sem valores ainda'}
          className={cn(
            'flex w-full gap-[2px] overflow-hidden rounded-full bg-surface-secondary',
            compact ? 'h-2' : 'h-5',
          )}
        >
          {groups.map((g) => (
            <div
              key={g}
              className={cn(
                'h-full transition-[flex-grow,opacity] duration-500 ease-out first:rounded-l-full last:rounded-r-full',
                COST_GROUP_BG[g],
                hovered && hovered !== g && 'opacity-40',
              )}
              style={{ flexGrow: share(g), flexBasis: 0 }}
              onMouseEnter={() => {
                setHovered(g);
              }}
              onMouseLeave={() => {
                setHovered(null);
              }}
            />
          ))}
        </div>
        {hovered && !compact && (
          <div
            role="tooltip"
            className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-overlay px-3 py-2 text-sm whitespace-nowrap text-overlay-foreground shadow-lg"
          >
            <span className="font-medium">{COST_GROUP_META[hovered].label}</span>{' '}
            <span className="text-muted">
              {formatMoney(composition[hovered])} · {formatPercent(share(hovered))}
            </span>
          </div>
        )}
      </div>

      {!compact && (
        <figcaption>
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {COST_GROUP_ORDER.map((g) => (
              <li
                key={g}
                className={cn(
                  'flex items-start gap-3 transition-opacity',
                  hovered && hovered !== g && 'opacity-50',
                )}
                onMouseEnter={() => {
                  setHovered(g);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                }}
              >
                <span
                  aria-hidden
                  className={cn('mt-1.5 size-2.5 shrink-0 rounded-[3px]', COST_GROUP_BG[g])}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {COST_GROUP_META[g].label}{' '}
                    <span className="font-normal text-muted tabular">
                      {formatPercent(share(g))}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-foreground tabular">
                    {formatMoney(composition[g])}
                  </span>
                  <span className="text-xs text-muted">{COST_GROUP_META[g].description}</span>
                </span>
              </li>
            ))}
          </ul>
        </figcaption>
      )}
    </figure>
  );
}
