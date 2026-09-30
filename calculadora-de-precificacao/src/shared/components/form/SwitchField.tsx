import { Description, Label, Switch } from '@heroui/react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface SwitchFieldProps {
  label: string;
  description?: ReactNode;
  isSelected: boolean;
  onChange: (selected: boolean) => void;
  className?: string;
}

/**
 * Interruptor com rótulo e descrição ao lado do controle.
 * No HeroUI v3, `Switch.Content` é o botão clicável: o controle PRECISA ficar dentro dele.
 */
export function SwitchField({
  label,
  description,
  isSelected,
  onChange,
  className,
}: SwitchFieldProps) {
  return (
    <Switch
      isSelected={isSelected}
      onChange={onChange}
      className={cn('flex flex-col gap-0.5', className)}
    >
      <Switch.Content className="flex cursor-pointer items-start gap-3">
        <Switch.Control className="mt-0.5 shrink-0">
          <Switch.Thumb />
        </Switch.Control>
        <Label>{label}</Label>
      </Switch.Content>
      {description && <Description className="pl-12">{description}</Description>}
    </Switch>
  );
}
