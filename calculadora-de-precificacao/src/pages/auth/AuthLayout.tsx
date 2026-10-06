import { Button } from '@heroui/react';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { MiniClapper } from '@/shared/components/brand/Clapper';
import { InteractiveBackground } from '@/shared/components/motion/InteractiveBackground';
import { env } from '@/shared/config/env';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  /** Vitrine ao lado do formulário (só em telas largas). */
  aside: ReactNode;
  /** A vitrine acompanha a rolagem (formulários longos, como o cadastro). */
  stickyAside?: boolean;
}

/** Tela dedicada de login/cadastro: mesmo fundo vivo do sistema, vitrine + cartão do formulário. */
export function AuthLayout({ children, aside, stickyAside }: AuthLayoutProps) {
  const { theme, toggle } = useTheme();
  const reduce = useReducedMotion();

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip">
      <InteractiveBackground />
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-full bg-accent px-4 py-2 text-accent-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>

      <header className="flex h-16 shrink-0 items-center justify-between gap-3 px-4 sm:px-8">
        <Link
          to="/"
          aria-label={`${env.VITE_APP_NAME} — início`}
          className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <MiniClapper />
          <span className="text-base font-semibold tracking-tight text-foreground">
            {env.VITE_APP_NAME}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-muted transition-all outline-none hover:-translate-y-0.5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus sm:flex"
          >
            <ArrowLeft className="size-4" aria-hidden /> Voltar ao início
          </Link>
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
        </div>
      </header>

      <main
        id="conteudo"
        className="mx-auto grid w-full max-w-[88rem] flex-1 gap-12 px-4 pb-6 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-16"
      >
        <div className={cn('hidden lg:block', stickyAside && 'lg:sticky lg:top-6')}>{aside}</div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-xl justify-self-center lg:justify-self-end"
        >
          <span aria-hidden className="glow-blob -top-24 -right-24 size-80 opacity-70" />
          <div className="relative card-soft p-5 sm:p-8">{children}</div>
        </motion.div>
      </main>
    </div>
  );
}

/** Cabeçalho do cartão do formulário, no mesmo tom das cenas do sistema. */
export function AuthHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-2.5">
      <p className="flex items-center gap-2 text-sm font-semibold text-accent">
        <span aria-hidden className="h-px w-6 bg-accent" />
        {eyebrow}
      </p>
      <h1 className="font-display text-4xl text-balance text-foreground">{title}</h1>
      {description && <p className="text-base text-pretty text-muted">{description}</p>}
    </header>
  );
}
