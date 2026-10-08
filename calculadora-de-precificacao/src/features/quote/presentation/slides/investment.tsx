import { CalendarCheck, CircleCheck, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

import { Coin } from '@/shared/components/brand/Decor';
import { formatDate, formatHours, formatMoney, pluralize } from '@/shared/lib/format';

import { includedLogistics, peopleInvolved, validUntil } from '../deck';
import { popVariants, useDeck } from '../motion';
import { AnimatedNumber, Eyebrow, Item, SlideBody, SlideTitle } from '../primitives';

const moneyFormat = (v: number) => formatMoney(Math.round(v));

/** O momento do valor: uma tela só para o investimento total, sem fatiar por etapa. */
export function InvestmentSlide() {
  const { draft, result, identity, issuedAt } = useDeck();
  const people = peopleInvolved(draft);
  const included = includedLogistics(result).length > 0;
  const total = formatMoney(result.suggestedPriceCents);
  // O número ocupa a largura do cartão: valores maiores ganham fonte menor.
  const totalFontSize = Math.min(176, Math.floor(1900 / total.length));

  const facts = [
    result.totalHours > 0 && `${formatHours(result.totalHours)} de trabalho`,
    draft.services.length > 0 && pluralize(draft.services.length, 'serviço', 'serviços'),
    pluralize(people, 'pessoa envolvida', 'pessoas envolvidas'),
    included && 'Logística inclusa',
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <SlideBody className="flex">
      <Item className="card-hero flex flex-1 flex-col items-center justify-center gap-10 px-16 text-center">
        <Coin
          className="absolute -top-16 -left-16 w-[260px] -rotate-12 opacity-70"
          withCheck={false}
        />
        <Coin className="absolute -right-12 -bottom-20 w-[300px] opacity-90" />

        <p className="relative flex items-center gap-3 text-[24px] font-semibold text-on-hero-soft">
          <span aria-hidden className="h-0.5 w-10 bg-current" />
          Investimento total
          <span aria-hidden className="h-0.5 w-10 bg-current" />
        </p>

        <p
          className="relative font-display leading-none text-white"
          style={{ fontSize: totalFontSize }}
        >
          <AnimatedNumber
            value={result.suggestedPriceCents}
            format={moneyFormat}
            delay={0.5}
            duration={2.4}
          />
        </p>

        <p className="relative max-w-[52rem] text-[28px] leading-snug text-pretty text-white/90">
          Para o projeto completo, do briefing à entrega final
          {included ? ', com todos os custos de produção já incluídos.' : '.'}
        </p>

        <ul className="relative flex flex-wrap justify-center gap-3">
          {facts.map((fact) => (
            <motion.li
              key={fact}
              variants={popVariants}
              className="rounded-full border border-white/35 bg-white/12 px-5 py-2 text-[20px] font-semibold text-white"
            >
              {fact}
            </motion.li>
          ))}
        </ul>

        <p className="relative text-[18px] text-white/80">
          Proposta válida até {formatDate(validUntil(identity, issuedAt))}
        </p>
      </Item>
    </SlideBody>
  );
}

export function ConditionsSlide() {
  const { result, identity, issuedAt } = useDeck();
  const until = validUntil(identity, issuedAt);
  const included = includedLogistics(result);

  const cards = [
    {
      icon: Wallet,
      title: 'Pagamento',
      body: identity.paymentTerms.trim() || 'A combinar.',
    },
    {
      icon: CalendarCheck,
      title: 'Validade',
      body: `Esta proposta vale por ${pluralize(identity.proposalValidityDays, 'dia', 'dias')}, até ${formatDate(until)}.`,
    },
    {
      icon: CircleCheck,
      title: 'Investimento total',
      body: `${formatMoney(result.suggestedPriceCents)}${included.length > 0 ? ', com deslocamento e custos de produção já incluídos.' : '.'}`,
    },
  ];

  return (
    <SlideBody className="grid grid-cols-[1fr_1fr] gap-16">
      <div className="flex flex-col justify-center gap-8">
        <Item>
          <Eyebrow>Condições</Eyebrow>
        </Item>
        <Item>
          <SlideTitle soft="Tudo combinado," strong="claro desde o início" />
        </Item>
        <Item>
          <p className="text-[26px] leading-snug text-pretty text-muted">
            Sem letras miúdas: estas são as condições para começarmos o seu projeto.
          </p>
        </Item>
      </div>
      <ul className="flex flex-col gap-5">
        {cards.map((card) => (
          <Item key={card.title} className="flex flex-1 items-center gap-7 card-soft px-9 py-6">
            <motion.span
              variants={popVariants}
              className="grid size-[72px] shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-[0_16px_30px_-14px_rgb(236_106_31/0.8)]"
            >
              <card.icon className="size-9" aria-hidden />
            </motion.span>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[28px] font-bold tracking-tight text-foreground">{card.title}</h3>
              <p className="text-[21px] leading-snug text-pretty text-muted">{card.body}</p>
            </div>
          </Item>
        ))}
      </ul>
    </SlideBody>
  );
}
