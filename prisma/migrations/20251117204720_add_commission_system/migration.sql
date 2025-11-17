-- CreateTable: PlatformRevenue
CREATE TABLE IF NOT EXISTS "PlatformRevenue" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "transactionId" TEXT,
    "orderId" TEXT,
    "leadMagnetPurchaseId" TEXT,
    "commissionAmount" DECIMAL(15,2) NOT NULL,
    "cashbackAmount" DECIMAL(15,2) NOT NULL,
    "netRevenue" DECIMAL(15,2) NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "specialistUserId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformRevenue_pkey" PRIMARY KEY ("id")
);

-- AddColumn: commissionProcessed, cashbackProcessed, platformRevenueId to LeadMagnetPurchase
ALTER TABLE "LeadMagnetPurchase" ADD COLUMN IF NOT EXISTS "commissionProcessed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "LeadMagnetPurchase" ADD COLUMN IF NOT EXISTS "cashbackProcessed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "LeadMagnetPurchase" ADD COLUMN IF NOT EXISTS "platformRevenueId" TEXT;

-- AddColumn: commissionProcessed, cashbackProcessed, platformRevenueId to Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "commissionProcessed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cashbackProcessed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "platformRevenueId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PlatformRevenue_type_idx" ON "PlatformRevenue"("type");
CREATE INDEX IF NOT EXISTS "PlatformRevenue_clientUserId_idx" ON "PlatformRevenue"("clientUserId");
CREATE INDEX IF NOT EXISTS "PlatformRevenue_specialistUserId_idx" ON "PlatformRevenue"("specialistUserId");
CREATE INDEX IF NOT EXISTS "PlatformRevenue_transactionId_idx" ON "PlatformRevenue"("transactionId");
CREATE INDEX IF NOT EXISTS "PlatformRevenue_orderId_idx" ON "PlatformRevenue"("orderId");
CREATE INDEX IF NOT EXISTS "PlatformRevenue_leadMagnetPurchaseId_idx" ON "PlatformRevenue"("leadMagnetPurchaseId");
CREATE INDEX IF NOT EXISTS "PlatformRevenue_createdAt_idx" ON "PlatformRevenue"("createdAt");

-- AddForeignKey (optional, для связи с Order)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'PlatformRevenue_orderId_fkey'
    ) THEN
        ALTER TABLE "PlatformRevenue" ADD CONSTRAINT "PlatformRevenue_orderId_fkey" 
        FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey (optional, для связи с LeadMagnetPurchase)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'PlatformRevenue_leadMagnetPurchaseId_fkey'
    ) THEN
        ALTER TABLE "PlatformRevenue" ADD CONSTRAINT "PlatformRevenue_leadMagnetPurchaseId_fkey" 
        FOREIGN KEY ("leadMagnetPurchaseId") REFERENCES "LeadMagnetPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey (для связи с User - clientUserId)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'PlatformRevenue_clientUserId_fkey'
    ) THEN
        ALTER TABLE "PlatformRevenue" ADD CONSTRAINT "PlatformRevenue_clientUserId_fkey" 
        FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey (для связи с User - specialistUserId, опционально)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'PlatformRevenue_specialistUserId_fkey'
    ) THEN
        ALTER TABLE "PlatformRevenue" ADD CONSTRAINT "PlatformRevenue_specialistUserId_fkey" 
        FOREIGN KEY ("specialistUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

