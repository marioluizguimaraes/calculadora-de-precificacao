import { Button, Kbd, toast } from '@heroui/react';
import {
  Calculator,
  History,
  House,
  Moon,
  Plus,
  Search,
  Settings2,
  SquarePen,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';

import { hasDraftContent, useDraftStore, useProfileStore } from '@/features/pricing';
import { quoteTitle, useHistoryStore } from '@/features/quote';
import { MiniClapper } from '@/shared/components/brand/Clapper';
import { InteractiveBackground } from '@/shared/components/motion/InteractiveBackground';
import { env } from '@/shared/config/env';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/lib/utils';

import { CommandPalette } from '../command/CommandPalette';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Início', icon: House, end: true },
  { to: '/orcamento', label: 'Orçamento em andamento', icon: SquarePen, end: true },
  { to: '/calculo', label: 'Como o preço foi gerado', icon: Calculator },
  { to: '/orcamentos', label: 'Orçamentos salvos', icon: History },
  { to: '/estudio', label: 'Meu estúdio', icon: Settings2 },
];

/** Botão redondo do trilho: laranja quando ativo, fantasma quando não. */
function RailLink({ item, compact }: { item: NavItem; compact?: boolean }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={item.label}
      className={({ isActive }) =>
        cn(
          'group relative grid shrink-0 place-items-center rounded-full border transition-all outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          compact ? 'size-9' : 'size-11',
          isActive
            ? 'border-transparent bg-accent text-accent-foreground shadow-[0_10px_20px_-10px_rgb(236_106_31/0.9)]'
            : 'border-border bg-surface text-muted hover:-translate-y-0.5 hover:text-foreground',
        )
      }
    >
      <Icon className={compact ? 'size-4' : 'size-[18px]'} aria-hidden />
      <span className="sr-only">{item.label}</span>
      {!compact && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-full ml-3 hidden rounded-full bg-ink px-3 py-1.5 text-xs font-medium whitespace-nowrap text-ink-foreground opacity-0 transition-opacity group-hover:opacity-100 lg:block"
        >
          {item.label}
        </span>
      )}
    </NavLink>
  );
}

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const draft = useDraftStore((s) => s.draft);
  const resetDraft = useDraftStore((s) => s.reset);
  const profile = useProfileStore((s) => s.profile);
  const saveQuote = useHistoryStore((s) => s.save);
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  // Novo orçamento: guarda o que estava em andamento no histórico e começa do zero.
  const startNewQuote = () => {
    if (hasDraftContent(draft)) {
      saveQuote(draft, profile);
      toast.success('Orçamento anterior salvo', {
        description: `"${quoteTitle(draft)}" está em Orçamentos salvos.`,
      });
    }
    resetDraft(profile);
    // Sem etapa fixa: o assistente abre na primeira (ou em "Seu estúdio", na primeira vez).
    void navigate('/orcamento');
  };
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const [headerHidden, setHeaderHidden] = useState(false);

  // Some ao descer, volta ao subir: mais espaço para o conteúdo sem perder a navegação.
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHeaderHidden(latest > previous && latest > 140);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <InteractiveBackground />
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-accent"
      />
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-full bg-accent px-4 py-2 text-accent-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>

      {/* Trilho lateral de ícones (desktop) */}
      <nav
        aria-label="Principal"
        className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center gap-3 pt-24 lg:flex"
      >
        {NAV.map((item) => (
          <RailLink key={item.to} item={item} />
        ))}
      </nav>

      <motion.header
        animate={{ y: headerHidden && !paletteOpen ? '-100%' : '0%' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-30 bg-background/95"
      >
        <div className="flex h-18 items-center justify-between gap-3 px-4 sm:px-6 lg:pl-5">
          <NavLink
            to="/"
            aria-label={`${env.VITE_APP_NAME} — início`}
            className="flex shrink-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-focus lg:w-[calc(5rem-1.25rem+12rem)]"
          >
            <MiniClapper />
            <span className="hidden text-base font-semibold tracking-tight text-foreground sm:inline">
              {env.VITE_APP_NAME}
            </span>
          </NavLink>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            {/* Busca em pílula — abre a paleta de comandos */}
            <button
              type="button"
              onClick={() => {
                setPaletteOpen(true);
              }}
              className="bg-field-background hidden h-10 w-full max-w-xs items-center gap-2 rounded-full border border-field-border px-4 text-left text-sm text-field-placeholder shadow-[var(--field-shadow)] transition-colors outline-none hover:border-accent/40 focus-visible:ring-2 focus-visible:ring-focus md:flex"
            >
              <Search className="size-4 shrink-0" aria-hidden />
              <span className="flex-1 truncate">Buscar etapa, orçamento…</span>
              <Kbd className="shrink-0">
                {isMac ? <Kbd.Abbr keyValue="command" /> : <Kbd.Content>Ctrl</Kbd.Content>}
                <Kbd.Content>K</Kbd.Content>
              </Kbd>
            </button>
            <Button
              isIconOnly
              variant="outline"
              size="sm"
              className="size-10 rounded-full bg-surface md:hidden"
              aria-label="Buscar"
              onPress={() => {
                setPaletteOpen(true);
              }}
            >
              <Search className="size-4" />
            </Button>

            <Button
              size="sm"
              className="h-10 rounded-full px-4 shadow-[0_10px_20px_-10px_rgb(236_106_31/0.9)]"
              onPress={startNewQuote}
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Novo orçamento</span>
              <span className="sr-only sm:hidden">Novo orçamento</span>
            </Button>

            <Button
              isIconOnly
              variant="outline"
              size="sm"
              className="size-10 rounded-full bg-surface"
              aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
              onPress={toggle}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            <NavLink
              to="/estudio"
              aria-label="Meu estúdio"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              <Settings2 className="size-4" aria-hidden />
            </NavLink>
          </div>
        </div>

        {/* Navegação compacta (mobile/tablet) */}
        <nav
          aria-label="Principal (compacta)"
          className="flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden"
        >
          {NAV.map((item) => (
            <RailLink key={item.to} item={item} compact />
          ))}
        </nav>
      </motion.header>

      <main id="conteudo" className="flex-1 lg:pl-20">
        <Outlet />
      </main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
