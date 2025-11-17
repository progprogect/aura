-- CreateTable (с проверкой существования)
CREATE TABLE IF NOT EXISTS "PortfolioItem" (
    "id" TEXT NOT NULL,
    "specialistProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (с проверкой существования)
CREATE INDEX IF NOT EXISTS "PortfolioItem_specialistProfileId_idx" ON "PortfolioItem"("specialistProfileId");

-- AddForeignKey (с проверкой существования)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'PortfolioItem_specialistProfileId_fkey'
    ) THEN
        ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_specialistProfileId_fkey" 
        FOREIGN KEY ("specialistProfileId") REFERENCES "SpecialistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

