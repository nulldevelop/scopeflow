export const defaultCategories = [
  { name: 'Sites & Landing Pages' },
  { name: 'Autenticação' },
  { name: 'Dashboard & Interface' },
  { name: 'Pagamentos & Assinaturas' },
  { name: 'E-mail & Notificações' },
  { name: 'Arquivos & Upload' },
  { name: 'API & Integrações' },
  { name: 'CMS & Conteúdo' },
  { name: 'Segurança & Auditoria' },
  { name: 'Mobile & PWA' },
  { name: 'Infraestrutura & DevOps' },
  { name: 'Marketing & SEO' },
]

export const defaultFeatures = [
  // Sites & Landing Pages
  {
    name: 'Landing Page de Alta Conversão',
    description:
      'Página única focada em venda/lead com seções de hero, benefícios, prova social e CTA.',
    baseHours: 12,
    complexity: 'media',
    categoryName: 'Sites & Landing Pages',
  },
  {
    name: 'Site Institucional (5+ páginas)',
    description:
      'Estrutura completa com Home, Sobre, Serviços, Blog e Contato.',
    baseHours: 24,
    complexity: 'media',
    categoryName: 'Sites & Landing Pages',
  },
  {
    name: 'Blog Integrado',
    description:
      'Sistema de publicação de artigos com categorias, tags e busca.',
    baseHours: 16,
    complexity: 'media',
    categoryName: 'Sites & Landing Pages',
  },
  {
    name: 'Formulário de Contato Avançado',
    description:
      'Integração com CRM, validação de campos e proteção anti-spam (reCAPTCHA).',
    baseHours: 6,
    complexity: 'baixa',
    categoryName: 'Sites & Landing Pages',
  },

  // Marketing & SEO
  {
    name: 'Otimização de SEO (On-page)',
    description:
      'Configuração de Meta Tags, OpenGraph, Sitemap e estruturação de dados (JSON-LD).',
    baseHours: 8,
    complexity: 'baixa',
    categoryName: 'Marketing & SEO',
  },
  {
    name: 'Google Analytics & Tag Manager',
    description:
      'Configuração completa de rastreamento de eventos e conversões.',
    baseHours: 4,
    complexity: 'baixa',
    categoryName: 'Marketing & SEO',
  },
  {
    name: 'Integração com Pixel de Conversão',
    description:
      'Implementação de Facebook Pixel e Google Ads Conversion Tracking.',
    baseHours: 4,
    complexity: 'baixa',
    categoryName: 'Marketing & SEO',
  },

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
    name: 'RBAC (Controle de Acesso)',
    description: 'Gerenciamento de permissões baseado em cargos e papéis.',
    baseHours: 10,
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
    name: 'Modo Escuro (Dark Mode)',
    description: 'Implementação de temas com Next-Themes e Tailwind.',
    baseHours: 4,
    complexity: 'baixa',
    categoryName: 'Dashboard & Interface',
  },
  {
    name: 'Exportação CSV/PDF',
    description: 'Funcionalidade para exportar dados de tabelas.',
    baseHours: 6,
    complexity: 'media',
    categoryName: 'Dashboard & Interface',
  },

  // Pagamentos
  {
    name: 'Checkout com Stripe',
    description: 'Integração de pagamentos únicos e recorrentes.',
    baseHours: 10,
    complexity: 'media',
    categoryName: 'Pagamentos & Asssignatures',
  },
  {
    name: 'Gestão de Assinaturas (SaaS)',
    description: 'Portal do cliente para upgrade/downgrade de planos.',
    baseHours: 14,
    complexity: 'alta',
    categoryName: 'Pagamentos & Assinaturas',
  },

  // Upload
  {
    name: 'Upload de Arquivos (S3/R2)',
    description: 'Armazenamento de imagens e documentos em nuvem.',
    baseHours: 8,
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

  // CMS
  {
    name: 'Editor Rich Text (TipTap)',
    description: 'Editor visual para criação de conteúdo rico.',
    baseHours: 8,
    complexity: 'media',
    categoryName: 'CMS & Conteúdo',
  },

  // Mobile
  {
    name: 'Sincronização Offline',
    description: 'Persistência de dados local quando sem internet.',
    baseHours: 14,
    complexity: 'alta',
    categoryName: 'Mobile & PWA',
  },

  // Infra
  {
    name: 'Audit Log',
    description: 'Histórico de ações críticas realizadas por usuários.',
    baseHours: 10,
    complexity: 'media',
    categoryName: 'Segurança & Auditoria',
  },
  {
    name: 'Backup Automatizado',
    description: 'Rotina de dump de banco de dados e arquivos.',
    baseHours: 8,
    complexity: 'media',
    categoryName: 'Infraestrutura & DevOps',
  },
]
