# ✅ Система баллов Phase 1 — Завершена

## 🎯 Что реализовано

### 1. База данных

- ✅ Обновлена модель `User` (поля `balance`, `bonusBalance`, `bonusExpiresAt`)
- ✅ Создана модель `Transaction` (история операций)
- ✅ Создана модель `Currency` (для Phase 2)
- ✅ SQL миграция: `prisma/migrations/20251012_add_points_system/migration.sql`

### 2. Backend

#### PointsService (`src/lib/points/points-service.ts`)
- ✅ `grantRegistrationBonus()` — начисление 50 баллов при регистрации
- ✅ `getBalance()` — получить баланс пользователя
- ✅ `addPoints()` — добавить баллы
- ✅ `deductPoints()` — списать баллы (приоритет: бонусные → обычные)
- ✅ `hasEnoughPoints()` — проверка достаточности средств
- ✅ `getTransactionHistory()` — история операций
- ✅ `expireOldBonuses()` — аннулирование просроченных бонусов

#### API Endpoints
- ✅ `GET /api/user/balance` — баланс пользователя
- ✅ `GET /api/user/transactions` — история транзакций
- ✅ `GET /api/cron/expire-bonuses` — cron для сгорания бонусов

#### Утилиты
- ✅ `src/lib/points/format.ts` — форматирование баллов, дат, иконок
- ✅ `src/types/points.ts` — TypeScript типы

#### Интеграция
- ✅ Добавлено в `unified-auth-service.ts` — начисление при регистрации

### 3. Frontend

#### UI Компоненты
- ✅ `BalanceChip` — компактный баланс для хедера
- ✅ `BalanceWidget` — детальный виджет для личного кабинета
- ✅ `TransactionHistoryModal` — модальное окно с историей операций
- ✅ `BalanceWidgetWrapper` — wrapper для server components

#### Интеграция
- ✅ Добавлен `BalanceChip` в `AuthAwareNavigation` (хедер)
- ✅ Добавлен `BalanceWidget` в `/profile` (личный кабинет)

### 4. Документация

- ✅ `docs/points/README.md` — главная документация
- ✅ `docs/points/ARCHITECTURE.md` — архитектура системы
- ✅ `docs/points/API.md` — документация API
- ✅ `docs/points/ROADMAP.md` — план Phase 2
- ✅ `docs/points/CRON_SETUP.md` — настройка Railway Cron

---

## 🚀 Как применить миграцию

### Вариант 1: Через скрипт

```bash
# Установить переменную
export DATABASE_PUBLIC_URL="postgresql://postgres:AEXabgipqvhbLSwunyuZfLBgwtZsgHjg@hopper.proxy.rlwy.net:40277/railway"

# Применить миграцию
bash apply-points-migration.sh
```

### Вариант 2: Вручную через psql

```bash
psql "$DATABASE_PUBLIC_URL" < prisma/migrations/20251012_add_points_system/migration.sql
npx prisma generate
```

### Вариант 3: Через Railway CLI

```bash
railway run psql < prisma/migrations/20251012_add_points_system/migration.sql
npx prisma generate
```

---

## ⚙️ Настройка Cron

### 1. Сгенерировать CRON_SECRET

```bash
openssl rand -hex 32
```

### 2. Добавить в Railway Variables

```
CRON_SECRET=<сгенерированный_секрет>
```

### 3. Настроить Railway Cron

**Schedule:** `0 3 * * *` (каждый день в 03:00 UTC)

**URL:** `https://your-railway-url.app/api/cron/expire-bonuses`

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

Подробная инструкция: `docs/points/CRON_SETUP.md`

---

## ✨ Особенности реализации

### 1. Два типа баллов

| Тип | Источник | Срок действия | Вывод |
|-----|----------|---------------|-------|
| **Обычные** | Покупка | Бессрочно | Да (Phase 2) |
| **Бонусные** | Регистрация | 7 дней | Нет |

### 2. Приоритет списания

При покупке:
1. Сначала списываются **бонусные** баллы
2. Потом **обычные** баллы

### 3. Безопасность

- **ACID-транзакции** через Prisma `$transaction`
- **Audit log** — каждая операция записывается в `Transaction`
- **Decimal precision** — `Decimal(15, 2)` для точности

### 4. UX

- **Хедер:** Компактный чип с общим балансом
- **ЛК:** Детальный виджет с разбивкой + таймер сгорания
- **История:** Модальное окно со всеми операциями

---

## 📊 Тестирование

### 1. Регистрация нового пользователя

1. Откройте `/auth/register`
2. Зарегистрируйтесь
3. Проверьте баланс → должно быть **50 бонусных баллов**
4. Проверьте `bonusExpiresAt` → должна быть дата через 7 дней

### 2. Отображение в UI

1. Авторизуйтесь
2. Проверьте **хедер** → должен отображаться `BalanceChip` с "50 б."
3. Откройте **/profile** → должен быть виджет с балансом
4. Кликните **"История"** → должно открыться модальное окно

### 3. Cron job

1. Вручную установите `bonusExpiresAt` в прошлое:

```sql
UPDATE "User"
SET "bonusExpiresAt" = NOW() - INTERVAL '1 day'
WHERE "bonusBalance" > 0
LIMIT 1;
```

2. Запустите cron:

```bash
curl https://your-railway-url.app/api/cron/expire-bonuses \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

3. Проверьте результат:

```sql
SELECT "bonusBalance", "bonusExpiresAt"
FROM "User"
WHERE id = '<user_id>';
-- Должно быть: bonusBalance = 0, bonusExpiresAt = NULL
```

4. Проверьте Transaction:

```sql
SELECT * FROM "Transaction"
WHERE type = 'bonus_expired'
ORDER BY "createdAt" DESC;
```

---

## 🔮 Что дальше (Phase 2)

### Приоритет 1: Покупка за баллы

- Лид-магниты за баллы
- Продукты от новых специалистов
- Система согласия специалистов

### Приоритет 2: Монетизация

- Пополнение баланса (Stripe, ЕРИП, ЮКassa)
- Вывод средств специалистами
- Комиссия платформы (10%)

### Приоритет 3: Геймификация

- Бонусы за действия (отзывы, заполнение профиля)
- Реферальная программа
- Достижения и бейджи

Подробнее: `docs/points/ROADMAP.md`

---

## 📝 Checklist для продакшена

- [ ] Применить миграцию БД на Railway
- [ ] Сгенерировать и установить `CRON_SECRET`
- [ ] Настроить Railway Cron (сгорание бонусов)
- [ ] Протестировать регистрацию (50 баллов)
- [ ] Протестировать отображение в хедере
- [ ] Протестировать виджет в ЛК
- [ ] Протестировать историю транзакций
- [ ] Протестировать cron (вручную)
- [ ] Настроить мониторинг cron (Dead Man's Snitch)
- [ ] Добавить аналитику (Metabase/Grafana)

---

## 🎉 Готово!

Система баллов Phase 1 полностью реализована и готова к использованию.

**Следующий шаг:** Применить миграцию и настроить cron на Railway.

**Вопросы?** См. документацию в `docs/points/`

