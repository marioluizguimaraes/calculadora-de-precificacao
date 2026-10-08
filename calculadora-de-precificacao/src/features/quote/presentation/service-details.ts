import {
  Accessibility,
  AudioWaveform,
  Building2,
  Camera,
  Captions,
  Clapperboard,
  Drone,
  FileCheck,
  Frame,
  HardDrive,
  Lightbulb,
  ListChecks,
  MapPin,
  MessagesSquare,
  Mic,
  MicVocal,
  Music,
  Palette,
  PenLine,
  RefreshCw,
  Scissors,
  Send,
  Smartphone,
  Sparkles,
  Video,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import type { SelectedService } from '@/features/pricing';
import { SERVICE_BY_ID } from '@/features/services';

/**
 * Como cada serviço do catálogo é apresentado ao cliente: o que fazemos e o que ele recebe.
 * Escrito para quem contrata, não para quem orça — sem jargão de custo.
 */
export interface ServiceDetail {
  icon: LucideIcon;
  steps: string[];
  outcome: string;
}

const DETAILS: Record<string, ServiceDetail> = {
  briefing: {
    icon: MessagesSquare,
    steps: [
      'Reunião para entender objetivo, público e mensagem',
      'Levantamento de referências visuais e de tom',
      'Alinhamento de prazos, formatos e canais de publicação',
    ],
    outcome: 'Um briefing aprovado que guia todas as decisões do projeto.',
  },
  roteiro: {
    icon: PenLine,
    steps: [
      'Estrutura narrativa pensada para o seu público',
      'Texto de falas, locução e chamadas',
      'Ajustes até o roteiro refletir a sua marca',
    ],
    outcome: 'Roteiro final aprovado antes da gravação.',
  },
  storyboard: {
    icon: Frame,
    steps: [
      'Planos desenhados ou referências cena a cena',
      'Definição de enquadramentos e movimentos de câmera',
      'Visualização do vídeo antes de gravar',
    ],
    outcome: 'Você enxerga o vídeo pronto antes do primeiro take.',
  },
  'decupagem-tecnica': {
    icon: ListChecks,
    steps: [
      'Lista de todos os planos a gravar',
      'Cronograma detalhado do dia de gravação',
      'Escalação da equipe e dos equipamentos',
    ],
    outcome: 'Um set organizado, sem tempo perdido.',
  },
  'visita-tecnica': {
    icon: MapPin,
    steps: [
      'Visita prévia ao local da gravação',
      'Análise de luz natural, ruído e energia elétrica',
      'Planejamento das posições de câmera e luz',
    ],
    outcome: 'Nenhuma surpresa no dia da gravação.',
  },
  'producao-locacao': {
    icon: Building2,
    steps: [
      'Busca e seleção de locações',
      'Seleção de elenco e participantes',
      'Negociação e reserva de datas',
    ],
    outcome: 'Pessoas e espaços certos para contar a sua história.',
  },
  documentacao: {
    icon: FileCheck,
    steps: [
      'Termos de uso de imagem dos participantes',
      'Autorizações de locação',
      'Garantia de direitos para publicação',
    ],
    outcome: 'Seu vídeo publicado com segurança jurídica.',
  },
  'montagem-set': {
    icon: Lightbulb,
    steps: [
      'Chegada antecipada e montagem de luz e câmera',
      'Testes de imagem e de som',
      'Desmontagem e organização do espaço',
    ],
    outcome: 'Set pronto para gravar com qualidade desde o primeiro take.',
  },
  captacao: {
    icon: Video,
    steps: [
      'Gravação dos planos previstos no roteiro',
      'Direção de cena e de enquadramento',
      'Cuidado com luz, foco e som em cada take',
    ],
    outcome: 'Material bruto em alta qualidade para a edição.',
  },
  entrevistas: {
    icon: Mic,
    steps: [
      'Preparação e direção dos entrevistados',
      'Áudio limpo com microfones dedicados',
      'Enquadramentos que valorizam quem fala',
    ],
    outcome: 'Depoimentos naturais e com som profissional.',
  },
  drone: {
    icon: Drone,
    steps: [
      'Planejamento do voo e das tomadas aéreas',
      'Verificação de autorizações e de segurança',
      'Imagens aéreas estabilizadas',
    ],
    outcome: 'Tomadas aéreas que dão escala e impacto ao vídeo.',
  },
  'making-of': {
    icon: Camera,
    steps: [
      'Registro dos bastidores da gravação',
      'Fotos e vídeos curtos para redes',
      'Material extra para engajar o seu público',
    ],
    outcome: 'Conteúdo bônus para as suas redes sociais.',
  },
  backup: {
    icon: HardDrive,
    steps: [
      'Descarregamento dos cartões ainda no set',
      'Cópia de segurança em dois lugares',
      'Organização dos arquivos por cena',
    ],
    outcome: 'Seu material protegido contra perdas.',
  },
  'decupagem-material': {
    icon: Clapperboard,
    steps: [
      'Revisão de todo o material gravado',
      'Marcação dos melhores takes',
      'Seleção de falas e trechos-chave',
    ],
    outcome: 'Só o melhor material chega à edição.',
  },
  edicao: {
    icon: Scissors,
    steps: [
      'Montagem da narrativa e do ritmo',
      'Cortes, transições e encaixe com a trilha',
      'Versão completa para a sua aprovação',
    ],
    outcome: 'O vídeo ganha forma, ritmo e emoção.',
  },
  color: {
    icon: Palette,
    steps: [
      'Correção de exposição e balanço de branco',
      'Color grading com a identidade visual do projeto',
      'Padronização entre todas as cenas',
    ],
    outcome: 'Imagem com cara de cinema, consistente do início ao fim.',
  },
  motion: {
    icon: Sparkles,
    steps: [
      'Vinhetas de abertura e encerramento',
      'Lettering e textos animados',
      'Animação de logo e elementos gráficos',
    ],
    outcome: 'Sua marca presente com acabamento profissional.',
  },
  audio: {
    icon: AudioWaveform,
    steps: [
      'Limpeza de ruídos e equalização das vozes',
      'Efeitos sonoros',
      'Mixagem final equilibrada',
    ],
    outcome: 'Som claro e agradável em qualquer tela.',
  },
  trilha: {
    icon: Music,
    steps: [
      'Pesquisa de trilhas alinhadas ao tom do vídeo',
      'Licenciamento para uso comercial',
      'Sincronização da música com a edição',
    ],
    outcome: 'Trilha legalizada que conduz a emoção.',
  },
  locucao: {
    icon: MicVocal,
    steps: [
      'Seleção da voz ideal para a marca',
      'Direção e gravação da narração',
      'Tratamento e sincronização do áudio',
    ],
    outcome: 'Narração profissional que guia quem assiste.',
  },
  legendas: {
    icon: Captions,
    steps: ['Transcrição completa das falas', 'Sincronização com o vídeo', 'Revisão ortográfica'],
    outcome: 'Vídeo que funciona mesmo sem som.',
  },
  acessibilidade: {
    icon: Accessibility,
    steps: ['Janela de Libras', 'Audiodescrição', 'Adequação às boas práticas de acessibilidade'],
    outcome: 'Seu conteúdo alcança todos os públicos.',
  },
  cortes: {
    icon: Smartphone,
    steps: [
      'Versões verticais para Reels, TikTok e Shorts',
      'Versões reduzidas para anúncios',
      'Adaptação de enquadramento e legendas',
    ],
    outcome: 'Mais conteúdo a partir da mesma produção.',
  },
  revisoes: {
    icon: RefreshCw,
    steps: [
      'Envio das versões para a sua avaliação',
      'Ajustes conforme o seu retorno',
      'Aprovação final antes da entrega',
    ],
    outcome: 'O vídeo final do jeito que você aprovou.',
  },
  entrega: {
    icon: Send,
    steps: [
      'Renderização nos formatos de cada canal',
      'Envio por link de download',
      'Arquivamento do projeto',
    ],
    outcome: 'Arquivos prontos para publicar.',
  },
};

/** Detalhe do serviço; serviços fora do catálogo usam a descrição cadastrada, se houver. */
export function serviceDetail(service: SelectedService): ServiceDetail {
  const known = DETAILS[service.serviceId];
  if (known) return known;
  const description = SERVICE_BY_ID.get(service.serviceId)?.description;
  return {
    icon: Wrench,
    steps: description ? [description] : [],
    outcome: `${service.label} feito com o mesmo cuidado de todo o projeto.`,
  };
}
