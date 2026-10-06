import { Clock, MapPin } from 'lucide-react';

import { UserAvatar } from '@/features/auth';
import { STAGE_BG, STAGE_META, STAGES } from '@/features/pricing';
import { TIER_META } from '@/features/services';
import { Panel } from '@/shared/components/layout/Panel';
import { formatDateShort, formatHours } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import type { Listing } from '../types';
import { cityLabel } from '../utils/labels';

import { ListingCover } from './ListingCard';
import { StageHoursBar } from './StageHoursBar';

/** Detalhe público da oferta: o que está incluso, em quanto tempo e por quem. */
export function ListingOverview({ listing }: { listing: Listing }) {
  const totalHours = listing.services.reduce((sum, s) => sum + s.hours, 0);
  return (
    <div className="flex flex-col gap-6">
      <section className="group overflow-hidden card-soft">
        <ListingCover listing={listing} size="lg" />
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-surface-secondary px-2.5 py-1 font-medium text-muted">
              {TIER_META[listing.tier].description}
            </span>
            <span className="font-mono text-muted">
              Publicada em {formatDateShort(listing.publishedAt)}
            </span>
          </div>
          <p className="text-lg leading-relaxed text-pretty whitespace-pre-line text-foreground">
            {listing.description}
          </p>
          <StageHoursBar services={listing.services} showLegend />
          {listing.deliverables && (
            <div className="rounded-xl bg-surface-secondary p-4">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">Entrega</p>
              <p className="mt-1 text-sm text-foreground">{listing.deliverables}</p>
            </div>
          )}
          {listing.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Especialidades">
              {listing.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {listing.services.length > 0 && (
        <Panel
          title="O que está incluso"
          description={`${formatHours(totalHours)} de trabalho, divididas nas três etapas.`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {STAGES.map((stage) => {
              const items = listing.services.filter((s) => s.stage === stage);
              if (items.length === 0) return null;
              return (
                <section key={stage} className="flex flex-col gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span aria-hidden className={cn('size-2 rounded-full', STAGE_BG[stage])} />
                    {STAGE_META[stage].label}
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {items.map((s) => (
                      <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-foreground">{s.label}</span>
                        <span className="flex items-center gap-1 font-mono text-xs text-muted tabular">
                          <Clock className="size-3" aria-hidden /> {formatHours(s.hours)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </Panel>
      )}

      <Panel title="Quem oferece">
        <div className="flex items-center gap-4">
          <UserAvatar name={listing.owner.name} size="lg" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-semibold text-foreground">{listing.owner.businessName}</span>
            <span className="text-sm text-muted">{listing.owner.headline}</span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <MapPin className="size-3" aria-hidden /> {cityLabel(listing.owner.city)} ·{' '}
              {listing.owner.name}
            </span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
