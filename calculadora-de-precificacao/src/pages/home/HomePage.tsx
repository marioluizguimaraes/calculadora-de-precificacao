import { Button } from '@heroui/react';
import { ArrowRight, FileText } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';

import {
  calculatePricing,
  createDefaultProfile,
  createEmptyDraft,
  hasDraftContent,
  useDraftStore,
} from '@/features/pricing';
import { quoteTitle, useSavedQuotes } from '@/features/quote';
import { applyPreset, PROJECT_PRESETS } from '@/features/services';
import { Glow, NumberedPoint, Pill, TwoToneHeading } from '@/shared/components/brand/Decor';
import { FloatingPills, type FloatingPillSpec } from '@/shared/components/motion/FloatingPills';
import { Reveal } from '@/shared/components/motion/Reveal';
import { formatDateShort, formatMoney } from '@/shared/lib/format';

import { HeroShowcase } from './HeroShowcase';

const METHOD = [
  {
    title: 'O custo da sua hora',
    formula: '(custos fixos + pró-labore) ÷ horas produtivas',
    text: 'Antes de qualquer projeto, o quanto custa manter o estúdio aberto.',
  },
  {
    title: 'O custo do projeto',
    formula: 'horas × custo/hora + equipe + kit + logística',
    text: 'Cada etapa, cada diária de set, cada quilômetro até a locação.',
  },
  {
    title: 'O markup',
    formula: '100 ÷ [100 − (impostos + taxas + lucro)]',
    text: 'Impostos e lucro calculados sobre o preço de venda, não sobre o custo.',
  },
  {
    title: 'A proposta',
    formula: 'escopo · investimento por etapa · condições',
    text: 'Um PDF pronto para enviar, com a sua marca.',
  },
];

/** Orçamento de exemplo que alimenta a demonstração do hero. */
function useDemo() {
  return useMemo(() => {
    const profile = {
      ...createDefaultProfile(),
      baseCity: { id: 3550308, name: 'São Paulo', uf: 'SP' },
    };
    const preset = PROJECT_PRESETS.find((p) => p.id === 'institucional') ?? PROJECT_PRESETS[0];
    let draft = createEmptyDraft(profile);
    if (preset) draft = applyPreset(draft, preset);
    draft = {
      ...draft,
      location: { ...draft.location, distanceKm: 94, distanceSource: 'rota' },
      equipment: [
        {
          id: 'demo-cam',
          name: 'Câmera',
          category: 'camera',
          stage: 'producao',
          kind: 'owned',
          kitId: null,
          purchaseCents: 1_800_000,
          resaleCents: 630_000,
          lifespanYears: 4,
          dailyRentCents: 0,
          days: null,
        },
      ],
    };
    return { draft, result: calculatePricing(draft, profile) };
  }, []);
}

const PILLS: FloatingPillSpec[] = [
  { text: 'Custo da hora', tone: 'amber', tilt: -10, className: 'left-[5%] top-[4%]', depth: 1.3 },
  { text: 'Depreciação', tone: 'cream', tilt: 12, className: 'left-[15%] top-[24%]', depth: 0.8 },
  { text: 'Diária de set', tone: 'accent', tilt: 3, className: 'left-[12%] top-[86%]', depth: 1.5 },
  { text: 'Pró-labore', tone: 'cream', tilt: -4, className: 'left-[4%] top-[66%]', depth: 0.9 },
  { text: 'Markup', tone: 'accent', tilt: 4, className: 'left-[3%] top-[42%]', depth: 1.1 },
  {
    text: 'Impostos e taxas',
    tone: 'cream',
    tilt: 5,
    className: 'right-[4%] top-[8%]',
    depth: 1.2,
  },
  {
    text: 'Lucro na referência',
    tone: 'accent',
    tilt: -5,
    className: 'right-[2%] top-[30%]',
    depth: 0.7,
  },
  { text: 'Deslocamento', tone: 'cream', tilt: 4, className: 'right-[5%] top-[52%]', depth: 1.4 },
  { text: 'Preço mínimo', tone: 'amber', tilt: -6, className: 'right-[16%] top-[72%]', depth: 1 },
  {
    text: 'Arredondar para cima',
    tone: 'accent',
    tilt: 3,
    className: 'right-[10%] top-[90%]',
    depth: 1.2,
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const draft = useDraftStore((s) => s.draft);
  const { quotes } = useSavedQuotes();
  const demo = useDemo();
  const hasDraft = hasDraftContent(draft);

  return (
    <div className="relative overflow-x-clip">
      {/* Hero: texto à esquerda, vitrine interativa ao lado */}
      <section className="relative mx-auto grid max-w-[90rem] gap-12 px-4 pt-8 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10 lg:pt-12">
        <Glow className="-top-32 right-0 size-[40rem] opacity-70" />
        <div className="relative flex flex-col gap-8">
          <Reveal>
            <TwoToneHeading
              soft="Quanto vale o seu próximo vídeo —"
              strong="resposta numa tela só"
              className="relative text-[clamp(2.2rem,4.2vw,3.6rem)]"
            />
          </Reveal>
          <div className="relative flex flex-col gap-6">
            <Reveal delay={0.06}>
              <NumberedPoint index={1} title="Custo antes do preço">
                Seus custos do mês e sua jornada viram o custo da sua hora.
              </NumberedPoint>
            </Reveal>
            <Reveal delay={0.12}>
              <NumberedPoint index={2} title="Projeto etapa por etapa">
                Local, serviços, horas, kit, equipe e logística — o preço muda ao vivo.
              </NumberedPoint>
            </Reveal>
            <Reveal delay={0.18}>
              <NumberedPoint index={3} title="Um preço que se explica">
                Markup, impostos e lucro às claras, com proposta em PDF.
              </NumberedPoint>
            </Reveal>
          </div>
          <Reveal delay={0.24} className="relative flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full px-6 shadow-[0_14px_28px_-14px_rgb(236_106_31/0.9)]"
                onPress={() => {
                  void navigate('/orcamento');
                }}
              >
                {hasDraft ? 'Continuar orçamento' : 'Começar orçamento'}
                <ArrowRight className="size-4" />
              </Button>
              {quotes.length > 0 && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full bg-surface px-6"
                  onPress={() => {
                    void navigate('/orcamentos');
                  }}
                >
                  Ver orçamentos salvos
                </Button>
              )}
            </div>
            {hasDraft && (
              <p className="text-sm text-muted">
                Rascunho em andamento: <span className="text-foreground">{quoteTitle(draft)}</span>
              </p>
            )}
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative">
          <HeroShowcase
            draft={demo.draft}
            result={demo.result}
            onExplain={() => {
              void navigate('/calculo');
            }}
          />
        </Reveal>
      </section>

      {/* Pílulas flutuantes: reagem ao cursor, à rolagem e podem ser arrastadas */}
      <FloatingPills pills={PILLS} className="px-4 py-28 sm:px-6 sm:py-36">
        <Glow className="top-1/2 left-1/2 -z-10 size-[46rem] -translate-x-1/2 -translate-y-1/2" />
        <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2
            id="diagnostico"
            className="font-display text-[clamp(2.6rem,6.5vw,5.25rem)] text-balance text-foreground"
          >
            Não é um chute. <span className="text-accent">É um preço que se explica.</span>
          </h2>
          <p className="max-w-xl text-lg text-muted">
            Por trás de cada real há uma regra: o sistema mostra o caminho do custo da hora até o
            valor da proposta.
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:hidden">
            {PILLS.map((p) => (
              <Pill key={p.text} tone={p.tone} className="text-sm">
                {p.text}
              </Pill>
            ))}
          </div>
        </Reveal>
      </FloatingPills>

      {/* Método */}
      <section aria-labelledby="metodo" className="relative">
        <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <TwoToneHeading
              as="h2"
              id="metodo"
              soft="Do custo ao preço,"
              strong="em quatro passos"
              className="max-w-xl text-4xl sm:text-5xl"
            />
            <p className="max-w-md text-sm text-muted">
              Método baseado no{' '}
              <a
                className="text-foreground underline underline-offset-2"
                href="https://www.sebraeplay.com.br/content/precificacao-de-servicos-7-etapas-para-chegar-ao-preco-ideal"
                target="_blank"
                rel="noreferrer"
              >
                Sebrae
              </a>{' '}
              e em referências do mercado audiovisual (
              <a
                className="text-foreground underline underline-offset-2"
                href="https://forasteiroproducoes.com/blog/videomaker-quanto-cobrar-producao-video/"
                target="_blank"
                rel="noreferrer"
              >
                Forasteiro
              </a>
              ,{' '}
              <a
                className="text-foreground underline underline-offset-2"
                href="https://www.impulsofilmes.com.br/como-funciona-a-tabela-de-precos-de-uma-produtora-de-video/"
                target="_blank"
                rel="noreferrer"
              >
                Impulso Filmes
              </a>
              ).
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METHOD.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.08}>
                <li
                  className={
                    i === 2
                      ? 'card-hero flex h-full flex-col gap-4 p-6 transition-transform hover:-translate-y-1.5'
                      : 'flex h-full flex-col gap-4 card-soft p-6 transition-transform hover:-translate-y-1.5'
                  }
                >
                  <span
                    className={`font-display text-4xl tabular ${i === 2 ? 'text-on-hero-soft' : 'text-accent'}`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className={`text-lg font-semibold ${i === 2 ? 'text-white' : 'text-foreground'}`}
                  >
                    {m.title}
                  </h3>
                  <p
                    className={`rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed ${i === 2 ? 'bg-white/15 text-white' : 'bg-surface-secondary text-muted'}`}
                  >
                    {m.formula}
                  </p>
                  <p className={`mt-auto text-sm ${i === 2 ? 'text-white/85' : 'text-muted'}`}>
                    {m.text}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {quotes.length > 0 && (
        <section aria-labelledby="recentes" className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6">
          <h2 id="recentes" className="mb-4 text-lg font-semibold text-foreground">
            Últimos orçamentos
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {quotes.slice(0, 3).map((q) => (
              <li key={q.id}>
                <Link
                  to={`/orcamentos/${q.id}`}
                  className="flex flex-col gap-3 card-soft p-5 transition-all outline-none hover:-translate-y-0.5 hover:border-accent/40 focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <span className="flex items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-full bg-accent/12 text-accent">
                      <FileText className="size-4" aria-hidden />
                    </span>
                    <span className="text-xs text-muted">{formatDateShort(q.savedAt)}</span>
                  </span>
                  <span className="font-semibold text-foreground">{quoteTitle(q.draft)}</span>
                  <span className="font-display text-3xl text-foreground tabular">
                    {formatMoney(q.priceCents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
