-- Миграция на систему баллов
-- Конвертация всех цен из валют/копеек в баллы

-- ========================================
-- SpecialistProfile: копейки → баллы
-- ========================================

-- Добавить новые колонки для баллов
ALTER TABLE "SpecialistProfile" 
  ADD COLUMN "priceFromInPoints" INTEGER,
  ADD COLUMN "priceToInPoints" INTEGER;

-- Конвертация: копейки / 100 = баллы (1 BYN = 100 копеек = 1 балл)
UPDATE "SpecialistProfile"
SET 
  "priceFromInPoints" = CASE 
    WHEN "priceFrom" IS NOT NULL THEN "priceFrom" / 100 
    ELSE NULL 
  END,
  "priceToInPoints" = CASE 
    WHEN "priceTo" IS NOT NULL THEN "priceTo" / 100 
    ELSE NULL 
  END
WHERE "priceFrom" IS NOT NULL OR "priceTo" IS NOT NULL;

-- Удалить старые колонки
ALTER TABLE "SpecialistProfile" 
  DROP COLUMN IF EXISTS "priceFrom",
  DROP COLUMN IF EXISTS "priceTo",
  DROP COLUMN IF EXISTS "currency";

-- ========================================
-- Service: удалить currency
-- ========================================

ALTER TABLE "Service" DROP COLUMN IF EXISTS "currency";

-- ========================================
-- Order: amountPaid → pointsPaid
-- ========================================

-- Добавить новую колонку для баллов
ALTER TABLE "Order" 
  ADD COLUMN "pointsPaid" DECIMAL(15,4);

-- Конвертация: 1 BYN = 1 балл (amountPaid уже в BYN)
UPDATE "Order"
SET "pointsPaid" = "amountPaid"
WHERE "amountPaid" IS NOT NULL;

-- Удалить старую колонку
ALTER TABLE "Order" DROP COLUMN IF EXISTS "amountPaid";

