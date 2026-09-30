import type { Stage, Tier } from '@/features/pricing';

export interface ServiceDefinition {
  id: string;
  stage: Stage;
  label: string;
  description: string;
  /** Horas sugeridas por tier de complexidade [redes, institucional, publicidade]. */
  hours: Record<Tier, number>;
}

const h = (t1: number, t2: number, t3: number): Record<Tier, number> => ({ 1: t1, 2: t2, 3: t3 });

/**
 * Sub-serviços de uma produção de vídeo, por etapa. As horas são SUAS (quem orça);
 * funções delegadas a outros profissionais entram na etapa "Equipe".
 */
export const SERVICE_CATALOG: ServiceDefinition[] = [
  // Pré-produção
  {
    id: 'briefing',
    stage: 'pre',
    label: 'Briefing e reuniões',
    description: 'Entender objetivo, público e referências do cliente',
    hours: h(1, 2, 4),
  },
  {
    id: 'roteiro',
    stage: 'pre',
    label: 'Roteiro',
    description: 'Texto, falas e estrutura narrativa',
    hours: h(2, 4, 10),
  },
  {
    id: 'storyboard',
    stage: 'pre',
    label: 'Storyboard',
    description: 'Planos desenhados ou referências visuais',
    hours: h(1, 3, 8),
  },
  {
    id: 'decupagem-tecnica',
    stage: 'pre',
    label: 'Decupagem e ordem do dia',
    description: 'Lista de planos, cronograma e equipe do set',
    hours: h(1, 2, 4),
  },
  {
    id: 'visita-tecnica',
    stage: 'pre',
    label: 'Visita técnica',
    description: 'Conhecer a locação, luz e som do ambiente',
    hours: h(1, 2, 4),
  },
  {
    id: 'producao-locacao',
    stage: 'pre',
    label: 'Produção de elenco e locação',
    description: 'Buscar pessoas, espaços e autorizações',
    hours: h(1, 4, 12),
  },
  {
    id: 'documentacao',
    stage: 'pre',
    label: 'Contratos e autorizações',
    description: 'Uso de imagem, locação e direitos',
    hours: h(0.5, 1, 2),
  },

  // Gravação
  {
    id: 'montagem-set',
    stage: 'producao',
    label: 'Montagem de set e luz',
    description: 'Chegada, montagem, testes e desmontagem',
    hours: h(1, 2, 4),
  },
  {
    id: 'captacao',
    stage: 'producao',
    label: 'Captação de imagens',
    description: 'Tempo efetivo de gravação',
    hours: h(3, 6, 10),
  },
  {
    id: 'entrevistas',
    stage: 'producao',
    label: 'Entrevistas e depoimentos',
    description: 'Direção de fala e captação de áudio',
    hours: h(1, 2, 4),
  },
  {
    id: 'drone',
    stage: 'producao',
    label: 'Imagens aéreas (drone)',
    description: 'Voo, planejamento e autorizações',
    hours: h(1, 2, 3),
  },
  {
    id: 'making-of',
    stage: 'producao',
    label: 'Making of e fotos',
    description: 'Bastidores para redes do cliente',
    hours: h(1, 2, 3),
  },
  {
    id: 'backup',
    stage: 'producao',
    label: 'Backup do material',
    description: 'Descarregar, duplicar e organizar cartões',
    hours: h(0.5, 1, 2),
  },

  // Pós-produção
  {
    id: 'decupagem-material',
    stage: 'pos',
    label: 'Decupagem do material',
    description: 'Assistir, marcar e selecionar os takes',
    hours: h(1, 3, 6),
  },
  {
    id: 'edicao',
    stage: 'pos',
    label: 'Edição e montagem',
    description: 'Montar a narrativa e o ritmo',
    hours: h(3, 10, 24),
  },
  {
    id: 'color',
    stage: 'pos',
    label: 'Correção de cor',
    description: 'Color grading e padronização visual',
    hours: h(1, 3, 8),
  },
  {
    id: 'motion',
    stage: 'pos',
    label: 'Motion graphics',
    description: 'Vinhetas, lettering e animações',
    hours: h(1, 4, 16),
  },
  {
    id: 'audio',
    stage: 'pos',
    label: 'Mixagem e sonorização',
    description: 'Limpeza de áudio, efeitos e mix',
    hours: h(1, 2, 6),
  },
  {
    id: 'trilha',
    stage: 'pos',
    label: 'Trilha sonora',
    description: 'Pesquisa e licenciamento de músicas',
    hours: h(0.5, 1, 2),
  },
  {
    id: 'locucao',
    stage: 'pos',
    label: 'Locução',
    description: 'Direção e gravação de narração',
    hours: h(0.5, 1, 3),
  },
  {
    id: 'legendas',
    stage: 'pos',
    label: 'Legendas',
    description: 'Transcrição, sincronização e revisão',
    hours: h(0.5, 1, 3),
  },
  {
    id: 'acessibilidade',
    stage: 'pos',
    label: 'Libras e audiodescrição',
    description: 'Recursos de acessibilidade',
    hours: h(1, 2, 4),
  },
  {
    id: 'cortes',
    stage: 'pos',
    label: 'Cortes para redes',
    description: 'Versões verticais e reduzidas',
    hours: h(1, 3, 6),
  },
  {
    id: 'revisoes',
    stage: 'pos',
    label: 'Rodadas de revisão',
    description: 'Ajustes pedidos pelo cliente',
    hours: h(1, 2, 5),
  },
  {
    id: 'entrega',
    stage: 'pos',
    label: 'Exportação e entrega',
    description: 'Renderização, upload e arquivamento',
    hours: h(0.5, 1, 2),
  },
];

export const SERVICE_BY_ID = new Map(SERVICE_CATALOG.map((s) => [s.id, s]));
