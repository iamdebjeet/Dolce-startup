-- CreateTable
CREATE TABLE "DeliverySettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "chargeMode" TEXT NOT NULL DEFAULT 'unset',
    "fixedFee" DECIMAL(10,2),
    "perKmRate" DECIMAL(10,2),
    "minimumCharge" DECIMAL(10,2),
    "freeAbove" DECIMAL(10,2),
    "pickupEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverySettings_pkey" PRIMARY KEY ("id")
);

