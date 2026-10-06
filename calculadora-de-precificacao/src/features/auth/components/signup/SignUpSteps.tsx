import { Checkbox, Label } from '@heroui/react';
import { PencilLine } from 'lucide-react';

import { CityPicker, StatePicker } from '@/features/location';
import { TextInput } from '@/shared/components/form/TextInput';
import { cn } from '@/shared/lib/utils';

import { PasswordInput } from '../PasswordInput';
import { SpecialtyTags } from '../SpecialtyTags';

import type { StepProps } from './form';

function PickerError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-danger">
      {message}
    </p>
  );
}

export function AccessStep({ form, errors, set }: StepProps) {
  return (
    <div className="grid gap-4">
      <TextInput
        label="Seu nome"
        value={form.name}
        onChange={(name) => {
          set({ name });
        }}
        autoComplete="name"
        isRequired
        errorMessage={errors.name}
      />
      <TextInput
        label="E-mail"
        type="email"
        value={form.email}
        onChange={(email) => {
          set({ email });
        }}
        autoComplete="email"
        isRequired
        errorMessage={errors.email}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordInput
          label="Senha"
          value={form.password}
          onChange={(password) => {
            set({ password });
          }}
          autoComplete="new-password"
          description="Pelo menos 8 caracteres."
          errorMessage={errors.password}
        />
        <PasswordInput
          label="Repita a senha"
          value={form.confirmPassword}
          onChange={(confirmPassword) => {
            set({ confirmPassword });
          }}
          autoComplete="new-password"
          errorMessage={errors.confirmPassword}
        />
      </div>
    </div>
  );
}

export function StudioStep({ form, errors, set }: StepProps) {
  return (
    <div className="grid gap-4">
      <TextInput
        label="Nome do estúdio ou nome artístico"
        placeholder="Ex.: Lia Campos Filmes"
        value={form.businessName}
        onChange={(businessName) => {
          set({ businessName });
        }}
        autoComplete="organization"
        isRequired
        errorMessage={errors.businessName}
      />
      <TextInput
        label="O que você faz, em uma frase"
        placeholder="Ex.: Filmes de casamento com cara de cinema"
        value={form.headline}
        onChange={(headline) => {
          set({ headline });
        }}
        isRequired
        description={`${form.headline.length}/80 caracteres`}
        errorMessage={errors.headline}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatePicker
          value={form.state}
          onChange={(state) => {
            set({ state, city: form.city?.uf === state.uf ? form.city : null });
          }}
        />
        <div className="flex flex-col gap-1.5">
          <CityPicker
            uf={form.state?.uf ?? null}
            value={form.city}
            onChange={(city) => {
              set({ city });
            }}
            label="Cidade onde você atende"
          />
          <PickerError message={errors.city} />
        </div>
      </div>
    </div>
  );
}

export function SpecialtiesStep({ form, errors, set }: StepProps) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2">
        <SpecialtyTags
          value={form.specialties}
          onChange={(specialties) => {
            set({ specialties });
          }}
          description="Escolha quantas quiser."
        />
        <PickerError message={errors.specialties} />
      </div>
      <TextInput
        label="Sobre você (opcional)"
        placeholder="Experiência, equipe, região que atende, diferenciais…"
        value={form.bio}
        onChange={(bio) => {
          set({ bio });
        }}
        multiline
        description={`${form.bio.length}/400 caracteres`}
        errorMessage={errors.bio}
      />
    </div>
  );
}

interface ReviewStepProps extends StepProps {
  onEdit: (stepId: string) => void;
}

function ReviewItem({
  label,
  value,
  onEdit,
  className,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  className?: string;
}) {
  return (
    <div className={cn('group flex min-w-0 items-start justify-between gap-2', className)}>
      <div className="flex min-w-0 flex-col">
        <dt className="text-[11px] text-muted">{label}</dt>
        <dd className="truncate text-sm text-foreground" title={value}>
          {value || '—'}
        </dd>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${label.toLowerCase()}`}
        className="grid size-7 shrink-0 place-items-center rounded-full text-muted opacity-60 transition-all outline-none group-hover:opacity-100 hover:bg-surface-secondary hover:text-accent focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-focus"
      >
        <PencilLine className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function ReviewStep({ form, errors, set, onEdit }: ReviewStepProps) {
  const edit = (id: string) => () => {
    onEdit(id);
  };
  return (
    <div className="grid gap-4">
      <dl className="grid gap-x-5 gap-y-3 rounded-xl border border-border bg-surface-secondary/50 p-4 sm:grid-cols-2">
        <ReviewItem label="Nome" value={form.name} onEdit={edit('acesso')} />
        <ReviewItem label="E-mail" value={form.email} onEdit={edit('acesso')} />
        <ReviewItem label="Estúdio" value={form.businessName} onEdit={edit('estudio')} />
        <ReviewItem
          label="Cidade"
          value={form.city ? `${form.city.name}/${form.city.uf}` : ''}
          onEdit={edit('estudio')}
        />
        <ReviewItem
          label="O que você faz"
          value={form.headline}
          onEdit={edit('estudio')}
          className="sm:col-span-2"
        />
        <ReviewItem
          label="Especialidades"
          value={form.specialties.join(', ')}
          onEdit={edit('especialidades')}
          className="sm:col-span-2"
        />
      </dl>

      <TextInput
        label="Telefone / WhatsApp (opcional)"
        type="tel"
        placeholder="(11) 99999-9999"
        value={form.phone}
        onChange={(phone) => {
          set({ phone });
        }}
        autoComplete="tel"
        errorMessage={errors.phone}
      />
      <div className="flex flex-col gap-1.5">
        <Checkbox
          isSelected={form.acceptTerms}
          onChange={(acceptTerms) => {
            set({ acceptTerms });
          }}
          isInvalid={Boolean(errors.acceptTerms)}
        >
          <Checkbox.Content className="flex cursor-pointer items-start gap-3">
            <Checkbox.Control className="mt-0.5 shrink-0">
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>Aceito os termos de uso e ter minhas ofertas visíveis no marketplace.</Label>
          </Checkbox.Content>
        </Checkbox>
        <PickerError message={errors.acceptTerms} />
      </div>
    </div>
  );
}
