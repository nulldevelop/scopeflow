export const defaultCategories = [
  { name: 'Autenticação' },
  { name: 'Dashboard & Interface' },
  { name: 'Pagamentos & Assinaturas' },
  { name: 'E-mail & Notificações' },
  { name: 'Arquivos & Upload' },
  { name: 'API & Integrações' },
  { name: 'CMS & Conteúdo' },
  { name: 'Segurança & Auditoria' },
]

export const defaultFeatures = [
  // Autenticação
  {
    name: 'Login Social (Google/GitHub)',
    description: 'Autenticação via OAuth2 com provedores populares.',
    baseHours: 4,
    complexity: 'baixa',
    categoryName: 'Autenticação',
  },
  {
    name: 'Multi-fator (2FA/MFA)',
    description: 'Segurança adicional via SMS ou Apps de Autenticação.',
    baseHours: 8,
    complexity: 'media',
    categoryName: 'Autenticação',
  },
  {
    name: 'Gestão de Convites',
    description: 'Fluxo completo de convidar membros para a organização.',
    baseHours: 6,
    complexity: 'media',
    categoryName: 'Autenticação',
  },

  // Dashboard
  {
    name: 'Dashboard Analítico',
    description:
      'Visualização de métricas com gráficos interativos (Recharts).',
    baseHours: 12,
    complexity: 'alta',
    categoryName: 'Dashboard & Interface',
  },
  {
    name: 'Filtros Dinâmicos',
    description: 'Sistema de filtragem em tabelas e buscas avançadas.',
    baseHours: 6,
    complexity: 'media',
    categoryName: 'Dashboard & Interface',
  },
  {
    name: 'Modo Escuro (Dark Mode)',
    description: 'Implementação de temas com Next-Themes e Tailwind.',
    baseHours: 4,
    complexity: 'baixa',
    categoryName: 'Dashboard & Interface',
  },

  // Pagamentos
  {
    name: 'Checkout com Stripe',
    description: 'Integração de pagamentos únicos e recorrentes.',
    baseHours: 10,
    complexity: 'media',
    categoryName: 'Pagamentos & Assinaturas',
  },
  {
    name: 'Gestão de Assinaturas (SaaS)',
    description: 'Portal do cliente para upgrade/downgrade de planos.',
    baseHours: 14,
    complexity: 'alta',
    categoryName: 'Pagamentos & Assinaturas',
  },
  {
    name: 'Histórico de Faturas',
    description: 'Listagem e download de PDFs de pagamentos anteriores.',
    baseHours: 6,
    complexity: 'media',
    categoryName: 'Pagamentos & Assinaturas',
  },

  // E-mail
  {
    name: 'E-mails Transacionais (Resend)',
    description: 'Boas-vindas, recuperação de senha e avisos.',
    baseHours: 4,
    complexity: 'baixa',
    categoryName: 'E-mail & Notificações',
  },
  {
    name: 'Notificações Push',
    description: 'Alertas em tempo real no navegador ou mobile.',
    baseHours: 12,
    complexity: 'alta',
    categoryName: 'E-mail & Notificações',
  },

  // Upload
  {
    name: 'Upload de Arquivos (S3/R2)',
    description: 'Armazenamento de imagens e documentos em nuvem.',
    baseHours: 8,
    complexity: 'media',
    categoryName: 'Arquivos & Upload',
  },
  {
    name: 'Otimização de Imagens',
    description: 'Redimensionamento e compressão automática no upload.',
    baseHours: 6,
    complexity: 'media',
    categoryName: 'Arquivos & Upload',
  },

  // API
  {
    name: 'Documentação Swagger/OpenAPI',
    description: 'Geração automática de documentação da API.',
    baseHours: 8,
    complexity: 'media',
    categoryName: 'API & Integrações',
  },
  {
    name: 'Integração com Webhooks',
    description: 'Envio de eventos para sistemas externos.',
    baseHours: 10,
    complexity: 'alta',
    categoryName: 'API & Integrações',
  },
]
