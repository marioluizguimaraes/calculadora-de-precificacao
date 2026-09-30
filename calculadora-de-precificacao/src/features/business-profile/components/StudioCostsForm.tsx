import { Button, Description, Label, ListBox, Select } from '@heroui/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { CityPicker, StatePicker } from '@/features/location';
import { useProfileStore, type StateRef } from '@/features/pricing';
import { MoneyField } from '@/shared/components/form/MoneyField';
import { QuantityField } from '@/shared/components/form/QuantityField';
import { TextInput } from '@/shared/components/form/TextInput';
import { Panel } from '@/shared/components/layout/Panel';
import { formatHours, formatMoney } from '@/shared/lib/format';
import { createId } from '@/shared/lib/id';

import { TAX_REGIMES } from '../constants/tax-regimes';

/** Custos, jornada e impostos — tudo o que define o valor da sua hora. */
export function StudioCostsForm() {
  const profile = useProfileStore((s) => s.profile);
  const update = useProfileStore((s) => s.update);
  const [baseState, setBaseState] = useState<StateRef | null>(null);

  const fixedTotal = profile.fixedCosts.reduce((acc, c) => acc + c.monthlyCents, 0);
  const monthly = fixedTotal + profile.proLaboreCents;
  const hours = profile.workDaysPerMonth * profile.hoursPerDay;
  const hourly = hours > 0 ? monthly / hours : 0;
  const regime = TAX_REGIMES.find((r) => r.id === profile.taxRegime);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 card-soft p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
        <div>
          <p className="text-sm font-medium text-muted">Sua hora custa</p>
          <p className="font-display text-5xl text-accent tabular">{formatMoney(hourly)}</p>
        </div>
        <p className="rounded-2xl bg-surface-secondary px-4 py-3 font-mono text-xs leading-relaxed text-muted">
          ({formatMoney(fixedTotal)} custos fixos + {formatMoney(profile.proLaboreCents)}{' '}
          pró-labore)
          <br />÷ {formatHours(hours)} produtivas no mês
          <br />
          <span className="text-foreground">
            É o mínimo para manter o estúdio de pé — antes de lucro e impostos.
          </span>
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Custos fixos mensais"
          description="O que você paga todo mês, tendo trabalho ou não."
          actions={
            <span className="font-mono text-sm text-foreground tabular">
              {formatMoney(fixedTotal)}
            </span>
          }
        >
          <ul className="flex flex-col gap-3">
            {profile.fixedCosts.map((cost) => (
              <li key={cost.id} className="grid items-end gap-3 sm:grid-cols-[1fr_10rem_auto]">
                <TextInput
                  label="Descrição"
                  value={cost.label}
                  onChange={(label) => {
                    update({
                      fixedCosts: profile.fixedCosts.map((c) =>
                        c.id === cost.id ? { ...c, label } : c,
                      ),
                    });
                  }}
                />
                <MoneyField
                  label="Por mês"
                  withCents={false}
                  valueCents={cost.monthlyCents}
                  onChange={(monthlyCents) => {
                    update({
                      fixedCosts: profile.fixedCosts.map((c) =>
                        c.id === cost.id ? { ...c, monthlyCents } : c,
                      ),
                    });
                  }}
                />
                <Button
                  isIconOnly
                  variant="ghost"
                  aria-label={`Remover ${cost.label}`}
                  onPress={() => {
                    update({ fixedCosts: profile.fixedCosts.filter((c) => c.id !== cost.id) });
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
          <Button
            size="sm"
            variant="tertiary"
            className="mt-4"
            onPress={() => {
              update({
                fixedCosts: [
                  ...profile.fixedCosts,
                  { id: createId(), label: 'Novo custo', monthlyCents: 0 },
                ],
              });
            }}
          >
            <Plus className="size-3.5" /> Adicionar custo
          </Button>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Pró-labore" description="Quanto você quer tirar por mês como salário.">
            <MoneyField
              label="Pró-labore mensal"
              withCents={false}
              valueCents={profile.proLaboreCents}
              onChange={(proLaboreCents) => {
                update({ proLaboreCents });
              }}
            />
          </Panel>

          <Panel
            title="Jornada"
            description="Horas em que você realmente produz — não conte o tempo de prospecção."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <QuantityField
                label="Dias por mês"
                unit="day"
                minValue={1}
                maxValue={31}
                value={profile.workDaysPerMonth}
                onChange={(workDaysPerMonth) => {
                  update({ workDaysPerMonth });
                }}
              />
              <QuantityField
                label="Horas por dia"
                unit="hour"
                minValue={1}
                maxValue={16}
                value={profile.hoursPerDay}
                onChange={(hoursPerDay) => {
                  update({ hoursPerDay });
                }}
              />
              <QuantityField
                label="Uso do kit por ano"
                unit="day"
                minValue={1}
                maxValue={365}
                value={profile.equipmentUseDaysPerYear}
                onChange={(equipmentUseDaysPerYear) => {
                  update({ equipmentUseDaysPerYear });
                }}
                description="Base da depreciação"
              />
            </div>
          </Panel>
        </div>

        <Panel
          title="Impostos e margem padrão"
          description="Valores sugeridos em cada novo orçamento."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              value={profile.taxRegime}
              onChange={(key) => {
                const next = TAX_REGIMES.find((r) => r.id === key);
                if (next) update({ taxRegime: next.id, taxRatePct: next.suggestedRatePct });
              }}
              fullWidth
            >
              <Label>Regime tributário</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              {regime && <Description>{regime.hint}</Description>}
              <Select.Popover>
                <ListBox items={TAX_REGIMES}>
                  {(r) => (
                    <ListBox.Item id={r.id} textValue={r.label}>
                      <Label>{r.label}</Label>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  )}
                </ListBox>
              </Select.Popover>
            </Select>
            <QuantityField
              label="Alíquota efetiva"
              unit="percent"
              step={0.5}
              maxValue={60}
              value={profile.taxRatePct}
              onChange={(taxRatePct) => {
                update({ taxRatePct });
              }}
            />
            <QuantityField
              label="Taxa de pagamento"
              unit="percent"
              step={0.5}
              maxValue={30}
              value={profile.paymentFeePct}
              onChange={(paymentFeePct) => {
                update({ paymentFeePct });
              }}
            />
            <QuantityField
              label="Lucro padrão"
              unit="percent"
              maxValue={60}
              value={profile.defaultProfitPct}
              onChange={(defaultProfitPct) => {
                update({ defaultProfitPct });
              }}
              description="Mercado: 20–30%"
            />
          </div>
        </Panel>

        <Panel
          title="Sua base"
          description="De onde você sai para gravar — usada no cálculo de deslocamento."
        >
          {profile.baseCity ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-foreground">
                {profile.baseCity.name}
                <span className="font-normal text-muted">/{profile.baseCity.uf}</span>
              </p>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => {
                  update({ baseCity: null });
                }}
              >
                Trocar
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <StatePicker value={baseState} onChange={setBaseState} />
              <CityPicker
                uf={baseState?.uf ?? null}
                value={null}
                onChange={(city) => {
                  if (city) update({ baseCity: city });
                }}
              />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
