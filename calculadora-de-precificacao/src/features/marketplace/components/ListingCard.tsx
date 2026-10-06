import { ArrowUpRight, Clapperboard, MapPin, Smartphone, Video } from 'lucide-react';
import type { PointerEvent } from 'react';
import { Link } from 'react-router';

import { UserAvatar } from '@/features/auth';
import { TIER_META } from '@/features/services';
import { formatHours, formatMoneyShort } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { TIER_COVER } from '../constants';
import type { Listing } from '../types';
import { cityLabel } from '../utils/labels';

import { StageHoursBar } from './StageHoursBar';

const TIER_ICON = { 1: Smartphone, 2: Video, 3: Clapperboard } as const;

export function ListingPrice({ listing, className }: { listing: Listing; className?: string }) {
  if (!listing.showPrice) {
    return <span className={cn('text-sm font-medium text-muted', className)}>Sob consulta</span>;
  }
  return (
    <span className={cn('flex flex-col items-end leading-tight', className)}>
      <span className="text-[11px] text-muted">a partir de</span>
      <span className="font-display text-xl text-foreground tabular">
        {formatMoneyShort(listing.priceCents)}
      </span>
    </span>
  );
}

/** Capa colorida da oferta: complexidade, preço e o ícone do tipo de trabalho. */
export function ListingCover({
  listing,
  size = 'md',
  className,
}: {
  listing: Listing;
  size?: 'md' | 'lg';
  className?: string;
}) {
  const Icon = TIER_ICON[listing.tier];
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        size === 'md' ? 'h-36 p-5' : 'h-48 p-6 sm:h-56 sm:p-8',
        TIER_COVER[listing.tier],
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.22)_1px,transparent_1.5px)] [background-size:14px_14px]" />
      <Icon
        aria-hidden
        strokeWidth={1.25}
        className={cn(
          'absolute -right-4 -bottom-6 rotate-12 opacity-25 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-0',
          size === 'md' ? 'size-36' : 'size-56',
        )}
      />
      <div className="relative flex h-full flex-col justify-between">
        <span className="self-start rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
          {TIER_META[listing.tier].label}
        </span>
        {listing.showPrice ? (
          <span className="flex flex-col leading-none">
            <span className="text-xs font-medium opacity-80">a partir de</span>
            <span
              className={cn(
                'font-display tabular',
                size === 'md' ? 'text-4xl' : 'text-5xl sm:text-6xl',
              )}
            >
              {formatMoneyShort(listing.priceCents)}
            </span>
          </span>
        ) : (
          <span className={cn('font-display', size === 'md' ? 'text-3xl' : 'text-5xl')}>
            Sob consulta
          </span>
        )}
      </div>
    </div>
  );
}

function trackSpotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export function ListingCard({ listing }: { listing: Listing }) {
  const totalHours = listing.services.reduce((sum, s) => sum + s.hours, 0);
  return (
    <Link
      to={`/servicos/${listing.id}`}
      onPointerMove={trackSpotlight}
      className="group relative flex h-full flex-col overflow-hidden card-soft transition-all duration-300 outline-none hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgb(92_58_30/0.55)] focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <ListingCover listing={listing} />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-1 flex-col gap-1.5">
          <h3 className="text-lg leading-snug font-semibold text-foreground transition-colors group-hover:text-accent">
            {listing.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted">{listing.description}</p>
        </div>
        {totalHours > 0 && (
          <div className="flex items-center gap-3">
            <StageHoursBar services={listing.services} className="flex-1" />
            <span className="font-mono text-[11px] text-muted tabular">
              {formatHours(totalHours)}
            </span>
          </div>
        )}
        {listing.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Especialidades">
            {listing.tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-3 border-t border-separator pt-4">
          <UserAvatar name={listing.owner.name} size="sm" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {listing.owner.businessName}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <MapPin className="size-3" aria-hidden /> {cityLabel(listing.owner.city)}
            </span>
          </div>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full border border-border text-muted transition-all duration-300 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-accent group-hover:text-accent-foreground"
          >
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(380px circle at var(--mx) var(--my), color-mix(in oklab, var(--accent) 10%, transparent), transparent 65%)',
        }}
      />
    </Link>
  );
}
