# 🚀 Deployment Guide для AI-Чата

## Шаг 1: Подготовка БД (PostgreSQL + pgvector)

### 1.1 Включить pgvector extension

Подключитесь к Railway PostgreSQL и выполните:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Или через Railway CLI:
```bash
railway connect postgres
# В psql:
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

### 1.2 Применить миграции Prisma

```bash
npx prisma migrate deploy
```

Или в Railway:
```bash
railway run npx prisma migrate deploy
```

---

## Шаг 2: Настроить переменные окружения

В Railway добавьте переменные (Settings → Variables):

```
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

DATABASE_URL и REDIS_URL уже должны быть настроены через Railway автоматически.

---

## Шаг 3: Генерация embeddings

### Локально (рекомендуется для первого раза):

```bash
npm run ai:generate-embeddings
```

Это займёт ~2-5 минут для 20 специалистов.

### Или через Railway:

```bash
railway run npm run ai:generate-embeddings
```

---

## Шаг 4: Деплой на Railway

```bash
git add .
git commit -m "feat: добавлен AI-чат с semantic search"
git push origin main
```

Railway автоматически задеплоит изменения.

---

## Шаг 5: Проверка

1. Откройте https://your-app.railway.app/chat
2. Напишите: "Хочу психолога для работы с тревогой"
3. Проверьте, что GPT ведёт диалог и показывает специалистов

---

## Troubleshooting

### Ошибка: "pgvector extension not found"
→ Выполните CREATE EXTENSION vector в PostgreSQL

### Ошибка: "OPENAI_API_KEY is not set"
→ Добавьте переменную в Railway Variables

### Ошибка: "No embeddings found"
→ Запустите npm run ai:generate-embeddings

### Embeddings generation долго работает
→ Это нормально! ~5-10 секунд на одного специалиста из-за rate limits OpenAI

---

## Мониторинг

### Проверить количество embeddings:

```sql
SELECT COUNT(*) FROM "SpecialistEmbedding";
```

### Посмотреть статистику чата:

```sql
SELECT * FROM "ChatAnalytics" ORDER BY date DESC LIMIT 10;
```

### Redis (статистика в реальном времени):

```bash
railway connect redis
# В redis-cli:
KEYS chat:analytics:*
GET chat:analytics:sessions:today:2025-10-06
```

---

## Автоматические задачи (опционально)

### Cron job для агрегации аналитики (каждую ночь):

```javascript
// Добавить в Railway → Settings → Cron Jobs
// Каждый день в 00:00
0 0 * * * curl -X POST https://your-app.railway.app/api/analytics/aggregate
```

### Очистка устаревших сессий (каждую неделю):

```javascript
// Каждое воскресенье в 03:00
0 3 * * 0 curl -X POST https://your-app.railway.app/api/analytics/cleanup
```

---

## Готово! 🎉

Теперь AI-чат полностью функционален и готов к production использованию.

