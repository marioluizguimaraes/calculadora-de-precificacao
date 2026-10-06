import { Description, FieldError, Input, Label, TextArea, TextField } from '@heroui/react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'password';
  isRequired?: boolean;
  multiline?: boolean;
  autoComplete?: string;
  errorMessage?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  description,
  placeholder,
  className,
  type = 'text',
  isRequired,
  multiline,
  autoComplete,
  errorMessage,
}: TextInputProps) {
  return (
    <TextField
      className={className}
      value={value}
      onChange={onChange}
      type={type}
      isRequired={isRequired}
      isInvalid={Boolean(errorMessage)}
      autoComplete={autoComplete}
      fullWidth
    >
      <Label>{label}</Label>
      {multiline ? (
        <TextArea placeholder={placeholder} rows={3} />
      ) : (
        <Input placeholder={placeholder} />
      )}
      {description && !errorMessage && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}
