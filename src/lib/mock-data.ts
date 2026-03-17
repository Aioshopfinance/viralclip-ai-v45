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
    id: 'prj_1',
    service: 'Cortes Virais Bíblicos',
    channel: 'Palavra Viva',
    status: 'AI Processing',
    progress: 65,
    date: 'Hoje',
  },
  {
    id: 'prj_2',
    service: 'Roteiros Devocionais',
    channel: 'Worship Moments',
    status: 'Completed',
    progress: 100,
    date: 'Ontem',
  },
]

export const MOCK_TIMELINE = [
  {
    id: 1,
    agent: 'Analista',
    action: 'Analisou o vídeo original de 45 minutos.',
    time: '10:00 AM',
    status: 'done',
  },
  {
    id: 2,
    agent: 'Estrategista',
    action: 'Identificou 5 momentos de alta emoção/retenção.',
    time: '10:05 AM',
    status: 'done',
  },
  {
    id: 3,
    agent: 'Editor',
    action: 'Gerando legendas dinâmicas e B-rolls.',
    time: '10:15 AM',
    status: 'processing',
  },
]
