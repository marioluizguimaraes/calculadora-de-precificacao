import { Chip, Label, Slider, ToggleButton, ToggleButtonGroup } from '@heroui/react';

import { QuantityField } from '@/shared/components/form/QuantityField';
import { Panel } from '@/shared/components/layout/Panel';
import { formatMoney, formatNumber } from '@/shared/lib/format';

import { usePricing } from '../hooks/usePricing';
import { useDraftStore } from '../store/draft-store';
import { profitStatus } from '../constants/meta';
import type { PricingOptions } from '../types';

import { AnimatedPrice } from './PriceMonitor';

const ROUNDING: { value: PricingOptions['roundToReais']; label: string }[] = [
  { value: 0, label: 'Exato' },
  { value: 10, label: 'R$ 10' },
  { value: 50, label: 'R$ 50' },
  { value: 100, label: 'R$ 100' },
];

export function MarginStep() {
  const pricing = useDraftStore((s) => s.draft.pricing);
  const patch = useDraftStore((s) => s.patch);
  const result = usePricing();
  const set = (value: Partial<PricingOptions>) => {
    patch('pricing', value);
  };
  const variablePct = pricing.taxRatePct + pricing.paymentFeePct + pricing.commissionPct;
  const status = profitStatus(pricing.profitPct);

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <Slider
            value={pricing.profitPct}
            onChange={(value) => {
              set({ profitPct: Array.isArray(value) ? (value[0] ?? 0) : value });
            }}
            minValue={0}
            maxValue={60}
            step={1}
            formatOptions={{ style: 'unit', unit: 'percent' }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <Label className="text-lg font-semibold text-foreground">Margem de lucro</Label>
              <Slider.Output className="font-display text-3xl text-accent tabular" />
            </div>
            <Slider.Track className="mt-4">
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>0%</span>
              <span>Referência 20–30%</span>
              <span>60%</span>
            </div>
          </Slider>
          <Chip color={status.color} variant="soft" className="self-start md:self-end">
            {status.label}
          </Chip>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-soft p-6">
          <p className="text-sm text-muted">Preço mínimo</p>
          <p className="mt-3 font-display text-3xl text-foreground tabular">
            {formatMoney(result.minimumPriceCents)}
          </p>
          <p className="mt-2 text-sm text-muted">
            Cobre todos os custos e impostos, com lucro zero. Abaixo disso, você paga para
            trabalhar.
          </p>
        </div>
        <div className="card-soft border-accent! bg-[radial-gradient(120%_90%_at_100%_0%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_65%),var(--surface)] p-6 shadow-[0_0_0_1px_var(--accent)]">
          <p className="text-sm font-semibold text-accent">Preço sugerido</p>
          <AnimatedPrice
            cents={result.suggestedPriceCents}
            className="mt-3 font-display text-4xl text-foreground"
          />
          <p className="mt-2 text-sm text-muted">
            Lucro de {formatMoney(result.profitCents)} · margem de contribuição{' '}
            {formatMoney(result.contributionMarginCents)}
          </p>
        </div>
      </div>

      <Panel
        title="Impostos e taxas"
        description="Percentuais sobre o valor da nota. Vêm do seu estúdio e podem mudar só neste orçamento."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <QuantityField
            label="Imposto"
            unit="percent"
            step={0.5}
            maxValue={60}
            value={pricing.taxRatePct}
            onChange={(taxRatePct) => {
              set({ taxRatePct });
            }}
          />
          <QuantityField
            label="Taxa de pagamento"
            description="Cartão, boleto ou plataforma"
            unit="percent"
            step={0.5}
            maxValue={30}
            value={pricing.paymentFeePct}
            onChange={(paymentFeePct) => {
              set({ paymentFeePct });
            }}
          />
          <QuantityField
            label="Comissão"
            description="Indicação, agência ou parceiro"
            unit="percent"
            step={0.5}
            maxValue={50}
            value={pricing.commissionPct}
            onChange={(commissionPct) => {
              set({ commissionPct });
            }}
          />
        </div>
        <p className="mt-5 rounded-2xl bg-surface-secondary px-4 py-3 font-mono text-xs leading-relaxed text-muted">
          markup = 100 ÷ [100 − ({formatNumber(variablePct)}% despesas variáveis +{' '}
          {formatNumber(pricing.profitPct)}% lucro)] ={' '}
          <span className="text-foreground">{result.markup.toFixed(3).replace('.', ',')}</span>
          <br />
          preço = custo direto {formatMoney(result.directCostCents)} × markup
        </p>
      </Panel>

      <Panel
        title="Arredondamento"
        description="Arredonda o preço para cima. A diferença vira lucro."
      >
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[String(pricing.roundToReais)]}
          onSelectionChange={(keys) => {
            const [key] = [...keys];
            if (key !== undefined) {
              set({ roundToReais: Number(key) as PricingOptions['roundToReais'] });
            }
          }}
        >
          {ROUNDING.map((r, i) => (
            <ToggleButton key={r.value} id={String(r.value)}>
              {i > 0 && <ToggleButtonGroup.Separator />}
              {r.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Panel>
    </div>
  );
}
