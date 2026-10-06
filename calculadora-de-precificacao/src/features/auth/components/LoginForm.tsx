import { Alert, Button, Spinner } from '@heroui/react';
import { LogIn, Sparkles } from 'lucide-react';
import { useState, type SyntheticEvent } from 'react';

import { TextInput } from '@/shared/components/form/TextInput';
import { env } from '@/shared/config/env';

import { DEMO_CREDENTIALS } from '../constants';
import { useLogin } from '../hooks/useAuth';
import { fieldErrors, loginSchema } from '../schemas/signup';

import { PasswordInput } from './PasswordInput';

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const login = useLogin();

  const submit = (credentials: { email: string; password: string }) => {
    const parsed = loginSchema.safeParse(credentials);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    login.mutate(parsed.data, { onSuccess });
  };

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    submit({ email, password });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      {login.isError && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{login.error.message}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}
      <TextInput
        label="E-mail"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        isRequired
        errorMessage={errors.email}
      />
      <PasswordInput
        label="Senha"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        errorMessage={errors.password}
      />
      <Button
        type="submit"
        size="lg"
        fullWidth
        className="rounded-full"
        isDisabled={login.isPending}
      >
        {login.isPending ? <Spinner size="sm" color="current" /> : <LogIn className="size-4" />}
        Entrar
      </Button>

      {!env.VITE_API_URL && (
        <div className="flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/6 p-3 pl-4">
          <Sparkles className="size-4 shrink-0 text-accent" aria-hidden />
          <p className="min-w-0 flex-1 text-sm text-muted">
            <span className="font-semibold text-foreground">Só experimentando?</span> Use a conta
            demo — os dados são simulados.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0 rounded-full"
            isDisabled={login.isPending}
            aria-label={`Entrar com a conta demo (${DEMO_CREDENTIALS.email})`}
            onPress={() => {
              setEmail(DEMO_CREDENTIALS.email);
              setPassword(DEMO_CREDENTIALS.password);
              submit(DEMO_CREDENTIALS);
            }}
          >
            Entrar com a demo
          </Button>
        </div>
      )}
    </form>
  );
}
