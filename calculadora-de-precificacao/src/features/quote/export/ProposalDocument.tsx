import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import {
  COST_GROUP_META,
  STAGE_META,
  STAGES,
  type BusinessProfile,
  type CostGroup,
  type PricingResult,
  type QuoteDraft,
  type Stage,
} from '@/features/pricing';
import {
  formatDate,
  formatHours,
  formatMoney,
  formatPercent,
  pluralize,
} from '@/shared/lib/format';

import { addDays, clientLabel, describeLocation, quoteTitle } from '../utils/describe';

/** Paleta clara para papel — mesmos matizes do app, passos do tema claro. */
const C = {
  ink: '#16181d',
  muted: '#5d636e',
  rule: '#d9dce2',
  paper: '#ffffff',
  soft: '#f3f4f6',
  accent: '#a45e00',
  stage: { pre: '#2a78d6', producao: '#eda100', pos: '#1baf7a' } satisfies Record<Stage, string>,
  cost: {
    trabalho: '#eda100',
    equipe: '#2a78d6',
    equipamentos: '#eb6834',
    logistica: '#1baf7a',
    impostos: '#4a3aa7',
    lucro: '#e87ba4',
  } satisfies Record<CostGroup, string>,
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.paper,
    color: C.ink,
    fontFamily: 'Helvetica',
    fontSize: 10,
    // Sem lineHeight aqui: herdado pelo rodapé absoluto, ele o empurra para fora da página.
    paddingTop: 44,
    paddingBottom: 64,
    paddingHorizontal: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 40, height: 40, objectFit: 'contain' },
  monogram: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: C.ink,
    color: C.paper,
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 11,
  },
  studio: { fontFamily: 'Helvetica-Bold', fontSize: 12 },
  small: { fontSize: 8.5, color: C.muted },
  eyebrow: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    letterSpacing: 1.6,
    color: C.accent,
    textTransform: 'uppercase',
  },
  hero: { marginTop: 24, marginBottom: 12 },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 26, lineHeight: 1.1, marginTop: 8 },
  metaRow: { flexDirection: 'row', gap: 28, marginTop: 16 },
  metaLabel: { fontSize: 7.5, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 },
  metaValue: { fontSize: 10, marginTop: 2 },
  section: { marginTop: 18 },
  h2: { fontFamily: 'Helvetica-Bold', fontSize: 12, marginBottom: 8 },
  paragraph: { color: C.ink, lineHeight: 1.45 },
  stageBlock: { flexDirection: 'row', marginBottom: 10 },
  stageBar: { width: 3, borderRadius: 2, marginRight: 10 },
  stageTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  stageHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    fontSize: 9,
  },
  serviceHours: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginLeft: 12 },
  hoursTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.ink,
  },
  table: { borderTopWidth: 1, borderTopColor: C.rule },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    padding: 16,
    backgroundColor: C.ink,
    borderRadius: 8,
  },
  totalLabel: { color: '#c9c6bf', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.2 },
  totalValue: { color: C.paper, fontFamily: 'Helvetica-Bold', fontSize: 22 },
  twoCols: { flexDirection: 'row', gap: 24 },
  col: { flex: 1 },
  bullet: { fontSize: 9, marginBottom: 3, lineHeight: 1.45 },
  footer: {
    position: 'absolute',
    left: 48,
    right: 48,
    bottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: C.muted,
    borderTopWidth: 1,
    borderTopColor: C.rule,
    paddingTop: 8,
  },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 10,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  swatch: { width: 8, height: 8, borderRadius: 2 },
  mono: { fontFamily: 'Courier', fontSize: 8.5, color: C.muted },
});

export interface ProposalOptions {
  includeBreakdown: boolean;
  notes: string;
}

interface ProposalDocumentProps {
  draft: QuoteDraft;
  identity: BusinessProfile;
  result: PricingResult;
  options: ProposalOptions;
  issuedAt?: Date;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'V'
  );
}

function ProposalFooter({ studio, document }: { studio: string; document: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>
        {studio}
        {document ? `  ·  ${document}` : ''}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
    </View>
  );
}

export function ProposalDocument({
  draft,
  identity,
  result,
  options,
  issuedAt = new Date(),
}: ProposalDocumentProps) {
  const studio = identity.businessName || identity.ownerName || 'Produção audiovisual';
  const contact = [identity.email, identity.phone, identity.website].filter(Boolean).join('  ·  ');
  const validUntil = addDays(issuedAt, identity.proposalValidityDays);
  const stagesWithWork = STAGES.filter((st) => result.stages[st].costCents > 0);
  const composition = (Object.keys(COST_GROUP_META) as CostGroup[]).filter(
    (g) => result.composition[g] > 0,
  );

  return (
    <Document title={`Proposta — ${quoteTitle(draft)}`} author={studio} language="pt-BR">
      <Page size="A4" style={s.page}>
        <ProposalFooter studio={studio} document={identity.document} />
        <View style={s.header}>
          <View style={s.brand}>
            {identity.logoDataUrl ? (
              <Image src={identity.logoDataUrl} style={s.logo} />
            ) : (
              <Text style={s.monogram}>{initials(studio)}</Text>
            )}
            <View>
              <Text style={s.studio}>{studio}</Text>
              {contact && <Text style={s.small}>{contact}</Text>}
            </View>
          </View>
          <Text style={s.small}>Emitida em {formatDate(issuedAt)}</Text>
        </View>

        <View style={s.hero}>
          <Text style={s.eyebrow}>Proposta de orçamento</Text>
          <Text style={s.title}>{quoteTitle(draft)}</Text>
          <View style={s.metaRow}>
            <View>
              <Text style={s.metaLabel}>Para</Text>
              <Text style={s.metaValue}>{clientLabel(draft)}</Text>
            </View>
            <View>
              <Text style={s.metaLabel}>Local</Text>
              <Text style={s.metaValue}>{describeLocation(draft.location)}</Text>
            </View>
            <View>
              <Text style={s.metaLabel}>Válida até</Text>
              <Text style={s.metaValue}>{formatDate(validUntil)}</Text>
            </View>
          </View>
        </View>

        {draft.project.deliverables ? (
          <View style={s.section}>
            <Text style={s.h2}>O que você recebe</Text>
            <Text style={s.paragraph}>{draft.project.deliverables}</Text>
          </View>
        ) : null}

        <View style={s.section}>
          <Text style={s.h2}>Como o trabalho acontece</Text>
          <Text style={[s.small, { marginBottom: 10 }]}>
            Cada serviço do projeto e as horas de trabalho dedicadas a ele.
          </Text>
          {STAGES.map((stage) => {
            const items = draft.services.filter((x) => x.stage === stage);
            if (items.length === 0) return null;
            const summary = result.stages[stage];
            return (
              <View key={stage} style={s.stageBlock} wrap={false}>
                <View style={[s.stageBar, { backgroundColor: C.stage[stage] }]} />
                <View style={{ flex: 1 }}>
                  <View style={s.stageHead}>
                    <Text style={s.stageTitle}>{STAGE_META[stage].label}</Text>
                    <Text style={s.stageTitle}>{formatHours(summary.hours)}</Text>
                  </View>
                  <View style={{ marginTop: 4 }}>
                    {items.map((item) => (
                      <View key={item.serviceId} style={s.serviceRow}>
                        <Text style={{ flex: 1, color: C.muted }}>{item.label}</Text>
                        <Text style={s.serviceHours}>{formatHours(Math.max(0, item.hours))}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
          {result.totalHours > 0 && (
            <View style={s.hoursTotal} wrap={false}>
              <Text style={s.stageTitle}>Total de horas de trabalho</Text>
              <Text style={s.stageTitle}>{formatHours(result.totalHours)}</Text>
            </View>
          )}
        </View>

        {(draft.team.length > 0 || draft.equipment.length > 0) && (
          <View style={[s.section, s.twoCols]} wrap={false}>
            {draft.team.length > 0 && (
              <View style={s.col}>
                <Text style={s.h2}>Equipe</Text>
                {draft.team.map((m) => (
                  <Text key={m.id} style={s.bullet}>
                    • {m.count > 1 ? `${m.count}× ` : ''}
                    {m.role}
                  </Text>
                ))}
              </View>
            )}
            {draft.equipment.length > 0 && (
              <View style={s.col}>
                <Text style={s.h2}>Estrutura técnica</Text>
                {draft.equipment.map((e) => (
                  <Text key={e.id} style={s.bullet}>
                    • {e.name}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={s.section} wrap={false}>
          <Text style={s.h2}>Investimento</Text>
          <View style={s.table}>
            {stagesWithWork.map((stage) => (
              <View key={stage} style={s.row}>
                <Text>{STAGE_META[stage].label}</Text>
                <Text>{formatMoney(result.stages[stage].priceCents)}</Text>
              </View>
            ))}
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total do projeto</Text>
            <Text style={s.totalValue}>{formatMoney(result.suggestedPriceCents)}</Text>
          </View>
        </View>

        <View style={s.section} wrap={false}>
          <Text style={s.h2}>Condições</Text>
          <Text style={s.bullet}>• Pagamento: {identity.paymentTerms}</Text>
          <Text style={s.bullet}>
            • Proposta válida por {pluralize(identity.proposalValidityDays, 'dia', 'dias')}, até{' '}
            {formatDate(validUntil)}.
          </Text>
          {result.logistics.totalCents > 0 && (
            <Text style={s.bullet}>
              • Deslocamento, alimentação e demais custos de produção já estão incluídos no valor.
            </Text>
          )}
          {options.notes ? <Text style={s.bullet}>• {options.notes}</Text> : null}
        </View>
      </Page>

      {options.includeBreakdown && (
        <Page size="A4" style={s.page}>
          <ProposalFooter studio={studio} document={identity.document} />
          <Text style={s.eyebrow}>Anexo</Text>
          <Text style={[s.title, { fontSize: 20 }]}>Memória de cálculo</Text>
          <Text style={[s.small, { marginTop: 6 }]}>
            Como o valor foi composto, seguindo o método de precificação por custo + markup.
          </Text>

          <View style={s.bar}>
            {composition.map((g) => (
              <View
                key={g}
                style={{
                  flexGrow: result.composition[g],
                  flexBasis: 0,
                  backgroundColor: C.cost[g],
                  marginRight: 1.5,
                }}
              />
            ))}
          </View>
          {composition.map((g) => (
            <View key={g} style={s.legendRow}>
              <View style={[s.swatch, { backgroundColor: C.cost[g] }]} />
              <Text style={{ flex: 1 }}>{COST_GROUP_META[g].label}</Text>
              <Text style={s.small}>
                {formatPercent(result.composition[g] / Math.max(1, result.suggestedPriceCents))}
              </Text>
              <Text style={{ width: 90, textAlign: 'right' }}>
                {formatMoney(result.composition[g])}
              </Text>
            </View>
          ))}

          <View style={s.section}>
            <Text style={s.h2}>Parâmetros</Text>
            <View style={s.table}>
              {[
                ['Custo da hora de trabalho', formatMoney(result.hourlyCostCents)],
                ['Horas de trabalho', formatHours(result.totalHours)],
                ['Custo direto total', formatMoney(result.directCostCents)],
                [
                  'Impostos, taxas e comissão',
                  formatPercent(
                    (draft.pricing.taxRatePct +
                      draft.pricing.paymentFeePct +
                      draft.pricing.commissionPct) /
                      100,
                  ),
                ],
                ['Margem de lucro', formatPercent(draft.pricing.profitPct / 100)],
                ['Markup aplicado', result.markup.toFixed(3).replace('.', ',')],
              ].map(([label, value]) => (
                <View key={label} style={s.row}>
                  <Text>{label}</Text>
                  <Text>{value}</Text>
                </View>
              ))}
            </View>
            <Text style={[s.mono, { marginTop: 10 }]}>
              preço = custo direto × 100 ÷ [100 - (despesas variáveis % + lucro %)]
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
