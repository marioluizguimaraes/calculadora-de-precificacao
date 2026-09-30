import { Spinner } from '@heroui/react';
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router';

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
          <Page>
            <QuotesHistoryPage />
          </Page>
        ),
      },
      {
        path: 'orcamentos/:id',
        element: (
          <Page>
            <SavedQuotePage />
          </Page>
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
          <Page>
            <PricingBreakdownPage />
          </Page>
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
