# 📡 API Документация — Система баллов

## Обзор

API для работы с внутренней валютой платформы (баллами).

**Base URL:** `/api/user`

**Авторизация:** Cookie `session_token`

---

## Endpoints

### 1. GET /api/user/balance

Получить баланс текущего пользователя.

#### Request

```http
GET /api/user/balance
Cookie: session_token=<token>
```

#### Response 200 OK

```json
{
  "balance": "100.00",
  "bonusBalance": "50.00",
  "bonusExpiresAt": "2025-10-19T12:00:00.000Z",
  "total": "150.00"
}
```

#### Response 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

#### Response 401 Invalid Session

```json
{
  "error": "Invalid or expired session"
}
```

---

### 2. GET /api/user/transactions

Получить историю транзакций пользователя.

#### Request

```http
GET /api/user/transactions?limit=50&offset=0
Cookie: session_token=<token>
```

#### Query Parameters

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `limit` | number | 50 | Количество записей (max 100) |
| `offset` | number | 0 | Смещение для пагинации |

#### Response 200 OK

```json
{
  "transactions": [
    {
      "id": "clxxx",
      "type": "bonus_registration",
      "amount": "50.00",
      "balanceType": "bonusBalance",
      "balanceBefore": "0.00",
      "balanceAfter": "50.00",
      "description": "Бонус за регистрацию: 50 баллов",
      "metadata": {
        "expiresAt": "2025-10-19T12:00:00.000Z"
      },
      "createdAt": "2025-10-12T12:00:00.000Z"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

#### Response 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

---

### 3. GET /api/cron/expire-bonuses

**[CRON ONLY]** Аннулировать просроченные бонусы.

#### Request

```http
GET /api/cron/expire-bonuses
Authorization: Bearer <CRON_SECRET>
```

#### Response 200 OK

```json
{
  "success": true,
  "expiredCount": 5,
  "totalAmount": "250.00",
  "timestamp": "2025-10-12T03:00:00.000Z"
}
```

#### Response 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

#### Response 500 Error

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Типы данных

### UserBalance

```typescript
interface UserBalance {
  balance: string;         // Обычные баллы
  bonusBalance: string;    // Бонусные баллы
  bonusExpiresAt: string | null; // Дата сгорания (ISO 8601)
  total: string;           // Общая сумма баллов
}
```

### TransactionItem

```typescript
interface TransactionItem {
  id: string;
  type: TransactionType;
  amount: string;           // Положительное или отрицательное
  balanceType: BalanceType;
  balanceBefore: string;
  balanceAfter: string;
  description: string | null;
  metadata: any;
  createdAt: string;        // ISO 8601
}
```

### TransactionType

```typescript
type TransactionType =
  | 'bonus_registration'   // Бонус за регистрацию
  | 'bonus_reward'         // Бонус за действие
  | 'bonus_expired'        // Сгорание бонусов
  | 'purchase'             // Покупка
  | 'refund'               // Возврат
  | 'withdrawal'           // Вывод средств
  | 'deposit';             // Пополнение
```

### BalanceType

```typescript
type BalanceType = 'balance' | 'bonusBalance';
```

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 400 | Некорректные параметры |
| 401 | Не авторизован или истекла сессия |
| 403 | Недостаточно прав |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

---

## Примеры использования

### JavaScript / TypeScript

```typescript
// Получить баланс
const response = await fetch('/api/user/balance');
const balance = await response.json();
console.log(`Всего баллов: ${balance.total}`);

// Получить историю транзакций
const txResponse = await fetch('/api/user/transactions?limit=10');
const { transactions, hasMore } = await txResponse.json();
transactions.forEach(tx => {
  console.log(`${tx.type}: ${tx.amount}`);
});
```

### cURL

```bash
# Получить баланс
curl -X GET https://aura.app/api/user/balance \
  -H "Cookie: session_token=xxx"

# Получить транзакции
curl -X GET "https://aura.app/api/user/transactions?limit=50&offset=0" \
  -H "Cookie: session_token=xxx"

# Cron: сгорание бонусов
curl -X GET https://aura.app/api/cron/expire-bonuses \
  -H "Authorization: Bearer <CRON_SECRET>"
```

---

## Rate Limiting

**Текущий статус:** Не реализовано

**Планируется (Phase 2):**
- `/api/user/balance` — 100 req/min
- `/api/user/transactions` — 50 req/min
- `/api/cron/*` — только из Railway Cron

---

## Миграция с Phase 1 на Phase 2

При добавлении покупки за баллы:

### Новые endpoints

```
POST /api/user/points/purchase
POST /api/user/points/deposit
POST /api/user/points/withdraw
GET  /api/user/points/rates
```

### Обратная совместимость

Все существующие endpoints сохранятся без изменений.

---

## Дополнительные материалы

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Архитектура системы
- [ROADMAP.md](./ROADMAP.md) — План развития

