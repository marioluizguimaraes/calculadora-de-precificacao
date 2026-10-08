import { Spinner } from '@heroui/react';
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router';

import { RequireAuth } from '@/features/auth';

import { AppShell } from '../layout/AppShell';
import { RouteError } from '../layout/RouteError';

// Páginas carregadas sob demanda: cada rota vira um pedaço separado do bundle.
const HomePage = lazy(() => import('@/pages/home/HomePage').then((m) => ({ default: m.HomePage })));
const QuoteWizardPage = lazy(() =>
  import('@/pages/quote-wizard/QuoteWizardPage').then((m) => ({ default: m.QuoteWizardPage })),
);
const QuoteSummaryPage = lazy(() =>
  import('@/pages/quote-summary/QuoteSummaryPage').then((m) => ({ default: m.QuoteSummaryPage })),
);
const QuotesHistoryPage = lazy(() =>
  import('@/pages/quotes-history/QuotesHistoryPage').then((m) => ({
    default: m.QuotesHistoryPage,
  })),
);
const SavedQuotePage = lazy(() =>
  import('@/pages/quotes-history/SavedQuotePage').then((m) => ({ default: m.SavedQuotePage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const PricingBreakdownPage = lazy(() =>
  import('@/pages/pricing-breakdown/PricingBreakdownPage').then((m) => ({
    default: m.PricingBreakdownPage,
  })),
);
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const SignUpPage = lazy(() =>
  import('@/pages/auth/SignUpPage').then((m) => ({ default: m.SignUpPage })),
);
const MarketplacePage = lazy(() =>
  import('@/pages/marketplace/MarketplacePage').then((m) => ({ default: m.MarketplacePage })),
);
const ListingPage = lazy(() =>
  import('@/pages/marketplace/ListingPage').then((m) => ({ default: m.ListingPage })),
);
const MessagesPage = lazy(() =>
  import('@/pages/messages/MessagesPage').then((m) => ({ default: m.MessagesPage })),
);
const AccountPage = lazy(() =>
  import('@/pages/account/AccountPage').then((m) => ({ default: m.AccountPage })),
);
const PresentationPage = lazy(() =>
  import('@/pages/presentation/PresentationPage').then((m) => ({ default: m.PresentationPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function Page({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60dvh] place-items-center">
          <Spinner aria-label="Carregando" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // Login e cadastro têm tela própria, fora do AppShell.
  {
    path: 'entrar',
    errorElement: <RouteError />,
    element: (
      <Page>
        <LoginPage />
      </Page>
    ),
  },
  {
    path: 'cadastro',
    errorElement: <RouteError />,
    element: (
      <Page>
        <SignUpPage />
      </Page>
    ),
  },
  // Apresentação da proposta: tela cheia, sem a navegação do app.
  {
    path: 'apresentacao',
    errorElement: <RouteError />,
    element: (
      <Page>
        <PresentationPage />
      </Page>
    ),
  },
  {
    path: 'orcamentos/:id/apresentacao',
    errorElement: <RouteError />,
    element: (
      <RequireAuth>
        <Page>
          <PresentationPage />
        </Page>
      </RequireAuth>
    ),
  },
  {
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: (
          <Page>
            <HomePage />
          </Page>
        ),
      },
      {
        path: 'orcamento',
        element: (
          <Page>
            <QuoteWizardPage />
          </Page>
        ),
      },
      {
        path: 'orcamento/resumo',
        element: (
          <Page>
            <QuoteSummaryPage />
          </Page>
        ),
      },
      {
        path: 'orcamentos',
        element: (
          <RequireAuth reason="salvar">
            <Page>
              <QuotesHistoryPage />
            </Page>
          </RequireAuth>
        ),
      },
      {
        path: 'orcamentos/:id',
        element: (
          <RequireAuth>
            <Page>
              <SavedQuotePage />
            </Page>
          </RequireAuth>
        ),
      },
      {
        path: 'calculo',
        element: (
          <Page>
            <PricingBreakdownPage />
          </Page>
        ),
      },
      {
        path: 'orcamentos/:id/calculo',
        element: (
          <RequireAuth>
            <Page>
              <PricingBreakdownPage />
            </Page>
          </RequireAuth>
        ),
      },
      {
        path: 'servicos',
        element: (
          <Page>
            <MarketplacePage />
          </Page>
        ),
      },
      {
        path: 'servicos/:id',
        element: (
          <Page>
            <ListingPage />
          </Page>
        ),
      },
      {
        path: 'mensagens',
        element: (
          <RequireAuth reason="chat">
            <Page>
              <MessagesPage />
            </Page>
          </RequireAuth>
        ),
      },
      {
        path: 'conta',
        element: (
          <RequireAuth>
            <Page>
              <AccountPage />
            </Page>
          </RequireAuth>
        ),
      },
      {
        path: 'estudio',
        element: (
          <Page>
            <SettingsPage />
          </Page>
        ),
      },
      {
        path: '*',
        element: (
          <Page>
            <NotFoundPage />
          </Page>
        ),
      },
    ],
  },
]);
