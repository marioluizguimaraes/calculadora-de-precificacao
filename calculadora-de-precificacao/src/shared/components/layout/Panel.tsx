import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface PanelProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Cartão de conteúdo com título opcional — base visual de todas as etapas. */
export function Panel({ title, description, actions, children, className }: PanelProps) {
  return (
    <section className={cn('card-soft p-5 sm:p-6', className)}>
      {(title ?? actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            {title && (
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            )}
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
