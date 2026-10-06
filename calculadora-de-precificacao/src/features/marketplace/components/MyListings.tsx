import { AlertDialog, Button, Spinner, toast } from '@heroui/react';
import { ArrowUpRight, Pause, Play, Store, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { EmptyScene } from '@/shared/components/layout/EmptyScene';
import { formatDateShort } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { useMyListings, useRemoveListing, useUpdateListing } from '../hooks/useMarketplace';
import type { Listing } from '../types';

import { TIER_COVER } from '../constants';

import { ListingPrice } from './ListingCard';
import { StageHoursBar } from './StageHoursBar';

/** Ofertas da conta: ver, pausar/reativar e excluir. */
export function MyListings() {
  const { data: listings = [], isLoading } = useMyListings();
  const update = useUpdateListing();
  const remove = useRemoveListing();
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState<Listing | null>(null);

  if (isLoading) {
    return (
      <div className="grid min-h-40 place-items-center">
        <Spinner aria-label="Carregando ofertas" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyScene
        compact
        title="Nenhuma oferta ainda"
        message="Abra um orçamento salvo e toque em “Publicar como serviço” para ele aparecer no marketplace."
        action={{
          label: 'Ver orçamentos salvos',
          onPress: () => {
            void navigate('/orcamentos');
          },
        }}
      />
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {listings.map((listing) => {
          const active = listing.status === 'ativa';
          return (
            <li
              key={listing.id}
              className="flex flex-wrap items-center justify-between gap-4 card-soft p-4 transition-shadow hover:shadow-[0_24px_40px_-28px_rgb(92_58_30/0.55)] sm:p-5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span
                  aria-hidden
                  className={cn(
                    'grid size-14 shrink-0 place-items-center rounded-2xl',
                    TIER_COVER[listing.tier],
                    !active && 'opacity-50 grayscale',
                  )}
                >
                  <Store className="size-5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        active ? 'bg-success/15 text-success' : 'bg-surface-secondary text-muted',
                      )}
                    >
                      {active ? 'Publicada' : 'Pausada'}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      {formatDateShort(listing.publishedAt)}
                    </span>
                  </div>
                  <span className="truncate font-semibold text-foreground">{listing.title}</span>
                  <StageHoursBar services={listing.services} className="max-w-xs" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ListingPrice listing={listing} className="mr-2" />
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => {
                    void navigate(`/servicos/${listing.id}`);
                  }}
                >
                  Abrir <ArrowUpRight className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={update.isPending}
                  onPress={() => {
                    update.mutate(
                      { id: listing.id, patch: { status: active ? 'pausada' : 'ativa' } },
                      {
                        onSuccess: () => {
                          toast.success(active ? 'Oferta pausada' : 'Oferta publicada de novo');
                        },
                      },
                    );
                  }}
                >
                  {active ? <Pause className="size-4" /> : <Play className="size-4" />}
                  {active ? 'Pausar' : 'Reativar'}
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={`Excluir ${listing.title}`}
                  onPress={() => {
                    setToDelete(listing);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <AlertDialog.Backdrop
        isOpen={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Excluir esta oferta?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-muted">
                “{toDelete?.title}” sai do marketplace e as conversas dela são apagadas. O orçamento
                de origem continua salvo.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="tertiary" slot="close">
                Manter
              </Button>
              <Button
                variant="danger"
                isDisabled={remove.isPending}
                onPress={() => {
                  if (!toDelete) return;
                  remove.mutate(toDelete.id, {
                    onSuccess: () => {
                      toast.success('Oferta excluída');
                      setToDelete(null);
                    },
                  });
                }}
              >
                Excluir oferta
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  );
}
