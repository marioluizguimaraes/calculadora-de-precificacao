import { useState } from 'react';

import { formatHours, formatTimecode } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { STAGES } from '../engine/calculate';
import { STAGE_META } from '../constants/meta';
import type { SelectedService, Stage } from '../types';

const STAGE_BG: Record<Stage, string> = {
  pre: 'bg-stage-pre',
  producao: 'bg-stage-producao',
  pos: 'bg-stage-pos',
};

const TICK_STEPS = [1, 2, 4, 6, 8, 12, 24, 48];

interface ProductionTimelineProps {
  services: SelectedService[];
  compact?: boolean;
  className?: string;
}

interface Clip {
  id: string;
  label: string;
  stage: Stage;
  start: number;
  hours: number;
}

/**
 * Timeline de ilha de edição: cada serviço é um clipe com largura proporcional às horas.
 * As etapas se sucedem no tempo (pré → set → pós), cada uma na sua trilha.
 */
export function ProductionTimeline({ services, compact, className }: ProductionTimelineProps) {
  const [hovered, setHovered] = useState<Clip | null>(null);

  let cursor = 0;
  const clips: Clip[] = [];
  const totals: Record<Stage, number> = { pre: 0, producao: 0, pos: 0 };
  for (const stage of STAGES) {
    for (const s of services.filter((x) => x.stage === stage && x.hours > 0)) {
      clips.push({ id: s.serviceId, label: s.label, stage, start: cursor, hours: s.hours });
      cursor += s.hours;
      totals[stage] += s.hours;
    }
  }
  const total = Math.max(cursor, 1);
  const maxTicks = compact ? 4 : 8;
  const step = TICK_STEPS.find((t) => total / t <= maxTicks) ?? 96;
  const ticks = Array.from({ length: Math.floor(total / step) + 1 }, (_, i) => i * step);
  const pct = (h: number) => `${(h / total) * 100}%`;

  return (
    <figure
      className={cn('flex flex-col gap-1.5', className)}
      aria-label={`Linha do tempo: ${STAGES.map((s) => `${STAGE_META[s].label} ${formatHours(totals[s])}`).join(', ')}`}
    >
      {/* Régua em timecode */}
      <div className="flex">
        <div className={cn('shrink-0', compact ? 'w-12' : 'w-24')} />
        <div className="relative h-4 flex-1">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute top-0 -translate-x-1/2 font-mono text-[9px] text-muted tabular first:translate-x-0"
              style={{ left: pct(t) }}
            >
              {formatTimecode(t)}
            </span>
          ))}
        </div>
      </div>

      {STAGES.map((stage) => (
        <div key={stage} className="flex items-center">
          <div
            className={cn('flex shrink-0 flex-col justify-center pr-2', compact ? 'w-12' : 'w-24')}
          >
            <span className="font-slate text-[10px] leading-none text-muted">
              {STAGE_META[stage].track}
              {!compact && ` · ${STAGE_META[stage].short}`}
            </span>
            {!compact && (
              <span className="mt-1 font-mono text-[10px] text-foreground tabular">
                {formatTimecode(totals[stage])}
              </span>
            )}
          </div>
          <div
            className={cn(
              'relative flex-1 overflow-hidden rounded-[4px] bg-surface-secondary',
              compact ? 'h-5' : 'h-8',
            )}
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent 0 calc(100% / 8 - 1px), color-mix(in oklab, var(--foreground) 6%, transparent) calc(100% / 8 - 1px) calc(100% / 8))',
            }}
          >
            {clips
              .filter((c) => c.stage === stage)
              .map((clip) => (
                <div
                  key={clip.id}
                  className={cn(
                    'absolute inset-y-0 overflow-hidden rounded-[4px] px-1.5 transition-all duration-300 ease-out',
                    STAGE_BG[stage],
                    hovered && hovered.id !== clip.id && 'opacity-50',
                  )}
                  style={{
                    left: `calc(${pct(clip.start)} + 1px)`,
                    width: `calc(${pct(clip.hours)} - 2px)`,
                  }}
                  onMouseEnter={() => {
                    setHovered(clip);
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                  }}
                >
                  {!compact && clip.hours / total >= 0.07 && (
                    <span className="flex h-full items-center text-[11px] font-semibold text-black/75">
                      <span className="truncate">{clip.label}</span>
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}

      <figcaption className="flex min-h-4 justify-end text-[11px] text-muted">
        {hovered ? (
          <span>
            <span className="font-medium text-foreground">{hovered.label}</span> ·{' '}
            {formatHours(hovered.hours)} · começa em {formatTimecode(hovered.start)}
          </span>
        ) : clips.length === 0 ? (
          'Escolha serviços para montar a linha do tempo.'
        ) : (
          <span className="font-mono tabular">Duração total {formatTimecode(cursor)}</span>
        )}
      </figcaption>
    </figure>
  );
}
