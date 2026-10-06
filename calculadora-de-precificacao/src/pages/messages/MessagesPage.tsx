import { useNavigate, useSearchParams } from 'react-router';

import { Inbox } from '@/features/marketplace';

export function MessagesPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  return (
    <div className="mx-auto flex max-w-[90rem] flex-col gap-5 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-accent">
            <span aria-hidden className="h-px w-6 bg-accent" />
            Mensagens
          </p>
          <h1 className="font-display text-4xl text-foreground">Suas conversas</h1>
        </div>
        <p className="text-sm text-muted">
          Cada conversa pertence a uma oferta — uma por pessoa interessada.
        </p>
      </header>
      <Inbox
        selectedId={params.get('conversa')}
        onSelect={(id) => {
          setParams(id ? { conversa: id } : {}, { replace: true, preventScrollReset: true });
        }}
        onExplore={() => {
          void navigate('/servicos');
        }}
      />
    </div>
  );
}
