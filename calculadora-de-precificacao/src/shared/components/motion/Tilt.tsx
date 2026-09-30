import { motion, useReducedMotion, useSpring } from 'motion/react';
import { useRef, type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface TiltProps {
  children: ReactNode;
  className?: string;
  /** Inclinação máxima, em graus. */
  max?: number;
}

/**
 * Inclina o conteúdo em 3D acompanhando o cursor. Só anima `transform` e lê o tamanho do
 * elemento uma vez por entrada do mouse (não a cada movimento).
 */
export function Tilt({ children, className, max = 6 }: TiltProps) {
  const rect = useRef<DOMRect | null>(null);
  const reduce = useReducedMotion();
  const spring = { stiffness: 160, damping: 18 };
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={cn('relative will-change-transform', className)}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onPointerEnter={(e) => {
        rect.current = e.currentTarget.getBoundingClientRect();
      }}
      onPointerMove={(e) => {
        const r = rect.current;
        if (!r) return;
        rotateY.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
        rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
      }}
      onPointerLeave={() => {
        rect.current = null;
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
