import { Description, Label, Tag, TagGroup } from '@heroui/react';

import { SPECIALTIES } from '../constants';

interface SpecialtyTagsProps {
  value: string[];
  onChange: (value: string[]) => void;
  description?: string;
}

/** Seleção múltipla de especialidades (cadastro, perfil e ofertas). */
export function SpecialtyTags({ value, onChange, description }: SpecialtyTagsProps) {
  return (
    <TagGroup
      selectionMode="multiple"
      selectedKeys={new Set(value)}
      onSelectionChange={(keys) => {
        onChange(keys === 'all' ? [...SPECIALTIES] : [...keys].map(String));
      }}
    >
      <Label>Especialidades</Label>
      {description && <Description>{description}</Description>}
      <TagGroup.List className="mt-2 flex flex-wrap gap-2">
        {SPECIALTIES.map((specialty) => (
          <Tag
            key={specialty}
            id={specialty}
            className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
          >
            {specialty}
          </Tag>
        ))}
      </TagGroup.List>
    </TagGroup>
  );
}
