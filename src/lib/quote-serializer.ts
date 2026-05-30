import type { Quote, QuoteItem } from '@/generated/prisma/client'

export function serializeQuote(quote: Quote) {
  return {
    ...quote,
    totalHours: Number(quote.totalHours),
    totalValue: Number(quote.totalValue),
    monthlyTotal: Number(quote.monthlyTotal),
    hourlyRate: Number(quote.hourlyRate),
    discount: Number(quote.discount),
    urgencyFee: Number(quote.urgencyFee),
    entryAmount: Number(quote.entryAmount),
  }
}

export function serializeQuoteItem(item: QuoteItem) {
  return {
    ...item,
    hours: Number(item.hours),
    unitValue: Number(item.unitValue),
    monthlyFee: Number(item.monthlyFee),
  }
}
