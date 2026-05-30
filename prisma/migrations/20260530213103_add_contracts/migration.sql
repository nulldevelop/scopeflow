-- CreateTable
CREATE TABLE "contract" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "quoteId" TEXT,
    "title" TEXT NOT NULL,
    "contractNumber" TEXT,
    "objectClause" TEXT,
    "timelineClause" TEXT,
    "paymentClause" TEXT,
    "ipClause" TEXT,
    "totalValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "providerSigned" BOOLEAN NOT NULL DEFAULT false,
    "providerSignedAt" TIMESTAMP(3),
    "providerSignerName" TEXT,
    "providerSignatureHash" TEXT,
    "clientSigned" BOOLEAN NOT NULL DEFAULT false,
    "clientSignedAt" TIMESTAMP(3),
    "clientSignerName" TEXT,
    "clientSignatureHash" TEXT,
    "sentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contract_organizationId_idx" ON "contract"("organizationId");

-- CreateIndex
CREATE INDEX "contract_clientId_idx" ON "contract"("clientId");

-- CreateIndex
CREATE INDEX "contract_quoteId_idx" ON "contract"("quoteId");

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
