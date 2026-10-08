import { motion } from 'motion/react';

import { STAGE_BG, STAGE_META, STAGES, type Stage } from '@/features/pricing';
import { formatHours, formatNumber, formatPercent, pluralize } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { stagesWithServices } from '../deck';
import { growVariants, popVariants, STAGE_COLOR, STAGE_PITCH, useDeck } from '../motion';
import { AnimatedNumber, Eyebrow, Item, SlideBody, SlideTitle } from '../primitives';

const hoursFormat = (v: number) => formatNumber(Math.round(v * 10) / 10);

const STAGE_COUNT_WORD = ['', 'uma etapa', 'duas etapas', 'três etapas'];

export function ProcessSlide() {
  const { draft, result } = useDeck();
  const stages = stagesWithServices(draft);

  return (
    <SlideBody className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <Item>
          <Eyebrow>Como trabalhamos</Eyebrow>
        </Item>
        <Item>
          <SlideTitle
            soft="Do briefing à entrega,"
            strong={`em ${STAGE_COUNT_WORD[stages.length] ?? `${stages.length} etapas`}`}
          />
        </Item>
      </div>

      <div className="relative flex-1">
        {/* Fio que liga as etapas, desenhado da esquerda para a direita. */}
        <motion.span
          aria-hidden
          variants={growVariants}
          className="absolute top-[44px] right-[8%] left-[8%] h-1 origin-left rounded-full bg-[linear-gradient(90deg,var(--stage-pre),var(--stage-producao),var(--stage-pos))]"
        />
        <ol
          className="relative grid gap-10"
          style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
        >
          {stages.map((stage, i) => {
            const items = draft.services.filter((s) => s.stage === stage);
            return (
              <Item key={stage} className="flex flex-col items-center gap-5 text-center">
                <motion.span
                  variants={popVariants}
                  className="grid size-[92px] place-items-center rounded-full border-[6px] border-background font-display text-[38px] shadow-[0_20px_40px_-18px_rgb(92_58_30/0.6)]"
                  style={{
                    backgroundColor: STAGE_COLOR[stage].fill,
                    color: STAGE_COLOR[stage].onFill,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </motion.span>
                <div className="flex w-full flex-col gap-3 card-soft px-8 py-7">
                  <h3 className="text-[36px] font-bold tracking-tight text-foreground">
                    {STAGE_META[stage].label}
                  </h3>
                  <p className="text-[21px] leading-snug text-pretty text-muted">
                    {STAGE_PITCH[stage]}
                  </p>
                  <ul className="flex flex-wrap justify-center gap-2 border-t border-border pt-4">
                    {items.slice(0, 4).map((s) => (
                      <li
                        key={s.serviceId}
                        className="rounded-full border border-border px-3.5 py-1 text-[16px] text-foreground"
                      >
                        {s.label}
                      </li>
                    ))}
                    {items.length > 4 && (
                      <li className="px-2 py-1 text-[16px] text-muted">+{items.length - 4}</li>
                    )}
                  </ul>
                  <p className="flex justify-center gap-3 pt-2 text-[19px] font-semibold text-foreground">
                    <span className="rounded-full bg-surface-secondary px-4 py-1.5">
                      {pluralize(items.length, 'serviço', 'serviços')}
                    </span>
                    <span className="rounded-full bg-surface-secondary px-4 py-1.5 tabular">
                      {formatHours(result.stages[stage].hours)}
                    </span>
                  </p>
                </div>
              </Item>
            );
          })}
        </ol>
      </div>
    </SlideBody>
  );
}

const TICK_STEPS = [1, 2, 4, 6, 8, 12, 24, 48, 96];
const PLAY_SECONDS = 2.2;

export function TimelineSlide() {
  const { draft, result, isStatic } = useDeck();

  let cursor = 0;
  const clips: { id: string; label: string; stage: Stage; start: number; hours: number }[] = [];
  for (const stage of STAGES) {
    for (const s of draft.services.filter((x) => x.stage === stage && x.hours > 0)) {
      clips.push({ id: s.serviceId, label: s.label, stage, start: cursor, hours: s.hours });
      cursor += s.hours;
    }
  }
  const total = Math.max(cursor, 1);
  const step = TICK_STEPS.find((t) => total / t <= 8) ?? 192;
  const ticks = Array.from({ length: Math.floor(total / step) + 1 }, (_, i) => i * step);
  const pct = (h: number) => `${(h / total) * 100}%`;
  const stages = STAGES.filter((st) => result.stages[st].hours > 0);

  return (
    <SlideBody className="flex flex-col gap-12">
      <div className="flex items-end justify-between gap-10">
        <div className="flex flex-col gap-6">
          <Item>
            <Eyebrow>Linha do tempo</Eyebrow>
          </Item>
          <Item>
            <SlideTitle soft="Cada hora," strong="no seu lugar" />
          </Item>
        </div>
        <Item className="text-right">
          <p className="font-display text-[88px] text-accent">
            <AnimatedNumber
              value={result.totalHours}
              format={hoursFormat}
              delay={0.4}
              duration={2}
            />
            <span className="ml-2 text-[40px]">h</span>
          </p>
          <p className="text-[20px] text-muted">de trabalho dedicadas ao projeto</p>
        </Item>
      </div>

      <Item className="flex flex-col gap-4 card-soft p-10">
        <div className="flex">
          <div className="w-56 shrink-0" />
          <div className="relative h-6 flex-1">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute top-0 -translate-x-1/2 font-mono text-[14px] text-muted tabular first:translate-x-0"
                style={{ left: pct(t) }}
              >
                {t} h
              </span>
            ))}
          </div>
        </div>
        <div className="relative flex flex-col gap-4">
          {STAGES.map((stage) => (
            <div key={stage} className="flex items-center">
              <div className="flex w-56 shrink-0 items-center gap-3 pr-4">
                <span aria-hidden className={cn('size-3.5 rounded-full', STAGE_BG[stage])} />
                <span className="text-[22px] font-semibold text-foreground">
                  {STAGE_META[stage].label}
                </span>
              </div>
              <div className="relative h-16 flex-1 overflow-hidden rounded-xl bg-surface-secondary">
                {clips
                  .filter((c) => c.stage === stage)
                  .map((clip) => (
                    <motion.div
                      key={clip.id}
                      className={cn(
                        'absolute inset-y-0 flex origin-left items-center overflow-hidden rounded-xl px-3',
                        STAGE_BG[stage],
                      )}
                      style={{
                        left: `calc(${pct(clip.start)} + 2px)`,
                        width: `calc(${pct(clip.hours)} - 4px)`,
                      }}
                      initial={isStatic ? false : { scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{
                        delay: 0.5 + (clip.start / total) * PLAY_SECONDS,
                        duration: Math.max(0.25, (clip.hours / total) * PLAY_SECONDS),
                        ease: 'linear',
                      }}
                    >
                      {clip.hours / total >= 0.1 && (
                        <span
                          className="truncate text-[16px] font-semibold"
                          style={{ color: STAGE_COLOR[stage].onFill }}
                        >
                          {clip.label}
                        </span>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
          {/* Agulha de reprodução: percorre a linha do tempo como numa ilha de edição. */}
          {!isStatic && (
            <div aria-hidden className="pointer-events-none absolute -inset-y-3 right-0 left-56">
              <motion.span
                className="absolute inset-y-0 w-[3px] -translate-x-1/2 rounded-full bg-foreground"
                initial={{ left: '0%', opacity: 1 }}
                animate={{ left: '100%', opacity: [1, 1, 0] }}
                transition={{
                  left: { delay: 0.5, duration: PLAY_SECONDS, ease: 'linear' },
                  opacity: { delay: 0.5, duration: PLAY_SECONDS + 0.5, times: [0, 0.82, 1] },
                }}
              />
            </div>
          )}
        </div>
      </Item>

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
      >
        {stages.map((stage) => (
          <Item
            key={stage}
            className="flex items-center gap-4 rounded-2xl bg-surface-secondary px-6 py-5"
          >
            <span aria-hidden className={cn('h-10 w-1.5 rounded-full', STAGE_BG[stage])} />
            <div>
              <p className="text-[18px] text-muted">{STAGE_META[stage].label}</p>
              <p className="text-[26px] font-semibold text-foreground tabular">
                {formatHours(result.stages[stage].hours)}{' '}
                <span className="text-[18px] font-normal text-muted">
                  · {formatPercent(result.stages[stage].hours / Math.max(1, result.totalHours))} do
                  tempo
                </span>
              </p>
            </div>
          </Item>
        ))}
      </div>
    </SlideBody>
  );
}
