import {
  Aperture,
  BedDouble,
  Building2,
  Camera,
  Car,
  Check,
  Drone,
  FileCheck,
  Laptop,
  Lightbulb,
  MapPin,
  Mic,
  Move3d,
  Package,
  ShieldCheck,
  Sparkles,
  UserRound,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

import { initials } from '@/features/auth';
import { CATEGORY_META } from '@/features/equipment';
import { STAGE_META, type EquipmentCategory } from '@/features/pricing';
import { pluralize } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { describeLocation } from '../../utils/describe';
import { includedLogistics, peopleInvolved, type IncludedKey } from '../deck';
import { popVariants, STAGE_COLOR, useDeck } from '../motion';
import { Eyebrow, Item, SlideBody, SlideTitle } from '../primitives';

const CATEGORY_ICON: Record<EquipmentCategory, LucideIcon> = {
  camera: Camera,
  lente: Aperture,
  luz: Lightbulb,
  audio: Mic,
  suporte: Move3d,
  drone: Drone,
  computador: Laptop,
  outro: Package,
};

const CATEGORY_ORDER = Object.keys(CATEGORY_META) as EquipmentCategory[];

export function TeamSlide() {
  const { draft, identity } = useDeck();
  const lead = identity.ownerName || identity.businessName;
  const people = [
    ...(lead ? [{ id: 'lead', role: 'Direção e coordenação', name: lead, stage: null }] : []),
    ...draft.team.map((m) => ({
      id: m.id,
      role: m.role,
      name: m.count > 1 ? `${m.count} profissionais` : null,
      stage: m.stage,
    })),
  ];
  const categories = CATEGORY_ORDER.filter((c) => draft.equipment.some((e) => e.category === c));
  const hasEquipment = categories.length > 0;

  const peopleCols = Math.min(Math.max(people.length, 1), 4);
  const equipmentCols = Math.min(categories.length, categories.length > 6 ? 4 : 3);
  // Muita gente ou muito equipamento: cards mais baixos para tudo caber no slide.
  const dense = people.length > 4 || categories.length > 6;

  return (
    <SlideBody className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <Item>
          <Eyebrow>Equipe e estrutura</Eyebrow>
        </Item>
        <Item>
          <SlideTitle soft="Quem faz" strong="e com o quê" />
        </Item>
      </div>

      <div className={cn('flex flex-1 flex-col justify-center', dense ? 'gap-6' : 'gap-10')}>
        <section className="grid grid-cols-[200px_1fr] items-start gap-8">
          <Item>
            <h3 className="pt-3 text-[24px] font-semibold text-foreground">Equipe</h3>
            <p className="mt-1 text-[17px] text-muted">
              {pluralize(peopleInvolved(draft), 'pessoa', 'pessoas')} no projeto
            </p>
          </Item>
          <ul
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${peopleCols}, minmax(0, 1fr))` }}
          >
            {people.map((p, i) => {
              const isLead = i === 0 && Boolean(lead);
              return (
                <Item
                  key={p.id}
                  className={cn(
                    cn('flex items-center gap-4 px-6', dense ? 'py-3.5' : 'py-6'),
                    isLead ? 'card-ink' : 'card-soft',
                  )}
                >
                  <span
                    aria-hidden
                    className="grid size-12 shrink-0 place-items-center rounded-full font-display text-[19px]"
                    style={{
                      backgroundColor: p.stage ? STAGE_COLOR[p.stage].fill : 'var(--accent)',
                      color: p.stage ? STAGE_COLOR[p.stage].onFill : '#fff',
                    }}
                  >
                    {p.stage ? <UserRound className="size-5" /> : initials(p.name)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[19px] leading-tight font-semibold text-balance">
                      {p.role}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 truncate text-[15px]',
                        isLead ? 'text-ink-muted' : 'text-muted',
                      )}
                    >
                      {p.stage ? STAGE_META[p.stage].label : p.name}
                      {p.stage && p.name ? ` · ${p.name}` : ''}
                    </span>
                  </span>
                </Item>
              );
            })}
          </ul>
        </section>

        {hasEquipment && (
          <section className="grid grid-cols-[200px_1fr] items-start gap-8 border-t border-border pt-8">
            <Item>
              <h3 className="pt-3 text-[24px] font-semibold text-foreground">Estrutura técnica</h3>
              <p className="mt-1 text-[17px] text-muted">
                {pluralize(draft.equipment.length, 'item', 'itens')} de equipamento
              </p>
            </Item>
            <ul
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${equipmentCols}, minmax(0, 1fr))` }}
            >
              {categories.map((category) => {
                const Icon = CATEGORY_ICON[category];
                const items = draft.equipment.filter((e) => e.category === category);
                return (
                  <Item
                    key={category}
                    className={cn(
                      'flex items-center gap-4 card-soft px-6',
                      dense ? 'py-3.5' : 'py-6',
                    )}
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[15px] font-semibold text-muted">
                        {CATEGORY_META[category].label}
                      </span>
                      <span
                        className={cn(
                          'leading-snug text-foreground',
                          dense ? 'line-clamp-2 text-[16px]' : 'line-clamp-2 text-[20px]',
                        )}
                      >
                        {items.map((e) => e.name).join(' · ')}
                      </span>
                    </span>
                  </Item>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </SlideBody>
  );
}

const INCLUDED_ICON: Record<IncludedKey, LucideIcon> = {
  deslocamento: Car,
  alimentacao: Utensils,
  hospedagem: BedDouble,
  seguro: ShieldCheck,
  locacao: Building2,
  licencas: FileCheck,
  extras: Sparkles,
};

export function IncludedSlide() {
  const { draft, result } = useDeck();
  const items = includedLogistics(result);

  return (
    <SlideBody className="grid grid-cols-[1fr_1fr] gap-20">
      <div className="flex flex-col justify-center gap-8">
        <Item>
          <Eyebrow>Tudo incluso</Eyebrow>
        </Item>
        <Item>
          <SlideTitle soft="Um valor só." strong="Sem surpresa no fim." />
        </Item>
        <Item>
          <p className="text-[26px] leading-snug text-pretty text-muted">
            Os custos para a produção acontecer já estão no investimento. Você não recebe nenhuma
            cobrança extra depois.
          </p>
        </Item>
        <Item className="flex items-center gap-3 self-start rounded-full bg-surface-secondary px-6 py-3 text-[21px] text-foreground">
          <MapPin className="size-6 text-accent" aria-hidden />
          Atendimento em {describeLocation(draft.location)}
        </Item>
      </div>

      {/* Um "recibo" do que já está no valor — termina em R$ 0,00 de cobrança extra. */}
      <Item className="flex flex-col card-soft px-10 py-8">
        <p className="flex items-center justify-between border-b border-dashed border-border pb-5 text-[18px] text-muted">
          <span className="font-semibold text-foreground">Já está no investimento</span>
          <span>{items.length} itens</span>
        </p>
        <ul className="flex flex-1 flex-col">
          {items.map((item) => {
            const Icon = INCLUDED_ICON[item.key];
            return (
              <li
                key={item.key}
                className="flex flex-1 items-center gap-5 border-b border-border py-3 last:border-0"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-secondary text-foreground">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="flex-1 text-[22px] font-semibold text-foreground">
                  {item.label}
                </span>
                <motion.span
                  variants={popVariants}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[16px] font-semibold text-white"
                  style={{ backgroundColor: 'var(--success)' }}
                >
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                  Incluso
                </motion.span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 flex items-baseline justify-between border-t-2 border-foreground pt-5">
          <span className="text-[20px] font-semibold text-foreground">Cobrança extra depois</span>
          <span className="font-display text-[44px] text-success">R$ 0,00</span>
        </p>
      </Item>
    </SlideBody>
  );
}
