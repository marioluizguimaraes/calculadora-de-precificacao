import { Check, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import type { ProfileCheck, ProfileSection } from '@/features/auth';
import CountUp from '@/shared/components/react-bits/CountUp';
import { cn } from '@/shared/lib/utils';

const R = 42;
const CIRCUMFERENCE = 2 * Math.PI * R;

/** Anel de progresso do perfil + atalhos para o que falta preencher. */
export function CompletenessCard({
  pct,
  checks,
  onFix,
}: {
  pct: number;
  checks: ProfileCheck[];
  onFix: (section: ProfileSection) => void;
}) {
  const reduce = useReducedMotion();
  const missing = checks.filter((c) => !c.done);
  return (
    <section aria-labelledby="perfil-completo" className="flex flex-col gap-5 card-soft p-5 sm:p-6">
      <div className="flex items-center gap-5">
        <div className="relative size-24 shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              strokeWidth="9"
              className="stroke-surface-secondary"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              className="stroke-accent"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - pct / 100) }}
              transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center font-display text-xl text-foreground tabular">
            <span>
              <CountUp to={pct} duration={1} />%
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h2 id="perfil-completo" className="font-semibold text-foreground">
            {pct === 100 ? 'Perfil completo!' : 'Complete seu perfil'}
          </h2>
          <p className="text-sm text-muted">
            {pct === 100
              ? 'Quem encontra suas ofertas vê tudo o que precisa para confiar.'
              : 'Perfis completos passam mais confiança para quem contrata.'}
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {checks.map((check) => (
          <li key={check.id}>
            {check.done ? (
              <span className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-muted">
                <span className="grid size-5 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Check className="size-3" aria-hidden />
                </span>
                <span className="line-through decoration-border">{check.label}</span>
                <span className="sr-only">(feito)</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onFix(check.section);
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left text-sm text-foreground transition-colors outline-none hover:bg-accent/8 focus-visible:ring-2 focus-visible:ring-focus"
              >
                <span className="size-5 rounded-full border-2 border-dashed border-accent/60" />
                <span className="flex-1">{check.label}</span>
                <ChevronRight
                  className={cn(
                    'size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent',
                  )}
                  aria-hidden
                />
              </button>
            )}
          </li>
        ))}
      </ul>
      {missing.length > 0 && (
        <p className="text-xs text-muted">
          Falta{missing.length > 1 ? 'm' : ''} {missing.length}{' '}
          {missing.length > 1 ? 'itens' : 'item'}.
        </p>
      )}
    </section>
  );
}
