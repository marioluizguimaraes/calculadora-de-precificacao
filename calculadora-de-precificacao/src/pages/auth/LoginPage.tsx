import { Alert } from '@heroui/react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';

import {
  AUTH_REASON_MESSAGE,
  LoginForm,
  safeReturnTo,
  useAuth,
  type AuthReason,
} from '@/features/auth';

import { AuthHeading, AuthLayout } from './AuthLayout';
import { LoginShowcase } from './LoginShowcase';

export function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const returnTo = safeReturnTo(params.get('voltar'));
  const reason = params.get('motivo') as AuthReason | null;
  const reasonMessage = reason ? AUTH_REASON_MESSAGE[reason] : undefined;

  if (isAuthenticated) return <Navigate to={returnTo} replace />;

  return (
    <AuthLayout aside={<LoginShowcase />}>
      <div className="flex flex-col gap-6">
        <AuthHeading
          eyebrow="Bem-vindo de volta"
          title="Entrar na sua conta"
          description="Continue de onde parou: orçamentos, ofertas e conversas."
        />
        {reasonMessage && (
          <Alert status="accent">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{reasonMessage}</Alert.Title>
            </Alert.Content>
          </Alert>
        )}
        <LoginForm
          onSuccess={() => {
            void navigate(returnTo, { replace: true });
          }}
        />
        <p className="text-center text-sm text-muted">
          Ainda não tem conta?{' '}
          <Link
            to={`/cadastro?${params.toString()}`}
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            Criar conta grátis
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
