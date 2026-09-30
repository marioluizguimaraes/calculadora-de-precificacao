import { Button, Spinner } from '@heroui/react';
import { Building2, MapPinned, Navigation, RotateCcw, Waypoints } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  useDraftStore,
  useProfileStore,
  type LocationScope,
  type StateRef,
} from '@/features/pricing';
import { ChoiceCards } from '@/shared/components/form/ChoiceCards';
import { QuantityField } from '@/shared/components/form/QuantityField';
import { Panel } from '@/shared/components/layout/Panel';
import { formatNumber } from '@/shared/lib/format';

import { useDistance } from '../hooks/useDistance';

import { CityPicker, RegionPicker, StatePicker } from './PlacePickers';

const SCOPES = [
  {
    value: 'cidade' as const,
    title: 'Numa cidade específica',
    description: 'Você sabe onde vai gravar. Calculamos a rota real até lá.',
    icon: <MapPinned className="size-5" />,
  },
  {
    value: 'regional' as const,
    title: 'Numa região',
    description: 'Atende um polo regional e as cidades ao redor.',
    icon: <Waypoints className="size-5" />,
  },
  {
    value: 'estadual' as const,
    title: 'Pelo estado todo',
    description: 'Pode ser em qualquer cidade do estado.',
    icon: <Navigation className="size-5" />,
  },
];

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`;
}

export function LocationStep() {
  const location = useDraftStore((s) => s.draft.location);
  const patch = useDraftStore((s) => s.patch);
  const baseCity = useProfileStore((s) => s.profile.baseCity);
  const updateProfile = useProfileStore((s) => s.update);
  const [baseState, setBaseState] = useState<StateRef | null>(null);

  const estimate = useDistance(location, baseCity);
  const isManual = location.distanceSource === 'manual';

  // Mantém a distância do rascunho sincronizada com o cálculo automático.
  useEffect(() => {
    if (isManual || estimate.isLoading) return;
    if (estimate.km !== location.distanceKm || estimate.source !== location.distanceSource) {
      patch('location', { distanceKm: estimate.km, distanceSource: estimate.source });
    }
  }, [estimate.km, estimate.source, estimate.isLoading, isManual, location, patch]);

  const setScope = (scope: LocationScope) => {
    patch('location', { scope, city: null, region: null, distanceSource: null });
  };

  return (
    <div className="flex flex-col gap-6">
      <ChoiceCards
        label="Área de atuação"
        value={location.scope}
        onChange={setScope}
        choices={SCOPES}
      />

      <Panel
        title={
          location.scope === 'cidade'
            ? 'Qual cidade?'
            : location.scope === 'regional'
              ? 'Qual região?'
              : 'Qual estado?'
        }
        description="Estados, regiões e municípios vêm da base oficial do IBGE."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <StatePicker
            value={location.state}
            onChange={(state) => {
              patch('location', {
                state,
                city: null,
                region: null,
                distanceSource: isManual ? 'manual' : null,
              });
            }}
          />
          {location.scope === 'cidade' && (
            <CityPicker
              uf={location.state?.uf ?? null}
              value={location.city}
              onChange={(city) => {
                patch('location', { city });
              }}
            />
          )}
          {location.scope === 'regional' && (
            <RegionPicker
              uf={location.state?.uf ?? null}
              value={location.region}
              onChange={(region) => {
                patch('location', { region });
              }}
            />
          )}
        </div>
      </Panel>

      <Panel
        title="Distância da sua base"
        description="Base para o custo de deslocamento (ida e volta entram na logística)."
      >
        {!baseCity ? (
          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-2 text-sm text-muted">
              <Building2 className="size-4" /> De onde você sai? Informe uma vez, fica salvo no seu
              estúdio.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatePicker label="Estado da sua base" value={baseState} onChange={setBaseState} />
              <CityPicker
                label="Cidade da sua base"
                uf={baseState?.uf ?? null}
                value={null}
                onChange={(city) => {
                  if (city) updateProfile({ baseCity: city });
                }}
              />
            </div>
          </div>
        ) : (
          <div className="grid items-end gap-6 sm:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-2">
              <p className="font-slate text-[11px] text-muted">
                {baseCity.name}/{baseCity.uf} →{' '}
                {location.city?.name ??
                  (location.region ? `Região de ${location.region.name}` : location.state?.name) ??
                  '—'}
              </p>
              <div className="flex items-baseline gap-3">
                {estimate.isLoading && !isManual ? (
                  <Spinner size="sm" />
                ) : (
                  <span className="font-display text-5xl text-foreground tabular">
                    {location.distanceKm === null ? '—' : formatNumber(location.distanceKm)}
                  </span>
                )}
                <span className="text-lg text-muted">km de ida</span>
              </div>
              <p className="text-sm text-muted">
                {isManual
                  ? 'Distância informada por você.'
                  : (estimate.detail ?? 'Escolha o local para calcular.')}
                {!isManual && estimate.durationMin !== null && (
                  <> · cerca de {formatDuration(estimate.durationMin)} de estrada</>
                )}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onPress={() => {
                  updateProfile({ baseCity: null });
                }}
              >
                Mudar cidade base
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:w-56">
              <QuantityField
                label="Ajustar distância"
                value={location.distanceKm ?? 0}
                unit="kilometer"
                step={1}
                onChange={(km) => {
                  patch('location', { distanceKm: km, distanceSource: 'manual' });
                }}
              />
              {isManual && (
                <Button
                  variant="tertiary"
                  size="sm"
                  onPress={() => {
                    patch('location', { distanceSource: null });
                  }}
                >
                  <RotateCcw className="size-4" /> Usar cálculo automático
                </Button>
              )}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
