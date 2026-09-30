import { Button } from '@heroui/react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface EmptySceneProps {
  title: string;
  message: ReactNode;
  /** Linha pequena em mono acima do título. */
  kicker?: string;
  action?: { label: string; onPress: () => void };
  /** Versão menor, para dentro das etapas. */
  compact?: boolean;
  /** Nível do título (a página "não encontrada" usa h1). */
  as?: 'h1' | 'h2';
  className?: string;
}

/** Estado vazio no mesmo estilo da página "não encontrada": centralizado, direto e com uma saída. */
export function EmptyScene({
  title,
  message,
  kicker = '00:00:00:00',
  action,
  compact,
  as: Heading = 'h2',
  className,
}: EmptySceneProps) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-xl flex-col items-center gap-5 px-4 text-center',
        compact ? 'py-12' : 'py-24',
        className,
      )}
    >
      <p className="font-mono text-sm text-muted tabular">{kicker}</p>
      <Heading className={cn('font-display text-foreground', compact ? 'text-4xl' : 'text-5xl')}>
        {title}
      </Heading>
      <p className="text-muted">{message}</p>
      {action && (
        <Button className="rounded-full px-5" onPress={action.onPress}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
