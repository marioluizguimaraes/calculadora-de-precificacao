import { Button } from '@heroui/react';
import { BedDouble, Car, Plus, Receipt, Ticket, Trash2, UtensilsCrossed } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { useDraftStore, usePricing, type LogisticsCosts } from '@/features/pricing';
import { ChoiceCards } from '@/shared/components/form/ChoiceCards';
import { MoneyField } from '@/shared/components/form/MoneyField';
import { QuantityField } from '@/shared/components/form/QuantityField';
import { SwitchField } from '@/shared/components/form/SwitchField';
import { TextInput } from '@/shared/components/form/TextInput';
import { Panel } from '@/shared/components/layout/Panel';
import { formatMoney, formatNumber, pluralize } from '@/shared/lib/format';
import { createId } from '@/shared/lib/id';

function Subtotal({ cents, children }: { cents: number; children: ReactNode }) {
  return (
    <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-4">
      <span className="text-sm text-muted">{children}</span>
      <span className="font-mono text-foreground tabular">{formatMoney(cents)}</span>
    </div>
  );
}

export function LogisticsStep() {
  const logistics = useDraftStore((s) => s.draft.logistics);
  const location = useDraftStore((s) => s.draft.location);
  const patch = useDraftStore((s) => s.patch);
  const pricing = usePricing();
  const set = (value: Partial<LogisticsCosts>) => {
    patch('logistics', value);
  };
  const p = pricing.logistics;
  const ownVehicle = logistics.transportMode === 'proprio';

  return (
    <div className="grid items-start gap-5 xl:grid-cols-2">
      {/* Duas colunas independentes: cada uma empilha seus cartões, sem forçar alturas iguais */}
      <div className="flex flex-col gap-5">
        <Panel
          title={
            <span className="flex items-center gap-2">
              <Car className="size-4 text-muted" /> Deslocamento
            </span>
          }
          description={
            !ownVehicle ? (
              'Valor fechado por viagem — a distância não entra na conta.'
            ) : location.distanceKm === null ? (
              <>
                Sem distância definida.{' '}
                <Link to="?etapa=local" className="text-accent underline-offset-2 hover:underline">
                  Escolher o local
                </Link>
              </>
            ) : (
              `${formatNumber(location.distanceKm)} km de ida · ida e volta em cada viagem`
            )
          }
        >
          <ChoiceCards
            label="Como a equipe chega ao set"
            hideLabel
            columns={2}
            className="mb-5"
            value={logistics.transportMode}
            onChange={(transportMode) => {
              set({ transportMode });
            }}
            choices={[
              {
                value: 'proprio',
                title: 'Veículo próprio',
                description: 'Combustível pela distância + pedágios',
                icon: <Car className="size-5" />,
              },
              {
                value: 'fixo',
                title: 'Valor fixo',
                description: 'Uber, táxi, ônibus, passagem…',
                icon: <Ticket className="size-5" />,
              },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {ownVehicle ? (
              <>
                <MoneyField
                  label="Preço do litro"
                  valueCents={logistics.fuelPricePerLiterCents}
                  onChange={(fuelPricePerLiterCents) => {
                    set({ fuelPricePerLiterCents });
                  }}
                />
                <QuantityField
                  label="Consumo (km por litro)"
                  value={logistics.kmPerLiter}
                  minValue={1}
                  step={0.5}
                  onChange={(kmPerLiter) => {
                    set({ kmPerLiter });
                  }}
                />
                <MoneyField
                  label="Pedágios por viagem"
                  description="Soma de ida e volta"
                  valueCents={logistics.tollsPerTripCents}
                  onChange={(tollsPerTripCents) => {
                    set({ tollsPerTripCents });
                  }}
                />
              </>
            ) : (
              <>
                <MoneyField
                  label={
                    logistics.farePerPerson ? 'Valor por pessoa, por viagem' : 'Valor por viagem'
                  }
                  description="Ida e volta somadas"
                  valueCents={logistics.fareCents}
                  onChange={(fareCents) => {
                    set({ fareCents });
                  }}
                />
                <SwitchField
                  className="self-center"
                  label="Cobrado por pessoa"
                  isSelected={logistics.farePerPerson}
                  onChange={(farePerPerson) => {
                    set({ farePerPerson });
                  }}
                  description={
                    logistics.farePerPerson
                      ? `Passagem: multiplica por ${pluralize(pricing.peopleOnSet, 'pessoa', 'pessoas')} no set`
                      : 'Corrida: um valor para a equipe toda'
                  }
                />
              </>
            )}
            <div className="flex flex-col gap-3 rounded-2xl border border-border p-3 sm:col-span-2">
              <SwitchField
                label="Viagens automáticas"
                isSelected={logistics.tripsCount === null}
                onChange={(auto) => {
                  set({ tripsCount: auto ? null : pricing.trips });
                }}
                description={
                  logistics.tripsCount === null
                    ? `${pluralize(pricing.trips, 'viagem', 'viagens')} (${logistics.lodgingNights > 0 ? 'com hospedagem' : 'uma por diária'})`
                    : 'Informe abaixo'
                }
              />
              {logistics.tripsCount !== null && (
                <QuantityField
                  label="Viagens"
                  value={logistics.tripsCount}
                  onChange={(tripsCount) => {
                    set({ tripsCount: Math.round(tripsCount) });
                  }}
                />
              )}
            </div>
          </div>
          {ownVehicle ? (
            <Subtotal cents={p.fuelCents + p.tollsCents}>Combustível + pedágios</Subtotal>
          ) : (
            <Subtotal cents={p.fareCents}>
              {formatMoney(logistics.fareCents)} × {pluralize(pricing.trips, 'viagem', 'viagens')}
              {logistics.farePerPerson &&
                ` × ${pluralize(pricing.peopleOnSet, 'pessoa', 'pessoas')}`}
            </Subtotal>
          )}
        </Panel>
        {/* Resumo da logística: fecha a coluna do deslocamento e mostra cada bloco */}
        <section aria-label="Logística total" className="flex flex-col gap-3 card-ink px-6 py-5">
          <ul className="flex flex-col gap-2 text-sm">
            {[
              [
                ownVehicle ? 'Combustível + pedágios' : 'Transporte',
                ownVehicle ? p.fuelCents + p.tollsCents : p.fareCents,
              ],
              ['Alimentação', p.mealsCents],
              ['Hospedagem', p.lodgingCents],
              [
                'Custos do projeto',
                p.insuranceCents + p.venueCents + p.licensesCents + p.extrasCents,
              ],
            ].map(([label, cents]) => (
              <li key={label} className="flex items-baseline justify-between gap-3">
                <span className="text-ink-muted">{label}</span>
                <span className="text-ink-foreground tabular">{formatMoney(Number(cents))}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between gap-3 border-t border-ink-foreground/15 pt-3">
            <span className="text-sm font-medium text-ink-muted">Logística total</span>
            <span className="font-display text-2xl text-ink-foreground tabular">
              {formatMoney(p.totalCents)}
            </span>
          </div>
        </section>
      </div>
      <div className="flex flex-col gap-5">
        <Panel
          title={
            <span className="flex items-center gap-2">
              <UtensilsCrossed className="size-4 text-muted" /> Alimentação
            </span>
          }
          description={`${pluralize(pricing.peopleOnSet, 'pessoa', 'pessoas')} no set × ${pluralize(pricing.captureDays, 'diária', 'diárias')} de gravação`}
        >
          <MoneyField
            label="Por pessoa, por diária"
            valueCents={logistics.mealPerPersonDayCents}
            onChange={(mealPerPersonDayCents) => {
              set({ mealPerPersonDayCents });
            }}
          />
          <Subtotal cents={p.mealsCents}>Alimentação da equipe</Subtotal>
        </Panel>

        <Panel
          title={
            <span className="flex items-center gap-2">
              <BedDouble className="size-4 text-muted" /> Hospedagem
            </span>
          }
          description={
            (location.distanceKm ?? 0) > 200
              ? 'Mais de 200 km: considere dormir na cidade e fazer uma viagem só.'
              : 'Só se a equipe precisar dormir fora.'
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <QuantityField
              label="Noites"
              value={logistics.lodgingNights}
              onChange={(lodgingNights) => {
                set({ lodgingNights: Math.round(lodgingNights) });
              }}
            />
            <MoneyField
              label="Por pessoa, por noite"
              valueCents={logistics.lodgingPerNightCents}
              onChange={(lodgingPerNightCents) => {
                set({ lodgingPerNightCents });
              }}
            />
          </div>
          <Subtotal cents={p.lodgingCents}>Hospedagem</Subtotal>
        </Panel>

        <Panel
          title={
            <span className="flex items-center gap-2">
              <Receipt className="size-4 text-muted" /> Custos do projeto
            </span>
          }
          description="Gastos que existem só por causa deste trabalho."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <MoneyField
              label="Seguro da produção"
              valueCents={logistics.insuranceCents}
              onChange={(insuranceCents) => {
                set({ insuranceCents });
              }}
            />
            <MoneyField
              label="Locação de espaço"
              valueCents={logistics.venueCents}
              onChange={(venueCents) => {
                set({ venueCents });
              }}
            />
            <MoneyField
              label="Trilhas e bancos de imagem"
              valueCents={logistics.licensesCents}
              onChange={(licensesCents) => {
                set({ licensesCents });
              }}
            />
          </div>
          {logistics.extras.length > 0 && (
            <ul className="mt-4 flex flex-col gap-3">
              {logistics.extras.map((extra) => (
                <li key={extra.id} className="grid items-end gap-3 sm:grid-cols-[1fr_11rem_auto]">
                  <TextInput
                    label="Descrição"
                    value={extra.label}
                    onChange={(label) => {
                      set({
                        extras: logistics.extras.map((e) =>
                          e.id === extra.id ? { ...e, label } : e,
                        ),
                      });
                    }}
                  />
                  <MoneyField
                    label="Valor"
                    valueCents={extra.cents}
                    onChange={(cents) => {
                      set({
                        extras: logistics.extras.map((e) =>
                          e.id === extra.id ? { ...e, cents } : e,
                        ),
                      });
                    }}
                  />
                  <Button
                    isIconOnly
                    variant="ghost"
                    aria-label={`Remover ${extra.label}`}
                    onPress={() => {
                      set({ extras: logistics.extras.filter((e) => e.id !== extra.id) });
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Button
            size="sm"
            variant="tertiary"
            className="mt-4"
            onPress={() => {
              set({
                extras: [...logistics.extras, { id: createId(), label: 'Outro custo', cents: 0 }],
              });
            }}
          >
            <Plus className="size-3.5" /> Outro custo
          </Button>
          <Subtotal cents={p.insuranceCents + p.venueCents + p.licensesCents + p.extrasCents}>
            Custos do projeto
          </Subtotal>
        </Panel>
      </div>
    </div>
  );
}
