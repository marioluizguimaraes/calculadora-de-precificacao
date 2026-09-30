import { ComboBox, Description, Input, Label, ListBox, Select } from '@heroui/react';

import type { CityRef, PlaceRef, StateRef } from '@/features/pricing';

import { useCities, useStates } from '../hooks/useLocalidades';
import { normalize } from '../utils/text';

const accentInsensitive = (text: string, input: string) =>
  normalize(text).includes(normalize(input));

interface StatePickerProps {
  value: StateRef | null;
  onChange: (state: StateRef) => void;
  label?: string;
}

export function StatePicker({ value, onChange, label = 'Estado' }: StatePickerProps) {
  const { data: states = [], isLoading, isError } = useStates();
  const ufByName = new Map(states.map((s) => [s.name, s.uf]));
  // Busca pelo nome (sem acento) ou pela sigla: "SP" também encontra São Paulo.
  const matches = (text: string, input: string) =>
    accentInsensitive(text, input) ||
    ufByName.get(text)?.toLowerCase() === input.trim().toLowerCase();
  return (
    <ComboBox
      key={isLoading ? 'carregando' : 'pronto'}
      defaultItems={states}
      value={value?.id ?? null}
      onChange={(key) => {
        const state = states.find((s) => s.id === key);
        if (state) onChange({ id: state.id, uf: state.uf, name: state.name });
      }}
      defaultFilter={matches}
      isDisabled={isLoading || isError}
      menuTrigger="focus"
      fullWidth
    >
      <Label>{label}</Label>
      <ComboBox.InputGroup>
        <Input placeholder={isLoading ? 'Carregando estados…' : 'Digite o nome ou a sigla'} />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      {isError && <Description>Não foi possível carregar os estados do IBGE.</Description>}
      <ComboBox.Popover>
        <ListBox>
          {(state: (typeof states)[number]) => (
            <ListBox.Item id={state.id} textValue={state.name}>
              <Label>{state.name}</Label>
              <Description>
                {state.uf} · {state.region}
              </Description>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

interface CityPickerProps {
  uf: string | null;
  value: CityRef | null;
  onChange: (city: CityRef | null) => void;
  label?: string;
  description?: string;
}

export function CityPicker({
  uf,
  value,
  onChange,
  label = 'Cidade',
  description,
}: CityPickerProps) {
  const { data: cities = [], isLoading, isError } = useCities(uf);
  const disabled = !uf || isLoading || isError;
  return (
    <ComboBox
      key={uf ?? 'sem-uf'}
      defaultItems={cities}
      value={value?.id ?? null}
      onChange={(key) => {
        const city = cities.find((c) => c.id === key);
        onChange(city ? { id: city.id, name: city.name, uf: city.uf } : null);
      }}
      defaultFilter={accentInsensitive}
      isDisabled={disabled}
      menuTrigger="focus"
      fullWidth
    >
      <Label>{label}</Label>
      <ComboBox.InputGroup>
        <Input
          placeholder={
            !uf ? 'Escolha o estado primeiro' : isLoading ? 'Carregando cidades…' : 'Digite o nome'
          }
        />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      {isError ? (
        <Description>Não foi possível carregar as cidades do IBGE.</Description>
      ) : (
        description && <Description>{description}</Description>
      )}
      <ComboBox.Popover>
        <ListBox>
          {(city: (typeof cities)[number]) => (
            <ListBox.Item id={city.id} textValue={city.name}>
              <Label>{city.name}</Label>
              <Description>Região de {city.intermediateRegionName}</Description>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

interface RegionPickerProps {
  uf: string | null;
  value: PlaceRef | null;
  onChange: (region: PlaceRef) => void;
}

/** Regiões geográficas intermediárias do IBGE (polos regionais, ex.: "Campinas"). */
export function RegionPicker({ uf, value, onChange }: RegionPickerProps) {
  const { data: cities = [], isLoading } = useCities(uf);
  const regions = [
    ...new Map(
      cities.map((c) => [
        c.intermediateRegionId,
        {
          id: c.intermediateRegionId,
          name: c.intermediateRegionName,
          count: cities.filter((x) => x.intermediateRegionId === c.intermediateRegionId).length,
        },
      ]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <Select
      value={value?.id ?? null}
      onChange={(key) => {
        const region = regions.find((r) => r.id === key);
        if (region) onChange({ id: region.id, name: region.name });
      }}
      placeholder={
        !uf ? 'Escolha o estado primeiro' : isLoading ? 'Carregando…' : 'Escolha a região'
      }
      isDisabled={!uf || isLoading}
      fullWidth
    >
      <Label>Região</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Description>Regiões intermediárias do IBGE, nomeadas pela cidade-polo.</Description>
      <Select.Popover>
        <ListBox items={regions}>
          {(region) => (
            <ListBox.Item id={region.id} textValue={region.name}>
              <Label>Região de {region.name}</Label>
              <Description>{region.count} municípios</Description>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
