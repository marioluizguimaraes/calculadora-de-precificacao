import { Button } from '@heroui/react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

import {
  STAGE_META,
  STAGES,
  useDraftStore,
  usePricing,
  useProfileStore,
  type Stage,
} from '@/features/pricing';
import { QuantityField } from '@/shared/components/form/QuantityField';
import { EmptyScene } from '@/shared/components/layout/EmptyScene';
import { Panel } from '@/shared/components/layout/Panel';
import { formatHours, formatMoney, formatTimecode, pluralize } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

const STAGE_BG: Record<Stage, string> = {
  pre: 'bg-stage-pre',
  producao: 'bg-stage-producao',
  pos: 'bg-stage-pos',
};

export function TimeStep() {
  const services = useDraftStore((s) => s.draft.services);
  const setList = useDraftStore((s) => s.setList);
  const hoursPerDay = useProfileStore((s) => s.profile.hoursPerDay);
  const pricing = usePricing();
  const navigate = useNavigate();
  const maxHours = Math.max(1, ...services.map((s) => s.hours));

  const setHours = (id: string, hours: number) => {
    setList('services', (list) => list.map((s) => (s.serviceId === id ? { ...s, hours } : s)));
  };

  if (services.length === 0) {
    return (
      <Panel>
        <EmptyScene
          compact
          title="Nada para cronometrar"
          message="Escolha os serviços na etapa anterior para distribuir o tempo."
          action={{
            label: 'Escolher serviços',
            onPress: () => {
              void navigate('/orcamento?etapa=servicos');
            },
          }}
        />
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        As horas são <strong className="text-foreground">suas</strong>. Tempo de outros
        profissionais entra na cena Equipe. Sua diária considera {formatHours(hoursPerDay)} de
        trabalho.
      </p>
      {STAGES.map((stage) => {
        const items = services.filter((s) => s.stage === stage);
        if (items.length === 0) return null;
        const summary = pricing.stages[stage];
        return (
          <Panel
            key={stage}
            title={
              <span className="flex items-center gap-3">
                <span className={cn('h-5 w-1.5 rounded-full', STAGE_BG[stage])} aria-hidden />
                {STAGE_META[stage].label}
              </span>
            }
            actions={
              <div className="text-right">
                <p className="font-mono text-lg text-foreground tabular">
                  {formatTimecode(summary.hours)}
                </p>
                <p className="text-xs text-muted">
                  {pluralize(summary.days, 'diária', 'diárias')} · {formatMoney(summary.laborCents)}
                </p>
              </div>
            }
          >
            <ul className="flex flex-col divide-y divide-separator">
              {items.map((item) => (
                <li
                  key={item.serviceId}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_11rem_auto]"
                >
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="col-span-2 row-start-2 h-1.5 overflow-hidden rounded-full bg-surface-secondary sm:col-span-1 sm:row-start-auto">
                    <span
                      className={cn(
                        'block h-full rounded-full transition-[width]',
                        STAGE_BG[stage],
                      )}
                      style={{ width: `${(item.hours / maxHours) * 100}%` }}
                    />
                  </span>
                  <QuantityField
                    label={`Horas de ${item.label}`}
                    hideLabel
                    value={item.hours}
                    step={0.5}
                    unit="hour"
                    onChange={(hours) => {
                      setHours(item.serviceId, hours);
                    }}
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={`Remover ${item.label}`}
                    onPress={() => {
                      setList('services', (list) =>
                        list.filter((s) => s.serviceId !== item.serviceId),
                      );
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </Panel>
        );
      })}
    </div>
  );
}
