import { animate, motion, useReducedMotion } from 'motion/react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { initials } from '@/features/auth';
import { cn } from '@/shared/lib/utils';

import type { SlideTone } from './deck';
import {
  EASE_OUT,
  itemVariants,
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
  slideVariants,
  useDeck,
} from './motion';

/**
 * Encaixa o quadro de 1600×900 no espaço disponível, mantendo 16:9 — o mesmo slide serve
 * para tela cheia, janela e miniatura.
 */
export function SlideViewport({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      setScale(Math.min(el.clientWidth / SLIDE_WIDTH, el.clientHeight / SLIDE_HEIGHT));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={cn('relative grid place-items-center overflow-hidden', className)}>
      <div
        className="relative"
        style={{ width: SLIDE_WIDTH * scale, height: SLIDE_HEIGHT * scale }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5 0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0.9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

/** Fundo do slide por tom + rodapé com o estúdio e a paginação. */
export function SlideCanvas({
  tone,
  page,
  total,
  footer = true,
  children,
}: {
  tone: SlideTone;
  page: number;
  total: number;
  /** A capa tem a própria ficha técnica no rodapé. */
  footer?: boolean;
  children: ReactNode;
}) {
  const { identity } = useDeck();
  const studio = identity.businessName || identity.ownerName;
  const ink = tone === 'ink';

  return (
    <div
      className={cn(
        'relative isolate size-full overflow-hidden',
        ink ? 'bg-ink text-ink-foreground' : 'bg-background text-foreground',
      )}
    >
      {/* Brilhos difusos: profundidade sem disputar atenção com o conteúdo. */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-64 -right-48 -z-10 size-[56rem] rounded-full',
          ink
            ? 'bg-[radial-gradient(closest-side,rgb(236_106_31/0.38),transparent)]'
            : 'bg-[radial-gradient(closest-side,rgb(246_189_92/0.4),transparent)]',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -bottom-80 -left-64 -z-10 size-[48rem] rounded-full',
          ink
            ? 'bg-[radial-gradient(closest-side,rgb(246_189_92/0.16),transparent)]'
            : 'bg-[radial-gradient(closest-side,rgb(236_106_31/0.12),transparent)]',
        )}
      />
      {/* Granulação de película: textura sutil que tira o ar de "slide de escritório". */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 mix-blend-overlay',
          ink ? 'opacity-[0.22]' : 'opacity-[0.35]',
        )}
        style={{ backgroundImage: GRAIN }}
      />
      {children}
      {footer && (
        <footer
          className={cn(
            'absolute inset-x-28 bottom-10 flex items-center justify-between text-[17px]',
            ink ? 'text-ink-muted' : 'text-muted',
          )}
        >
          <span className="font-semibold">{studio}</span>
          <span className="font-mono tabular">
            {String(page).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </footer>
      )}
    </div>
  );
}

/** Raiz animada de cada slide: os filhos com `Item` entram em cascata. */
export function SlideBody({ children, className }: { children: ReactNode; className?: string }) {
  const { isStatic } = useDeck();
  return (
    <motion.div
      className={cn('absolute inset-0 px-28 pt-24 pb-28', className)}
      variants={slideVariants}
      initial={isStatic ? false : 'hidden'}
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function Item({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div variants={itemVariants} className={className} style={style}>
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, onInk }: { children: ReactNode; onInk?: boolean }) {
  return (
    <p
      className={cn(
        'flex items-center gap-3 text-[20px] font-semibold',
        onInk ? 'text-amber' : 'text-accent',
      )}
    >
      <span aria-hidden className={cn('h-0.5 w-10', onInk ? 'bg-amber' : 'bg-accent')} />
      {children}
    </p>
  );
}

/** Manchete em dois tons, como no resto do app. */
export function SlideTitle({
  soft,
  strong,
  className,
}: {
  soft?: ReactNode;
  strong: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn('font-display text-[76px] text-balance', className)}>
      {soft && <span className="text-headline-soft">{soft} </span>}
      <span className="text-foreground">{strong}</span>
    </h2>
  );
}

/**
 * Número que conta do zero até o valor. O texto muda direto no DOM a cada quadro;
 * leitores de tela recebem só o valor final.
 */
export function AnimatedNumber({
  value,
  format,
  delay = 0.4,
  duration = 1.6,
  className,
}: {
  value: number;
  format: (value: number) => string;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const { isStatic } = useDeck();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const still = isStatic || Boolean(reduce);

  useEffect(() => {
    if (still) return;
    const controls = animate(0, value, {
      delay,
      duration,
      ease: EASE_OUT,
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = format(latest);
      },
    });
    return () => {
      controls.stop();
    };
  }, [still, value, format, delay, duration]);

  return (
    <span className={cn('tabular', className)}>
      <span ref={ref} aria-hidden>
        {format(still ? value : 0)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}

/** Título que aparece palavra por palavra, saindo do desfoque. */
export function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const { isStatic } = useDeck();
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="mr-[0.22em] inline-block"
          initial={isStatic ? false : { opacity: 0, y: 40, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.35 + i * 0.09, ease: EASE_OUT }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

/** Logo do estúdio ou monograma com as iniciais. */
export function StudioMark({ className, onInk }: { className?: string; onInk?: boolean }) {
  const { identity } = useDeck();
  const studio = identity.businessName || identity.ownerName || 'Produção audiovisual';
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {identity.logoDataUrl ? (
        <img
          src={identity.logoDataUrl}
          alt=""
          className="size-16 rounded-2xl bg-white object-contain p-1.5"
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            'grid size-16 place-items-center rounded-2xl font-display text-[26px]',
            onInk ? 'bg-ink-foreground text-ink' : 'bg-ink text-ink-foreground',
          )}
        >
          {initials(studio)}
        </span>
      )}
      <span className="text-[24px] font-semibold">{studio}</span>
    </div>
  );
}

/** Listras diagonais da haste da claquete (escuro + branco). */
function stripes(angle: number): CSSProperties {
  return {
    backgroundImage: `repeating-linear-gradient(${angle}deg, #1e140e 0 22px, #fbf3ea 22px 44px)`,
  };
}

/** Claquete grande que "bate" quando o slide entra — a marca do app abrindo a reunião. */
export function BigClapper({
  className,
  scene,
  take,
}: {
  className?: string;
  scene: string;
  take: string;
}) {
  const { isStatic } = useDeck();
  return (
    <div aria-hidden className={cn('relative flex w-[420px] flex-col', className)}>
      <motion.div
        className="h-[64px] origin-[4%_100%] rounded-t-xl"
        style={stripes(60)}
        initial={isStatic ? false : { rotate: -26 }}
        animate={{ rotate: [-26, -26, 0, -4, 0] }}
        transition={{ duration: 1.1, times: [0, 0.55, 0.72, 0.84, 1], delay: 0.5 }}
      />
      <div className="h-[44px]" style={stripes(-60)} />
      <div className="relative flex h-[260px] flex-col justify-between rounded-b-2xl bg-accent p-7 shadow-[0_40px_80px_-30px_rgb(236_106_31/0.9)]">
        <div className="grid grid-cols-2 gap-6 font-mono text-[15px] text-white/75">
          <span>
            CENA
            <span className="mt-1 block font-display text-[56px] text-white">{scene}</span>
          </span>
          <span>
            TAKE
            <span className="mt-1 block font-display text-[56px] text-white">{take}</span>
          </span>
        </div>
        <span className="h-1.5 w-2/3 rounded-full bg-white/70" />
      </div>
    </div>
  );
}
