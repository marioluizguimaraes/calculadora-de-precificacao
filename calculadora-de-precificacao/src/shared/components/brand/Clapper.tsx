import { useAnimate, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';

import { cn } from '@/shared/lib/utils';

/** Listras diagonais da haste (escuro + branco). */
function stripes(angle: number): CSSProperties {
  return {
    backgroundImage: `repeating-linear-gradient(${angle}deg, #1e140e 0 3.5px, #ffffff 3.5px 7px)`,
  };
}

/** Logo "Claquete": a haste bate ao passar o mouse. */
export function MiniClapper({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLSpanElement>();

  const clap = () => {
    if (reduce) return;
    void animate([
      ['.mini-stick', { rotate: -32 }, { duration: 0.18, ease: 'easeOut' }],
      ['.mini-stick', { rotate: 0 }, { duration: 0.09, ease: 'easeIn', at: '+0.08' }],
    ]);
  };

  return (
    <span
      ref={scope}
      aria-hidden
      onPointerEnter={clap}
      className={cn('relative inline-flex size-9 shrink-0 flex-col', className)}
    >
      <span className="mini-stick h-[30%] origin-[8%_100%] rounded-t-[3px]" style={stripes(60)} />
      <span className="h-[18%]" style={stripes(-60)} />
      <span className="relative flex-1 rounded-b-md bg-accent shadow-[0_8px_18px_-8px_rgb(236_106_31/0.8)]">
        <span className="absolute top-[30%] left-[18%] h-[14%] w-[34%] rounded-full bg-white/85" />
        <span className="absolute top-[30%] right-[18%] h-[14%] w-[16%] rounded-full bg-white/55" />
      </span>
    </span>
  );
}
