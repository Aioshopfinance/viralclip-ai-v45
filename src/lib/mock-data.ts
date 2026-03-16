export const MOCK_CHANNELS = [
  {
    id: 'ch_1',
    name: 'Palavra Viva',
    platform: 'YouTube',
    subscribers: '125K',
    niche: 'Devocional',
    score: 84,
    avatar: 'https://img.usecurling.com/i?q=bible&color=gradient',
  },
  {
    id: 'ch_2',
    name: 'Worship Moments',
    platform: 'Instagram',
    subscribers: '45K',
    niche: 'Louvor',
    score: 62,
    avatar: 'https://img.usecurling.com/i?q=music&color=gradient',
  },
]

export const MOCK_SERVICES = [
  {
    id: 'srv_1',
    title: 'Cortes Virais Bíblicos',
    description:
      'Nossa IA Roteirista e Editora transforma suas pregações em cortes de 60s otimizados para retenção.',
    credits: 50,
    icon: 'Scissors',
    agent: 'Equipe de Edição',
  },
  {
    id: 'srv_2',
    title: 'Roteiros Devocionais',
    description: 'Geração de roteiros originais baseados em temas teológicos para vídeos curtos.',
    credits: 20,
    icon: 'FileText',
    agent: 'Agente Roteirista',
  },
  {
    id: 'srv_3',
    title: 'Auditoria Inteligente',
    description: 'Análise profunda do seu canal com plano de ação detalhado.',
    credits: 100,
    icon: 'Search',
    agent: 'Analista de Dados',
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
