import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-abacatepay-signature')
    const secret = process.env.ABACATEPAY_WEBHOOK_SECRET

    if (!secret) {
      console.error(
        '[AbacatePay Webhook] ABACATEPAY_WEBHOOK_SECRET is not defined',
      )
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 },
      )
    }

    if (!signature) {
      return NextResponse.json({ error: 'Assinatura ausente' }, { status: 401 })
    }

    const digest = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    // Timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature)
    const digestBuf = Buffer.from(digest)
    const isValid =
      sigBuf.length === digestBuf.length &&
      crypto.timingSafeEqual(sigBuf, digestBuf)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 },
      )
    }

    const body = JSON.parse(rawBody)
    const { event } = body.data

    switch (event) {
      case 'checkout.completed':
      case 'subscription.completed':
      case 'subscription.renewed': {
        const { customerId, items, subscriptionId } = body.data
        const org = await prisma.organization.findFirst({
          where: { abacateCustomerId: customerId },
          select: { id: true },
        })

        if (org) {
          const product = items[0]

          const PLAN_MAP: Record<string, string> = {}
          if (process.env.ABACATEPAY_PRODUCT_PRO)
            PLAN_MAP[process.env.ABACATEPAY_PRODUCT_PRO] = 'pro'
          if (process.env.ABACATEPAY_PRODUCT_EQUIPE)
            PLAN_MAP[process.env.ABACATEPAY_PRODUCT_EQUIPE] = 'equipe'

          const planName = PLAN_MAP[product.id] || product.externalId || 'pro'

          const existingSub = await prisma.subscription.findFirst({
            where: { organizationId: org.id },
            select: { id: true },
          })

          const periodEnd = body.data.currentPeriodEnd
            ? new Date(body.data.currentPeriodEnd)
            : new Date(Date.now() + 32 * 24 * 60 * 60 * 1000)

          if (existingSub) {
            await prisma.subscription.update({
              where: { id: existingSub.id },
              data: {
                externalId: subscriptionId,
                status: 'active',
                plan: planName,
                currentPeriodEnd: periodEnd,
              },
            })
          } else {
            await prisma.subscription.create({
              data: {
                organizationId: org.id,
                externalId: subscriptionId,
                status: 'active',
                plan: planName,
                currentPeriodEnd: periodEnd,
              },
            })
          }

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
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
