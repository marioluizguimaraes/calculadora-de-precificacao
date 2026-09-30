import { Description, Label, NumberField } from '@heroui/react';

interface QuantityFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  className?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  /** Unidade exibida (Intl): 'hour', 'day', 'kilometer', 'percent'... */
  unit?: 'hour' | 'day' | 'kilometer' | 'percent' | 'year' | 'liter';
  hideLabel?: boolean;
  isDisabled?: boolean;
}

/** Campo numérico com botões − / + e unidade formatada. */
export function QuantityField({
  label,
  value,
  onChange,
  description,
  className,
  minValue = 0,
  maxValue,
  step = 1,
  unit,
  hideLabel,
  isDisabled,
}: QuantityFieldProps) {
  const isPercent = unit === 'percent';
  return (
    <NumberField
      className={className}
      value={isPercent ? value / 100 : value}
      onChange={(next) => {
        const safe = Number.isFinite(next) ? next : 0;
        onChange(isPercent ? Math.round(safe * 1000) / 10 : safe);
      }}
      minValue={isPercent ? minValue / 100 : minValue}
      maxValue={maxValue === undefined ? undefined : isPercent ? maxValue / 100 : maxValue}
      step={isPercent ? step / 100 : step}
      isDisabled={isDisabled}
      aria-label={hideLabel ? label : undefined}
      formatOptions={
        isPercent
          ? { style: 'percent', maximumFractionDigits: 1 }
          : unit
            ? { style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: 2 }
            : { maximumFractionDigits: 2 }
      }
      fullWidth
    >
      {!hideLabel && <Label>{label}</Label>}
      <NumberField.Group>
        <NumberField.DecrementButton />
        <NumberField.Input className="text-center tabular" />
        <NumberField.IncrementButton />
      </NumberField.Group>
      {description && <Description>{description}</Description>}
    </NumberField>
  );
}
