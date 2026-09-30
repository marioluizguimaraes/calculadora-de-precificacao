import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';

import { Pill, type PillTone } from '@/shared/components/brand/Decor';
import { cn } from '@/shared/lib/utils';

export interface FloatingPillSpec {
  text: string;
  tone: PillTone;
  tilt: number;
  /** Posição absoluta (classes top/left/right). */
  className: string;
  /** Profundidade da paralaxe: maiores se movem mais. */
  depth?: number;
}

function ParallaxPill({
  pill,
  mouseX,
  mouseY,
  progress,
}: {
  pill: FloatingPillSpec;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  progress: MotionValue<number>;
}) {
  const depth = pill.depth ?? 1;
  const x = useTransform(mouseX, (v) => v * 50 * depth);
  const scrollY = useTransform(progress, [0, 1], [110 * depth, -110 * depth]);
  const y = useTransform([scrollY, mouseY], ([s, m]) => (s as number) + (m as number) * 40 * depth);

  return (
    <motion.div style={{ x, y }} className={cn('pointer-events-auto absolute', pill.className)}>
      <motion.span
        drag
        dragSnapToOrigin
        dragElastic={0.6}
        initial={{ rotate: pill.tilt }}
        whileHover={{ scale: 1.08, rotate: 0 }}
        whileTap={{ scale: 0.95 }}
        whileDrag={{ scale: 1.12, rotate: 0, zIndex: 10 }}
        className="inline-block cursor-grab active:cursor-grabbing"
      >
        <Pill tone={pill.tone} className="text-base select-none lg:text-lg">
          {pill.text}
        </Pill>
      </motion.span>
    </motion.div>
  );
}

/**
 * Seção com pílulas flutuantes que reagem ao cursor (paralaxe), à rolagem (sobem e descem) e
 * podem ser arrastadas — voltam para o lugar ao soltar.
 */
export function FloatingPills({
  pills,
  children,
  className,
}: {
  pills: FloatingPillSpec[];
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 60, damping: 18 });
  const mouseY = useSpring(rawY, { stiffness: 60, damping: 18 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
    };
  }, [reduce, rawX, rawY]);

  return (
    <section ref={ref} className={cn('relative isolate overflow-hidden', className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {pills.map((pill) =>
          reduce ? (
            <Pill
              key={pill.text}
              tone={pill.tone}
              tilt={pill.tilt}
              className={cn('absolute text-base lg:text-lg', pill.className)}
            >
              {pill.text}
            </Pill>
          ) : (
            <ParallaxPill
              key={pill.text}
              pill={pill}
              mouseX={mouseX}
              mouseY={mouseY}
              progress={scrollYProgress}
            />
          ),
        )}
      </div>
      {children}
    </section>
  );
}
