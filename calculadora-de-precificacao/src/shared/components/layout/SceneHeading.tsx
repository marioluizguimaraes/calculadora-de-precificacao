import type { ReactNode } from 'react';

interface SceneHeadingProps {
  /** Rótulo curto acima do título (ex.: "Etapa 03 de 09 · Serviços"). */
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
}

/** Cabeçalho de cada tela: rótulo laranja, uma pergunta direta e o contexto em tom suave. */
export function SceneHeading({ eyebrow, title, description, aside }: SceneHeadingProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-accent">
          <span aria-hidden className="h-px w-6 bg-accent" />
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl text-balance text-foreground sm:text-5xl">{title}</h1>
        {description && (
          <p className="text-base leading-relaxed text-pretty text-muted sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {aside}
    </header>
  );
}
