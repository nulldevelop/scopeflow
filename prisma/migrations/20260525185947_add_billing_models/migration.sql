-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "abacateCustomerId" TEXT;

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "externalId" TEXT,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_history" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "invoiceUrl" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_externalId_key" ON "subscription"("externalId");

-- CreateIndex
CREATE INDEX "subscription_organizationId_idx" ON "subscription"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_history_externalId_key" ON "billing_history"("externalId");

-- CreateIndex
CREATE INDEX "billing_history_organizationId_idx" ON "billing_history"("organizationId");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_history" ADD CONSTRAINT "billing_history_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
