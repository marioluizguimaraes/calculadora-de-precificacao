import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Deslocamento inicial, em px. */
  y?: number;
}

/**
 * Entra em cena ao aparecer na rolagem — e sai quando deixa a tela, então reage tanto ao
 * descer quanto ao subir a página.
 */
export function Reveal({ children, className, delay = 0, y = 32 }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.15, once: false }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
