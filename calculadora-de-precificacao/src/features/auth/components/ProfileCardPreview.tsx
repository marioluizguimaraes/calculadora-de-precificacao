import { MapPin, MessagesSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { PointerEvent } from 'react';

import type { CityRef } from '@/features/pricing';
import { cn } from '@/shared/lib/utils';

import { initials } from '../utils/return-to';

interface ProfileCardPreviewProps {
  name: string;
  businessName: string;
  headline: string;
  city: CityRef | null;
  specialties: string[];
  className?: string;
}

/** Luz que segue o cursor dentro do cartão (variáveis CSS: sem re-render a cada movimento). */
function trackSpotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

/** Prévia ao vivo de como a pessoa vai aparecer no marketplace (usada no cadastro). */
export function ProfileCardPreview({
  name,
  businessName,
  headline,
  city,
  specialties,
  className,
}: ProfileCardPreviewProps) {
  const title = businessName.trim() || name.trim() || 'Seu estúdio';
  return (
    <article
      onPointerMove={trackSpotlight}
      className={cn('group relative overflow-hidden card-soft', className)}
    >
      <div className="relative h-24 overflow-hidden bg-[radial-gradient(120%_90%_at_85%_20%,rgb(255_190_110/0.45),transparent_55%),linear-gradient(150deg,#f37a2c,#e05a12)]">
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.28)_1px,transparent_1.5px)] [background-size:14px_14px]" />
        <span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white">
          <span className="size-1.5 rounded-full bg-white" /> Prévia ao vivo
        </span>
      </div>
      <div className="relative flex flex-col gap-3.5 px-6 pb-5">
        <motion.span
          key={initials(name || title)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="-mt-9 grid size-18 place-items-center rounded-2xl border-4 border-surface bg-ink font-display text-2xl text-ink-foreground shadow-[0_14px_28px_-14px_rgb(40_24_12/0.6)]"
        >
          {initials(name || title)}
        </motion.span>
        <div className="flex flex-col gap-1">
          <h3
            className={cn(
              'font-display text-3xl transition-colors',
              businessName.trim() || name.trim() ? 'text-foreground' : 'text-headline-soft',
            )}
          >
            {title}
          </h3>
          <p className={cn('text-sm', headline.trim() ? 'text-muted' : 'text-headline-soft')}>
            {headline.trim() || 'O que você faz, em uma frase'}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3" aria-hidden />
            {city ? `${city.name}/${city.uf}` : 'Sua cidade'}
          </p>
        </div>
        <ul className="flex min-h-7 flex-wrap gap-1.5" aria-label="Especialidades">
          <AnimatePresence initial={false}>
            {specialties.length === 0 && (
              <motion.li
                key="vazio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-headline-soft"
              >
                Suas especialidades
              </motion.li>
            )}
            {specialties.map((s) => (
              <motion.li
                key={s}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                className="rounded-full bg-accent/12 px-2.5 py-1 text-xs font-medium text-accent"
              >
                {s}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <div className="flex items-center justify-between gap-3 border-t border-separator pt-4">
          <span className="text-xs text-muted">Ofertas com preço calculado</span>
          <span className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
            <MessagesSquare className="size-3.5" aria-hidden /> Conversar
          </span>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(360px circle at var(--mx) var(--my), color-mix(in oklab, var(--accent) 12%, transparent), transparent 65%)',
        }}
      />
    </article>
  );
}
