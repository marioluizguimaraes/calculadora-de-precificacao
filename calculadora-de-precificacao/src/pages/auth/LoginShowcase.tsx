import { FileText, Store } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

import { Coin, Pill, TwoToneHeading } from '@/shared/components/brand/Decor';
import { ParallaxLayer, ParallaxStage } from '@/shared/components/motion/Parallax';

const EASE = [0.22, 1, 0.36, 1] as const;

function Enter({ children, delay }: { children: ReactNode; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

/** Três pontinhos de "digitando…". */
function Typing() {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

/** Vitrine do login: o que a conta guarda, em camadas que seguem o cursor. */
export function LoginShowcase() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <TwoToneHeading
          as="h2"
          soft="Seu preço bem feito —"
          strong="sua vitrine aberta."
          accent
          className="text-[clamp(2.4rem,4vw,3.6rem)]"
        />
        <p className="max-w-lg text-lg text-pretty text-muted [@media(max-height:820px)]:hidden">
          Orçamentos salvos na conta, proposta em PDF e um marketplace para oferecer seus serviços —
          com um chat para cada pessoa interessada.
        </p>
      </div>

      <ParallaxStage
        label="Exemplo do que fica na sua conta"
        className="h-[25rem] max-w-[36rem] [@media(max-height:820px)]:h-[22rem]"
      >
        {/* Proposta em PDF, ao fundo */}
        <ParallaxLayer depth={0.35} className="absolute top-2 left-4 w-64 -rotate-6">
          <Enter delay={0.1}>
            <div className="flex flex-col gap-3 card-soft p-5">
              <span className="flex items-center gap-2 text-xs font-semibold text-muted">
                <FileText className="size-4 text-accent" aria-hidden /> proposta-institucional.pdf
              </span>
              <span className="h-2 w-3/4 rounded-full bg-surface-secondary" />
              <span className="h-2 w-full rounded-full bg-surface-secondary" />
              <span className="h-2 w-5/6 rounded-full bg-surface-secondary" />
              <div className="mt-2 flex items-end justify-between border-t border-separator pt-3">
                <span className="text-[11px] text-muted">Investimento</span>
                <span className="font-display text-xl text-foreground tabular">R$ 5.200</span>
              </div>
            </div>
          </Enter>
        </ParallaxLayer>

        {/* Preço ao vivo, o destaque */}
        <ParallaxLayer depth={1.1} className="absolute top-20 right-2 z-10 w-64">
          <Enter delay={0.25}>
            <div className="card-hero flex flex-col gap-3 p-5">
              <Coin className="absolute -right-6 -bottom-8 w-24 opacity-80" withCheck={false} />
              <span className="relative flex items-center gap-2 text-sm font-medium">
                <span className="size-2 rounded-full bg-white shadow-[0_0_0_4px_rgb(255_255_255/0.25)]" />
                Salvo <span className="text-on-hero-soft">na conta</span>
              </span>
              <span className="relative font-display text-[2.4rem] leading-none tabular">
                R$ 5.200
              </span>
              <span className="relative text-sm text-white/80">Vídeo institucional · 32 h</span>
            </div>
          </Enter>
        </ParallaxLayer>

        {/* Oferta no marketplace */}
        <ParallaxLayer depth={0.7} className="absolute bottom-6 left-0 w-72">
          <Enter delay={0.4}>
            <div className="flex flex-col gap-3 card-soft p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                  LC
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">Lia Campos Filmes</span>
                  <span className="text-[11px] text-muted">São Paulo/SP</span>
                </span>
                <Store className="ml-auto size-4 text-accent" aria-hidden />
              </div>
              <span className="text-sm font-medium text-foreground">
                Filme de casamento (2 câmeras + drone)
              </span>
              <span className="flex h-1.5 gap-[2px] overflow-hidden rounded-full" aria-hidden>
                <span className="basis-[12%] bg-stage-pre" />
                <span className="basis-[28%] bg-stage-producao" />
                <span className="basis-[60%] bg-stage-pos" />
              </span>
            </div>
          </Enter>
        </ParallaxLayer>

        {/* Chat da oferta, na frente */}
        <ParallaxLayer depth={1.6} className="absolute right-6 bottom-0 z-20 w-60">
          <Enter delay={0.55}>
            <div className="flex float-slow flex-col gap-2 rounded-2xl border border-border bg-surface/95 p-3 shadow-[0_24px_40px_-20px_rgb(40_24_12/0.45)]">
              <span className="self-start rounded-2xl rounded-bl-md bg-surface-secondary px-3 py-1.5 text-xs text-foreground">
                Atende casamento em Campinas?
              </span>
              <span className="self-end rounded-2xl rounded-br-md bg-accent px-3 py-1.5 text-xs text-accent-foreground">
                Atendo! Te mando a proposta.
              </span>
              <span className="flex items-center gap-2 self-start rounded-2xl bg-surface-secondary px-3 py-2">
                <Typing />
              </span>
            </div>
          </Enter>
        </ParallaxLayer>

        <ParallaxLayer depth={1.9} className="absolute -top-2 right-24">
          <Pill tone="amber" tilt={-8} className="text-sm">
            PDF da proposta
          </Pill>
        </ParallaxLayer>
        <ParallaxLayer depth={1.3} className="absolute top-[58%] -left-6 z-30">
          <Pill tone="soft" tilt={6} className="text-sm">
            Chat por oferta
          </Pill>
        </ParallaxLayer>
      </ParallaxStage>
    </div>
  );
}
