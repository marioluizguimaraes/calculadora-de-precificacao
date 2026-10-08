import type { Variants } from 'motion/react';
import { createContext, useContext } from 'react';

import type { Stage } from '@/features/pricing';

import type { DeckData } from './deck';

/** Tamanho do quadro de desenho dos slides. Tudo é escalado a partir dele, como num projetor. */
export const SLIDE_WIDTH = 1600;
export const SLIDE_HEIGHT = 900;

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Slide: entra em cascata, um elemento depois do outro. */
export const slideVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
};

/** Cada bloco do slide sobe, ganha nitidez e aparece. */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE_OUT } },
};

/** Barras que crescem da esquerda para a direita. */
export const growVariants: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT } },
};

/** Selos e checks que "estalam" na tela. */
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 22 } },
};

/** Troca de slide: o próximo entra pelo lado em que a pessoa avançou. */
export const pageVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 90, scale: 0.985 }),
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.55, ease: EASE_OUT } },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -90,
    scale: 0.985,
    transition: { duration: 0.3, ease: 'easeIn' },
  }),
};

/** Frase curta de cada etapa — o que o cliente ganha com ela. */
export const STAGE_PITCH: Record<Stage, string> = {
  pre: 'Planejamos cada detalhe antes de ligar a câmera.',
  producao: 'Captamos com a equipe e a estrutura certas para o projeto.',
  pos: 'Transformamos o material bruto no vídeo que você vai publicar.',
};

/**
 * Cores das etapas no deck (base: --stage-*), com contraste conferido para cada uso:
 * `fill` é o preenchimento, `onFill` o texto/ícone sobre ele (escuro no âmbar, claro nos
 * demais) e `onInk` a versão clara para fundos marrom-café, onde o marrom da pós sumiria.
 */
export const STAGE_COLOR: Record<Stage, { fill: string; onFill: string; onInk: string }> = {
  pre: { fill: '#f2ac3d', onFill: '#3a2511', onInk: '#f6bd5c' },
  producao: { fill: '#ec6a1f', onFill: '#ffffff', onInk: '#ff9a5c' },
  pos: { fill: '#8a5634', onFill: '#ffffff', onInk: '#e9b48a' },
};

export interface DeckContextValue extends DeckData {
  /** Miniaturas da visão geral: tudo já no estado final, sem animação. */
  isStatic: boolean;
}

export const DeckContext = createContext<DeckContextValue | null>(null);

export function useDeck(): DeckContextValue {
  const value = useContext(DeckContext);
  if (!value) throw new Error('useDeck precisa estar dentro do ProposalDeck');
  return value;
}
