import { Label, ListBox, Select } from '@heroui/react';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';

import type { Tier } from '@/features/pricing';
import { TIER_META } from '@/features/services';
import { cn } from '@/shared/lib/utils';

import { QUICK_SEARCHES, SORT_OPTIONS, UFS } from '../constants';
import type { ListingSearch, ListingSort } from '../types';
import { normalizeText } from '../utils/search';

const ALL = 'todos';

interface FilterProps {
  value: ListingSearch;
  onChange: (patch: Partial<ListingSearch>) => void;
}

/** Busca grande, em pílula — a porta de entrada da vitrine. */
export function ListingSearchBar({ value, onChange }: FilterProps) {
  return (
    <div className="group relative">
      <label
        htmlFor="busca-servicos"
        className="flex h-16 items-center gap-3 rounded-full border border-border bg-surface pr-2 pl-6 shadow-[0_20px_40px_-24px_rgb(92_58_30/0.45)] transition-all focus-within:border-accent/50 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_18%,transparent),0_20px_40px_-24px_rgb(92_58_30/0.45)]"
      >
        <Search className="size-5 shrink-0 text-accent" aria-hidden />
        <span className="sr-only">Buscar serviço</span>
        <input
          id="busca-servicos"
          type="search"
          value={value.q}
          onChange={(e) => {
            onChange({ q: e.target.value });
          }}
          placeholder="Casamento, drone, reels, institucional…"
          className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-field-placeholder [&::-webkit-search-cancel-button]:hidden"
        />
        {value.q && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => {
              onChange({ q: '' });
            }}
            className="grid size-9 place-items-center rounded-full text-muted outline-none hover:bg-surface-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X className="size-4" />
          </button>
        )}
        <span className="hidden h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_20px_-10px_rgb(236_106_31/0.9)] sm:flex">
          Buscar
        </span>
      </label>
    </div>
  );
}

/** Atalhos: um toque preenche a busca (e outro toque limpa). */
export function QuickSearches({ value, onChange }: FilterProps) {
  const current = normalizeText(value.q);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted">Populares:</span>
      {QUICK_SEARCHES.map((term) => {
        const active = current === normalizeText(term);
        return (
          <motion.button
            key={term}
            type="button"
            aria-pressed={active}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onChange({ q: active ? '' : term });
            }}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus',
              active
                ? 'border-transparent bg-accent text-accent-foreground shadow-[0_10px_20px_-12px_rgb(236_106_31/0.9)]'
                : 'border-border bg-surface text-foreground hover:border-accent/40',
            )}
          >
            {term}
          </motion.button>
        );
      })}
    </div>
  );
}

const TIER_OPTIONS: { id: Tier | null; label: string }[] = [
  { id: null, label: 'Todas' },
  ...([1, 2, 3] as const).map((tier) => ({ id: tier, label: TIER_META[tier].label })),
];

const UF_OPTIONS = [
  { id: ALL, label: 'Todo o Brasil' },
  ...UFS.map((uf) => ({ id: uf, label: uf })),
];

function CompactSelect({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select
      aria-label={label}
      value={value}
      onChange={(key) => {
        if (key !== null) onChange(String(key));
      }}
      className={className}
    >
      <Select.Trigger className="rounded-full">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox items={options}>
          {(option) => (
            <ListBox.Item id={option.id} textValue={option.label}>
              <Label>{option.label}</Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

/** Complexidade em botões segmentados (com pílula deslizante) + estado e ordem. */
export function ListingFilterBar({ value, onChange }: FilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="radiogroup"
        aria-label="Complexidade"
        className="flex gap-1 rounded-full border border-border bg-surface p-1 shadow-[var(--surface-shadow)]"
      >
        {TIER_OPTIONS.map((option) => {
          const active = value.tier === option.id;
          return (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                onChange({ tier: option.id });
              }}
              className={cn(
                'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus',
                active ? 'text-accent-foreground' : 'text-muted hover:text-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="tier-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-accent shadow-[0_8px_16px_-8px_rgb(236_106_31/0.9)]"
                />
              )}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <CompactSelect
          label="Estado"
          className="w-40"
          value={value.uf ?? ALL}
          options={UF_OPTIONS}
          onChange={(id) => {
            onChange({ uf: id === ALL ? null : id });
          }}
        />
        <CompactSelect
          label="Ordenar por"
          className="w-44"
          value={value.sort}
          options={SORT_OPTIONS}
          onChange={(id) => {
            onChange({ sort: id as ListingSort });
          }}
        />
      </div>
    </div>
  );
}
