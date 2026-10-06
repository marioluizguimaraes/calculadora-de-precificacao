import { Alert, Button, Spinner } from '@heroui/react';
import { ArrowLeft, ArrowRight, Check, UserPlus } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';

import { cn } from '@/shared/lib/utils';

import { authApi } from '../../api/auth-api';
import { useSignUp } from '../../hooks/useAuth';
import { fieldErrors } from '../../schemas/signup';

import { EMPTY_SIGN_UP, SIGN_UP_STEPS, type SignUpForm } from './form';
import { AccessStep, ReviewStep, SpecialtiesStep, StudioStep } from './SignUpSteps';

const pad = (n: number) => String(n).padStart(2, '0');

/** Cadastro em etapas: valida cada etapa ao avançar e só cria a conta no fim. */
export function SignUpWizard({
  onSuccess,
  onFormChange,
  onStepChange,
  loginLink,
}: {
  onSuccess: () => void;
  /** Atalho "Já tem conta?", mostrado no topo do formulário. */
  loginLink?: ReactNode;
  /** Avisa a cada alteração — alimenta a prévia do cartão ao lado do formulário. */
  onFormChange?: (form: SignUpForm) => void;
  onStepChange?: (index: number) => void;
}) {
  const [form, setForm] = useState<SignUpForm>(EMPTY_SIGN_UP);
  const [index, setIndex] = useState(0);
  const [reached, setReached] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const signUp = useSignUp();
  const reduceMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const step = SIGN_UP_STEPS[index] ?? SIGN_UP_STEPS[0];
  const isLast = index === SIGN_UP_STEPS.length - 1;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    onStepChange?.(index);
  }, [index, onStepChange]);

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  const set = (patch: Partial<SignUpForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    // Some o erro do campo assim que a pessoa mexe nele.
    setErrors((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => !(key in patch))),
    );
  };

  const goTo = (target: number) => {
    setErrors({});
    setIndex(target);
    setReached((r) => Math.max(r, target));
  };

  const validateStep = () => {
    const parsed = step.schema.safeParse(form);
    if (parsed.success) return true;
    setErrors(fieldErrors(parsed.error));
    return false;
  };

  const next = async () => {
    if (!validateStep()) return;
    if (step.id === 'acesso') {
      setCheckingEmail(true);
      try {
        const { available } = await authApi.emailAvailable(form.email);
        if (!available) {
          setErrors({ email: 'Já existe uma conta com esse e-mail. Tente entrar.' });
          return;
        }
      } finally {
        setCheckingEmail(false);
      }
    }
    goTo(index + 1);
  };

  const submit = () => {
    if (!validateStep()) return;
    signUp.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        businessName: form.businessName.trim(),
        headline: form.headline.trim(),
        city: form.city,
        specialties: form.specialties,
        bio: form.bio.trim(),
        phone: form.phone.trim(),
      },
      { onSuccess },
    );
  };

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (isLast) submit();
    else void next();
  };

  const stepProps = { form, errors, set };
  const busy = checkingEmail || signUp.isPending;

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-accent">
          <span aria-hidden className="h-px w-6 bg-accent" />
          Nova conta
        </p>
        {loginLink}
      </div>
      <nav aria-label="Etapas do cadastro">
        <ol className="grid grid-cols-4 gap-2">
          {SIGN_UP_STEPS.map((s, i) => {
            const isCurrent = i === index;
            const filled = i <= index;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={i > reached || busy}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Etapa ${i + 1}: ${s.label}`}
                  onClick={() => {
                    goTo(i);
                  }}
                  className="group flex w-full flex-col gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-surface disabled:cursor-not-allowed"
                >
                  <span className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
                    <motion.span
                      className="block h-full rounded-full bg-accent"
                      initial={false}
                      animate={{ width: filled ? '100%' : '0%' }}
                      transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                  <span
                    className={cn(
                      'hidden items-center gap-1.5 text-xs font-medium transition-colors sm:flex',
                      isCurrent
                        ? 'text-foreground'
                        : 'text-muted group-enabled:group-hover:text-foreground',
                    )}
                  >
                    {i < index ? (
                      <Check className="size-3 text-accent" aria-hidden />
                    ) : (
                      <span className="font-mono text-[10px] tabular">{pad(i + 1)}</span>
                    )}
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step.id}
          initial={reduceMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs text-muted tabular">
              Etapa {pad(index + 1)} de {pad(SIGN_UP_STEPS.length)}
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-3xl text-foreground outline-none"
            >
              {step.title}
            </h1>
            <p className="text-sm text-muted [@media(max-height:860px)]:hidden">
              {step.description}
            </p>
          </div>

          {step.id === 'acesso' && <AccessStep {...stepProps} />}
          {step.id === 'estudio' && <StudioStep {...stepProps} />}
          {step.id === 'especialidades' && <SpecialtiesStep {...stepProps} />}
          {step.id === 'revisao' && (
            <ReviewStep
              {...stepProps}
              onEdit={(id) => {
                goTo(SIGN_UP_STEPS.findIndex((s) => s.id === id));
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {signUp.isError && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{signUp.error.message}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-separator pt-4">
        {index > 0 ? (
          <Button
            variant="tertiary"
            isDisabled={busy}
            onPress={() => {
              goTo(index - 1);
            }}
          >
            <ArrowLeft className="size-4" /> Voltar
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="lg" className="rounded-full px-6" isDisabled={busy}>
          {busy && <Spinner size="sm" color="current" />}
          {isLast ? (
            <>{!busy && <UserPlus className="size-4" />} Criar conta</>
          ) : (
            <>Continuar {!busy && <ArrowRight className="size-4" />}</>
          )}
        </Button>
      </div>
    </form>
  );
}
