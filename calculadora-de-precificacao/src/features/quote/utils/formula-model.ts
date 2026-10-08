import {
  teamMemberCost,
  STAGE_META,
  type BusinessProfile,
  type PricingResult,
  type QuoteDraft,
} from '@/features/pricing';
import { formatHours, formatMoney, formatNumber, pluralize } from '@/shared/lib/format';

/**
 * Modelo explicável do cálculo: cada fórmula vira uma sequência de "peças" (variáveis e
 * operadores), e cada variável diz de onde vem o valor. Funções puras, sem JSX.
 */

/** De onde vem o valor de uma variável. */
export type VarKind = 'fixo' | 'estudio' | 'orcamento' | 'calculado';

export const VAR_KINDS: VarKind[] = ['fixo', 'estudio', 'orcamento', 'calculado'];

export const KIND_META: Record<VarKind, { label: string; description: string }> = {
  fixo: { label: 'Fixo do método', description: 'Constantes da fórmula — nunca mudam.' },
  estudio: { label: 'Do seu estúdio', description: 'Você define uma vez, vale para todos.' },
  orcamento: { label: 'Deste orçamento', description: 'Suas respostas nas etapas.' },
  calculado: { label: 'Calculado', description: 'Resultado de outra fórmula.' },
};

export interface FormulaVar {
  id: string;
  label: string;
  kind: VarKind;
  value: string;
  /** Onde a pessoa encontra (ou altera) esse valor. */
  source: string;
  /** Rota para alterar o valor, quando for editável. */
  editHref?: string;
}

export type Token =
  | { t: 'var'; id: string }
  | { t: 'op'; op: string }
  /** Valor avulso (ex.: diária de um membro da equipe), fora do catálogo. */
  | { t: 'val'; label: string; value: string; kind: VarKind };

export interface FormulaLine {
  label: string;
  tokens: Token[];
  result: string;
}

export interface Formula {
  id: string;
  title: string;
  /** Por que essa fórmula existe, em linguagem simples. */
  why: string;
  /** Variável que a fórmula produz. */
  resultId: string;
  tokens: Token[];
  /** Como cada parte da fórmula foi obtida. */
  details: FormulaLine[];
}

const v = (id: string): Token => ({ t: 'var', id });
const op = (o: string): Token => ({ t: 'op', op: o });
const val = (label: string, value: string, kind: VarKind = 'orcamento'): Token => ({
  t: 'val',
  label,
  value,
  kind,
});
const pct = (n: number) => `${formatNumber(n)}%`;
const days = (n: number) => pluralize(n, 'diária', 'diárias');
const step = (id: string) => `/orcamento?etapa=${id}`;

export function buildFormulaModel(
  draft: QuoteDraft,
  profile: BusinessProfile,
  result: PricingResult,
): { vars: Record<string, FormulaVar>; formulas: Formula[] } {
  const p = draft.pricing;
  const l = draft.logistics;
  const fixedCents = profile.fixedCosts.reduce((acc, c) => acc + c.monthlyCents, 0);
  const variablePct = p.taxRatePct + p.paymentFeePct + p.commissionPct;
  const rawPriceCents = Math.round(result.directCostCents * result.markup);
  const otherCents =
    result.logistics.insuranceCents +
    result.logistics.venueCents +
    result.logistics.licensesCents +
    result.logistics.extrasCents;
  const markupText = `× ${formatNumber(Math.round(result.markup * 1000) / 1000)}`;
  const teamOnSet = result.peopleOnSet - 1;
  const ownVehicle = l.transportMode === 'proprio';

  const list: FormulaVar[] = [
    // Fixos do método
    {
      id: 'cem',
      label: 'Base 100%',
      kind: 'fixo',
      value: '100',
      source: 'Percentuais são frações de 100',
    },
    {
      id: 'idaVolta',
      label: 'Ida e volta',
      kind: 'fixo',
      value: '2',
      source: 'Cada viagem tem ida e volta',
    },
    { id: 'voce', label: 'Você', kind: 'fixo', value: '1', source: 'Você sempre está no set' },
    {
      id: 'df',
      label: 'Despesas fixas',
      kind: 'fixo',
      value: '0%',
      source: 'Já estão no custo da hora — evita cobrar duas vezes',
    },

    // Do estúdio
    {
      id: 'custosFixos',
      label: 'Custos fixos/mês',
      kind: 'estudio',
      value: formatMoney(fixedCents),
      source: `Meu estúdio · ${pluralize(profile.fixedCosts.length, 'item', 'itens')}`,
      editHref: '/estudio',
    },
    {
      id: 'proLabore',
      label: 'Pró-labore',
      kind: 'estudio',
      value: formatMoney(profile.proLaboreCents),
      source: 'Meu estúdio · custos e jornada',
      editHref: '/estudio',
    },
    {
      id: 'diasMes',
      label: 'Dias/mês',
      kind: 'estudio',
      value: formatNumber(profile.workDaysPerMonth),
      source: 'Meu estúdio · jornada',
      editHref: '/estudio',
    },
    {
      id: 'horasDia',
      label: 'Horas/dia',
      kind: 'estudio',
      value: formatHours(profile.hoursPerDay),
      source: 'Meu estúdio · jornada',
      editHref: '/estudio',
    },
    {
      id: 'diasKit',
      label: 'Dias de uso do kit/ano',
      kind: 'estudio',
      value: formatNumber(profile.equipmentUseDaysPerYear),
      source: 'Meu estúdio · jornada',
      editHref: '/estudio',
    },

    // Deste orçamento
    ...(['pre', 'producao', 'pos'] as const).map((stage): FormulaVar => ({
      id: `horas-${stage}`,
      label: `Horas ${STAGE_META[stage].short.toLowerCase()}`,
      kind: 'orcamento',
      value: formatHours(result.stages[stage].hours),
      source: `Etapa Tempo · ${STAGE_META[stage].label}`,
      editHref: step('tempo'),
    })),
    {
      id: 'distancia',
      label: 'Distância (ida)',
      kind: 'orcamento',
      value:
        draft.location.distanceKm === null ? '—' : `${formatNumber(draft.location.distanceKm)} km`,
      source: 'Etapa Local',
      editHref: step('local'),
    },
    {
      id: 'kmPorLitro',
      label: 'Consumo',
      kind: 'orcamento',
      value: `${formatNumber(l.kmPerLiter)} km/l`,
      source: 'Etapa Logística · deslocamento',
      editHref: step('logistica'),
    },
    {
      id: 'precoLitro',
      label: 'Preço do litro',
      kind: 'orcamento',
      value: formatMoney(l.fuelPricePerLiterCents),
      source: 'Etapa Logística · deslocamento',
      editHref: step('logistica'),
    },
    {
      id: 'pedagio',
      label: 'Pedágio/viagem',
      kind: 'orcamento',
      value: formatMoney(l.tollsPerTripCents),
      source: 'Etapa Logística · deslocamento',
      editHref: step('logistica'),
    },
    {
      id: 'refeicao',
      label: 'Refeição/pessoa/dia',
      kind: 'orcamento',
      value: formatMoney(l.mealPerPersonDayCents),
      source: 'Etapa Logística · alimentação',
      editHref: step('logistica'),
    },
    {
      id: 'noites',
      label: 'Noites',
      kind: 'orcamento',
      value: formatNumber(l.lodgingNights),
      source: 'Etapa Logística · hospedagem',
      editHref: step('logistica'),
    },
    {
      id: 'valorNoite',
      label: 'Noite/pessoa',
      kind: 'orcamento',
      value: formatMoney(l.lodgingPerNightCents),
      source: 'Etapa Logística · hospedagem',
      editHref: step('logistica'),
    },
    {
      id: 'outros',
      label: 'Seguro, locação e extras',
      kind: 'orcamento',
      value: formatMoney(otherCents),
      source: 'Etapa Logística · custos do projeto',
      editHref: step('logistica'),
    },
    {
      id: 'equipeSet',
      label: 'Equipe no set',
      kind: 'orcamento',
      value: formatNumber(teamOnSet),
      source: 'Etapa Equipe · pessoas na gravação',
      editHref: step('equipe'),
    },
    {
      id: 'imposto',
      label: 'Imposto',
      kind: 'orcamento',
      value: pct(p.taxRatePct),
      source: 'Etapa Margem · herdado do estúdio',
      editHref: step('margem'),
    },
    {
      id: 'taxa',
      label: 'Taxa de pagamento',
      kind: 'orcamento',
      value: pct(p.paymentFeePct),
      source: 'Etapa Margem · herdado do estúdio',
      editHref: step('margem'),
    },
    {
      id: 'comissao',
      label: 'Comissão',
      kind: 'orcamento',
      value: pct(p.commissionPct),
      source: 'Etapa Margem',
      editHref: step('margem'),
    },
    {
      id: 'lucro',
      label: 'Lucro desejado',
      kind: 'orcamento',
      value: pct(p.profitPct),
      source: 'Etapa Margem · herdado do estúdio',
      editHref: step('margem'),
    },
    {
      id: 'arredondamento',
      label: 'Arredondar para cima',
      kind: 'orcamento',
      value: p.roundToReais > 0 ? `R$ ${p.roundToReais}` : 'Exato',
      source: 'Etapa Margem · arredondamento',
      editHref: step('margem'),
    },
    l.tripsCount === null
      ? {
          id: 'viagens',
          label: 'Viagens',
          kind: 'calculado',
          value: formatNumber(result.trips),
          source: 'Automático: 1 por diária de set, ou 1 se houver hospedagem',
        }
      : {
          id: 'viagens',
          label: 'Viagens',
          kind: 'orcamento',
          value: formatNumber(result.trips),
          source: 'Etapa Logística · viagens manuais',
          editHref: step('logistica'),
        },

    {
      id: 'tarifa',
      label: l.farePerPerson ? 'Valor/pessoa/viagem' : 'Valor por viagem',
      kind: 'orcamento',
      value: formatMoney(l.fareCents),
      source: 'Etapa Logística · transporte por valor fixo',
      editHref: step('logistica'),
    },
    {
      id: 'transporte',
      label: 'Transporte',
      kind: 'calculado',
      value: formatMoney(result.logistics.fareCents),
      source: 'Fórmula 05 · valor fixo × viagens',
    },

    // Calculados
    {
      id: 'custoHora',
      label: 'Custo da hora',
      kind: 'calculado',
      value: formatMoney(result.hourlyCostCents),
      source: 'Fórmula 01',
    },
    {
      id: 'maoDeObra',
      label: 'Seu trabalho',
      kind: 'calculado',
      value: formatMoney(result.laborCents),
      source: 'Fórmula 02',
    },
    {
      id: 'diariasSet',
      label: 'Diárias de set',
      kind: 'calculado',
      value: formatNumber(result.captureDays),
      source: 'Fórmula 02 · horas de gravação ÷ horas/dia',
    },
    {
      id: 'equipe',
      label: 'Equipe',
      kind: 'calculado',
      value: formatMoney(result.teamCents),
      source: 'Fórmula 03',
    },
    {
      id: 'equipamentos',
      label: 'Equipamentos',
      kind: 'calculado',
      value: formatMoney(result.equipmentCents),
      source: 'Fórmula 04',
    },
    {
      id: 'pessoasSet',
      label: 'Pessoas no set',
      kind: 'calculado',
      value: formatNumber(result.peopleOnSet),
      source: 'Fórmula 05 · você + equipe no set',
    },
    {
      id: 'combustivel',
      label: 'Combustível',
      kind: 'calculado',
      value: formatMoney(result.logistics.fuelCents),
      source: 'Fórmula 05',
    },
    {
      id: 'pedagios',
      label: 'Pedágios',
      kind: 'calculado',
      value: formatMoney(result.logistics.tollsCents),
      source: 'Fórmula 05',
    },
    {
      id: 'alimentacao',
      label: 'Alimentação',
      kind: 'calculado',
      value: formatMoney(result.logistics.mealsCents),
      source: 'Fórmula 05',
    },
    {
      id: 'hospedagem',
      label: 'Hospedagem',
      kind: 'calculado',
      value: formatMoney(result.logistics.lodgingCents),
      source: 'Fórmula 05',
    },
    {
      id: 'logistica',
      label: 'Logística',
      kind: 'calculado',
      value: formatMoney(result.logistics.totalCents),
      source: 'Fórmula 05',
    },
    {
      id: 'custoDireto',
      label: 'Custo direto',
      kind: 'calculado',
      value: formatMoney(result.directCostCents),
      source: 'Fórmula 06',
    },
    { id: 'markup', label: 'Markup', kind: 'calculado', value: markupText, source: 'Fórmula 07' },
    {
      id: 'preco',
      label: 'Preço sugerido',
      kind: 'calculado',
      value: formatMoney(result.suggestedPriceCents),
      source: 'Fórmula 08',
    },
  ];
  // Só entram no catálogo as variáveis do modo de transporte escolhido.
  const hidden = ownVehicle
    ? ['tarifa', 'transporte']
    : ['distancia', 'kmPorLitro', 'precoLitro', 'pedagio', 'combustivel', 'pedagios'];
  const vars = Object.fromEntries(list.filter((x) => !hidden.includes(x.id)).map((x) => [x.id, x]));

  const formulas: Formula[] = [
    {
      id: 'hora',
      title: 'Custo da sua hora',
      why: 'Tudo o que o estúdio custa por mês, dividido pelas horas em que você realmente produz. É o piso de qualquer orçamento.',
      resultId: 'custoHora',
      tokens: [
        op('('),
        v('custosFixos'),
        op('+'),
        v('proLabore'),
        op(')'),
        op('÷'),
        op('('),
        v('diasMes'),
        op('×'),
        v('horasDia'),
        op(')'),
      ],
      details: profile.fixedCosts.map((c) => ({
        label: c.label || 'Custo sem nome',
        tokens: [val('Mensal', formatMoney(c.monthlyCents), 'estudio')],
        result: formatMoney(c.monthlyCents),
      })),
    },
    {
      id: 'trabalho',
      title: 'Seu trabalho no projeto',
      why: 'As horas de cada etapa vêm dos serviços marcados. As diárias são horas ÷ horas por dia, sempre arredondadas para cima.',
      resultId: 'maoDeObra',
      tokens: [
        v('custoHora'),
        op('×'),
        op('('),
        v('horas-pre'),
        op('+'),
        v('horas-producao'),
        op('+'),
        v('horas-pos'),
        op(')'),
      ],
      details: (['pre', 'producao', 'pos'] as const).map((stage) => ({
        label: `Diárias · ${STAGE_META[stage].label}`,
        tokens: [op('⌈'), v(`horas-${stage}`), op('÷'), v('horasDia'), op('⌉')],
        result: days(result.stages[stage].days),
      })),
    },
    {
      id: 'equipe',
      title: 'Equipe contratada',
      why: 'Cada profissional entra pela diária ou pelas horas que assume, na etapa em que trabalha. Sem dias ou horas próprios, segue os da etapa.',
      resultId: 'equipe',
      tokens: [
        op('Σ'),
        op('('),
        val('Diária ou hora', 'cada um'),
        op('×'),
        val('Pessoas', 'cada um'),
        op('×'),
        val('Diárias ou horas', 'da etapa'),
        op(')'),
      ],
      details: draft.team.map((m) => {
        const stage = result.stages[m.stage];
        const people = val('Pessoas', formatNumber(m.count));
        const cost = formatMoney(teamMemberCost(m, stage));
        if (m.billing === 'hora') {
          const h = m.hours ?? stage.hours;
          return {
            label: m.role,
            tokens: [
              val('Valor da hora', formatMoney(m.hourlyRateCents)),
              op('×'),
              people,
              op('×'),
              val('Horas', formatHours(h), m.hours === null ? 'calculado' : 'orcamento'),
            ],
            result: cost,
          };
        }
        const d = m.days ?? stage.days;
        return {
          label: m.role,
          tokens: [
            val('Diária', formatMoney(m.dailyRateCents)),
            op('×'),
            people,
            op('×'),
            val('Diárias', formatNumber(d), m.days === null ? 'calculado' : 'orcamento'),
          ],
          result: cost,
        };
      }),
    },
    {
      id: 'equipamentos',
      title: 'Equipamentos',
      why: 'Kit próprio entra pela depreciação (quanto ele perde de valor por dia de uso). Alugado entra pela diária.',
      resultId: 'equipamentos',
      tokens: [
        op('Σ'),
        op('('),
        val('Custo diário', 'cada item', 'calculado'),
        op('×'),
        val('Diárias', 'da etapa', 'calculado'),
        op(')'),
      ],
      details: draft.equipment.map((e) => {
        const d = e.days ?? result.stages[e.stage].days;
        const cents = result.equipmentItems.find((i) => i.id === e.id)?.cents ?? 0;
        const dTok = val('Diárias', formatNumber(d), e.days === null ? 'calculado' : 'orcamento');
        return {
          label: `${e.name} · ${e.kind === 'owned' ? 'próprio' : 'alugado'}`,
          tokens:
            e.kind === 'owned'
              ? [
                  op('('),
                  val('Compra', formatMoney(e.purchaseCents), 'estudio'),
                  op('−'),
                  val('Revenda', formatMoney(e.resaleCents), 'estudio'),
                  op(')'),
                  op('÷'),
                  val('Vida útil', `${formatNumber(e.lifespanYears)} anos`, 'estudio'),
                  op('÷'),
                  v('diasKit'),
                  op('×'),
                  dTok,
                ]
              : [val('Aluguel/dia', formatMoney(e.dailyRentCents)), op('×'), dTok],
          result: formatMoney(cents),
        };
      }),
    },
    {
      id: 'logistica',
      title: 'Logística',
      why: 'Custos variáveis de chegar e ficar no set. Toda a logística é custeada na etapa de gravação.',
      resultId: 'logistica',
      tokens: [
        ...(ownVehicle ? [v('combustivel'), op('+'), v('pedagios')] : [v('transporte')]),
        op('+'),
        v('alimentacao'),
        op('+'),
        v('hospedagem'),
        op('+'),
        v('outros'),
      ],
      details: [
        ...(ownVehicle
          ? [
              {
                label: 'Combustível',
                tokens: [
                  v('distancia'),
                  op('×'),
                  v('idaVolta'),
                  op('×'),
                  v('viagens'),
                  op('÷'),
                  v('kmPorLitro'),
                  op('×'),
                  v('precoLitro'),
                ],
                result: formatMoney(result.logistics.fuelCents),
              },
              {
                label: 'Pedágios',
                tokens: [v('pedagio'), op('×'), v('viagens')],
                result: formatMoney(result.logistics.tollsCents),
              },
            ]
          : [
              {
                label: 'Transporte (valor fixo)',
                tokens: [
                  v('tarifa'),
                  op('×'),
                  v('viagens'),
                  ...(l.farePerPerson ? [op('×'), v('pessoasSet')] : []),
                ],
                result: formatMoney(result.logistics.fareCents),
              },
            ]),
        {
          label: 'Pessoas no set',
          tokens: [v('voce'), op('+'), v('equipeSet')],
          result: pluralize(result.peopleOnSet, 'pessoa', 'pessoas'),
        },
        {
          label: 'Alimentação',
          tokens: [v('refeicao'), op('×'), v('pessoasSet'), op('×'), v('diariasSet')],
          result: formatMoney(result.logistics.mealsCents),
        },
        {
          label: 'Hospedagem',
          tokens: [v('valorNoite'), op('×'), v('noites'), op('×'), v('pessoasSet')],
          result: formatMoney(result.logistics.lodgingCents),
        },
      ],
    },
    {
      id: 'custo',
      title: 'Custo direto',
      why: 'O custo unitário do serviço: o que você gasta para entregar este projeto, antes de impostos e lucro.',
      resultId: 'custoDireto',
      tokens: [
        v('maoDeObra'),
        op('+'),
        v('equipe'),
        op('+'),
        v('equipamentos'),
        op('+'),
        v('logistica'),
      ],
      details: [],
    },
    {
      id: 'markup',
      title: 'Markup',
      why: 'Impostos, taxas, comissão e lucro são percentuais do preço de venda — não do custo. O markup divisor embute todos de uma vez.',
      resultId: 'markup',
      tokens: [
        v('cem'),
        op('÷'),
        op('['),
        v('cem'),
        op('−'),
        op('('),
        v('imposto'),
        op('+'),
        v('taxa'),
        op('+'),
        v('comissao'),
        op('+'),
        v('df'),
        op('+'),
        v('lucro'),
        op(')'),
        op(']'),
      ],
      details: [
        {
          label: 'Soma dos percentuais (precisa ficar abaixo de 100%)',
          tokens: [v('imposto'), op('+'), v('taxa'), op('+'), v('comissao'), op('+'), v('lucro')],
          result: pct(variablePct + p.profitPct),
        },
      ],
    },
    {
      id: 'preco',
      title: 'Preço sugerido',
      why: 'Custo direto × markup, arredondado para cima. A diferença do arredondamento vira lucro — nunca é perdida.',
      resultId: 'preco',
      tokens: [
        op('⌈'),
        v('custoDireto'),
        op('×'),
        v('markup'),
        op('⌉'),
        op('→'),
        v('arredondamento'),
      ],
      details: [
        {
          label: 'Antes do arredondamento',
          tokens: [v('custoDireto'), op('×'), v('markup')],
          result: formatMoney(rawPriceCents),
        },
        {
          label: 'Preço mínimo (lucro zero)',
          tokens: [
            v('custoDireto'),
            op('×'),
            v('cem'),
            op('÷'),
            op('('),
            v('cem'),
            op('−'),
            val('Imposto + taxa + comissão', pct(variablePct), 'calculado'),
            op(')'),
          ],
          result: formatMoney(result.minimumPriceCents),
        },
        {
          label: 'Lucro (o que sobra)',
          tokens: [
            v('preco'),
            op('−'),
            v('custoDireto'),
            op('−'),
            val(
              'Impostos, taxas e comissão',
              formatMoney(result.taxesCents + result.feesCents + result.commissionCents),
              'calculado',
            ),
          ],
          result: formatMoney(result.profitCents),
        },
      ],
    },
  ];

  return { vars, formulas };
}
