# 🚂 Railway Migration Steps - Preview System V3

## 🎯 БЫСТРЫЙ СТАРТ - 3 команды

```bash
# 1. Подключиться к Railway (один раз)
npm install -g @railway/cli
railway login
railway link

# 2. Запустить миграции на production
railway run npm run migrate:all-previews

# 3. Запустить Preview Worker (создать новый Service в Dashboard)
# Start Command: npm run worker:preview
```

---

## 📋 Детальные шаги для выполнения миграции на Railway

### Вариант 1: Через Railway CLI (Рекомендуется)

#### 1. Установить Railway CLI (если нет)
```bash
npm install -g @railway/cli
railway login
```

#### 2. Подключиться к проекту
```bash
cd /Users/mikitavalkunovich/Desktop/Cursor/Эволюция 360
railway link
```

#### 3. Запустить миграции на production
```bash
# Исправление PDF 401 errors
railway run npx tsx prisma/scripts/fix-pdf-access.ts

# Миграция base64 → Cloudinary (если будут)
railway run npx tsx prisma/scripts/migrate-preview-to-cdn.ts
```

---

### Вариант 2: Через Railway Dashboard

#### 1. Зайти в Railway Dashboard
https://railway.app/

#### 2. Открыть ваш проект Эволюция 360

#### 3. Создать Deployment для миграции

**Способ A: Temporary Script Service**
1. New → Empty Service
2. Settings → Deploy Command:
   ```
   npx tsx prisma/scripts/fix-pdf-access.ts && npx tsx prisma/scripts/migrate-preview-to-cdn.ts
   ```
3. Variables → скопировать все ENV из основного сервиса
4. Deploy
5. Проверить логи
6. Удалить сервис после успеха

**Способ B: One-off Command (если доступно)**
1. Service → Settings
2. Custom Build Command
3. Запустить миграцию вручную

---

### Вариант 3: Через SSH на Railway (если доступно)

```bash
# Подключиться к Railway
railway shell

# Запустить миграции
npx tsx prisma/scripts/fix-pdf-access.ts
npx tsx prisma/scripts/migrate-preview-to-cdn.ts
```

---

### Вариант 4: Добавить в package.json scripts

#### 1. Добавить скрипты в package.json:
```json
{
  "scripts": {
    "migrate:fix-pdf": "tsx prisma/scripts/fix-pdf-access.ts",
    "migrate:to-cdn": "tsx prisma/scripts/migrate-preview-to-cdn.ts",
    "migrate:all": "npm run migrate:fix-pdf && npm run migrate:to-cdn"
  }
}
```

#### 2. Запустить через Railway:
```bash
railway run npm run migrate:all
```

---

## 🚀 После миграции: Запустить Preview Worker

### Создать Worker Service на Railway

1. **New Service** в вашем проекте
2. **Settings:**
   - Name: `preview-worker`
   - Source: тот же репозиторий
   - Start Command: `npx tsx src/lib/queue/worker-start.ts`
   
3. **Variables:** Скопировать все из основного сервиса:
   - DATABASE_URL
   - REDIS_PUBLIC_URL
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

4. **Deploy** и проверить логи:
```
✅ Preview Worker работает
[Preview Worker] 🚀 Worker запущен
```

---

## 📊 Проверка результатов

### 1. Через Railway Logs
```bash
railway logs --service preview-worker
```

### 2. Через API endpoint (после деплоя)
```bash
curl https://your-app.railway.app/api/lead-magnet/preview/batch \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"regenerateAll": true}'
```

### 3. Через SQL
```bash
railway run npx prisma studio
```

SQL запрос:
```sql
SELECT 
  COUNT(*) as total,
  COUNT("previewUrls") as with_responsive
FROM "LeadMagnet";
```

---

## ⚠️ Важно

1. **Cloudinary ключи** должны быть в ENV на Railway
2. **Redis** должен быть доступен (уже есть)
3. **Worker** должен работать постоянно для новых превью
4. **Миграция** может занять время (500ms на лид-магнит)

---

## 🆘 Troubleshooting

### "Cloudinary не настроен"
- Проверить ENV в Railway Dashboard
- Должны быть: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

### "Redis connection failed"
- Проверить REDIS_PUBLIC_URL в ENV
- Проверить что Redis plugin добавлен

### "Worker не запускается"
- Проверить Start Command: `npx tsx src/lib/queue/worker-start.ts`
- Проверить логи: railway logs --service preview-worker

---

**Готово к запуску на Railway!** 🚀

