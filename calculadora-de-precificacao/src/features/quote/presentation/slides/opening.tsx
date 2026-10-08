import { Clapperboard, Clock, ListChecks, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { TIER_META } from '@/features/services';
import { formatDate, formatNumber } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { describeLocation, quoteTitle } from '../../utils/describe';
import { peopleInvolved, stagesWithServices, validUntil } from '../deck';
import { useDeck } from '../motion';
import {
  AnimatedNumber,
  AnimatedWords,
  BigClapper,
  Eyebrow,
  Item,
  SlideBody,
  SlideTitle,
  StudioMark,
} from '../primitives';

/** Perfurações de película nas bordas da capa. */
function FilmStrip({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'absolute inset-x-0 flex h-[30px] items-center justify-between bg-black/30 px-6',
        className,
      )}
    >
      {Array.from({ length: 44 }, (_, i) => (
        <span key={i} className="h-3 w-5 rounded-[3px] bg-ink-foreground/12" />
      ))}
    </div>
  );
}

/** Cantos do visor da câmera, enquadrando a capa. */
function ViewfinderCorners() {
  const corner = 'absolute size-11 border-ink-foreground/35';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-14 top-[54px] bottom-[54px]">
      <span className={cn(corner, 'top-0 left-0 rounded-tl-md border-t-2 border-l-2')} />
      <span className={cn(corner, 'top-0 right-0 rounded-tr-md border-t-2 border-r-2')} />
      <span className={cn(corner, 'bottom-0 left-0 rounded-bl-md border-b-2 border-l-2')} />
      <span className={cn(corner, 'right-0 bottom-0 rounded-br-md border-r-2 border-b-2')} />
    </div>
  );
}

/** Timecode correndo a 24 quadros por segundo, como no visor durante a gravação. */
function RunningTimecode() {
  const { isStatic } = useDeck();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (isStatic) return;
    const start = performance.now();
    const timer = setInterval(() => {
      const frames = Math.floor(((performance.now() - start) / 1000) * 24);
      const pad = (n: number) => String(n).padStart(2, '0');
      const s = Math.floor(frames / 24);
      if (ref.current) {
        ref.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frames % 24)}`;
      }
    }, 1000 / 24);
    return () => {
      clearInterval(timer);
    };
  }, [isStatic]);
  return (
    <span ref={ref} className="tabular">
      00:00:00:00
    </span>
  );
}

function titleSize(title: string): string {
  if (title.length <= 28) return 'text-[120px]';
  if (title.length <= 50) return 'text-[100px]';
  if (title.length <= 70) return 'text-[82px]';
  return 'text-[66px]';
}

export function CoverSlide() {
  const { draft, identity, issuedAt } = useDeck();
  const title = quoteTitle(draft);
  const client = draft.client.company || draft.client.name || 'A definir';

  const slate = [
    ['Cliente', client],
    ['Local', describeLocation(draft.location)],
    ['Data', formatDate(issuedAt)],
    ['Válida até', formatDate(validUntil(identity, issuedAt))],
  ];

  return (
    <>
      {/* Texturas: vazamento de luz quente, faixa diagonal e película nas bordas. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-56 -right-40 h-[760px] w-[1000px] rounded-full bg-[radial-gradient(closest-side,rgb(244_123_48/0.5),rgb(236_106_31/0.12)_60%,transparent)] blur-2xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 left-[38%] h-[1300px] w-[220px] rotate-[28deg] bg-[linear-gradient(90deg,transparent,rgb(255_220_170/0.07),transparent)]"
      />
      <FilmStrip className="top-0" />
      <FilmStrip className="bottom-0" />
      <ViewfinderCorners />

      <SlideBody className="flex flex-col justify-between px-[120px] pt-[86px] pb-[86px]">
        <Item className="flex items-center justify-between">
          <StudioMark onInk />
          <span className="flex items-center gap-5 font-mono text-[16px] text-ink-muted">
            <span className="flex items-center gap-2 text-ink-foreground">
              <span className="rec-dot size-3!" /> REC
            </span>
            <RunningTimecode />
            <span className="rounded-md border border-ink-foreground/20 px-2 py-0.5">4K · 24p</span>
          </span>
        </Item>

        <div className="grid grid-cols-[1fr_auto] items-center gap-14">
          <div className="flex min-w-0 flex-col gap-7">
            <Item>
              <Eyebrow onInk>Proposta de produção audiovisual</Eyebrow>
            </Item>
            <AnimatedWords
              text={title}
              className={cn(
                'line-clamp-4 font-display text-balance text-ink-foreground',
                titleSize(title),
              )}
            />
          </div>
          <Item>
            <BigClapper scene="01" take="01" className="w-[340px] rotate-[-5deg]" />
          </Item>
        </div>

        <Item>
          <dl className="grid grid-cols-4 border-t border-ink-foreground/15">
            {slate.map(([label, value], i) => (
              <div
                key={label}
                className={cn(
                  'flex min-w-0 flex-col gap-1.5 pt-5',
                  i > 0 && 'border-l border-ink-foreground/15 pl-7',
                  i < slate.length - 1 && 'pr-7',
                )}
              >
                <dt className="font-mono text-[13px] tracking-[0.18em] text-amber uppercase">
                  {label}
                </dt>
                <dd className="line-clamp-2 text-[21px] leading-snug font-semibold text-ink-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Item>
      </SlideBody>
    </>
  );
}

const hoursFormat = (v: number) => formatNumber(Math.round(v));
const intFormat = (v: number) => String(Math.round(v));

export function ProjectSlide() {
  const { draft, result } = useDeck();
  const tier = TIER_META[draft.project.tier];
  const stages = stagesWithServices(draft).length;
  const deliverables = draft.project.deliverables.trim() || quoteTitle(draft);

  const stats = [
    {
      icon: Clock,
      value: result.totalHours,
      format: hoursFormat,
      suffix: 'h',
      label: 'de trabalho dedicadas ao seu projeto',
    },
    {
      icon: ListChecks,
      value: draft.services.length,
      format: intFormat,
      suffix: draft.services.length === 1 ? 'serviço' : 'serviços',
      label: 'detalhados nesta proposta',
    },
    {
      icon: Users,
      value: peopleInvolved(draft),
      format: intFormat,
      suffix: peopleInvolved(draft) === 1 ? 'pessoa' : 'pessoas',
      label: 'cuidando de cada detalhe',
    },
    {
      icon: Clapperboard,
      value: stages,
      format: intFormat,
      suffix: stages === 1 ? 'etapa' : 'etapas',
      label: 'do briefing à entrega final',
    },
  ];
  const [hero, ...others] = stats as [(typeof stats)[number], ...typeof stats];
  // Diárias ficam de fora: são horas ÷ jornada, não os dias reais de gravação.
  const rest = others.filter((stat) => stat.value > 0);

  return (
    <SlideBody className="grid grid-cols-[1.1fr_1fr] gap-20">
      <div className="flex flex-col justify-center gap-10">
        <Item>
          <Eyebrow>O projeto</Eyebrow>
        </Item>
        <Item>
          <SlideTitle soft="O que você" strong="vai receber" />
        </Item>
        <Item className="relative overflow-hidden card-soft p-10">
          <span
            aria-hidden
            className="absolute -top-4 right-8 font-display text-[200px] leading-none text-accent/15"
          >
            “
          </span>
          <p
            className={cn(
              'leading-[1.25] font-semibold text-balance text-foreground',
              deliverables.length > 110 ? 'line-clamp-6 text-[28px]' : 'text-[38px]',
            )}
          >
            {deliverables}
          </p>
          <p className="mt-6 flex items-center gap-3 text-[20px] text-muted">
            <span className="rounded-full bg-accent/12 px-4 py-1.5 font-semibold text-accent">
              Complexidade {tier.label.toLowerCase()}
            </span>
            {tier.description}
          </p>
        </Item>
      </div>

      <div className="flex flex-col justify-center gap-6">
        <Item className="card-hero p-10">
          <div className="relative flex flex-col gap-2">
            <hero.icon className="size-9 text-white/80" aria-hidden />
            <p className="font-display text-[112px] text-white">
              <AnimatedNumber value={hero.value} format={hero.format} delay={0.5} />
              <span className="ml-3 text-[52px]">{hero.suffix}</span>
            </p>
            <p className="text-[26px] text-white/85">{hero.label}</p>
          </div>
        </Item>
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${Math.max(1, rest.length)}, minmax(0, 1fr))` }}
        >
          {rest.map((stat, i) => (
            <Item key={stat.label} className="flex flex-col gap-2 card-soft p-7">
              <stat.icon className="size-7 text-accent" aria-hidden />
              <p className="font-display text-[60px] text-foreground">
                <AnimatedNumber value={stat.value} format={stat.format} delay={0.7 + i * 0.15} />
              </p>
              <p className="text-[19px] leading-snug text-muted">
                <strong className="font-semibold text-foreground">{stat.suffix}</strong>{' '}
                {stat.label}
              </p>
            </Item>
          ))}
        </div>
      </div>
    </SlideBody>
  );
}
