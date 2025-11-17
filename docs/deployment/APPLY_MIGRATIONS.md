# 🚀 Применение миграций на production

## 📋 Доступные миграции

1. **20251117115632_add_portfolio** - Создание таблицы PortfolioItem
2. **20251117184902_add_company_profile_fields** - Добавление полей для компаний (profileType, companyName, address, addressCoordinates, taxId)

## 🔧 Способы применения миграций

### Вариант 1: Через Railway CLI (рекомендуется)

```bash
# 1. Установить Railway CLI (если нет)
npm install -g @railway/cli

# 2. Залогиниться
railway login

# 3. Подключиться к проекту
railway link

# 4. Применить миграции
railway run npm run migrate:deploy
```

### Вариант 2: Через Railway Dashboard

1. Зайти в Railway Dashboard → ваш проект
2. Открыть Next.js сервис → **Settings** → **Deploy**
3. В **"Custom Start Command"** временно изменить на:
   ```bash
   npx prisma migrate deploy && node server.js
   ```
4. Сохранить и нажать **"Redeploy"**
5. После успешного деплоя вернуть команду на:
   ```bash
   node server.js
   ```

### Вариант 3: Через Railway One-off Command

1. Railway Dashboard → ваш проект → **Deployments**
2. Нажать **"New Deployment"**
3. В **"Command"** указать:
   ```bash
   npx prisma migrate deploy
   ```
4. Запустить деплой

### Вариант 4: Через Prisma Studio (для проверки)

```bash
railway run npx prisma studio
```

## ✅ Проверка после применения

После применения миграций проверьте:

### 1. Проверка таблицы PortfolioItem

```sql
-- Проверка существования таблицы
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'PortfolioItem'
);

-- Проверка структуры
\d "PortfolioItem"
```

### 2. Проверка полей компаний в SpecialistProfile

```sql
-- Проверка наличия колонок
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'SpecialistProfile'
  AND column_name IN ('profileType', 'companyName', 'address', 'addressCoordinates', 'taxId');

-- Проверка индекса
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'SpecialistProfile' 
  AND indexname = 'SpecialistProfile_profileType_idx';
```

### 3. Проверка через Prisma

```bash
railway run npx prisma db pull
```

Должны появиться новые поля в schema.prisma.

## ⚠️ Важные замечания

1. **Миграции идемпотентны**: Используют `IF NOT EXISTS`, поэтому безопасно запускать несколько раз
2. **Резервное копирование**: Рекомендуется сделать backup БД перед применением миграций
3. **Время применения**: Миграции применяются быстро (< 1 секунды)

## 🐛 Решение проблем

### Ошибка: "relation already exists"
- Это нормально, миграции используют `IF NOT EXISTS`
- Можно игнорировать или проверить, что таблица уже существует

### Ошибка: "column already exists"
- Колонка уже добавлена ранее
- Можно безопасно игнорировать

### Ошибка: "DATABASE_URL not found"
- Убедитесь, что переменная окружения установлена в Railway
- Проверьте в Settings → Variables

