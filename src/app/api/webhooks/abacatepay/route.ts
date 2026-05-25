import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const signature = req.headers.get('x-abacatepay-signature')
    const secret = process.env.ABACATEPAY_WEBHOOK_SECRET

    // 1. Validar assinatura HMAC (opcional mas recomendado)
    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret)
      const digest = hmac.update(JSON.stringify(body)).digest('hex')
      if (signature !== digest) {
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
      }
    }

    const { event, metadata } = body.data

    // 2. Processar eventos
    switch (event) {
      case 'checkout.completed':
      case 'subscription.completed':
      case 'subscription.renewed': {
        const { customerId, items, subscriptionId, status, externalId } = body.data
        const org = await prisma.organization.findFirst({
          where: { abacateCustomerId: customerId },
        })

        if (org) {
          const product = items[0]
          
          // Buscar assinatura existente
          const existingSub = await prisma.subscription.findFirst({
            where: { organizationId: org.id }
          })

          if (existingSub) {
            await prisma.subscription.update({
              where: { id: existingSub.id },
              data: {
                externalId: subscriptionId,
                status: 'active',
                plan: product.externalId,
                currentPeriodEnd: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
              }
            })
          } else {
            await prisma.subscription.create({
              data: {
                organizationId: org.id,
                externalId: subscriptionId,
                status: 'active',
                plan: product.externalId,
                currentPeriodEnd: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
              }
            })
          }

          // Registrar histórico
          await prisma.billingHistory.create({
            data: {
              organizationId: org.id,
              amount: body.data.amount / 100,
              status: 'paid',
              externalId: body.data.id,
            },
          })
        }
        break
      }

      case 'subscription.cancelled': {
        const { subscriptionId } = body.data
        await prisma.subscription.updateMany({
          where: { externalId: subscriptionId },
          data: { status: 'cancelled' },
        })
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AbacatePay Webhook Error]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
