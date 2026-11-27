-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "consent" TEXT NOT NULL DEFAULT 'first_name',
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "product" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'website',
ALTER COLUMN "text" SET DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Review_externalId_key" ON "Review"("externalId");

