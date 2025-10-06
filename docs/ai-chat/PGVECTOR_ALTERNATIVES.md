# 🗄️ Установка pgvector на Railway PostgreSQL

## Вариант 1: Railway Template с pgvector (Рекомендуется)

### Шаг 1: Создать новый PostgreSQL с pgvector

1. Откройте Railway Dashboard
2. Нажмите "+ New" → "Database" → "PostgreSQL"
3. **ИЛИ** используйте готовый template:
   - Найдите "pgvector" в Railway Templates
   - Deploy template в ваш проект

### Шаг 2: Получить DATABASE_URL

1. Откройте сервис PostgreSQL в Railway
2. Перейдите в "Variables"
3. Скопируйте `DATABASE_PUBLIC_URL` или `DATABASE_URL`

Формат:
```
postgresql://postgres:password@region.railway.app:port/railway
```

### Шаг 3: Подключиться и проверить pgvector

```bash
# Подключитесь к новой БД
psql "postgresql://postgres:PASSWORD@HOST:PORT/railway"

# Проверьте наличие pgvector
\dx

# Если pgvector есть, создайте extension
CREATE EXTENSION IF NOT EXISTS vector;

# Проверьте версию
SELECT extversion FROM pg_extension WHERE extname = 'vector';
```

---

## Вариант 2: Обновить существующую БД (требует support ticket)

К сожалению, на стандартном Railway PostgreSQL pgvector не предустановлен.

Вам нужно:
1. Открыть support ticket в Railway: https://railway.app/help
2. Попросить установить pgvector extension на ваш PostgreSQL instance
3. Дождаться ответа (обычно 1-2 дня)

**Текст запроса:**
```
Hi Railway team,

Could you please install the pgvector extension on my PostgreSQL instance?

Project: diligent-presence
Service: Postgres
Database URL: hopper.proxy.rlwy.net:40277

I need it for AI-powered semantic search in my application.

Thank you!
```

---

## Вариант 3: Использовать Supabase (бесплатно, с pgvector)

Supabase предоставляет PostgreSQL с предустановленным pgvector:

### Шаг 1: Создать проект на Supabase

1. Перейдите на https://supabase.com
2. Создайте новый проект (Free tier)
3. Дождитесь создания БД (~2 минуты)

### Шаг 2: Получить DATABASE_URL

1. Откройте "Settings" → "Database"
2. Скопируйте "Connection string" в формате URI
3. Замените `[YOUR-PASSWORD]` на ваш пароль

### Шаг 3: Включить pgvector

```sql
-- В Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### Шаг 4: Мигрировать данные (опционально)

Если у вас уже есть данные в Railway:

```bash
# Экспорт из Railway
pg_dump "postgresql://postgres:OLD_PASSWORD@hopper.proxy.rlwy.net:40277/railway" > dump.sql

# Импорт в Supabase
psql "postgresql://postgres:NEW_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres" < dump.sql
```

---

## Вариант 4: Использовать отдельный Vector Store (Pinecone/Weaviate)

Если не хотите заморачиваться с pgvector, используйте managed vector DB:

### Pinecone (проще всего)

```bash
npm install @pinecone-database/pinecone
```

**Плюсы:**
- Бесплатный tier (1M vectors)
- Не нужно настраивать PostgreSQL
- Очень быстрый поиск
- Автоматический scaling

**Минусы:**
- Нужен отдельный API key
- Данные хранятся отдельно от основной БД

---

## После установки pgvector

### 1. Обновите DATABASE_URL в проекте

```bash
# .env.local
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/railway"
```

### 2. Примените миграции

```bash
npx prisma db push
```

### 3. Создайте индекс (опционально, для production)

```sql
-- После генерации embeddings (>1000 записей)
CREATE INDEX ON "SpecialistEmbedding" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 4. Сгенерируйте embeddings

```bash
npm run ai:generate-embeddings
```

---

## Проверка работы

```bash
# Подключитесь к БД
psql $DATABASE_URL

# Проверьте, что extension установлен
SELECT * FROM pg_extension WHERE extname = 'vector';

# Проверьте, что таблица создана
\d "SpecialistEmbedding"

# Проверьте количество embeddings
SELECT COUNT(*) FROM "SpecialistEmbedding";
```

---

## Рекомендация

**Для production:** Вариант 1 (Railway с pgvector) или Вариант 3 (Supabase)

**Для быстрого старта:** Вариант 3 (Supabase) — работает из коробки, бесплатно, с pgvector

**Для масштабирования:** Вариант 4 (Pinecone) — если понадобится >100k специалистов

---

Какой вариант выберете, дайте знать — помогу с настройкой! 🚀

