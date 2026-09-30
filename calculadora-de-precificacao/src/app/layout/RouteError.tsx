import { Button } from '@heroui/react';
import { isRouteErrorResponse, useRouteError } from 'react-router';

/** Erro inesperado numa rota: explica o que houve e oferece uma saída. */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Erro desconhecido';

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="font-slate text-xs text-rec">Falha na gravação</p>
      <h1 className="font-display text-4xl text-foreground">Algo travou nesta tela</h1>
      <p className="text-sm text-muted">
        Seus dados continuam salvos neste navegador. Recarregue a página para tentar de novo.
      </p>
      <code className="rounded-lg bg-surface-secondary px-3 py-2 text-xs text-muted">
        {message}
      </code>
      <Button
        onPress={() => {
          window.location.assign('/');
        }}
      >
        Recarregar o app
      </Button>
    </div>
  );
}
