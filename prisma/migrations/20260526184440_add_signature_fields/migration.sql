-- AlterTable
ALTER TABLE "quote" ADD COLUMN     "signatureHash" TEXT,
ADD COLUMN     "signedAt" TIMESTAMP(3),
ADD COLUMN     "signerName" TEXT;
