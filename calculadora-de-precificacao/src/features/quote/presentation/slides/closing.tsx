import { Globe, Mail, Phone, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

import { popVariants, useDeck } from '../motion';
import { Eyebrow, Item, SlideBody, StudioMark } from '../primitives';

const NEXT_STEPS = [
  { title: 'Aprovação', body: 'Você confirma a proposta e alinhamos os detalhes finais.' },
  { title: 'Agenda', body: 'Marcamos o briefing e as datas de gravação.' },
  { title: 'Ação!', body: 'Começamos a produzir — e você acompanha cada etapa.' },
];

export function ClosingSlide() {
  const { identity } = useDeck();
  const contacts: [LucideIcon, string][] = (
    [
      [Mail, identity.email],
      [Phone, identity.phone],
      [Globe, identity.website],
    ] as [LucideIcon, string][]
  ).filter(([, value]) => value.trim());

  return (
    <SlideBody className="grid grid-cols-[1.25fr_1fr] gap-20">
      <div className="flex flex-col justify-center gap-10">
        <Item>
          <Eyebrow onInk>Próximos passos</Eyebrow>
        </Item>
        <Item>
          <h2 className="font-display text-[96px] text-balance text-ink-foreground">
            Vamos tirar esse projeto <span className="text-amber">do papel?</span>
          </h2>
        </Item>
        <ol className="flex flex-col gap-5">
          {NEXT_STEPS.map((step, i) => (
            <Item key={step.title} className="flex items-center gap-6">
              <motion.span
                variants={popVariants}
                className="grid size-16 shrink-0 place-items-center rounded-full bg-accent font-display text-[28px] text-white"
              >
                {i + 1}
              </motion.span>
              <p className="text-[24px] text-ink-muted">
                <strong className="mr-2 font-semibold text-ink-foreground">{step.title}</strong>
                {step.body}
              </p>
            </Item>
          ))}
        </ol>
      </div>

      <Item className="flex flex-col justify-center">
        <div className="flex flex-col gap-8 rounded-[2rem] border border-ink-foreground/15 bg-ink-raised/70 p-12 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)]">
          <p className="font-display text-[64px] text-ink-foreground">Obrigado!</p>
          <StudioMark onInk />
          {contacts.length > 0 && (
            <ul className="flex flex-col gap-4 border-t border-ink-foreground/15 pt-8">
              {contacts.map(([Icon, value]) => (
                <li key={value} className="flex items-center gap-4 text-[22px] text-ink-foreground">
                  <span className="grid size-11 place-items-center rounded-xl bg-ink text-amber">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {value}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Item>
    </SlideBody>
  );
}
