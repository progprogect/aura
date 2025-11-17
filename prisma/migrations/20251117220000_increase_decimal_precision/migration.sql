-- Увеличиваем точность Decimal полей для поддержки дробных значений комиссий и балансов
-- Меняем Decimal(15, 2) на Decimal(15, 4) для всех полей с балансами и комиссиями

-- User: balance и bonusBalance
ALTER TABLE "User" 
  ALTER COLUMN "balance" TYPE DECIMAL(15, 4),
  ALTER COLUMN "bonusBalance" TYPE DECIMAL(15, 4);

-- Transaction: amount, balanceBefore, balanceAfter
ALTER TABLE "Transaction" 
  ALTER COLUMN "amount" TYPE DECIMAL(15, 4),
  ALTER COLUMN "balanceBefore" TYPE DECIMAL(15, 4),
  ALTER COLUMN "balanceAfter" TYPE DECIMAL(15, 4);

-- PlatformRevenue: commissionAmount, cashbackAmount, netRevenue
ALTER TABLE "PlatformRevenue" 
  ALTER COLUMN "commissionAmount" TYPE DECIMAL(15, 4),
  ALTER COLUMN "cashbackAmount" TYPE DECIMAL(15, 4),
  ALTER COLUMN "netRevenue" TYPE DECIMAL(15, 4);

