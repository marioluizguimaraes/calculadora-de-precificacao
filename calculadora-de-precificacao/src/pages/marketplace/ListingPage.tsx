import { Button, Spinner } from '@heroui/react';
import { ArrowLeft, MessagesSquare, Settings2 } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { useAuth } from '@/features/auth';
import { ListingChat, ListingOverview, useListing } from '@/features/marketplace';
import { SceneHeading } from '@/shared/components/layout/SceneHeading';

import { NotFoundPage } from '../not-found/NotFoundPage';

export function ListingPage() {
  const { id } = useParams();
  const { data: listing, isLoading, isError } = useListing(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const isOwner = Boolean(listing && user?.id === listing.owner.id);

  // Links da caixa de mensagens chegam com #chat: leva direto à conversa.
  useEffect(() => {
    if (hash === '#chat' && listing) {
      document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hash, listing]);

  if (isLoading) {
    return (
      <div className="grid min-h-[60dvh] place-items-center">
        <Spinner aria-label="Carregando oferta" />
      </div>
    );
  }
  if (isError || !listing) {
    return <NotFoundPage message="Essa oferta não existe ou foi pausada por quem publicou." />;
  }

  return (
    <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-4 py-8 sm:px-6">
      <Button
        variant="ghost"
        className="self-start text-muted"
        onPress={() => {
          void navigate(-1);
        }}
      >
        <ArrowLeft className="size-4" /> Voltar
      </Button>
      <SceneHeading
        eyebrow={isOwner ? 'Sua oferta' : listing.owner.businessName}
        title={listing.title}
        description={listing.owner.headline}
        aside={
          isOwner ? (
            <Button
              variant="outline"
              className="rounded-full bg-surface"
              onPress={() => {
                void navigate('/conta?aba=ofertas');
              }}
            >
              <Settings2 className="size-4" /> Gerenciar ofertas
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] xl:gap-12">
        <ListingOverview listing={listing} />
        <section
          id="chat"
          aria-labelledby="chat-titulo"
          className="h-fit scroll-mt-24 overflow-hidden card-soft lg:sticky lg:top-24"
        >
          <div className="flex items-center gap-2 border-b border-separator px-4 py-3">
            <MessagesSquare className="size-4 text-accent" aria-hidden />
            <h2 id="chat-titulo" className="text-sm font-semibold text-foreground">
              {isOwner ? 'Conversas desta oferta' : 'Conversar sobre este serviço'}
            </h2>
          </div>
          <ListingChat listing={listing} />
        </section>
      </div>
    </div>
  );
}
