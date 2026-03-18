export const MOCK_SERVICES = [
  {
    id: 'srv_1',
    title: 'Cortes Virais Bíblicos',
    description:
      'Nossa IA Roteirista e Editora transforma suas pregações em cortes de 60s otimizados para retenção.',
    credits: 50,
    icon: 'Scissors',
    agent: 'Equipe de Edição',
    category: 'Viral Clips',
  },
  {
    id: 'srv_2',
    title: 'Roteiros Devocionais',
    description: 'Geração de roteiros originais baseados em temas teológicos para vídeos curtos.',
    credits: 20,
    icon: 'FileText',
    agent: 'Agente Roteirista',
    category: 'Devotional Scripts',
  },
  {
    id: 'srv_3',
    title: 'Ideias Virais Bíblicas',
    description:
      'Análise de tendências no seu nicho para sugerir ganchos e temas de alta conversão.',
    credits: 10,
    icon: 'Lightbulb',
    agent: 'Analista de Tendências',
    category: 'Biblical Viral Ideas',
  },
  {
    id: 'srv_4',
    title: 'Auditoria Profunda',
    description:
      'Análise completa do seu canal com plano de ação detalhado para os próximos 30 dias.',
    credits: 100,
    icon: 'Search',
    agent: 'Analista de Dados',
    category: 'Audits',
  },
]

export const MOCK_PROJECTS = [
  {
    id: '1',
    service_name: 'Cortes Virais',
    status: 'in_progress',
    channel_name: 'Meu Canal',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    service_name: 'Auditoria IA',
    status: 'completed',
    channel_name: 'Canal Secundário',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const MOCK_TIMELINE = [
  {
    id: 'step_1',
    title: 'Projeto Iniciado',
    description: 'Recebemos as informações do seu projeto.',
    status: 'completed',
    time: '10:00',
    date: new Date().toISOString(),
  },
  {
    id: 'step_2',
    title: 'Processamento de IA',
    description: 'Nossa inteligência artificial está analisando o conteúdo...',
    status: 'in_progress',
    time: '10:05',
    date: new Date().toISOString(),
  },
  {
    id: 'step_3',
    title: 'Finalização',
    description: 'Aguardando a conclusão da geração dos resultados.',
    status: 'pending',
    time: '--:--',
    date: '',
  },
]
