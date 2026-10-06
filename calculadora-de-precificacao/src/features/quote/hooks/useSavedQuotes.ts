import { toast } from '@heroui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ACCOUNT_QUERY_KEY, useAuth } from '@/features/auth';
import { normalizeDraft } from '@/features/pricing';
import { env } from '@/shared/config/env';

import { quotesApi } from '../api/quotes-api';
import type { SavedQuote } from '../types';

const quotesKey = (userId: string | undefined) => [ACCOUNT_QUERY_KEY, userId, 'orcamentos'];

const NO_QUOTES: SavedQuote[] = [];

/** Orçamentos da conta. Sem login, a lista é sempre vazia (nada fica salvo). */
export function useSavedQuotes() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: quotesKey(user?.id),
    queryFn: quotesApi.list,
    enabled: Boolean(user),
  });
  return { ...query, quotes: query.data ?? NO_QUOTES };
}

/** Um orçamento salvo; reaproveita a lista em cache quando ela já foi carregada. */
export function useSavedQuote(id: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: [...quotesKey(user?.id), id],
    queryFn: () => quotesApi.get(id ?? ''),
    enabled: Boolean(user && id),
    retry: false,
    initialData: () =>
      queryClient.getQueryData<SavedQuote[]>(quotesKey(user?.id))?.find((q) => q.id === id),
  });
}

export function useSaveQuote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotesApi.save,
    onSuccess: (saved) => {
      queryClient.setQueryData<SavedQuote[]>(quotesKey(user?.id), (list = []) => [
        saved,
        ...list.filter((q) => q.id !== saved.id),
      ]);
      queryClient.setQueryData([...quotesKey(user?.id), saved.id], saved);
    },
  });
}

export function useRemoveQuote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotesApi.remove,
    onSuccess: (_, id) => {
      queryClient.setQueryData<SavedQuote[]>(quotesKey(user?.id), (list = []) =>
        list.filter((q) => q.id !== id),
      );
      queryClient.removeQueries({ queryKey: [...quotesKey(user?.id), id] });
    },
  });
}

/** Onde o histórico ficava antes das contas existirem (só neste navegador). */
const LEGACY_HISTORY_KEY = `${env.VITE_STORAGE_KEY}:historico`;
let importing = false;

/**
 * Leva para a conta os orçamentos salvos neste navegador antes do login existir.
 * Roda uma vez, no primeiro login depois da atualização.
 */
export function useImportLegacyQuotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || importing) return;
    let legacy: SavedQuote[] = [];
    try {
      const raw = localStorage.getItem(LEGACY_HISTORY_KEY);
      if (!raw) return;
      legacy = (JSON.parse(raw) as { state?: { quotes?: SavedQuote[] } }).state?.quotes ?? [];
    } catch {
      localStorage.removeItem(LEGACY_HISTORY_KEY);
      return;
    }
    importing = true;
    void Promise.all(
      legacy.map((q) =>
        quotesApi.save({ draft: normalizeDraft(q.draft), profile: q.profile, savedAt: q.savedAt }),
      ),
    )
      .then(() => {
        localStorage.removeItem(LEGACY_HISTORY_KEY);
        void queryClient.invalidateQueries({ queryKey: quotesKey(user.id) });
        if (legacy.length > 0) {
          toast.success('Orçamentos trazidos para a sua conta', {
            description: `${legacy.length} orçamento(s) salvos neste navegador agora estão na sua conta.`,
          });
        }
      })
      .catch((error: unknown) => {
        console.error(error);
      })
      .finally(() => {
        importing = false;
      });
  }, [user, queryClient]);
}
