import { Description, FieldError, InputGroup, Label, TextField } from '@heroui/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  description?: string;
  errorMessage?: string;
}

/** Campo de senha com o botão de mostrar/ocultar. */
export function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  description,
  errorMessage,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      value={value}
      onChange={onChange}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      isInvalid={Boolean(errorMessage)}
      isRequired
      fullWidth
    >
      <Label>{label}</Label>
      <InputGroup>
        <InputGroup.Input />
        <InputGroup.Suffix>
          <button
            type="button"
            className="grid size-7 place-items-center rounded-md text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus"
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={visible}
            onClick={() => {
              setVisible((v) => !v);
            }}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </InputGroup.Suffix>
      </InputGroup>
      {description && !errorMessage && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}
