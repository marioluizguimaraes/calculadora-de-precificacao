import { createDefaultProfile, createEmptyDraft } from '@/features/pricing';

import { PROJECT_PRESETS } from '../constants/presets';

import { applyPreset, retier } from './services';

describe('modelos de projeto', () => {
  const draft = createEmptyDraft(createDefaultProfile());

  it('aplica serviços, tier e equipe do modelo', () => {
    const preset = PROJECT_PRESETS.find((p) => p.id === 'publicidade');
    if (!preset) throw new Error('modelo ausente');
    const next = applyPreset(draft, preset);
    expect(next.project.tier).toBe(3);
    expect(next.services).toHaveLength(preset.services.length);
    expect(next.team).toHaveLength(preset.team.length);
    expect(next.project.title).toBe(preset.label);
  });

  it('todos os modelos apontam para serviços e funções existentes', () => {
    for (const preset of PROJECT_PRESETS) {
      const next = applyPreset(draft, preset);
      expect(next.services).toHaveLength(preset.services.length);
      expect(next.team).toHaveLength(preset.team.length);
    }
  });

  it('ao mudar o tier, preserva horas editadas à mão', () => {
    const services = [
      { serviceId: 'edicao', stage: 'pos' as const, label: 'Edição', hours: 10 },
      { serviceId: 'roteiro', stage: 'pre' as const, label: 'Roteiro', hours: 7 },
    ];
    const next = retier(services, 2, 3);
    expect(next[0]?.hours).toBe(24);
    expect(next[1]?.hours).toBe(7);
  });
});
