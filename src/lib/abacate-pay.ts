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
      return abacatePay.fetch('/products/list')
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
