import { prisma } from '@/lib/prisma'

export interface Quote {
  id: string
  title: string
  description: string | null
  status: string
  totalHours: unknown
  totalValue: unknown
  hourlyRate: unknown
  discount: unknown
  urgencyFee: unknown
  entryAmount: unknown
  installments: number
  expirationDate: Date | null
  sentAt: Date | null
  approvedAt: Date | null
  clientId: string | null
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface QuoteItem {
  id: string
  name: string
  description: string | null
  hours: unknown
  unitValue: unknown
  order: number
  quoteId: string
  featureId: string | null
  createdAt: Date
  updatedAt: Date
}

export async function getQuotesByOrganization(
  organizationId: string,
): Promise<Quote[]> {
  return prisma.quote.findMany({
    where: { organizationId },
    include: {
      client: true,
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  }) as Promise<Quote[]>
}

export async function getQuoteById(
  id: string,
  organizationId: string,
): Promise<Quote | null> {
  return prisma.quote.findFirst({
    where: { id, organizationId },
    include: {
      client: true,
      items: true,
    },
  }) as Promise<Quote | null>
}

export async function getQuoteByIdWithItems(
  id: string,
): Promise<(Quote & { items: QuoteItem[] }) | null> {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { order: 'asc' },
      },
      client: true,
    },
  }) as Promise<(Quote & { items: QuoteItem[] }) | null>
}

export async function createQuote(
  data: {
    title: string
    description?: string
    status?: string
    totalHours: number
    totalValue: number
    hourlyRate: number
    discount?: number
    urgencyFee?: number
    entryAmount?: number
    installments?: number
    expirationDate?: Date
    clientId?: string | null
  },
  organizationId: string,
): Promise<Quote> {
  return prisma.quote.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || 'rascunho',
      totalHours: data.totalHours,
      totalValue: data.totalValue,
      hourlyRate: data.hourlyRate,
      discount: data.discount || 0,
      urgencyFee: data.urgencyFee || 0,
      entryAmount: data.entryAmount || 0,
      installments: data.installments || 1,
      expirationDate: data.expirationDate,
      clientId: data.clientId || null,
      organizationId,
    },
  }) as Promise<Quote>
}

export async function updateQuote(
  id: string,
  data: {
    title?: string
    description?: string | null
    status?: string
    totalHours?: number
    totalValue?: number
    hourlyRate?: number
    discount?: number
    urgencyFee?: number
    entryAmount?: number
    installments?: number
    expirationDate?: Date | null
    sentAt?: Date | null
    approvedAt?: Date | null
    clientId?: string | null
  },
): Promise<Quote> {
  const updateData: Record<string, unknown> = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.status !== undefined) updateData.status = data.status
  if (data.totalHours !== undefined) updateData.totalHours = data.totalHours
  if (data.totalValue !== undefined) updateData.totalValue = data.totalValue
  if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate
  if (data.discount !== undefined) updateData.discount = data.discount
  if (data.urgencyFee !== undefined) updateData.urgencyFee = data.urgencyFee
  if (data.entryAmount !== undefined) updateData.entryAmount = data.entryAmount
  if (data.installments !== undefined)
    updateData.installments = data.installments
  if (data.expirationDate !== undefined)
    updateData.expirationDate = data.expirationDate
  if (data.sentAt !== undefined) updateData.sentAt = data.sentAt
  if (data.approvedAt !== undefined) updateData.approvedAt = data.approvedAt
  if (data.clientId !== undefined) updateData.clientId = data.clientId

  return prisma.quote.update({
    where: { id },
    data: updateData,
  }) as Promise<Quote>
}

export async function deleteQuote(id: string): Promise<void> {
  await prisma.quote.delete({
    where: { id },
  })
}

export async function addQuoteItem(
  data: {
    name: string
    description?: string
    hours: number
    unitValue: number
    order?: number
    featureId?: string | null
  },
  quoteId: string,
): Promise<QuoteItem> {
  return prisma.quoteItem.create({
    data: {
      name: data.name,
      description: data.description,
      hours: data.hours,
      unitValue: data.unitValue,
      order: data.order || 0,
      featureId: data.featureId || null,
      quoteId,
    },
  }) as Promise<QuoteItem>
}

export async function updateQuoteItem(
  id: string,
  data: {
    name?: string
    description?: string | null
    hours?: number
    unitValue?: number
    order?: number
  },
): Promise<QuoteItem> {
  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.hours !== undefined) updateData.hours = data.hours
  if (data.unitValue !== undefined) updateData.unitValue = data.unitValue
  if (data.order !== undefined) updateData.order = data.order

  return prisma.quoteItem.update({
    where: { id },
    data: updateData,
  }) as Promise<QuoteItem>
}

export async function deleteQuoteItem(id: string): Promise<void> {
  await prisma.quoteItem.delete({
    where: { id },
  })
}

export async function deleteQuoteItems(quoteId: string): Promise<void> {
  await prisma.quoteItem.deleteMany({
    where: { quoteId },
  })
}
