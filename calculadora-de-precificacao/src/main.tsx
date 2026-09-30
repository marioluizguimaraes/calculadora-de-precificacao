import './app/styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { AppProviders } from './app/providers/AppProviders';
import { router } from './app/router/routes';
import { applyStoredTheme } from './shared/hooks/useTheme';

applyStoredTheme();

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado no index.html');

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
