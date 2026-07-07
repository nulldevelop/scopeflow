-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'PROPOSAL_SENT', 'NEGOTIATING', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "lead" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "category" TEXT NOT NULL,
    "hasWebsite" BOOLEAN NOT NULL,
    "website" TEXT,
    "domainStatus" JSONB,
    "score" INTEGER NOT NULL DEFAULT 0,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_organizationId_idx" ON "lead"("organizationId");

-- CreateIndex
CREATE INDEX "lead_organizationId_score_idx" ON "lead"("organizationId", "score");

-- CreateIndex
CREATE INDEX "lead_organizationId_stage_idx" ON "lead"("organizationId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "lead_organizationId_placeId_key" ON "lead"("organizationId", "placeId");

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

