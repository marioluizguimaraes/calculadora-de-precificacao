import { motion } from 'motion/react';

import { STAGE_META, type Stage } from '@/features/pricing';
import { SERVICE_BY_ID } from '@/features/services';
import { formatHours, formatNumber } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { stagesWithServices } from '../deck';
import { EASE_OUT, popVariants, STAGE_COLOR, STAGE_PITCH, useDeck } from '../motion';
import { AnimatedNumber, Eyebrow, Item, SlideBody } from '../primitives';
import { serviceDetail } from '../service-details';

const hoursFormat = (v: number) => formatNumber(Math.round(v * 10) / 10);
const intFormat = (v: number) => String(Math.round(v));

/** Abertura de capítulo: cada etapa entra como um novo ato do projeto. */
export function StageSlide({ stage }: { stage: Stage }) {
  const { draft, result, isStatic } = useDeck();
  const stages = stagesWithServices(draft);
  const position = stages.indexOf(stage) + 1;
  const services = draft.services.filter((s) => s.stage === stage);
  const team = draft.team
    .filter((m) => m.stage === stage)
    .reduce((acc, m) => acc + Math.max(0, m.count), 0);
  const color = STAGE_COLOR[stage];

  const stats = [
    { value: result.stages[stage].hours, format: hoursFormat, unit: 'h', label: 'de trabalho' },
    {
      value: services.length,
      format: intFormat,
      unit: '',
      label: services.length === 1 ? 'serviço' : 'serviços',
    },
    ...(team > 0
      ? [
          {
            value: team,
            format: intFormat,
            unit: '',
            label: team === 1 ? 'profissional extra' : 'profissionais extras',
          },
        ]
      : []),
  ];

  return (
    <SlideBody className="flex flex-col justify-between">
      {/* Número gigante do ato, ao fundo. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-[-150px] font-display text-[640px] leading-none select-none"
        style={{ color: color.onInk, opacity: 0.16 }}
        initial={isStatic ? false : { opacity: 0, scale: 1.08 }}
        animate={{ opacity: 0.16, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE_OUT }}
      >
        {String(position).padStart(2, '0')}
      </motion.span>

      <Item className="flex items-center justify-between">
        <Eyebrow onInk>
          Etapa {position} de {stages.length}
        </Eyebrow>
        <ol className="flex items-center gap-2 text-[17px]">
          {stages.map((st) => (
            <li
              key={st}
              className={cn(
                'rounded-full px-4 py-1.5 font-semibold',
                st !== stage && 'text-ink-muted ring-1 ring-ink-foreground/15',
              )}
              style={
                st === stage
                  ? { backgroundColor: STAGE_COLOR[st].onInk, color: '#2a1a0a' }
                  : undefined
              }
            >
              {STAGE_META[st].label}
            </li>
          ))}
        </ol>
      </Item>

      <div className="relative flex flex-col gap-7">
        <Item>
          <span
            aria-hidden
            className="block h-2 w-28 rounded-full"
            style={{ backgroundColor: color.onInk }}
          />
        </Item>
        <Item>
          <h2 className="font-display text-[128px] text-ink-foreground">
            {STAGE_META[stage].label}
          </h2>
        </Item>
        <Item>
          <p className="max-w-[46rem] text-[32px] leading-snug text-pretty text-ink-muted">
            {STAGE_PITCH[stage]}
          </p>
        </Item>
      </div>

      <Item className="relative flex items-end gap-14">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              'flex flex-col gap-1',
              i > 0 && 'border-l border-ink-foreground/15 pl-14',
            )}
          >
            <span className="font-display text-[72px] text-ink-foreground">
              <AnimatedNumber value={stat.value} format={stat.format} delay={0.6 + i * 0.15} />
              {stat.unit && <span className="ml-1.5 text-[36px]">{stat.unit}</span>}
            </span>
            <span className="text-[20px] text-ink-muted">{stat.label}</span>
          </div>
        ))}
      </Item>
    </SlideBody>
  );
}

/** Ficha de cada serviço: o que fazemos, em passos, e o que o cliente recebe. */
export function ServicesSlide({
  stage,
  part,
  parts,
  serviceIds,
}: {
  stage: Stage;
  part: number;
  parts: number;
  serviceIds: string[];
}) {
  const { draft } = useDeck();
  const stageServices = draft.services.filter((s) => s.stage === stage);
  const services = serviceIds.flatMap((id) => stageServices.filter((s) => s.serviceId === id));
  const color = STAGE_COLOR[stage];
  const wide = services.length < 3;

  return (
    <SlideBody className="flex flex-col gap-9">
      <div className="flex items-end justify-between gap-10">
        <div className="flex flex-col gap-4">
          <Item>
            <Eyebrow>{STAGE_META[stage].label} em detalhe</Eyebrow>
          </Item>
          <Item>
            <h2 className="font-display text-[56px] text-foreground">
              <span className="text-headline-soft">O que fazemos</span> em cada serviço
            </h2>
          </Item>
        </div>
        {parts > 1 && (
          <Item className="flex items-center gap-2 pb-3">
            <span className="sr-only">
              Parte {part} de {parts}
            </span>
            {Array.from({ length: parts }, (_, i) => (
              <span
                key={i}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i + 1 === part ? 40 : 12,
                  backgroundColor: i + 1 === part ? color.fill : 'var(--surface-tertiary)',
                }}
              />
            ))}
          </Item>
        )}
      </div>

      <ul
        className="grid min-h-0 flex-1 gap-7"
        style={{ gridTemplateColumns: `repeat(${services.length}, minmax(0, 1fr))` }}
      >
        {services.map((service) => {
          const detail = serviceDetail(service);
          const description = SERVICE_BY_ID.get(service.serviceId)?.description;
          const number = stageServices.indexOf(service) + 1;
          return (
            <Item
              key={service.serviceId}
              className={cn('flex min-h-0 flex-col card-soft', wide ? 'px-9 py-8' : 'px-7 py-6')}
            >
              <div className="flex items-center justify-between">
                <motion.span
                  variants={popVariants}
                  className="grid size-16 place-items-center rounded-2xl shadow-[0_14px_28px_-14px_rgb(92_58_30/0.7)]"
                  style={{ backgroundColor: color.fill, color: color.onFill }}
                >
                  <detail.icon className="size-8" aria-hidden />
                </motion.span>
                <span className="flex items-center gap-3">
                  <span className="rounded-full bg-surface-secondary px-4 py-1.5 text-[18px] font-semibold text-foreground tabular">
                    {formatHours(service.hours)}
                  </span>
                  <span className="font-mono text-[18px] text-muted tabular">
                    {String(number).padStart(2, '0')}
                  </span>
                </span>
              </div>

              <h3
                className={cn(
                  'mt-6 leading-tight font-bold tracking-tight text-balance text-foreground',
                  wide ? 'text-[34px]' : 'text-[30px]',
                )}
              >
                {service.label}
              </h3>

              {wide && description && <p className="mt-2 text-[19px] text-muted">{description}</p>}

              <ul
                className={cn(
                  'flex flex-1 flex-col border-t border-border',
                  wide ? 'mt-5 gap-4 pt-5' : 'mt-5 gap-3 pt-5',
                )}
              >
                {detail.steps.map((step) => (
                  <li
                    key={step}
                    className={cn(
                      'flex gap-3 leading-snug text-foreground',
                      wide ? 'text-[21px]' : 'text-[19px]',
                    )}
                  >
                    <span
                      aria-hidden
                      className="mt-[0.45em] size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: color.fill }}
                    />
                    {step}
                  </li>
                ))}
              </ul>

              <div
                className="mt-5 rounded-2xl px-5 py-4"
                style={{ backgroundColor: `color-mix(in oklab, ${color.fill} 14%, transparent)` }}
              >
                <p className="text-[15px] font-semibold text-headline-soft">Você recebe</p>
                <p
                  className={cn(
                    'mt-1 leading-snug font-medium text-pretty text-foreground',
                    wide ? 'text-[20px]' : 'text-[18px]',
                  )}
                >
                  {detail.outcome}
                </p>
              </div>
            </Item>
          );
        })}
      </ul>
    </SlideBody>
  );
}
