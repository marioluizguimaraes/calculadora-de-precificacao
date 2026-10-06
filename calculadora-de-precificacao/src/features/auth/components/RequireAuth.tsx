import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '../hooks/useAuth';
import type { AuthReason } from '../types';
import { loginPath } from '../utils/return-to';

/** Protege uma rota: sem conta, vai para o login e volta para cá depois. */
export function RequireAuth({
  children,
  reason = 'conta',
}: {
  children: ReactNode;
  reason?: AuthReason;
}) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={loginPath(reason, location.pathname + location.search)} replace />;
  }
  return children;
}
