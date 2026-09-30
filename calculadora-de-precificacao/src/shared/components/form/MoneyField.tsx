import { Description, Label, NumberField } from '@heroui/react';

import { env } from '@/shared/config/env';
import { toCents, toReais } from '@/shared/lib/format';

interface MoneyFieldProps {
  label: string;
  valueCents: number;
  onChange: (cents: number) => void;
  description?: string;
  className?: string;
  isRequired?: boolean;
  /** Mostra centavos (padrão) ou só reais inteiros. */
  withCents?: boolean;
  'aria-label'?: string;
}

/** Campo monetário em reais, guardando o valor em centavos. */
export function MoneyField({
  label,
  valueCents,
  onChange,
  description,
  className,
  isRequired,
  withCents = true,
  ...rest
}: MoneyFieldProps) {
  return (
    <NumberField
      className={className}
      value={toReais(valueCents)}
      onChange={(value) => {
        onChange(Number.isFinite(value) ? toCents(value) : 0);
      }}
      minValue={0}
      step={withCents ? 0.01 : 1}
      isRequired={isRequired}
      aria-label={rest['aria-label']}
      formatOptions={{
        style: 'currency',
        currency: env.VITE_DEFAULT_CURRENCY,
        maximumFractionDigits: withCents ? 2 : 0,
      }}
      fullWidth
    >
      {label && <Label>{label}</Label>}
      <NumberField.Group>
        <NumberField.Input className="tabular" />
      </NumberField.Group>
      {description && <Description>{description}</Description>}
    </NumberField>
  );
}
