const BASE_URL = 'https://api.abacatepay.com/v2'
const API_KEY = process.env.ABACATEPAY_API_KEY

export interface AbacateProduct {
  id: string
  externalId: string
  name: string
  price: number
  cycle?: 'WEEKLY' | 'MONTHLY' | 'SEMIANNUALLY' | 'ANNUALLY'
}

export const abacatePay = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        ...options.headers,
      },
    })

    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(
        data.error || `AbacatePay API Error: ${response.statusText}`,
      )
    }

    return data.data
  },

  customers: {
    async create(data: { email: string; name?: string; taxId?: string }) {
      return abacatePay.fetch('/customers/create', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  },

  products: {
    async list(): Promise<AbacateProduct[]> {
      // Cache product list for 1 hour — products rarely change
      return abacatePay.fetch('/products/list', {
        next: { revalidate: 3600 },
      } as RequestInit)
    },
  },

  checkouts: {
    async create(data: {
      customerId: string
      externalId: string
      items: { id: string; quantity: number }[]
      returnUrl: string
      completionUrl: string
    }) {
      return abacatePay.fetch('/checkouts/create', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          frequency: 'SUBSCRIPTION',
          methods: ['CARD'],
        }),
      })
    },
  },

  subscriptions: {
    async list() {
      return abacatePay.fetch('/subscriptions/list')
    },
    async cancel(id: string) {
      return abacatePay.fetch('/subscriptions/cancel', {
        method: 'POST',
        body: JSON.stringify({ id }),
      })
    },
  },
}

const PRODUCT_IDS: Record<string, string | undefined> = {
  pro: process.env.ABACATEPAY_PRODUCT_PRO,
  equipe: process.env.ABACATEPAY_PRODUCT_EQUIPE,
}

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    'http://localhost:3000'
  )
}

export async function createPlanCheckout(
  planId: string,
  customerId: string,
  orgId: string,
  returnUrl: string,
  completionUrl: string,
): Promise<{ url: string }> {
  const productId = PRODUCT_IDS[planId]
  if (!productId) {
    throw new Error(
      `Plano "${planId}" não mapeado (variável de ambiente ausente)`,
    )
  }

  const products = await abacatePay.products.list()
  const product = products.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Plano não encontrado no AbacatePay (id: ${productId})`)
  }

  const baseUrl = getAppBaseUrl()
  return abacatePay.checkouts.create({
    customerId,
    externalId: `checkout_${orgId}_${Date.now()}`,
    items: [{ id: product.id, quantity: 1 }],
    returnUrl: `${baseUrl}${returnUrl}`,
    completionUrl: `${baseUrl}${completionUrl}`,
  })
}
