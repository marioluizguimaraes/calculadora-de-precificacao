import { useMemo } from 'react';

import { calculatePricing } from '../engine/calculate';
import { useDraftStore } from '../store/draft-store';
import { useProfileStore } from '../store/profile-store';

/** Resultado da precificação do rascunho atual, recalculado a cada alteração. */
export function usePricing() {
  const draft = useDraftStore((s) => s.draft);
  const profile = useProfileStore((s) => s.profile);
  return useMemo(() => calculatePricing(draft, profile), [draft, profile]);
}
