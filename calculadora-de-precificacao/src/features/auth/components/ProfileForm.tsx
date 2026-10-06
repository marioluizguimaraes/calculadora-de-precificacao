import { Button, Spinner, toast } from '@heroui/react';
import { MapPin, Phone, Sparkles, UserRound, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState, type ReactNode, type SyntheticEvent } from 'react';

import { CityPicker, StatePicker, useStates } from '@/features/location';
import type { CityRef, StateRef } from '@/features/pricing';
import { TextInput } from '@/shared/components/form/TextInput';

import { useUpdateProfile } from '../hooks/useAuth';
import { confirmSchema, fieldErrors, specialtiesSchema, studioSchema } from '../schemas/signup';
import type { ProfileInput, User } from '../types';
import { profileSectionId, type ProfileSection } from '../utils/completeness';

import { SpecialtyTags } from './SpecialtyTags';

const profileSchema = studioSchema
  .extend(specialtiesSchema.shape)
  .extend({ phone: confirmSchema.shape.phone });

export type ProfileDraft = ProfileInput;

function fromUser(user: User): ProfileDraft {
  return {
    name: user.name,
    businessName: user.businessName,
    headline: user.headline,
    city: user.city,
    specialties: user.specialties,
    bio: user.bio,
    phone: user.phone,
  };
}

const sameDraft = (a: ProfileDraft, b: ProfileDraft) => JSON.stringify(a) === JSON.stringify(b);

function Section({
  section,
  icon: Icon,
  title,
  description,
  children,
}: {
  section: ProfileSection;
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={profileSectionId(section)}
      className="scroll-mt-28 card-soft p-5 transition-shadow target:ring-2 target:ring-accent/40 sm:p-6"
    >
      <header className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

interface ProfileFormProps {
  user: User;
  /** Avisa a cada alteração — alimenta a prévia ao vivo ao lado do formulário. */
  onChange?: (draft: ProfileDraft) => void;
}

/** Edição do perfil público em seções, com barra flutuante quando há alterações. */
export function ProfileForm({ user, onChange }: ProfileFormProps) {
  const [draft, setDraft] = useState(() => fromUser(user));
  const [pickedState, setPickedState] = useState<StateRef | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = useUpdateProfile();
  const reduce = useReducedMotion();
  const { data: states = [] } = useStates();
  const saved = fromUser(user);
  const dirty = !sameDraft(draft, saved);
  // A conta guarda só a cidade; o estado do seletor é deduzido pela UF.
  const state = pickedState ?? states.find((s) => s.uf === draft.city?.uf) ?? null;

  useEffect(() => {
    onChange?.(draft);
  }, [draft, onChange]);

  const set = (patch: Partial<ProfileDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => !(key in patch))),
    );
  };

  const discard = () => {
    setDraft(saved);
    setPickedState(null);
    setErrors({});
  };

  const save = (e?: SyntheticEvent) => {
    e?.preventDefault();
    const parsed = profileSchema.safeParse(draft);
    const nameOk = draft.name.trim().length >= 2;
    if (!parsed.success || !nameOk) {
      setErrors({
        ...(parsed.success ? {} : fieldErrors(parsed.error)),
        ...(nameOk ? {} : { name: 'Informe seu nome.' }),
      });
      toast.danger('Confira os campos destacados');
      return;
    }
    update.mutate(
      {
        ...draft,
        name: draft.name.trim(),
        businessName: draft.businessName.trim(),
        headline: draft.headline.trim(),
        bio: draft.bio.trim(),
        phone: draft.phone.trim(),
      },
      {
        onSuccess: (next) => {
          setDraft(fromUser(next));
          toast.success('Perfil atualizado', {
            description: 'Vale para as próximas ofertas que você publicar.',
          });
        },
        onError: (error) => {
          toast.danger('Não foi possível salvar', { description: error.message });
        },
      },
    );
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={save} noValidate>
      <Section
        section="identidade"
        icon={UserRound}
        title="Identidade"
        description="Como seu nome e o do estúdio aparecem nas ofertas."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Seu nome"
            value={draft.name}
            onChange={(name) => {
              set({ name });
            }}
            autoComplete="name"
            isRequired
            errorMessage={errors.name}
          />
          <TextInput
            label="Nome do estúdio ou nome artístico"
            value={draft.businessName}
            onChange={(businessName) => {
              set({ businessName });
            }}
            autoComplete="organization"
            isRequired
            errorMessage={errors.businessName}
          />
          <TextInput
            className="sm:col-span-2"
            label="O que você faz, em uma frase"
            value={draft.headline}
            onChange={(headline) => {
              set({ headline });
            }}
            isRequired
            description={`${draft.headline.length}/80 caracteres`}
            errorMessage={errors.headline}
          />
        </div>
      </Section>

      <Section
        section="local"
        icon={MapPin}
        title="Onde você atende"
        description="Quem busca serviços pode filtrar pelo seu estado."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <StatePicker
            value={state}
            onChange={(next) => {
              setPickedState(next);
              if (draft.city?.uf !== next.uf) set({ city: null });
            }}
          />
          <div className="flex flex-col gap-1.5">
            <CityPicker
              uf={state?.uf ?? null}
              value={draft.city}
              onChange={(city: CityRef | null) => {
                set({ city });
              }}
            />
            {errors.city && (
              <p role="alert" className="text-sm text-danger">
                {errors.city}
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section
        section="especialidades"
        icon={Sparkles}
        title="Especialidades e bio"
        description="O que você faz de melhor e um pouco da sua história."
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <SpecialtyTags
              value={draft.specialties}
              onChange={(specialties) => {
                set({ specialties });
              }}
              description="Escolha quantas quiser."
            />
            {errors.specialties && (
              <p role="alert" className="text-sm text-danger">
                {errors.specialties}
              </p>
            )}
          </div>
          <TextInput
            label="Sobre você"
            placeholder="Experiência, equipe, região que atende, diferenciais…"
            value={draft.bio}
            onChange={(bio) => {
              set({ bio });
            }}
            multiline
            description={`${draft.bio.length}/400 caracteres`}
            errorMessage={errors.bio}
          />
        </div>
      </Section>

      <Section
        section="contato"
        icon={Phone}
        title="Contato"
        description="Vai na proposta em PDF. Nas ofertas, o contato é pelo chat."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Telefone / WhatsApp"
            type="tel"
            placeholder="(11) 99999-9999"
            value={draft.phone}
            onChange={(phone) => {
              set({ phone });
            }}
            autoComplete="tel"
            errorMessage={errors.phone}
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">E-mail de acesso</span>
            <span className="py-2 text-sm text-muted">{user.email}</span>
          </div>
        </div>
      </Section>

      {/* Barra flutuante: só aparece quando algo mudou */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            role="status"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-3 card-ink py-2.5 pr-2.5 pl-5 sm:bottom-6"
          >
            <span className="rec-dot shrink-0" aria-hidden />
            <p className="min-w-0 flex-1 text-sm">Você tem alterações não salvas.</p>
            <Button
              size="sm"
              variant="ghost"
              className="text-ink-foreground hover:bg-ink-raised"
              onPress={discard}
            >
              Descartar
            </Button>
            <Button
              size="sm"
              className="rounded-full px-4"
              isDisabled={update.isPending}
              onPress={() => {
                save();
              }}
            >
              {update.isPending && <Spinner size="sm" color="current" />}
              Salvar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
