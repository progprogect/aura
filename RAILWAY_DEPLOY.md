# 🚀 Railway Deployment - AI-Чат

## Быстрый старт для Railway

### 1. Переменные окружения в Railway

Откройте Railway Dashboard → Settings → Variables и добавьте:

```bash
# PostgreSQL (уже должен быть)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# MongoDB (добавьте сервис MongoDB)
MONGODB_URL=${{MongoDB.MONGO_PUBLIC_URL}}

# Redis (добавьте сервис Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# OpenAI API Key (добавьте вручную)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# App URL (замените на ваш домен)
NEXT_PUBLIC_APP_URL=${{Railway.RAILWAY_PUBLIC_DOMAIN}}

# Environment
NODE_ENV=production
```

---

## 2. Сервисы в Railway (должны быть добавлены)

✅ **PostgreSQL** - основная БД (специалисты, категории, сессии)
✅ **MongoDB** - embeddings для AI-поиска
✅ **Redis** - кэш и аналитика
✅ **Next.js app** - ваше приложение

---

## 3. После деплоя - выполните миграции

### 3.1 PostgreSQL миграции

```bash
# Через Railway CLI
railway run npx prisma db push
```

Или в Railway Shell:
```bash
npx prisma db push
```

### 3.2 MongoDB индексы

```bash
railway run npx tsx prisma/setup-mongodb.ts
```

### 3.3 Генерация embeddings

```bash
railway run npm run ai:generate-embeddings
```

⏱️ Это займёт ~2-5 минут для 20 специалистов.

---

## 4. Проверка работы

### 4.1 Откройте приложение

```
https://ваше-приложение.railway.app
```

### 4.2 Проверьте AI-чат

```
https://ваше-приложение.railway.app/chat
```

Напишите: "Хочу психолога для работы с тревогой"

### 4.3 Проверьте БД (через Railway Shell)

```bash
# PostgreSQL
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"ChatSession\";"

# MongoDB
mongosh $MONGODB_URL --eval "db.specialist_embeddings.countDocuments()"

# Redis
redis-cli -u $REDIS_URL KEYS "chat:analytics:*"
```

---

## 5. Troubleshooting

### Ошибка: "MONGODB_URL is not set"
→ Добавьте MongoDB сервис в Railway и установите переменную

### Ошибка: "OPENAI_API_KEY is not set"
→ Добавьте вручную в Railway Variables

### Ошибка: "No embeddings found"
→ Запустите `railway run npm run ai:generate-embeddings`

### Build fails
→ Убедитесь что все зависимости установлены: `npm install`

---

## 6. Автоматический деплой

Railway автоматически деплоит при push в main:

```bash
git add .
git commit -m "feat: AI-чат с MongoDB embeddings"
git push origin main
```

Railway автоматически:
1. ✅ Установит зависимости
2. ✅ Сгенерирует Prisma Client
3. ✅ Соберёт Next.js
4. ✅ Запустит приложение

---

## 7. Post-Deploy шаги (один раз)

После первого деплоя выполните:

```bash
# 1. Миграции БД
railway run npx prisma db push

# 2. Создание индексов MongoDB
railway run npx tsx prisma/setup-mongodb.ts

# 3. Генерация embeddings
railway run npm run ai:generate-embeddings
```

---

## ✅ Готово!

Ваш AI-чат работает на production! 🎉

**Важные URLs:**
- 🏠 Главная: https://ваше-приложение.railway.app
- 🤖 AI-чат: https://ваше-приложение.railway.app/chat
- 📋 Каталог: https://ваше-приложение.railway.app/catalog

---

## 📊 Мониторинг

### Логи Railway

```bash
railway logs --follow
```

### Метрики в БД

```sql
-- Статистика чата
SELECT * FROM "ChatAnalytics" ORDER BY date DESC LIMIT 7;

-- Активные сессии
SELECT COUNT(*) FROM "ChatSession" WHERE status = 'active';
```

### Redis метрики

```bash
redis-cli -u $REDIS_URL INFO stats
```

