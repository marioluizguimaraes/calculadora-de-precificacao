import { STAGE_BG, STAGE_META, STAGES } from '@/features/pricing';
import { formatHours } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import type { ListingService } from '../types';

/** Barra com as horas de pré, gravação e pós em proporção — a "cara" do trabalho. */
export function StageHoursBar({
  services,
  showLegend = false,
  className,
}: {
  services: ListingService[];
  showLegend?: boolean;
  className?: string;
}) {
  const hours = STAGES.map((stage) =>
    services.filter((s) => s.stage === stage).reduce((sum, s) => sum + s.hours, 0),
  );
  const total = hours.reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  const summary = STAGES.map(
    (stage, i) => `${STAGE_META[stage].label}: ${formatHours(hours[i] ?? 0)}`,
  ).join(', ');

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span
        role="img"
        aria-label={`Horas por etapa — ${summary}`}
        className="flex h-1.5 w-full gap-[2px] overflow-hidden rounded-full"
      >
        {STAGES.map((stage, i) => (
          <span
            key={stage}
            className={cn('h-full', STAGE_BG[stage])}
            style={{ flexGrow: hours[i] ?? 0, flexBasis: 0 }}
          />
        ))}
      </span>
      {showLegend && (
        <span className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted" aria-hidden>
          {STAGES.map((stage, i) =>
            hours[i] ? (
              <span key={stage} className="flex items-center gap-1">
                <span className={cn('size-1.5 rounded-full', STAGE_BG[stage])} />
                {STAGE_META[stage].label} {formatHours(hours[i] ?? 0)}
              </span>
            ) : null,
          )}
        </span>
      )}
    </div>
  );
}
