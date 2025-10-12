# 📦 Preview System V3 - Migration Guide

## 🎯 Обзор миграции

Миграция системы превью с base64 в Cloudinary CDN с responsive images.

**Что меняется:**
- ❌ Старое: `previewImage: String` (base64 data URL)
- ✅ Новое: `previewUrls: Json` ({ thumbnail, card, detail, original })

**Преимущества:**
- 🚀 CDN доставка (быстрее в 10x)
- 📱 Responsive images (экономия трафика до 70%)
- 🖼️ WebP/AVIF форматы (размер меньше на 30-50%)
- ♻️ Меньше нагрузки на БД (без base64)

---

## ✅ Что уже сделано

### 1. База данных
- ✅ SQL миграция применена (`20251010182008_add_preview_urls`)
- ✅ Поле `previewUrls JSONB` добавлено в таблицу `LeadMagnet`
- ✅ Старое поле `previewImage` сохранено для обратной совместимости

### 2. Backend
- ✅ BullMQ queue настроена
- ✅ Worker для фоновой генерации
- ✅ API endpoints созданы
- ✅ Cloudinary интеграция готова

### 3. Frontend
- ✅ `ResponsivePreview` компонент с srcset
- ✅ `CardPreview` обновлён для поддержки обоих полей
- ✅ Обратная совместимость

---

## 🚀 Шаги миграции

### Шаг 1: Запустить Preview Worker

Worker обрабатывает задачи генерации превью в фоне.

**Local Development:**
```bash
npx ts-node src/lib/queue/worker-start.ts
```

**Production (Railway):**

Добавить в `package.json`:
```json
{
  "scripts": {
    "worker:preview": "node --loader ts-node/esm src/lib/queue/worker-start.ts"
  }
}
```

На Railway создать новый Service:
- Type: Worker
- Start Command: `npm run worker:preview`
- Variables: те же что у основного сервиса

---

### Шаг 2: Исправить существующие PDF (401 errors)

Скрипт перезагружает PDF с правильными настройками доступа.

```bash
npx ts-node prisma/scripts/fix-pdf-access.ts
```

**Что делает:**
- Находит PDF с 401 ошибками
- Перезагружает с `resource_type: 'raw'`
- Обновляет URLs в БД

**Ожидаемый результат:**
```
📄 Найдено PDF файлов: X
✅ Исправлено! Новый URL: https://...
```

---

### Шаг 3: Мигрировать существующие base64 превью

Переносит base64 превью в Cloudinary с responsive размерами.

```bash
npx ts-node prisma/scripts/migrate-preview-to-cdn.ts
```

**Что делает:**
1. Находит лид-магниты с base64 `previewImage`
2. Загружает в Cloudinary (3 размера)
3. Сохраняет `previewUrls` в БД
4. Оставляет старый `previewImage` для rollback

**Процесс:**
```
📊 Найдено лид-магнитов для миграции: 25

⚙️  Обрабатываем: Мой PDF Guide
   📤 Загрузка в Cloudinary...
   ✅ Успешно мигрировано
      - Thumbnail: https://res.cloudinary.com/.../w_400,h_300/...
      - Card: https://res.cloudinary.com/.../w_800,h_600/...
      - Detail: https://res.cloudinary.com/.../w_1200,h_900/...

📊 Итоговая статистика:
   ✅ Успешно: 24
   ⏭️  Пропущено: 1
   ❌ Ошибок: 0
```

**Важно:** Скрипт добавляет задержку 500ms между запросами (rate limiting).

---

### Шаг 4: Сгенерировать превью для новых лид-магнитов

Для лид-магнитов без превью (ссылки, которые не генерировались ранее).

**Вариант A: Через API (рекомендуется)**
```bash
curl -X POST http://localhost:3000/api/lead-magnet/preview/batch \
  -H "Content-Type: application/json" \
  -d '{"regenerateAll": true}'
```

**Вариант B: Вручную для конкретного**
```bash
curl -X POST http://localhost:3000/api/lead-magnet/preview/generate \
  -H "Content-Type: application/json" \
  -d '{"leadMagnetId": "clxxx..."}'
```

**Проверить статус:**
```bash
curl http://localhost:3000/api/lead-magnet/preview/status/{jobId}
```

---

### Шаг 5: Проверка результатов

**SQL запрос для проверки:**
```sql
-- Сколько мигрировано
SELECT 
  COUNT(*) FILTER (WHERE "previewUrls" IS NOT NULL) as migrated,
  COUNT(*) FILTER (WHERE "previewImage" IS NOT NULL AND "previewUrls" IS NULL) as pending,
  COUNT(*) FILTER (WHERE "previewImage" IS NULL AND "previewUrls" IS NULL) as no_preview
FROM "LeadMagnet";
```

**Ожидаемый результат:**
```
migrated | pending | no_preview
---------|---------|------------
   45    |    0    |     5
```

**Проверка в UI:**
- Откройте любой профиль специалиста
- Превью должны загружаться быстро
- В DevTools Network: изображения должны быть WebP
- Разные размеры для mobile/desktop (проверить srcset)

---

## 🔄 Rollback (если что-то пошло не так)

### Откат миграции превью

```bash
npx ts-node prisma/scripts/rollback-preview-migration.ts
```

**Что делает:**
1. Удаляет превью из Cloudinary
2. Восстанавливает `previewUrls = null`
3. Оставляет старый `previewImage` (backup)

### Откат SQL миграции

**НЕ РЕКОМЕНДУЕТСЯ** (может привести к потере данных)

```sql
-- Только если критично необходимо
ALTER TABLE "LeadMagnet" DROP COLUMN "previewUrls";
```

---

## 📊 Мониторинг миграции

### Логи Worker

```bash
# Railway
railway logs --service preview-worker

# Local
# Смотрите в консоль где запущен worker
```

**Что искать:**
```
[Preview Worker] ✅ Задача completed - успех
[Preview Worker] ❌ Задача failed - ошибка
```

### Redis Queue Stats

```bash
# Подключиться к Redis
redis-cli -u $REDIS_PUBLIC_URL

# Проверить очередь
LLEN bull:preview-generation:wait    # Ожидают
LLEN bull:preview-generation:active  # Обрабатываются
LLEN bull:preview-generation:failed  # Провалены
```

### Cloudinary Usage

Dashboard → Media Library → `aura/previews/`

Проверить:
- Количество файлов
- Общий размер
- Bandwidth usage

---

## ⚠️ Важные замечания

### 1. Старые превью НЕ удаляются автоматически

После успешной миграции `previewImage` остаётся как backup.

**Удалить вручную (после проверки):**
```sql
UPDATE "LeadMagnet" 
SET "previewImage" = NULL 
WHERE "previewUrls" IS NOT NULL;
```

**Экономия места в БД:** ~50-80% для лид-магнитов с base64

### 2. Rate Limiting

Скрипты добавляют задержку между запросами:
- Миграция: 500ms между лид-магнитами
- Batch generation: throttling в worker

**НЕ запускайте несколько скриптов одновременно!**

### 3. Cloudinary Limits

Free план:
- 25 GB storage
- 25 GB bandwidth/month
- 100K transformations/month

**Рекомендация:** Мониторить usage в Cloudinary Dashboard

### 4. Worker должен работать постоянно

Новые лид-магниты генерируют превью через queue.

**Если worker упал:**
- Превью не генерируются
- Задачи накапливаются в queue
- После перезапуска обработаются автоматически

---

## 🎯 Acceptance Criteria для миграции

- ✅ SQL миграция применена без ошибок
- ✅ Worker запущен и обрабатывает задачи
- ✅ PDF 401 errors исправлены
- ✅ Base64 превью мигрированы в Cloudinary
- ✅ Новые лид-магниты генерируют превью автоматически
- ✅ UI показывает responsive images с srcset
- ✅ Нет регрессий (старые превью работают)
- ✅ Rollback скрипты готовы к использованию

---

## 🆘 Troubleshooting

### Проблема: Worker не запускается

**Причина:** Redis недоступен

**Решение:**
```bash
# Проверить Redis
redis-cli -u $REDIS_PUBLIC_URL ping
# Должно вернуть: PONG

# Проверить переменные
echo $REDIS_PUBLIC_URL
```

### Проблема: Превью не загружаются

**Причина 1:** Cloudinary не настроен

**Решение:**
```bash
# Проверить .env
grep CLOUDINARY .env

# Должны быть:
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

**Причина 2:** Worker не работает

**Решение:**
- Проверить логи worker
- Перезапустить worker
- Проверить очередь в Redis

### Проблема: PDF всё ещё 401

**Решение:**
1. Запустить fix-pdf-access.ts снова
2. Проверить что используется `uploadPDF()` а не `uploadDocument()`
3. Проверить Cloudinary Settings → Security

---

## 📞 Поддержка

**Вопросы по миграции:**
- Проверить логи: `[Preview Worker]`, `[Cloudinary Storage]`
- Проверить docs: `/docs/preview-system/ARCHITECTURE.md`
- SQL запросы для отладки выше

**После миграции:**
- Старую систему можно удалить после 1-2 недель стабильной работы
- Cleanup код: удалить `pdf-preview.ts`, старый `preview-generator-universal.ts`

---

**Дата:** 2025-10-10  
**Версия:** 3.0.0  
**Статус:** ✅ Ready for Production Migration

