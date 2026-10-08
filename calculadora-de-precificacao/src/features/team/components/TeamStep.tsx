import { Button, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import { Plus, Trash2 } from 'lucide-react';

import {
  STAGE_META,
  STAGES,
  teamMemberCost,
  teamMemberDefaults,
  useDraftStore,
  usePricing,
  type Stage,
  type TeamBilling,
  type TeamMember,
} from '@/features/pricing';
import { MoneyField } from '@/shared/components/form/MoneyField';
import { QuantityField } from '@/shared/components/form/QuantityField';
import { TextInput } from '@/shared/components/form/TextInput';
import { EmptyScene } from '@/shared/components/layout/EmptyScene';
import { Panel } from '@/shared/components/layout/Panel';
import { formatHours, formatMoney, pluralize } from '@/shared/lib/format';
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
    ...teamMemberDefaults(role?.dailyRateCents ?? 40000),
    count: 1,
  };
}

const BILLING_OPTIONS: { id: TeamBilling; label: string }[] = [
  { id: 'diaria', label: 'Diária' },
  { id: 'hora', label: 'Por hora' },
];

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
        description="Diárias de referência de mercado — ajuste para a sua praça. Quem cobra pelas horas que assume no projeto entra como “Por hora”."
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
            const stage = pricing.stages[m.stage];
            const days = m.days ?? stage.days;
            const hours = m.hours ?? stage.hours;
            const byHour = m.billing === 'hora';
            return (
              <li key={m.id} className="relative overflow-hidden card-soft p-5">
                <span
                  aria-hidden
                  className={cn('absolute inset-y-0 left-0 w-1', STAGE_BG[m.stage])}
                />
                <div className="flex flex-col gap-4">
                  <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
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
                        const [next] = [...keys] as Stage[];
                        if (next) updateMember(m.id, { stage: next, days: null, hours: null });
                      }}
                    >
                      {STAGES.map((st, i) => (
                        <ToggleButton key={st} id={st}>
                          {i > 0 && <ToggleButtonGroup.Separator />}
                          {STAGE_META[st].short}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    <ToggleButtonGroup
                      aria-label="Cobrança"
                      size="sm"
                      selectionMode="single"
                      disallowEmptySelection
                      selectedKeys={[m.billing]}
                      onSelectionChange={(keys) => {
                        const [billing] = [...keys] as TeamBilling[];
                        if (billing) updateMember(m.id, { billing });
                      }}
                    >
                      {BILLING_OPTIONS.map((option, i) => (
                        <ToggleButton key={option.id} id={option.id}>
                          {i > 0 && <ToggleButtonGroup.Separator />}
                          {option.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      className="justify-self-end"
                      aria-label={`Remover ${m.role}`}
                      onPress={() => {
                        setList('team', (list) => list.filter((x) => x.id !== m.id));
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="grid items-start gap-4 sm:grid-cols-[10rem_8rem_9rem_minmax(0,1fr)]">
                    {byHour ? (
                      <MoneyField
                        label="Valor da hora"
                        description="0 = sem custo no orçamento"
                        valueCents={m.hourlyRateCents}
                        onChange={(hourlyRateCents) => {
                          updateMember(m.id, { hourlyRateCents });
                        }}
                      />
                    ) : (
                      <MoneyField
                        label="Diária"
                        valueCents={m.dailyRateCents}
                        onChange={(dailyRateCents) => {
                          updateMember(m.id, { dailyRateCents });
                        }}
                      />
                    )}
                    <QuantityField
                      label="Pessoas"
                      minValue={1}
                      value={m.count}
                      onChange={(count) => {
                        updateMember(m.id, { count: Math.max(1, Math.round(count)) });
                      }}
                    />
                    {byHour ? (
                      <QuantityField
                        label="Horas no projeto"
                        unit="hour"
                        step={0.5}
                        value={hours}
                        description={m.hours === null ? 'Segue as horas da etapa' : undefined}
                        onChange={(next) => {
                          updateMember(m.id, { hours: next });
                        }}
                      />
                    ) : (
                      <QuantityField
                        label="Diárias"
                        unit="day"
                        value={days}
                        onChange={(next) => {
                          updateMember(m.id, { days: next });
                        }}
                      />
                    )}
                    <p className="flex flex-col items-start gap-0.5 sm:items-end sm:self-center">
                      <span className="text-xs text-muted">
                        {byHour
                          ? `${formatMoney(m.hourlyRateCents)}/h × ${formatHours(hours)}`
                          : `${formatMoney(m.dailyRateCents)} × ${pluralize(days, 'diária', 'diárias')}`}
                        {m.count > 1 ? ` × ${m.count}` : ''}
                      </span>
                      <span className="font-mono text-sm text-foreground tabular">
                        {formatMoney(teamMemberCost(m, stage))}
                      </span>
                    </p>
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
