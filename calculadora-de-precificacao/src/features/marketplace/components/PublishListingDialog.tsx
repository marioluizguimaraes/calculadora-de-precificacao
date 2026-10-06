import { Button, Modal, Spinner, toast } from '@heroui/react';
import { Store } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { SpecialtyTags, useAuth } from '@/features/auth';
import type { SavedQuote } from '@/features/quote';
import { SwitchField } from '@/shared/components/form/SwitchField';
import { TextInput } from '@/shared/components/form/TextInput';
import { formatMoney } from '@/shared/lib/format';

import { usePublishListing } from '../hooks/useMarketplace';
import type { Listing } from '../types';
import { listingFromQuote } from '../utils/from-quote';

const publishSchema = z.object({
  title: z.string().trim().min(5, 'Dê um título com pelo menos 5 caracteres.').max(90),
  description: z
    .string()
    .trim()
    .min(20, 'Descreva o serviço em pelo menos 20 caracteres.')
    .max(1_200, 'Use no máximo 1.200 caracteres.'),
});

interface PublishListingDialogProps {
  quote: SavedQuote;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished: (listing: Listing) => void;
}

/** Torna um orçamento salvo uma oferta pública — sem os dados do cliente. */
export function PublishListingDialog({
  quote,
  isOpen,
  onOpenChange,
  onPublished,
}: PublishListingDialogProps) {
  const { user } = useAuth();
  const [base] = useState(() => listingFromQuote(quote));
  const [title, setTitle] = useState(base.title);
  const [description, setDescription] = useState(base.description);
  const [showPrice, setShowPrice] = useState(true);
  const [tags, setTags] = useState<string[]>(() => user?.specialties.slice(0, 3) ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const publish = usePublishListing();

  const submit = () => {
    const parsed = publishSchema.safeParse({ title, description });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    publish.mutate(
      { ...base, ...parsed.data, showPrice, tags },
      {
        onSuccess: (listing) => {
          toast.success('Oferta publicada', {
            description: 'Ela já aparece na busca de serviços.',
          });
          onOpenChange(false);
          onPublished(listing);
        },
        onError: (error) => {
          toast.danger('Não foi possível publicar', { description: error.message });
        },
      },
    );
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Publicar como serviço</Modal.Heading>
            <p className="text-sm text-muted">
              A oferta mostra os serviços, as horas e o preço deste orçamento. Nome, empresa e
              e-mail do cliente <strong className="text-foreground">não</strong> são publicados.
            </p>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-5">
            <TextInput
              label="Título da oferta"
              value={title}
              onChange={(value) => {
                setTitle(value);
                setErrors(({ title: _title, ...rest }) => rest);
              }}
              isRequired
              errorMessage={errors.title}
            />
            <TextInput
              label="Descrição"
              placeholder="O que está incluso, como você trabalha, prazos…"
              value={description}
              onChange={(value) => {
                setDescription(value);
                setErrors(({ description: _description, ...rest }) => rest);
              }}
              multiline
              isRequired
              errorMessage={errors.description}
            />
            <SpecialtyTags
              value={tags}
              onChange={setTags}
              description="Ajudam a oferta a aparecer na busca."
            />
            <SwitchField
              label={`Mostrar o preço (${formatMoney(base.priceCents)})`}
              description="Desligado, a oferta aparece como “sob consulta” e o valor é combinado no chat."
              isSelected={showPrice}
              onChange={setShowPrice}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="tertiary"
              onPress={() => {
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button isDisabled={publish.isPending} onPress={submit}>
              {publish.isPending ? (
                <Spinner size="sm" color="current" />
              ) : (
                <Store className="size-4" />
              )}
              Publicar oferta
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
