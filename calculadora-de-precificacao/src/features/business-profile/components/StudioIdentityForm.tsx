import { Button, toast } from '@heroui/react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useRef } from 'react';

import { useProfileStore } from '@/features/pricing';
import { QuantityField } from '@/shared/components/form/QuantityField';
import { TextInput } from '@/shared/components/form/TextInput';

const MAX_LOGO_BYTES = 400 * 1024;

/** Dados que assinam a proposta em PDF. */
export function StudioIdentityForm({ compact = false }: { compact?: boolean }) {
  const profile = useProfileStore((s) => s.profile);
  const update = useProfileStore((s) => s.update);
  const fileRef = useRef<HTMLInputElement>(null);

  const onLogo = (file: File | undefined) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.danger('Use uma imagem PNG ou JPG.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.danger('A logo precisa ter até 400 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') update({ logoDataUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-surface-secondary">
          {profile.logoDataUrl ? (
            <img
              src={profile.logoDataUrl}
              alt="Logo do estúdio"
              className="size-full object-contain"
            />
          ) : (
            <ImagePlus className="size-5 text-muted" aria-hidden />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            className="sr-only"
            aria-label="Enviar logo"
            onChange={(e) => {
              onLogo(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              fileRef.current?.click();
            }}
          >
            {profile.logoDataUrl ? 'Trocar logo' : 'Enviar logo'}
          </Button>
          {profile.logoDataUrl && (
            <Button
              size="sm"
              variant="ghost"
              onPress={() => {
                update({ logoDataUrl: null });
              }}
            >
              <Trash2 className="size-4" /> Remover
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Nome do estúdio ou profissional"
          value={profile.businessName}
          onChange={(businessName) => {
            update({ businessName });
          }}
          isRequired
          autoComplete="organization"
        />
        <TextInput
          label="Seu nome"
          value={profile.ownerName}
          onChange={(ownerName) => {
            update({ ownerName });
          }}
          autoComplete="name"
        />
        <TextInput
          label="E-mail"
          type="email"
          value={profile.email}
          onChange={(email) => {
            update({ email });
          }}
          autoComplete="email"
        />
        <TextInput
          label="Telefone / WhatsApp"
          type="tel"
          value={profile.phone}
          onChange={(phone) => {
            update({ phone });
          }}
          autoComplete="tel"
        />
        {!compact && (
          <>
            <TextInput
              label="CNPJ ou CPF"
              value={profile.document}
              onChange={(document) => {
                update({ document });
              }}
            />
            <TextInput
              label="Site ou portfólio"
              type="url"
              value={profile.website}
              onChange={(website) => {
                update({ website });
              }}
              autoComplete="url"
            />
          </>
        )}
        <TextInput
          className="sm:col-span-2"
          label="Condições de pagamento"
          value={profile.paymentTerms}
          onChange={(paymentTerms) => {
            update({ paymentTerms });
          }}
          multiline
        />
        <QuantityField
          label="Validade da proposta"
          unit="day"
          minValue={1}
          value={profile.proposalValidityDays}
          onChange={(proposalValidityDays) => {
            update({ proposalValidityDays });
          }}
        />
      </div>
    </div>
  );
}
