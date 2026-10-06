import { Check } from 'lucide-react';
import { motion } from 'motion/react';

import { ProfileCardPreview, SIGN_UP_STEPS, type SignUpForm } from '@/features/auth';
import { TwoToneHeading } from '@/shared/components/brand/Decor';
import { Tilt } from '@/shared/components/motion/Tilt';
import { cn } from '@/shared/lib/utils';

/** Lateral do cadastro: o cartão do marketplace se monta enquanto a pessoa preenche. */
export function SignUpShowcase({ form, step }: { form: SignUpForm; step: number }) {
  return (
    <div className="flex flex-col gap-6">
      <TwoToneHeading
        as="h2"
        soft="Seu cartão no marketplace,"
        strong="montado enquanto você preenche."
        className="text-[clamp(2rem,3vw,2.6rem)]"
      />
      <Tilt max={5} className="max-w-md">
        <ProfileCardPreview
          name={form.name}
          businessName={form.businessName}
          headline={form.headline}
          city={form.city}
          specialties={form.specialties}
        />
      </Tilt>
      <ol
        className="flex max-w-md flex-col gap-2.5 [@media(max-height:860px)]:hidden"
        aria-label="Etapas do cadastro"
      >
        {SIGN_UP_STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={s.id} className="flex items-center gap-3">
              <motion.span
                animate={{ scale: current ? 1.1 : 1 }}
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular transition-colors',
                  done && 'border-transparent bg-accent text-accent-foreground',
                  current && 'border-accent bg-accent/12 text-accent',
                  !done && !current && 'border-border bg-surface text-muted',
                )}
              >
                {done ? <Check className="size-3.5" aria-label="feita" /> : i + 1}
              </motion.span>
              <span
                className={cn('text-sm', current ? 'font-semibold text-foreground' : 'text-muted')}
              >
                {s.label}
                <span className="text-muted"> — {s.title}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
