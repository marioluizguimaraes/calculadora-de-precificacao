import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { createContext, use, useRef, type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface Pointer {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

const PointerContext = createContext<Pointer | null>(null);

/**
 * Palco com paralaxe: acompanha o cursor (de -0,5 a 0,5 em cada eixo) e as camadas dentro dele
 * se deslocam conforme a própria profundidade. Com movimento reduzido, tudo fica parado.
 */
export function ParallaxStage({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const rect = useRef<DOMRect | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 90, damping: 16 });
  const y = useSpring(rawY, { stiffness: 90, damping: 16 });

  return (
    <PointerContext value={{ x, y }}>
      <motion.figure
        aria-label={label}
        className={cn('relative [perspective:1200px]', className)}
        onPointerEnter={(e) => {
          rect.current = e.currentTarget.getBoundingClientRect();
        }}
        onPointerMove={(e) => {
          const r = rect.current;
          if (!r || reduce) return;
          rawX.set((e.clientX - r.left) / r.width - 0.5);
          rawY.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          rect.current = null;
          rawX.set(0);
          rawY.set(0);
        }}
      >
        {children}
      </motion.figure>
    </PointerContext>
  );
}

/** Camada do palco: `depth` maior = se move mais (parece mais perto). */
export function ParallaxLayer({
  children,
  depth = 1,
  className,
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
}) {
  const pointer = use(PointerContext);
  const still = useMotionValue(0);
  const x = useTransform(pointer?.x ?? still, (v) => v * depth * 36);
  const y = useTransform(pointer?.y ?? still, (v) => v * depth * 28);
  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}
