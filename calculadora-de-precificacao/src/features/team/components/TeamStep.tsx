import { Button, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import { Plus, Trash2 } from 'lucide-react';

import {
  STAGE_META,
  STAGES,
  useDraftStore,
  usePricing,
  type Stage,
  type TeamMember,
} from '@/features/pricing';
import { MoneyField } from '@/shared/components/form/MoneyField';
import { QuantityField } from '@/shared/components/form/QuantityField';
import { TextInput } from '@/shared/components/form/TextInput';
import { EmptyScene } from '@/shared/components/layout/EmptyScene';
import { Panel } from '@/shared/components/layout/Panel';
import { formatMoney } from '@/shared/lib/format';
import { createId } from '@/shared/lib/id';
import { cn } from '@/shared/lib/utils';

import { TEAM_ROLES, type RoleDefinition } from '../constants/roles';

const STAGE_BG: Record<Stage, string> = {
  pre: 'bg-stage-pre',
  producao: 'bg-stage-producao',
  pos: 'bg-stage-pos',
};

function fromRole(role: RoleDefinition | null): TeamMember {
  return {
    id: createId(),
    role: role?.label ?? 'Profissional',
    stage: role?.stage ?? 'producao',
    dailyRateCents: role?.dailyRateCents ?? 40000,
    count: 1,
    days: null,
  };
}

export function TeamStep() {
  const team = useDraftStore((s) => s.draft.team);
  const setList = useDraftStore((s) => s.setList);
  const pricing = usePricing();

  const updateMember = (id: string, patch: Partial<TeamMember>) => {
    setList('team', (list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Chamar para o set"
        description="Diárias de referência de mercado — ajuste para a sua praça."
      >
        <div className="flex flex-col gap-4">
          {STAGES.map((stage) => (
            <div key={stage} className="flex flex-wrap items-center gap-2">
              <span className="w-full font-slate text-[11px] text-muted sm:w-28">
                {STAGE_META[stage].label}
              </span>
              {TEAM_ROLES.filter((r) => r.stage === stage).map((role) => (
                <Button
                  key={role.id}
                  size="sm"
                  variant="secondary"
                  onPress={() => {
                    setList('team', (list) => [...list, fromRole(role)]);
                  }}
                >
                  <Plus className="size-3.5" /> {role.label}
                </Button>
              ))}
            </div>
          ))}
          <Button
            size="sm"
            variant="tertiary"
            className="self-start"
            onPress={() => {
              setList('team', (list) => [...list, fromRole(null)]);
            }}
          >
            <Plus className="size-3.5" /> Outra função
          </Button>
        </div>
      </Panel>

      {team.length === 0 ? (
        <Panel>
          <EmptyScene
            compact
            title="Só você no set"
            message="Vai fazer tudo sozinho? Tudo bem — é só seguir para a próxima etapa. Ou adicione uma função acima."
          />
        </Panel>
      ) : (
        <ul className="flex flex-col gap-3">
          {team.map((m) => {
            const days = m.days ?? pricing.stages[m.stage].days;
            return (
              <li key={m.id} className="relative overflow-hidden card-soft p-5">
                <span
                  aria-hidden
                  className={cn('absolute inset-y-0 left-0 w-1', STAGE_BG[m.stage])}
                />
                <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1.4fr)_auto_10rem_8rem_9rem_auto]">
                  <TextInput
                    label="Função"
                    value={m.role}
                    onChange={(role) => {
                      updateMember(m.id, { role });
                    }}
                  />
                  <ToggleButtonGroup
                    aria-label="Etapa"
                    size="sm"
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={[m.stage]}
                    onSelectionChange={(keys) => {
                      const [stage] = [...keys] as Stage[];
                      if (stage) updateMember(m.id, { stage, days: null });
                    }}
                  >
                    {STAGES.map((stage, i) => (
                      <ToggleButton key={stage} id={stage}>
                        {i > 0 && <ToggleButtonGroup.Separator />}
                        {STAGE_META[stage].short}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <MoneyField
                    label="Diária"
                    valueCents={m.dailyRateCents}
                    onChange={(dailyRateCents) => {
                      updateMember(m.id, { dailyRateCents });
                    }}
                  />
                  <QuantityField
                    label="Pessoas"
                    minValue={1}
                    value={m.count}
                    onChange={(count) => {
                      updateMember(m.id, { count: Math.max(1, Math.round(count)) });
                    }}
                  />
                  <QuantityField
                    label="Diárias"
                    unit="day"
                    value={days}
                    onChange={(next) => {
                      updateMember(m.id, { days: next });
                    }}
                  />
                  <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                    <span className="font-mono text-sm text-foreground tabular">
                      {formatMoney(m.dailyRateCents * m.count * days)}
                    </span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label={`Remover ${m.role}`}
                      onPress={() => {
                        setList('team', (list) => list.filter((x) => x.id !== m.id));
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
