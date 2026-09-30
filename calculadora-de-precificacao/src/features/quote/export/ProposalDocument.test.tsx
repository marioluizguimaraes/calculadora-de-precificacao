// @vitest-environment node
import { pdf } from '@react-pdf/renderer';

import { calculatePricing } from '@/features/pricing';
import { makeDraft, makeProfile } from '@/test/fixtures/pricing';

import { ProposalDocument } from './ProposalDocument';

describe('ProposalDocument', () => {
  it.each([false, true])(
    'gera um PDF válido (memória de cálculo: %s)',
    async (includeBreakdown) => {
      const profile = makeProfile({ businessName: 'Lume Filmes', document: '12.345.678/0001-90' });
      const draft = makeDraft(profile);
      const blob = await pdf(
        <ProposalDocument
          draft={draft}
          identity={profile}
          result={calculatePricing(draft, profile)}
          options={{ includeBreakdown, notes: 'Inclui 2 rodadas de revisão.' }}
        />,
      ).toBlob();
      expect(blob.size).toBeGreaterThan(1_000);
      expect(await blob.slice(0, 5).text()).toBe('%PDF-');
    },
  );
});
