# ⏰ Настройка Railway Cron для сгорания бонусов

## Обзор

Cron job для ежедневного аннулирования просроченных бонусных баллов.

**Endpoint:** `GET /api/cron/expire-bonuses`

**Расписание:** Ежедневно в 03:00 UTC (06:00 MSK)

---

## 1. Генерация CRON_SECRET

### Локально

```bash
# Сгенерировать случайный секрет
openssl rand -hex 32
```

Результат (пример):
```
3f7a9b2c4d5e6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b
```

### Online

Альтернативно: https://randomkeygen.com/

---

## 2. Добавление переменной в Railway

1. Откройте **Railway Dashboard**
2. Перейдите в ваш проект **Эволюция 360**
3. Откройте **Variables** (вкладка)
4. Добавьте новую переменную:

```
CRON_SECRET=3f7a9b2c4d5e6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b
```

5. **Redeploy** проект

---

## 3. Настройка Railway Cron (через веб-интерфейс)

### Шаг 1: Создать Cron Job

1. В Railway Dashboard откройте вкладку **Cron Jobs**
2. Нажмите **+ New Cron Job**
3. Заполните форму:

**Name:** `Expire Bonuses`

**Schedule (cron):**
```
0 3 * * *
```
_(Каждый день в 03:00 UTC)_

**Command:**
```bash
curl -X GET https://YOUR_RAILWAY_URL/api/cron/expire-bonuses \
  -H "Authorization: Bearer $CRON_SECRET"
```

Замените `YOUR_RAILWAY_URL` на ваш реальный домен Railway.

4. Сохраните

---

## 4. Альтернатива: Railway Cron через CLI

### Установка Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Создание cron job

```bash
railway run --service cron \
  --schedule "0 3 * * *" \
  --command "curl -X GET https://YOUR_RAILWAY_URL/api/cron/expire-bonuses -H 'Authorization: Bearer $CRON_SECRET'"
```

---

## 5. Альтернатива: Внешний Cron (Cron-job.org)

Если Railway не поддерживает Cron Jobs в вашем плане:

### Шаг 1: Зарегистрироваться

https://cron-job.org/

### Шаг 2: Создать задание

**URL:**
```
https://YOUR_RAILWAY_URL/api/cron/expire-bonuses
```

**HTTP Method:** GET

**Headers:**
```
Authorization: Bearer 3f7a9b2c4d5e6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b
```

**Schedule:**
```
Every day at 03:00 UTC
```

**Save**

---

## 6. Проверка работы

### Ручной запуск (для тестирования)

```bash
curl -X GET https://YOUR_RAILWAY_URL/api/cron/expire-bonuses \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Ожидаемый ответ

```json
{
  "success": true,
  "expiredCount": 3,
  "totalAmount": "150.00",
  "timestamp": "2025-10-12T03:00:00.000Z"
}
```

### Проверка логов

```bash
railway logs
```

Ищите строки:
```
[CRON] Expiring old bonuses...
[CRON] Expired 3 bonuses, total: 150.00
```

---

## 7. Мониторинг

### Настройка алертов (опционально)

**Цель:** Получать уведомление, если cron не сработал.

#### Вариант 1: Dead Man's Snitch

1. Зарегистрироваться: https://deadmanssnitch.com/
2. Создать Snitch с интервалом **Daily**
3. Получить URL: `https://nosnch.in/abc123`
4. Обновить cron command:

```bash
curl -X GET https://YOUR_RAILWAY_URL/api/cron/expire-bonuses \
  -H "Authorization: Bearer $CRON_SECRET" \
  && curl https://nosnch.in/abc123
```

#### Вариант 2: Healthchecks.io

1. Зарегистрироваться: https://healthchecks.io/
2. Создать Check с интервалом **1 day**
3. Получить Ping URL: `https://hc-ping.com/abc-123`
4. Обновить cron command (аналогично)

---

## 8. Безопасность

### Требования

- **CRON_SECRET** должен быть не менее 32 символов
- Не храните секрет в коде (только в env)
- Используйте HTTPS для всех запросов
- Ротируйте секрет раз в квартал

### Проверка безопасности

```bash
# Попытка запустить без токена (должно вернуть 401)
curl -X GET https://YOUR_RAILWAY_URL/api/cron/expire-bonuses
# => {"error":"Unauthorized"}

# Попытка запустить с неверным токеном (должно вернуть 401)
curl -X GET https://YOUR_RAILWAY_URL/api/cron/expire-bonuses \
  -H "Authorization: Bearer wrong_token"
# => {"error":"Unauthorized"}
```

---

## 9. Отладка проблем

### Cron не запускается

**Проверить:**
1. `CRON_SECRET` установлен в Railway Variables
2. Синтаксис cron расписания: `0 3 * * *`
3. URL правильный (без опечаток)
4. Service активен в Railway

### Cron запускается, но баллы не сгорают

**Проверить:**
1. Логи API: `railway logs`
2. Проверить `bonusExpiresAt` в БД:

```sql
SELECT id, "bonusBalance", "bonusExpiresAt"
FROM "User"
WHERE "bonusBalance" > 0 AND "bonusExpiresAt" <= NOW();
```

3. Проверить транзакции:

```sql
SELECT * FROM "Transaction"
WHERE type = 'bonus_expired'
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## 10. Масштабирование

При большом количестве пользователей (>100K):

### Оптимизация 1: Batch Processing

Обрабатывать по 1000 пользователей за раз.

### Оптимизация 2: Асинхронная очередь

Использовать BullMQ (уже есть в проекте):

```typescript
// src/lib/queues/expire-bonuses.ts
export const expireBonusesQueue = new Queue('expire-bonuses', {
  connection: redis,
});

expireBonusesQueue.add('expire', {}, {
  repeat: { cron: '0 3 * * *' },
});
```

---

## Дополнительные материалы

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Архитектура системы
- [API.md](./API.md) — API документация
- [ROADMAP.md](./ROADMAP.md) — План развития

