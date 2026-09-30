import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { useEffect } from 'react';

/**
 * Fundo vivo e leve: um brilho segue o cursor e duas manchas derivam com a rolagem.
 * Só anima `transform` (composição na GPU) — sem `filter: blur` nem máscaras, que forçam
 * repintura da tela inteira a cada quadro.
 */
export function InteractiveBackground() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(typeof window === 'undefined' ? 900 : window.innerWidth * 0.7);
  const my = useMotionValue(220);
  const x = useSpring(mx, { stiffness: 50, damping: 20, mass: 1 });
  const y = useSpring(my, { stiffness: 50, damping: 20, mass: 1 });
  const { scrollYProgress } = useScroll();
  const driftA = useTransform(scrollYProgress, [0, 1], [0, -240]);
  const driftB = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
    };
  }, [reduce, mx, my]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Malha de pontos estática */}
      <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklab,var(--foreground)_9%,transparent)_1px,transparent_1.5px)] [background-size:24px_24px]" />

      <motion.div
        style={{ y: driftA }}
        className="absolute top-[8%] -right-40 size-[36rem] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)] will-change-transform"
      />
      <motion.div
        style={{ y: driftB }}
        className="absolute top-[55%] -left-48 size-[30rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent)_14%,transparent),transparent)] will-change-transform"
      />

      {!reduce && (
        <motion.div
          style={{ x, y }}
          className="absolute -top-64 -left-64 size-[32rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent)_20%,transparent),transparent)] will-change-transform"
        />
      )}
    </div>
  );
}
