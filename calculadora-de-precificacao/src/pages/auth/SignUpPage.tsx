import { toast } from '@heroui/react';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';

import { EMPTY_SIGN_UP, safeReturnTo, SignUpWizard, useAuth } from '@/features/auth';

import { AuthLayout } from './AuthLayout';
import { SignUpShowcase } from './SignUpShowcase';

export function SignUpPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const returnTo = safeReturnTo(params.get('voltar'));
  const [preview, setPreview] = useState(EMPTY_SIGN_UP);
  const [step, setStep] = useState(0);

  if (isAuthenticated) return <Navigate to={returnTo} replace />;

  return (
    <AuthLayout stickyAside aside={<SignUpShowcase form={preview} step={step} />}>
      <SignUpWizard
        onFormChange={setPreview}
        onStepChange={setStep}
        loginLink={
          <Link
            to={`/entrar?${params.toString()}`}
            className="text-sm text-muted underline-offset-4 hover:text-foreground"
          >
            Já tem conta? <span className="font-semibold text-accent hover:underline">Entrar</span>
          </Link>
        }
        onSuccess={() => {
          toast.success('Conta criada', {
            description: 'Seus orçamentos agora ficam salvos na sua conta.',
          });
          void navigate(returnTo, { replace: true });
        }}
      />
    </AuthLayout>
  );
}
