import { Button } from '@heroui/react';
import { ArrowRight, History, MessagesSquare, MessageCircleMore, Plus, Store } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import {
  profileCompleteness,
  ProfileCardPreview,
  ProfileForm,
  profileSectionId,
  useAuth,
  UserAvatar,
  type ProfileDraft,
  type ProfileSection,
  type User,
} from '@/features/auth';
import { ListingCard, MyListings, useConversations, useMyListings } from '@/features/marketplace';
import { useSavedQuotes } from '@/features/quote';
import { Tilt } from '@/shared/components/motion/Tilt';
import { formatRelative } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { AccountStats } from './AccountStats';
import { CompletenessCard } from './CompletenessCard';
import { ProfileHero } from './ProfileHero';

const TABS = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'editar', label: 'Editar perfil' },
  { id: 'ofertas', label: 'Minhas ofertas' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function readTab(value: string | null): TabId {
  if (value === 'perfil') return 'editar';
  return TABS.find((t) => t.id === value)?.id ?? 'visao';
}

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {action && (
        <button
          type="button"
          onClick={action.onPress}
          className="group flex items-center gap-1 rounded-full text-sm font-medium text-accent outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {action.label}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}

function Overview({
  user,
  onTab,
  onFix,
}: {
  user: User;
  onTab: (tab: TabId) => void;
  onFix: (section: ProfileSection) => void;
}) {
  const navigate = useNavigate();
  const { data: listings = [] } = useMyListings();
  const { data: conversations = [] } = useConversations();
  const { pct, checks } = profileCompleteness(user);
  // Publicadas primeiro.
  const featured = [...listings]
    .sort((a, b) => Number(b.status === 'ativa') - Number(a.status === 'ativa'))
    .slice(0, 2);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-w-0 flex-col gap-8">
        <section className="flex flex-col gap-4">
          <SectionTitle
            title="Suas ofertas"
            action={
              listings.length > 0
                ? {
                    label: 'Ver todas',
                    onPress: () => {
                      onTab('ofertas');
                    },
                  }
                : undefined
            }
          />
          {featured.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {featured.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => {
                void navigate('/orcamentos');
              }}
              className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-border p-6 text-left transition-colors outline-none hover:border-accent/50 hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-focus"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-accent/12 text-accent transition-transform group-hover:rotate-90">
                <Plus className="size-5" aria-hidden />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-foreground">Publique seu primeiro serviço</span>
                <span className="text-sm text-muted">
                  Abra um orçamento salvo e toque em “Publicar como serviço”.
                </span>
              </span>
            </button>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle
            title="Conversas recentes"
            action={
              conversations.length > 0
                ? {
                    label: 'Abrir mensagens',
                    onPress: () => {
                      void navigate('/mensagens');
                    },
                  }
                : undefined
            }
          />
          {conversations.length > 0 ? (
            <ul className="flex flex-col divide-y divide-separator card-soft">
              {conversations.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/mensagens?conversa=${c.id}`}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors outline-none first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface-secondary focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <span className="relative">
                      <UserAvatar name={c.counterpart.name} />
                      {c.unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-accent" />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-sm text-foreground',
                            c.unread > 0 ? 'font-semibold' : 'font-medium',
                          )}
                        >
                          {c.counterpart.businessName || c.counterpart.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted">
                          {formatRelative(c.updatedAt)}
                        </span>
                      </span>
                      <span className="truncate text-xs text-accent">{c.listingTitle}</span>
                      <span className="truncate text-sm text-muted">
                        {c.lastMessage?.text ?? 'Sem mensagens'}
                      </span>
                    </span>
                    {c.unread > 0 && (
                      <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[10px] leading-5 font-semibold text-accent-foreground">
                        {c.unread}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-3 card-soft p-5 text-sm text-muted">
              <MessageCircleMore className="size-5 text-accent" aria-hidden />
              Quando alguém escrever sobre uma oferta sua, a conversa aparece aqui.
            </p>
          )}
        </section>
      </div>

      <aside className="flex flex-col gap-6">
        <CompletenessCard pct={pct} checks={checks} onFix={onFix} />
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted">Como você aparece no marketplace</h2>
          <Tilt max={5}>
            <ProfileCardPreview
              name={user.name}
              businessName={user.businessName}
              headline={user.headline}
              city={user.city}
              specialties={user.specialties}
            />
          </Tilt>
        </section>
      </aside>
    </div>
  );
}

function EditProfile({ user, onFix }: { user: User; onFix: (s: ProfileSection) => void }) {
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const live = draft ?? user;
  const { pct, checks } = profileCompleteness(live);
  const onChange = useCallback((next: ProfileDraft) => {
    setDraft(next);
  }, []);

  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <ProfileForm key={user.id} user={user} onChange={onChange} />
      <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted">
            <span className="rec-dot" aria-hidden /> Prévia ao vivo
          </h2>
          <Tilt max={5}>
            <ProfileCardPreview
              name={live.name}
              businessName={live.businessName}
              headline={live.headline}
              city={live.city}
              specialties={live.specialties}
            />
          </Tilt>
        </section>
        <CompletenessCard pct={pct} checks={checks} onFix={onFix} />
      </aside>
    </div>
  );
}

export function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const tab = readTab(params.get('aba'));
  const [pendingSection, setPendingSection] = useState<ProfileSection | null>(null);
  const { data: listings = [] } = useMyListings();
  const { data: conversations = [] } = useConversations();
  const { quotes } = useSavedQuotes();

  const goTab = (next: TabId) => {
    setParams(next === 'visao' ? {} : { aba: next }, { replace: true, preventScrollReset: true });
  };

  const fix = (section: ProfileSection) => {
    setPendingSection(section);
    goTab('editar');
  };

  // Depois da troca de aba, rola até a seção pedida e foca o primeiro campo dela.
  useEffect(() => {
    if (tab !== 'editar' || !pendingSection) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(profileSectionId(pendingSection));
      el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      el?.querySelector<HTMLElement>('input, textarea, [role="combobox"]')?.focus({
        preventScroll: true,
      });
      setPendingSection(null);
    }, 320);
    return () => {
      clearTimeout(timer);
    };
  }, [tab, pendingSection, reduce]);

  if (!user) return null;

  const unread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const active = listings.filter((l) => l.status === 'ativa').length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <ProfileHero
        user={user}
        onEdit={() => {
          goTab('editar');
        }}
        onListings={() => {
          goTab('ofertas');
        }}
      />

      <AccountStats
        stats={[
          {
            label: 'Ofertas',
            value: listings.length,
            hint: `${active} publicada${active === 1 ? '' : 's'}`,
            icon: Store,
            onPress: () => {
              goTab('ofertas');
            },
          },
          {
            label: 'Orçamentos salvos',
            value: quotes.length,
            hint: 'Na sua conta',
            icon: History,
            onPress: () => void navigate('/orcamentos'),
          },
          {
            label: 'Conversas',
            value: conversations.length,
            hint: 'Em todas as ofertas',
            icon: MessagesSquare,
            onPress: () => void navigate('/mensagens'),
          },
          {
            label: 'Não lidas',
            value: unread,
            hint: unread > 0 ? 'Tem gente esperando resposta' : 'Tudo em dia',
            icon: MessageCircleMore,
            highlight: unread > 0,
            onPress: () => void navigate('/mensagens'),
          },
        ]}
      />

      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Seções da conta"
            className="flex gap-1 rounded-full border border-border bg-surface p-1 shadow-[var(--surface-shadow)]"
          >
            {TABS.map((t) => {
              const selected = t.id === tab;
              return (
                <button
                  key={t.id}
                  id={`aba-${t.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`painel-${t.id}`}
                  onClick={() => {
                    goTab(t.id);
                  }}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    selected ? 'text-accent-foreground' : 'text-muted hover:text-foreground',
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="aba-conta"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-accent shadow-[0_8px_16px_-8px_rgb(236_106_31/0.9)]"
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>
          {tab === 'ofertas' && (
            <Button
              variant="outline"
              className="rounded-full bg-surface"
              onPress={() => void navigate('/orcamentos')}
            >
              <Plus className="size-4" /> Publicar a partir de um orçamento
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            id={`painel-${tab}`}
            role="tabpanel"
            aria-labelledby={`aba-${tab}`}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'visao' && <Overview user={user} onTab={goTab} onFix={fix} />}
            {tab === 'editar' && <EditProfile user={user} onFix={fix} />}
            {tab === 'ofertas' && <MyListings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
