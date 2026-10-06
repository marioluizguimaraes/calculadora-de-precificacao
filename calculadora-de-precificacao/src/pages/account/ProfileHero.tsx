import { Button } from '@heroui/react';
import { CalendarDays, Mail, MapPin, PencilLine, Store } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { PointerEvent } from 'react';

import { initials, type User } from '@/features/auth';
import { Pill, type PillTone } from '@/shared/components/brand/Decor';
import { ParallaxLayer, ParallaxStage } from '@/shared/components/motion/Parallax';
import { formatMonthYear } from '@/shared/lib/format';

/** Posições das pílulas de especialidade na capa (lado direito, "jogadas" na mesa). */
const PILL_SPOTS: { className: string; tilt: number; depth: number; tone: PillTone }[] = [
  { className: 'top-6 right-[8%]', tilt: -6, depth: 1.6, tone: 'cream' },
  { className: 'top-20 right-[26%]', tilt: 5, depth: 0.9, tone: 'amber' },
  { className: 'top-6 right-[44%]', tilt: 8, depth: 1.2, tone: 'ink' },
  { className: 'bottom-6 right-[14%]', tilt: -3, depth: 1.3, tone: 'cream' },
];

function trackSpotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

interface ProfileHeroProps {
  user: User;
  onEdit: () => void;
  onListings: () => void;
}

/** Capa do perfil: fundo vivo, avatar grande e as especialidades flutuando. */
export function ProfileHero({ user, onEdit, onListings }: ProfileHeroProps) {
  const reduce = useReducedMotion();
  return (
    <section className="overflow-hidden card-soft" aria-label="Seu perfil">
      <ParallaxStage label="Capa do perfil" className="m-0">
        <div
          onPointerMove={trackSpotlight}
          className="group relative h-44 overflow-hidden bg-[radial-gradient(120%_90%_at_85%_20%,rgb(255_190_110/0.45),transparent_55%),linear-gradient(150deg,#f37a2c,#e05a12)] sm:h-52"
        >
          <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.25)_1px,transparent_1.5px)] [background-size:16px_16px]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(420px circle at var(--mx) var(--my), rgb(255 230 190 / 0.35), transparent 65%)',
            }}
          />
          <div className="hidden md:block" aria-hidden>
            {user.specialties.slice(0, PILL_SPOTS.length).map((specialty, i) => {
              const spot = PILL_SPOTS[i];
              if (!spot) return null;
              return (
                <ParallaxLayer
                  key={specialty}
                  depth={spot.depth}
                  className={`absolute ${spot.className}`}
                >
                  <motion.span
                    initial={reduce ? false : { opacity: 0, y: 20, rotate: spot.tilt }}
                    animate={{ opacity: 1, y: 0, rotate: spot.tilt }}
                    whileHover={{ rotate: 0, scale: 1.08 }}
                    transition={{
                      delay: 0.15 + i * 0.08,
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                    }}
                    className="inline-block"
                  >
                    <Pill tone={spot.tone} className="text-sm">
                      {specialty}
                    </Pill>
                  </motion.span>
                </ParallaxLayer>
              );
            })}
          </div>
        </div>
      </ParallaxStage>

      <div className="flex flex-col gap-5 px-5 pb-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <motion.span
            initial={reduce ? false : { scale: 0.7, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            whileHover={reduce ? undefined : { rotate: -4, scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            aria-hidden
            className="relative z-10 -mt-16 grid size-28 shrink-0 place-items-center rounded-3xl border-[5px] border-surface bg-ink font-display text-4xl text-ink-foreground shadow-[0_20px_40px_-18px_rgb(40_24_12/0.7)] sm:-mt-20 sm:size-32 sm:text-5xl"
          >
            {initials(user.name)}
          </motion.span>
          <div className="flex min-w-0 flex-col gap-2 sm:pt-5">
            <h1 className="font-display text-4xl text-balance text-foreground sm:text-5xl">
              {user.businessName || user.name}
            </h1>
            <p className="text-base text-muted sm:text-lg">
              {user.name} · {user.headline}
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4 text-accent" aria-hidden />
                {user.city ? `${user.city.name}/${user.city.uf}` : 'Cidade não informada'}
              </li>
              <li className="flex items-center gap-1.5">
                <CalendarDays className="size-4 text-accent" aria-hidden />
                Desde {formatMonthYear(user.createdAt)}
              </li>
              <li className="flex min-w-0 items-center gap-1.5">
                <Mail className="size-4 shrink-0 text-accent" aria-hidden />
                <span className="truncate">{user.email}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" className="rounded-full bg-surface" onPress={onListings}>
            <Store className="size-4" /> Minhas ofertas
          </Button>
          <Button
            className="rounded-full px-5 shadow-[0_10px_20px_-10px_rgb(236_106_31/0.9)]"
            onPress={onEdit}
          >
            <PencilLine className="size-4" /> Editar perfil
          </Button>
        </div>
      </div>
    </section>
  );
}
