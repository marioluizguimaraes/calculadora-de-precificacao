import type { QuoteDraft, SelectedService, TeamMember, Tier } from '@/features/pricing';
import { ROLE_BY_ID } from '@/features/team';
import { createId } from '@/shared/lib/id';

import { SERVICE_BY_ID, type ServiceDefinition } from '../constants/catalog';
import type { ProjectPreset } from '../constants/presets';

export function toSelected(def: ServiceDefinition, tier: Tier): SelectedService {
  return { serviceId: def.id, stage: def.stage, label: def.label, hours: def.hours[tier] };
}

/** Aplica um modelo: tier, entregáveis, serviços com horas típicas e equipe sugerida. */
export function applyPreset(draft: QuoteDraft, preset: ProjectPreset): QuoteDraft {
  const services = preset.services.flatMap((id) => {
    const def = SERVICE_BY_ID.get(id);
    return def ? [toSelected(def, preset.tier)] : [];
  });
  const team = preset.team.flatMap(({ roleId, stage }): TeamMember[] => {
    const role = ROLE_BY_ID.get(roleId);
    return role
      ? [
          {
            id: createId(),
            role: role.label,
            stage,
            dailyRateCents: role.dailyRateCents,
            count: 1,
            days: null,
          },
        ]
      : [];
  });
  return {
    ...draft,
    presetId: preset.id,
    project: {
      ...draft.project,
      tier: preset.tier,
      deliverables: draft.project.deliverables || preset.deliverables,
      title: draft.project.title || preset.label,
    },
    services,
    team,
  };
}

/**
 * Ao mudar a complexidade, atualiza as horas que ainda estão no valor padrão do tier anterior —
 * horas ajustadas à mão pelo usuário são preservadas.
 */
export function retier(services: SelectedService[], from: Tier, to: Tier): SelectedService[] {
  return services.map((s) => {
    const def = SERVICE_BY_ID.get(s.serviceId);
    if (def?.hours[from] !== s.hours) return s;
    return { ...s, hours: def.hours[to] };
  });
}
