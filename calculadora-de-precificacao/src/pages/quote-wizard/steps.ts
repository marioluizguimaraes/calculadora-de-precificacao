import type { ComponentType } from 'react';

import { StudioCostsForm } from '@/features/business-profile';
import { LogisticsStep } from '@/features/costs';
import { EquipmentStep } from '@/features/equipment';
import { LocationStep } from '@/features/location';
import { MarginStep, type BusinessProfile, type QuoteDraft } from '@/features/pricing';
import { ProjectStep, ServicesStep } from '@/features/services';
import { TeamStep } from '@/features/team';
import { TimeStep } from '@/features/work-stages';

export interface WizardStep {
  id: string;
  label: string;
  title: string;
  description: string;
  Component: ComponentType;
  /** A etapa já tem o mínimo preenchido? (só sinaliza; nunca bloqueia o avanço). */
  isComplete: (draft: QuoteDraft, profile: BusinessProfile) => boolean;
}

/** O orçamento em cenas: a ordem é a do raciocínio de precificação (Sebrae + mercado). */
export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'estudio',
    label: 'Seu estúdio',
    title: 'Quanto custa manter seu estúdio de pé?',
    description:
      'Seus custos do mês e a sua jornada definem o valor da sua hora — a base de todo orçamento. Você preenche uma vez.',
    Component: StudioCostsForm,
    isComplete: (_, p) => p.proLaboreCents > 0 && p.workDaysPerMonth > 0 && p.baseCity !== null,
  },
  {
    id: 'projeto',
    label: 'Projeto',
    title: 'Que vídeo vamos orçar?',
    description: 'Escolha um modelo para já sair com serviços e horas típicas — ou comece do zero.',
    Component: ProjectStep,
    isComplete: (d) => d.project.title.trim() !== '' && d.client.name.trim() !== '',
  },
  {
    id: 'local',
    label: 'Local',
    title: 'Onde a câmera vai rodar?',
    description:
      'Cidade, região ou estado. A distância da sua base entra no custo de deslocamento.',
    Component: LocationStep,
    isComplete: (d) => d.location.distanceKm !== null,
  },
  {
    id: 'servicos',
    label: 'Serviços',
    title: 'O que entra no pacote?',
    description:
      'Marque cada etapa do trabalho. Na próxima etapa, você ajusta o tempo de cada uma.',
    Component: ServicesStep,
    isComplete: (d) => d.services.length > 0,
  },
  {
    id: 'tempo',
    label: 'Tempo',
    title: 'Quanto tempo cada etapa pede?',
    description:
      'Horas suas em cada serviço. As diárias de cada etapa são calculadas automaticamente.',
    Component: TimeStep,
    isComplete: (d) => d.services.some((s) => s.hours > 0),
  },
  {
    id: 'equipamentos',
    label: 'Kit',
    title: 'Qual kit vai para o set?',
    description: 'Seu equipamento entra pela depreciação; o alugado, pela diária.',
    Component: EquipmentStep,
    isComplete: (d) => d.equipment.length > 0,
  },
  {
    id: 'equipe',
    label: 'Equipe',
    title: 'Quem mais está com você?',
    description: 'Freelancers e parceiros entram pela diária, na etapa em que trabalham.',
    Component: TeamStep,
    isComplete: () => true,
  },
  {
    id: 'logistica',
    label: 'Logística',
    title: 'O que custa chegar e ficar lá?',
    description: 'Combustível, pedágio, comida da equipe, hospedagem e gastos do projeto.',
    Component: LogisticsStep,
    isComplete: () => true,
  },
  {
    id: 'margem',
    label: 'Margem',
    title: 'Quanto você quer lucrar?',
    description: 'Impostos e taxas incidem sobre o preço final. O markup cuida da conta por você.',
    Component: MarginStep,
    isComplete: (d) => d.pricing.profitPct > 0,
  },
];
