import { Button } from '@heroui/react';
import { Check, Plus } from 'lucide-react';
import { ToggleButton } from 'react-aria-components';

import { STAGE_META, STAGES, useDraftStore, type Stage } from '@/features/pricing';
import { formatHours } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';

import { SERVICE_CATALOG } from '../constants/catalog';
import { toSelected } from '../utils/services';

const STAGE_BG: Record<Stage, string> = {
  pre: 'bg-stage-pre',
  producao: 'bg-stage-producao',
  pos: 'bg-stage-pos',
};

export function ServicesStep() {
  const services = useDraftStore((s) => s.draft.services);
  const tier = useDraftStore((s) => s.draft.project.tier);
  const setList = useDraftStore((s) => s.setList);
  const selected = new Set(services.map((s) => s.serviceId));

  const toggle = (id: string, on: boolean) => {
    const def = SERVICE_CATALOG.find((s) => s.id === id);
    if (!def) return;
    setList('services', (list) =>
      on ? [...list, toSelected(def, tier)] : list.filter((s) => s.serviceId !== id),
    );
  };

  const setStage = (stage: Stage, on: boolean) => {
    setList('services', (list) => {
      const others = list.filter((s) => s.stage !== stage);
      if (!on) return others;
      const current = list.filter((s) => s.stage === stage);
      const missing = SERVICE_CATALOG.filter(
        (d) => d.stage === stage && !current.some((s) => s.serviceId === d.id),
      ).map((d) => toSelected(d, tier));
      return [...others, ...current, ...missing];
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {STAGES.map((stage) => {
        const defs = SERVICE_CATALOG.filter((d) => d.stage === stage);
        const count = defs.filter((d) => selected.has(d.id)).length;
        const all = count === defs.length;
        return (
          <section key={stage} aria-labelledby={`etapa-${stage}`} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={cn('h-6 w-1.5 rounded-full', STAGE_BG[stage])} aria-hidden />
                <h2 id={`etapa-${stage}`} className="text-lg font-semibold text-foreground">
                  {STAGE_META[stage].label}
                </h2>
                <span className="font-slate text-[11px] text-muted">
                  {count}/{defs.length}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => {
                  setStage(stage, !all);
                }}
              >
                {all ? 'Limpar etapa' : 'Marcar todos'}
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {defs.map((def) => {
                const isOn = selected.has(def.id);
                return (
                  <ToggleButton
                    key={def.id}
                    isSelected={isOn}
                    onChange={(on) => {
                      toggle(def.id, on);
                    }}
                    className={({ isFocusVisible, isHovered }) =>
                      cn(
                        'relative flex items-start gap-3 overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-150 outline-none',
                        isOn
                          ? 'border-accent/50 bg-accent/8 shadow-[0_10px_24px_-18px_rgb(236_106_31/0.8)]'
                          : 'border-border bg-surface',
                        isHovered && !isOn && 'border-accent/30',
                        isFocusVisible && 'ring-2 ring-focus ring-offset-2 ring-offset-background',
                      )
                    }
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-y-0 left-0 w-1 transition-opacity',
                        STAGE_BG[stage],
                        isOn ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
                        isOn
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border-tertiary text-muted',
                      )}
                    >
                      {isOn ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">{def.label}</span>
                      <span className="text-xs leading-snug text-muted">{def.description}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-muted tabular">
                      {formatHours(def.hours[tier])}
                    </span>
                  </ToggleButton>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
