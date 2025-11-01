# 🚀 Деплой системы аналитики на production

**Дата:** 2025-01-27  
**Версия:** MVP

---

## ✅ Выполнено

1. ✅ Код залит в `main` ветку
2. ✅ Все изменения закоммичены
3. ⏳ Миграция БД готова к применению

---

## 📋 Применение миграции на production

### Вариант 1: Через Railway CLI (рекомендуется)

```bash
# Подключиться к БД через Railway CLI
railway connect

# Применить миграцию
psql $DATABASE_URL -f prisma/migrations/apply_to_production.sql
```

### Вариант 2: Через Railway Dashboard

1. Зайти в Railway Dashboard
2. Открыть PostgreSQL service
3. Перейти в раздел "Query"
4. Скопировать содержимое файла `prisma/migrations/apply_to_production.sql`
5. Выполнить SQL запрос

### Вариант 3: Через Prisma Migrate (если доступен)

```bash
DATABASE_URL="postgresql://postgres:AEXabgipqvhbLSwunyuZfLBgwtZsgHjg@hopper.proxy.rlwy.net:40277/railway" \
npx prisma migrate deploy
```

---

## 🔍 Проверка после применения миграции

После применения миграции проверьте:

1. ✅ Таблица `SpecialistAnalyticsDaily` создана
2. ✅ Индексы созданы
3. ✅ Внешний ключ добавлен
4. ✅ Можно создавать записи в таблице

**SQL для проверки:**
```sql
-- Проверка существования таблицы
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'SpecialistAnalyticsDaily'
);

-- Проверка структуры таблицы
\d "SpecialistAnalyticsDaily"

-- Проверка индексов
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'SpecialistAnalyticsDaily';
```

---

## 📝 Настройка Redis

Убедитесь, что в переменных окружения production установлен:

```
REDIS_PUBLIC_URL=redis://default:VwgtfvXFMAnuMOItGfwKMSZSWODgwVVs@turntable.proxy.rlwy.net:27179
```

или

```
REDIS_URL=redis://default:VwgtfvXFMAnuMOItGfwKMSZSWODgwVVs@turntable.proxy.rlwy.net:27179
```

---

## ✅ После деплоя

После применения миграции и деплоя кода:

1. Система начнет собирать аналитику автоматически
2. Данные будут агрегироваться при первом запросе (lazy aggregation)
3. Страница `/profile/analytics` будет доступна для всех специалистов

---

**Дата создания:** 2025-01-27  
**Статус:** Готово к применению на production

