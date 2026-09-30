import { Tabs } from '@heroui/react';

import { StudioCostsForm, StudioIdentityForm } from '@/features/business-profile';
import { Panel } from '@/shared/components/layout/Panel';
import { SceneHeading } from '@/shared/components/layout/SceneHeading';

export function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <SceneHeading
        eyebrow="Meu estúdio"
        title="Os números que sustentam seu preço"
        description="Tudo aqui é salvo automaticamente e vale para os próximos orçamentos."
      />
      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Configurações do estúdio">
            <Tabs.Tab id="custos">
              Custos e jornada
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="proposta">
              Proposta e contato
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="custos" className="pt-6">
          <StudioCostsForm />
        </Tabs.Panel>
        <Tabs.Panel id="proposta" className="pt-6">
          <Panel
            title="Como você assina a proposta"
            description="Aparece no cabeçalho e no rodapé do PDF."
          >
            <StudioIdentityForm />
          </Panel>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
