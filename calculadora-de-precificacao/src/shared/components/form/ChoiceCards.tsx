import type { ReactNode } from 'react';
import { Label, RadioButton, RadioField, RadioGroup } from 'react-aria-components';

import { cn } from '@/shared/lib/utils';

export interface Choice<T extends string> {
  value: T;
  title: string;
  description?: string;
  icon?: ReactNode;
  meta?: ReactNode;
}

interface ChoiceCardsProps<T extends string> {
  label: string;
  value: T | null;
  onChange: (value: T) => void;
  choices: Choice<T>[];
  columns?: 2 | 3;
  hideLabel?: boolean;
  className?: string;
}

/**
 * Escolha única em cartões grandes (React Aria RadioGroup — mesma base do HeroUI):
 * setas do teclado navegam, espaço seleciona.
 */
export function ChoiceCards<T extends string>({
  label,
  value,
  onChange,
  choices,
  columns = 3,
  hideLabel,
  className,
}: ChoiceCardsProps<T>) {
  return (
    <RadioGroup
      value={value}
      onChange={(v) => {
        onChange(v as T);
      }}
      aria-label={hideLabel ? label : undefined}
      className={cn('flex flex-col gap-3', className)}
    >
      {!hideLabel && <Label className="text-sm font-semibold text-foreground">{label}</Label>}
      <div
        className={cn(
          'grid gap-3',
          columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2',
        )}
      >
        {choices.map((choice) => (
          <RadioField key={choice.value} value={choice.value} className="flex">
            <RadioButton
              className={({ isSelected, isFocusVisible, isHovered }) =>
                cn(
                  'group relative flex w-full cursor-pointer flex-col gap-2 rounded-xl border p-5 transition-all duration-200 outline-none',
                  'border-border bg-surface shadow-[var(--surface-shadow)]',
                  isHovered && !isSelected && '-translate-y-0.5 border-accent/30',
                  isSelected &&
                    'border-accent bg-[radial-gradient(120%_80%_at_100%_0%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_70%),var(--surface)] shadow-[0_0_0_1px_var(--accent),0_18px_36px_-20px_rgb(236_106_31/0.7)]',
                  isFocusVisible && 'ring-2 ring-focus ring-offset-2 ring-offset-background',
                )
              }
            >
              {({ isSelected }) => (
                <>
                  <div className="flex items-start justify-between gap-3">
                    {choice.icon && (
                      <span
                        className={cn(
                          'grid size-11 place-items-center rounded-full border transition-colors',
                          isSelected
                            ? 'border-transparent bg-accent text-accent-foreground shadow-[0_8px_16px_-8px_rgb(236_106_31/0.9)]'
                            : 'border-border bg-surface-secondary text-accent',
                        )}
                      >
                        {choice.icon}
                      </span>
                    )}
                    <span
                      aria-hidden
                      className={cn(
                        'mt-1 size-4 rounded-full border-2 transition-all',
                        isSelected
                          ? 'border-accent bg-accent shadow-[inset_0_0_0_3px_var(--surface)]'
                          : 'border-field-border',
                      )}
                    />
                  </div>
                  <span className="text-base font-semibold text-foreground">{choice.title}</span>
                  {choice.description && (
                    <span className="text-sm leading-snug text-muted">{choice.description}</span>
                  )}
                  {choice.meta}
                </>
              )}
            </RadioButton>
          </RadioField>
        ))}
      </div>
    </RadioGroup>
  );
}
