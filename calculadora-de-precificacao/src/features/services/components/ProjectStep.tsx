import { toast, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import {
  Building2,
  Clapperboard,
  Film,
  Heart,
  type LucideIcon,
  Mic,
  Smartphone,
  Sparkles,
} from 'lucide-react';

import { useDraftStore, type Tier } from '@/features/pricing';
import { TextInput } from '@/shared/components/form/TextInput';
import { Panel } from '@/shared/components/layout/Panel';
import SpotlightCard from '@/shared/components/react-bits/SpotlightCard';
import { cn } from '@/shared/lib/utils';

import { PROJECT_PRESETS, TIER_META } from '../constants/presets';
import { applyPreset, retier } from '../utils/services';

const PRESET_ICONS: Record<string, LucideIcon> = {
  redes: Smartphone,
  institucional: Building2,
  evento: Mic,
  casamento: Heart,
  publicidade: Clapperboard,
  documentario: Film,
};

export function ProjectStep() {
  const draft = useDraftStore((s) => s.draft);
  const update = useDraftStore((s) => s.update);
  const patch = useDraftStore((s) => s.patch);

  const choosePreset = (id: string) => {
    const preset = PROJECT_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    update((d) => applyPreset(d, preset));
    toast.success(`Modelo "${preset.label}" aplicado`, {
      description: `${preset.services.length} serviços com horas típicas. Ajuste tudo nas próximas etapas.`,
    });
  };

  const setTier = (tier: Tier) => {
    update((d) => ({
      ...d,
      project: { ...d.project, tier },
      services: retier(d.services, d.project.tier, tier),
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="modelos" className="flex flex-col gap-3">
        <h2 id="modelos" className="font-slate text-xs text-muted">
          Comece por um modelo
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECT_PRESETS.map((preset) => {
            const Icon = PRESET_ICONS[preset.id] ?? Sparkles;
            const active = draft.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  choosePreset(preset.id);
                }}
                className="group rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <SpotlightCard
                  spotlightColor="rgba(236, 106, 31, 0.12)"
                  className={cn(
                    'h-full p-5 transition-all duration-200 group-hover:-translate-y-0.5',
                    active &&
                      'border-accent shadow-[0_0_0_1px_var(--accent),0_18px_36px_-20px_rgb(236_106_31/0.7)]',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={cn(
                        'grid size-11 place-items-center rounded-full border transition-colors',
                        active
                          ? 'border-transparent bg-accent text-accent-foreground'
                          : 'border-border bg-surface-secondary text-accent',
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="font-slate text-[10px] text-muted">
                      Tier {preset.tier} · {preset.services.length} serviços
                    </span>
                  </div>
                  <p className="mt-4 text-base font-semibold text-foreground">{preset.label}</p>
                  <p className="text-sm text-muted">{preset.tagline}</p>
                </SpotlightCard>
              </button>
            );
          })}
        </div>
      </section>

      <Panel title="Sobre o projeto" description="Isso aparece no cabeçalho da proposta.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Nome do projeto"
            placeholder="Ex.: Vídeo institucional 2026"
            value={draft.project.title}
            onChange={(title) => {
              patch('project', { title });
            }}
            isRequired
          />
          <TextInput
            label="Cliente"
            placeholder="Nome de quem vai receber a proposta"
            value={draft.client.name}
            onChange={(name) => {
              patch('client', { name });
            }}
            isRequired
          />
          <TextInput
            label="Empresa do cliente"
            placeholder="Opcional"
            value={draft.client.company}
            onChange={(company) => {
              patch('client', { company });
            }}
          />
          <TextInput
            label="E-mail do cliente"
            type="email"
            placeholder="Opcional"
            value={draft.client.email}
            onChange={(email) => {
              patch('client', { email });
            }}
          />
          <TextInput
            className="sm:col-span-2"
            label="O que será entregue"
            placeholder="Ex.: 1 vídeo de 2 minutos + 3 cortes verticais para redes"
            value={draft.project.deliverables}
            onChange={(deliverables) => {
              patch('project', { deliverables });
            }}
            multiline
          />
        </div>
      </Panel>

      <Panel
        title="Complexidade"
        description="Define as horas típicas de cada serviço. Horas que você ajustou à mão não mudam."
      >
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[String(draft.project.tier)]}
          onSelectionChange={(keys) => {
            const [key] = [...keys];
            if (key) setTier(Number(key) as Tier);
          }}
          fullWidth
          className="flex-col sm:flex-row"
        >
          {([1, 2, 3] as const).map((tier, i) => (
            <ToggleButton key={tier} id={String(tier)} className="h-auto flex-1 py-3">
              {i > 0 && <ToggleButtonGroup.Separator />}
              <span className="flex flex-col items-start gap-0.5 text-left">
                <span className="font-semibold">
                  Tier {tier} · {TIER_META[tier].label}
                </span>
                <span className="text-xs font-normal text-muted">
                  {TIER_META[tier].description}
                </span>
              </span>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Panel>
    </div>
  );
}
