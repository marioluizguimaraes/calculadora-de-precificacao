import { Button, Label, ListBox, Select, Switch, toast } from '@heroui/react';
import {
  Aperture,
  Camera,
  Cpu,
  Lightbulb,
  type LucideIcon,
  Mic,
  Package,
  Plane,
  Plus,
  SlidersHorizontal,
  Trash2,
  Move3d,
} from 'lucide-react';
import { useState } from 'react';

import {
  STAGE_META,
  useDraftStore,
  usePricing,
  useProfileStore,
  type EquipmentCategory,
  type KitItem,
  type QuoteEquipment,
} from '@/features/pricing';
import { MoneyField } from '@/shared/components/form/MoneyField';
import { QuantityField } from '@/shared/components/form/QuantityField';
import { TextInput } from '@/shared/components/form/TextInput';
import { Panel } from '@/shared/components/layout/Panel';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/shared/components/ui/item';
import { formatMoney, pluralize } from '@/shared/lib/format';
import { createId } from '@/shared/lib/id';

import { CATEGORY_META, KIT_SUGGESTIONS, type KitSuggestion } from '../constants/kit';

const CATEGORY_ICONS: Record<EquipmentCategory, LucideIcon> = {
  camera: Camera,
  lente: Aperture,
  luz: Lightbulb,
  audio: Mic,
  suporte: Move3d,
  drone: Plane,
  computador: Cpu,
  outro: Package,
};

function fromKit(item: KitItem): QuoteEquipment {
  return {
    id: createId(),
    name: item.name,
    category: item.category,
    stage: CATEGORY_META[item.category].stage,
    kind: 'owned',
    kitId: item.id,
    purchaseCents: item.purchaseCents,
    resaleCents: item.resaleCents,
    lifespanYears: item.lifespanYears,
    dailyRentCents: 0,
    days: null,
  };
}

function kitFromSuggestion(s: KitSuggestion): KitItem {
  return {
    id: createId(),
    name: s.name,
    category: s.category,
    purchaseCents: s.purchaseCents,
    resaleCents: Math.round((s.purchaseCents * s.resalePct) / 100),
    lifespanYears: s.lifespanYears,
  };
}

function rentalFromSuggestion(s: KitSuggestion | null): QuoteEquipment {
  return {
    id: createId(),
    name: s?.name ?? 'Equipamento alugado',
    category: s?.category ?? 'outro',
    stage: 'producao',
    kind: 'rented',
    kitId: null,
    purchaseCents: 0,
    resaleCents: 0,
    lifespanYears: 0,
    dailyRentCents: s?.dailyRentCents ?? 10000,
    days: null,
  };
}

function CategorySelect({
  value,
  onChange,
}: {
  value: EquipmentCategory;
  onChange: (value: EquipmentCategory) => void;
}) {
  const options = Object.entries(CATEGORY_META) as [EquipmentCategory, { label: string }][];
  return (
    <Select
      value={value}
      onChange={(key) => {
        if (key) onChange(key as EquipmentCategory);
      }}
      fullWidth
    >
      <Label>Categoria</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map(([id, meta]) => (
            <ListBox.Item key={id} id={id} textValue={meta.label}>
              <Label>{meta.label}</Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

export function EquipmentStep() {
  const kit = useProfileStore((s) => s.profile.kit);
  const useDays = useProfileStore((s) => s.profile.equipmentUseDaysPerYear);
  const updateProfile = useProfileStore((s) => s.update);
  const equipment = useDraftStore((s) => s.draft.equipment);
  const setList = useDraftStore((s) => s.setList);
  const pricing = usePricing();
  const [editing, setEditing] = useState<string | null>(null);

  const costOf = (id: string) => pricing.equipmentItems.find((i) => i.id === id)?.cents ?? 0;
  const inQuote = (kitId: string) => equipment.find((e) => e.kitId === kitId);
  const rentals = equipment.filter((e) => e.kind === 'rented');
  const kitNames = new Set(kit.map((k) => k.name));

  const saveKit = (next: KitItem[]) => {
    updateProfile({ kit: next });
  };

  const updateKitItem = (id: string, patch: Partial<KitItem>) => {
    saveKit(kit.map((k) => (k.id === id ? { ...k, ...patch } : k)));
    // Mantém a cópia do orçamento alinhada com o cadastro do kit.
    setList('equipment', (list) =>
      list.map((e) =>
        e.kitId === id
          ? {
              ...e,
              ...patch,
              id: e.id,
              stage: patch.category ? CATEGORY_META[patch.category].stage : e.stage,
            }
          : e,
      ),
    );
  };

  const addToKit = (item: KitItem, edit = false) => {
    saveKit([...kit, item]);
    setList('equipment', (list) => [...list, fromKit(item)]);
    if (edit) setEditing(item.id);
  };

  const toggleKitItem = (item: KitItem, on: boolean) => {
    setList('equipment', (list) =>
      on ? [...list, fromKit(item)] : list.filter((e) => e.kitId !== item.id),
    );
  };

  // Tira do kit permanente e de todos os lugares deste orçamento que usavam o item.
  const removeFromKit = (item: KitItem) => {
    saveKit(kit.filter((x) => x.id !== item.id));
    setList('equipment', (list) => list.filter((e) => e.kitId !== item.id));
    if (editing === item.id) setEditing(null);
    toast(`${item.name} saiu do kit`);
  };

  const setDays = (id: string, days: number | null) => {
    setList('equipment', (list) => list.map((e) => (e.id === id ? { ...e, days } : e)));
  };

  const dailyDepreciation = (k: KitItem) =>
    k.lifespanYears > 0 && useDays > 0
      ? Math.max(0, k.purchaseCents - k.resaleCents) / k.lifespanYears / useDays
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Seu kit"
        description={`Cadastre uma vez e reaproveite. O custo é a depreciação: (compra − revenda) ÷ vida útil ÷ ${useDays} dias de uso por ano.`}
      >
        {kit.length === 0 ? (
          <p className="mb-4 text-sm text-muted">
            Seu kit está vazio. Toque nas sugestões abaixo para montar em segundos.
          </p>
        ) : (
          <ItemGroup className="mb-5 gap-2">
            {kit.map((k) => {
              const Icon = CATEGORY_ICONS[k.category];
              const quoteItem = inQuote(k.id);
              const isEditing = editing === k.id;
              return (
                <Item
                  key={k.id}
                  role="listitem"
                  variant="outline"
                  className="rounded-2xl bg-surface-secondary/50"
                >
                  <ItemMedia className="grid size-10 place-items-center rounded-xl border border-border bg-surface">
                    <Icon className="size-4 text-muted" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="text-foreground">{k.name}</ItemTitle>
                    <ItemDescription className="text-muted">
                      {formatMoney(dailyDepreciation(k))}/dia · {CATEGORY_META[k.category].label}
                      {quoteItem && ` · ${formatMoney(costOf(quoteItem.id))} neste orçamento`}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label={`Editar ${k.name}`}
                      aria-expanded={isEditing}
                      onPress={() => {
                        setEditing(isEditing ? null : k.id);
                      }}
                    >
                      <SlidersHorizontal className="size-4" />
                    </Button>
                    <Switch
                      isSelected={Boolean(quoteItem)}
                      onChange={(on) => {
                        toggleKitItem(k, on);
                      }}
                      aria-label={`Levar ${k.name} neste orçamento`}
                    >
                      {/* Switch.Content é o botão clicável: o controle precisa ficar dentro dele. */}
                      <Switch.Content className="cursor-pointer">
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      className="text-muted hover:text-danger"
                      aria-label={`Tirar ${k.name} do kit`}
                      onPress={() => {
                        removeFromKit(k);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </ItemActions>
                  {isEditing && (
                    <div className="grid w-full gap-4 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                      <TextInput
                        label="Nome"
                        value={k.name}
                        onChange={(name) => {
                          updateKitItem(k.id, { name });
                        }}
                      />
                      <CategorySelect
                        value={k.category}
                        onChange={(category) => {
                          updateKitItem(k.id, { category });
                        }}
                      />
                      <QuantityField
                        label="Vida útil"
                        unit="year"
                        minValue={1}
                        value={k.lifespanYears}
                        onChange={(lifespanYears) => {
                          updateKitItem(k.id, { lifespanYears });
                        }}
                      />
                      <MoneyField
                        label="Valor de compra"
                        withCents={false}
                        valueCents={k.purchaseCents}
                        onChange={(purchaseCents) => {
                          updateKitItem(k.id, { purchaseCents });
                        }}
                      />
                      <MoneyField
                        label="Valor de revenda"
                        withCents={false}
                        valueCents={k.resaleCents}
                        onChange={(resaleCents) => {
                          updateKitItem(k.id, { resaleCents });
                        }}
                      />
                      {quoteItem && (
                        <QuantityField
                          label="Diárias neste orçamento"
                          unit="day"
                          value={quoteItem.days ?? pricing.stages[quoteItem.stage].days}
                          onChange={(days) => {
                            setDays(quoteItem.id, days);
                          }}
                          description={
                            quoteItem.days === null
                              ? `Acompanha ${STAGE_META[quoteItem.stage].label.toLowerCase()}`
                              : undefined
                          }
                        />
                      )}
                    </div>
                  )}
                </Item>
              );
            })}
          </ItemGroup>
        )}

        <div className="flex flex-wrap gap-2">
          {KIT_SUGGESTIONS.filter((s) => !kitNames.has(s.name)).map((s) => (
            <Button
              key={s.name}
              size="sm"
              variant="secondary"
              onPress={() => {
                addToKit(kitFromSuggestion(s));
              }}
            >
              <Plus className="size-3.5" /> {s.name}
            </Button>
          ))}
          <Button
            size="sm"
            variant="tertiary"
            onPress={() => {
              addToKit(
                {
                  id: createId(),
                  name: 'Novo equipamento',
                  category: 'outro',
                  purchaseCents: 100000,
                  resaleCents: 20000,
                  lifespanYears: 4,
                },
                true,
              );
            }}
          >
            <Plus className="size-3.5" /> Outro equipamento
          </Button>
        </div>
      </Panel>

      <Panel
        title="Aluguel"
        description="O que você vai locar só para este trabalho — entra pelo valor da diária."
        actions={
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              setList('equipment', (list) => [...list, rentalFromSuggestion(null)]);
            }}
          >
            <Plus className="size-4" /> Adicionar aluguel
          </Button>
        }
      >
        {rentals.length === 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-muted">Sugestões:</span>
            {KIT_SUGGESTIONS.filter((s) => s.dailyRentCents > 0)
              .slice(0, 5)
              .map((s) => (
                <Button
                  key={s.name}
                  size="sm"
                  variant="tertiary"
                  onPress={() => {
                    setList('equipment', (list) => [...list, rentalFromSuggestion(s)]);
                  }}
                >
                  <Plus className="size-3.5" /> {s.name}
                </Button>
              ))}
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {rentals.map((r) => (
              <li
                key={r.id}
                className="grid items-end gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_11rem_10rem_auto]"
              >
                <TextInput
                  label="Equipamento"
                  value={r.name}
                  onChange={(name) => {
                    setList('equipment', (list) =>
                      list.map((e) => (e.id === r.id ? { ...e, name } : e)),
                    );
                  }}
                />
                <MoneyField
                  label="Diária"
                  valueCents={r.dailyRentCents}
                  onChange={(dailyRentCents) => {
                    setList('equipment', (list) =>
                      list.map((e) => (e.id === r.id ? { ...e, dailyRentCents } : e)),
                    );
                  }}
                />
                <QuantityField
                  label="Diárias"
                  unit="day"
                  value={r.days ?? pricing.stages[r.stage].days}
                  onChange={(days) => {
                    setDays(r.id, days);
                  }}
                />
                <Button
                  isIconOnly
                  variant="ghost"
                  aria-label={`Remover ${r.name}`}
                  onPress={() => {
                    setList('equipment', (list) => list.filter((e) => e.id !== r.id));
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <p className="text-right text-sm text-muted">
        {pluralize(equipment.length, 'item', 'itens')} no orçamento ·{' '}
        <span className="font-medium text-foreground">{formatMoney(pricing.equipmentCents)}</span>
      </p>
    </div>
  );
}
