import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Maximize,
  Minimize,
  X,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { cn } from '@/shared/lib/utils';

import {
  buildSlides,
  slideKey,
  slideLabel,
  slideTone,
  type DeckData,
  type SlideSpec,
} from './deck';
import { DeckContext, EASE_OUT, pageVariants, type DeckContextValue } from './motion';
import { SlideCanvas, SlideViewport } from './primitives';
import { ClosingSlide } from './slides/closing';
import { ConditionsSlide, InvestmentSlide } from './slides/investment';
import { CoverSlide, ProjectSlide } from './slides/opening';
import { ProcessSlide, TimelineSlide } from './slides/process';
import { ServicesSlide, StageSlide } from './slides/stages';
import { IncludedSlide, TeamSlide } from './slides/structure';

function SlideContent({ slide }: { slide: SlideSpec }) {
  switch (slide.kind) {
    case 'capa':
      return <CoverSlide />;
    case 'projeto':
      return <ProjectSlide />;
    case 'processo':
      return <ProcessSlide />;
    case 'etapa':
      return <StageSlide stage={slide.stage} />;
    case 'servicos':
      return (
        <ServicesSlide
          stage={slide.stage}
          part={slide.part}
          parts={slide.parts}
          serviceIds={slide.serviceIds}
        />
      );
    case 'cronograma':
      return <TimelineSlide />;
    case 'equipe':
      return <TeamSlide />;
    case 'incluso':
      return <IncludedSlide />;
    case 'investimento':
      return <InvestmentSlide />;
    case 'condicoes':
      return <ConditionsSlide />;
    case 'encerramento':
      return <ClosingSlide />;
  }
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  pressed,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'grid size-10 place-items-center rounded-full text-white/80 transition outline-none hover:bg-white/12 hover:text-white focus-visible:ring-2 focus-visible:ring-[#f47b30] disabled:pointer-events-none disabled:opacity-30',
        pressed && 'bg-white/15 text-white',
      )}
    >
      <Icon className="size-[18px]" aria-hidden />
    </button>
  );
}

const IDLE_MS = 2600;
const SWIPE_PX = 60;

interface ProposalDeckProps {
  data: DeckData;
  /** Slide inicial (base 0) — vem da URL para sobreviver a um recarregamento. */
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  onExit: () => void;
}

/**
 * Apresentação da proposta em slides, para conduzir a reunião com o cliente.
 * Mostra só o que o cliente precisa ver: escopo, processo, investimento total e condições.
 */
export function ProposalDeck({ data, initialIndex = 0, onIndexChange, onExit }: ProposalDeckProps) {
  const slides = useMemo(() => buildSlides(data.draft, data.result), [data.draft, data.result]);
  const [index, setIndex] = useState(() => Math.min(Math.max(0, initialIndex), slides.length - 1));
  const [direction, setDirection] = useState(1);
  const [overview, setOverview] = useState(false);
  const [idle, setIdle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const current = slides[index] ?? slides[0];
  const total = slides.length;

  const contextValue = useMemo<DeckContextValue>(() => ({ ...data, isStatic: false }), [data]);
  const staticValue = useMemo<DeckContextValue>(() => ({ ...data, isStatic: true }), [data]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(0, next), total - 1);
      setIndex((prev) => {
        if (clamped !== prev) setDirection(clamped > prev ? 1 : -1);
        return clamped;
      });
    },
    [total],
  );
  const next = useCallback(() => {
    goTo(index + 1);
  }, [goTo, index]);
  const prev = useCallback(() => {
    goTo(index - 1);
  }, [goTo, index]);

  // Avisa a página (que guarda o slide na URL) sem depender da identidade do callback.
  const onIndexChangeRef = useRef(onIndexChange);
  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  });
  useEffect(() => {
    onIndexChangeRef.current?.(index);
  }, [index]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
    };
  }, []);

  // Teclado de apresentação: setas, espaço, PageUp/Down (passadores de slide), Home/End.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          // Com foco num botão, Enter/espaço acionam o botão.
          if ((event.key === 'Enter' || event.key === ' ') && target?.closest('button')) return;
          event.preventDefault();
          if (overview) setOverview(false);
          else next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          event.preventDefault();
          prev();
          break;
        case 'Home':
          event.preventDefault();
          goTo(0);
          break;
        case 'End':
          event.preventDefault();
          goTo(total - 1);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'g':
        case 'G':
          setOverview((v) => !v);
          break;
        case 'Escape':
          if (overview) setOverview(false);
          else if (!document.fullscreenElement) onExit();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [goTo, next, prev, total, overview, toggleFullscreen, onExit]);

  // Controles somem quando o mouse para — a tela fica só com o slide.
  useEffect(() => {
    if (idle) return;
    const timer = setTimeout(() => {
      setIdle(true);
    }, IDLE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [idle, index]);

  const wake = () => {
    if (idle) setIdle(false);
  };

  const onPointerDown = (event: ReactPointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };
  // Toque: deslizar troca de slide. Mouse: clicar no slide avança, como num passador.
  const onPointerUp = (event: ReactPointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (event.pointerType === 'mouse') {
      const target = event.target as HTMLElement;
      const onStage = target.closest('[data-deck-stage]') && !target.closest('button, a');
      if (event.button === 0 && onStage && Math.hypot(dx, dy) < 6) next();
      return;
    }
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
  };

  if (!current) return null;
  const label = slideLabel(current);

  return (
    <MotionConfig reducedMotion="user">
      <DeckContext.Provider value={contextValue}>
        <div
          ref={rootRef}
          data-theme="light"
          className={cn(
            'fixed inset-0 z-50 flex flex-col bg-[#0f0a07] select-none',
            idle && !overview && 'cursor-none',
          )}
          onPointerMove={wake}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {/* Progresso */}
          <div className="absolute inset-x-0 top-0 z-20 h-1 bg-white/8">
            <motion.div
              className="h-full origin-left bg-[#f47b30]"
              animate={{ scaleX: (index + 1) / total }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            />
          </div>

          <p className="sr-only" aria-live="polite">
            Slide {index + 1} de {total}: {label}
          </p>

          <div className="flex min-h-0 flex-1 p-3 sm:p-6">
            <SlideViewport className="flex-1">
              <div
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${total}: ${label}`}
                className="absolute inset-0 overflow-hidden rounded-[14px] shadow-[0_40px_120px_-30px_rgb(0_0_0/0.8)]"
                data-deck-stage
              >
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={slideKey(current)}
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    <SlideCanvas
                      tone={slideTone(current)}
                      page={index + 1}
                      total={total}
                      footer={current.kind !== 'capa'}
                    >
                      <SlideContent slide={current} />
                    </SlideCanvas>
                  </motion.div>
                </AnimatePresence>
              </div>
            </SlideViewport>
          </div>

          {/* Barra de controles */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4"
            animate={{ opacity: idle && !overview ? 0 : 1, y: idle && !overview ? 12 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-[#1e140e]/85 p-1.5 text-white shadow-2xl backdrop-blur-md">
              <ControlButton
                icon={ChevronLeft}
                label="Slide anterior (←)"
                onClick={prev}
                disabled={index === 0}
              />
              <span className="min-w-28 px-2 text-center text-sm">
                <span className="font-mono tabular">
                  {index + 1}/{total}
                </span>
                <span className="ml-2 hidden text-white/60 sm:inline">{label}</span>
              </span>
              <ControlButton
                icon={ChevronRight}
                label="Próximo slide (→)"
                onClick={next}
                disabled={index === total - 1}
              />
              <span aria-hidden className="mx-1 h-6 w-px bg-white/15" />
              <ControlButton
                icon={LayoutGrid}
                label="Visão geral (G)"
                pressed={overview}
                onClick={() => {
                  setOverview((v) => !v);
                }}
              />
              <ControlButton
                icon={isFullscreen ? Minimize : Maximize}
                label={isFullscreen ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
                onClick={toggleFullscreen}
              />
              <ControlButton icon={X} label="Fechar apresentação (Esc)" onClick={onExit} />
            </div>
          </motion.div>

          {/* Visão geral: todos os slides, para pular direto para uma pergunta do cliente. */}
          <AnimatePresence>
            {overview && (
              <motion.div
                className="absolute inset-0 z-30 overflow-y-auto bg-[#0f0a07]/95 px-4 pt-10 pb-28 backdrop-blur-sm sm:px-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="mb-6 text-lg font-semibold text-white">Visão geral</h2>
                <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {slides.map((slide, i) => (
                    <motion.li
                      key={slideKey(slide)}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          goTo(i);
                          setOverview(false);
                        }}
                        className={cn('group flex w-full flex-col gap-2 text-left outline-none')}
                        aria-current={i === index ? 'true' : undefined}
                      >
                        <span
                          className={cn(
                            'block aspect-video w-full overflow-hidden rounded-xl ring-2 transition group-hover:ring-white/60 group-focus-visible:ring-[#f47b30]',
                            i === index ? 'ring-[#f47b30]' : 'ring-transparent',
                          )}
                        >
                          <DeckContext.Provider value={staticValue}>
                            <SlideViewport className="size-full">
                              <div className="pointer-events-none absolute inset-0" inert>
                                <SlideCanvas
                                  tone={slideTone(slide)}
                                  page={i + 1}
                                  total={total}
                                  footer={slide.kind !== 'capa'}
                                >
                                  <SlideContent slide={slide} />
                                </SlideCanvas>
                              </div>
                            </SlideViewport>
                          </DeckContext.Provider>
                        </span>
                        <span className="text-sm text-white/80">
                          <span className="mr-2 font-mono text-white/50 tabular">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {slideLabel(slide)}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DeckContext.Provider>
    </MotionConfig>
  );
}
