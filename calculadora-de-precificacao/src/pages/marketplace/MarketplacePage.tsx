import { Button, Spinner } from '@heroui/react';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useDeferredValue } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useAuthGate } from '@/features/auth';
import {
  ListingCard,
  ListingFilterBar,
  ListingSearchBar,
  QuickSearches,
  useListings,
  type ListingSearch,
  type ListingSort,
} from '@/features/marketplace';
import { Coin, Glow, TwoToneHeading } from '@/shared/components/brand/Decor';
import { EmptyScene } from '@/shared/components/layout/EmptyScene';
import { Reveal } from '@/shared/components/motion/Reveal';
import CountUp from '@/shared/components/react-bits/CountUp';
import { pluralize } from '@/shared/lib/format';

const SORTS: ListingSort[] = ['recentes', 'menor-preco', 'maior-preco'];
const EVERYTHING: ListingSearch = { q: '', tier: null, uf: null, sort: 'recentes' };
const EASE = [0.22, 1, 0.36, 1] as const;

/** Os filtros vivem na URL: a busca pode ser compartilhada e sobrevive ao voltar. */
function readSearch(params: URLSearchParams): ListingSearch {
  const tier = Number(params.get('tipo'));
  const sort = params.get('ordem') as ListingSort | null;
  return {
    q: params.get('q') ?? '',
    tier: tier === 1 || tier === 2 || tier === 3 ? tier : null,
    uf: params.get('uf'),
    sort: sort && SORTS.includes(sort) ? sort : 'recentes',
  };
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <CountUp
        to={value}
        duration={1.2}
        className="font-display text-4xl text-foreground tabular"
      />
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export function MarketplacePage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const gate = useAuthGate();
  const reduce = useReducedMotion();
  const search = readSearch(params);
  const q = useDeferredValue(search.q);
  const { data: listings = [], isLoading, isFetching } = useListings({ ...search, q });
  // Todas as ofertas ativas (mesma consulta em cache) — alimenta os números do topo.
  const { data: everything = [] } = useListings(EVERYTHING);

  const studios = new Set(everything.map((l) => l.owner.id)).size;
  const cities = new Set(everything.flatMap((l) => (l.owner.city ? [l.owner.city.name] : []))).size;

  const update = (patch: Partial<ListingSearch>) => {
    const next = { ...search, ...patch };
    const entries: [string, string][] = [];
    if (next.q) entries.push(['q', next.q]);
    if (next.tier) entries.push(['tipo', String(next.tier)]);
    if (next.uf) entries.push(['uf', next.uf]);
    if (next.sort !== 'recentes') entries.push(['ordem', next.sort]);
    setParams(new URLSearchParams(entries), { replace: true, preventScrollReset: true });
  };

  const offer = () => {
    if (gate('publicar', '/conta?aba=ofertas')) void navigate('/conta?aba=ofertas');
  };

  const hasFilters = search.q !== '' || search.tier !== null || search.uf !== null;

  return (
    <div className="relative overflow-x-clip">
      {/* Vitrine: manchete, busca e números */}
      <section className="relative mx-auto grid max-w-[90rem] gap-10 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:pt-14">
        <Glow className="-top-40 -left-20 size-[36rem] opacity-60" />
        <div className="relative flex flex-col gap-7">
          <Reveal>
            <p className="flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground">
              <span className="rec-dot" aria-hidden />
              Marketplace ·{' '}
              <span className="text-muted">
                {pluralize(everything.length, 'oferta ativa', 'ofertas ativas')}
              </span>
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <TwoToneHeading
              soft="Quem filma, edita e produz —"
              strong="com preço que se explica."
              accent
              className="text-[clamp(2.4rem,5vw,4.4rem)]"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-2xl text-lg text-pretty text-muted">
              Ofertas publicadas por quem precifica na calculadora: horas, etapas e entregas às
              claras. Encontrou? Converse direto no chat da oferta.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="flex flex-col gap-4">
            <ListingSearchBar value={search} onChange={update} />
            <QuickSearches value={search} onChange={update} />
          </Reveal>
        </div>

        <Reveal delay={0.2} className="relative flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4 card-soft p-6">
            <Stat value={everything.length} label="ofertas" />
            <Stat value={studios} label="estúdios" />
            <Stat value={cities} label="cidades" />
          </div>
          <div className="card-hero flex flex-col gap-4 p-6">
            <Coin className="absolute -right-8 -bottom-10 w-36 opacity-80" withCheck={false} />
            <p className="relative text-sm font-medium">
              Você também <span className="text-on-hero-soft">filma?</span>
            </p>
            <p className="relative max-w-[16rem] font-display text-3xl leading-tight">
              Seu orçamento vira vitrine em um clique.
            </p>
            <Button
              className="relative self-start rounded-full bg-white px-5 text-accent shadow-[0_10px_20px_-10px_rgb(80_30_0/0.6)]"
              onPress={offer}
            >
              Oferecer meu serviço <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>
      </section>

      {/* Resultados */}
      <section
        aria-labelledby="resultados"
        className="mx-auto flex max-w-[90rem] flex-col gap-6 px-4 pb-20 sm:px-6"
      >
        <div className="flex flex-col gap-4 border-t border-separator pt-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="resultados" className="text-lg font-semibold text-foreground">
              {hasFilters ? 'Resultados da busca' : 'Ofertas em destaque'}
            </h2>
            <span className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
              {isFetching && <Spinner size="sm" aria-label="Atualizando" />}
              {!isLoading &&
                pluralize(listings.length, 'serviço encontrado', 'serviços encontrados')}
            </span>
          </div>
          <ListingFilterBar value={search} onChange={update} />
        </div>

        {isLoading ? (
          <div className="grid min-h-60 place-items-center">
            <Spinner aria-label="Carregando ofertas" />
          </div>
        ) : listings.length === 0 ? (
          <EmptyScene
            compact
            kicker="00:00:00:00 · sem take"
            title="Nada por aqui"
            message={
              hasFilters
                ? 'Nenhuma oferta combina com essa busca. Tente outras palavras ou tire um filtro.'
                : 'Ainda não há ofertas publicadas. Que tal ser a primeira?'
            }
            action={
              hasFilters
                ? {
                    label: 'Limpar filtros',
                    onPress: () => {
                      setParams({}, { replace: true, preventScrollReset: true });
                    },
                  }
                : { label: 'Oferecer meu serviço', onPress: offer }
            }
          />
        ) : (
          <motion.ul layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {listings.map((listing, i) => (
                <motion.li
                  key={listing.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: Math.min(i, 6) * 0.04, ease: EASE }}
                >
                  <ListingCard listing={listing} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </section>
    </div>
  );
}
