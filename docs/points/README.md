# 💰 Система баллов — Документация

## Что это?

**Система баллов (Points System)** — внутренняя валюта платформы Аура для монетизации услуг специалистов и геймификации пользовательского опыта.

## Быстрый старт

### Для разработчиков

```bash
# 1. Применить миграцию БД
DATABASE_PUBLIC_URL="postgresql://..." npm run migrate:points

# 2. Сгенерировать Prisma Client
npx prisma generate

# 3. Настроить cron для сгорания бонусов
# См. CRON_SETUP.md

# 4. Запустить проект
npm run dev
```

### Для пользователей

1. **Регистрация** → Получите 50 бонусных баллов
2. **Используйте** баллы в течение 7 дней
3. **Пополняйте** баланс для покупки услуг (Phase 2)

---

## Основные концепции

### Типы баллов

| Тип | Описание | Сгорают? | Можно выводить? |
|-----|----------|----------|-----------------|
| **Обычные** | Покупаются за деньги | Нет | Да (Phase 2) |
| **Бонусные** | За регистрацию/активности | Через 7 дней | Нет |

### Логика списания

При покупке сначала списываются **бонусные**, затем **обычные** баллы.

---

## Документация

### Основные документы

| Документ | Описание |
|----------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Архитектура системы, типы транзакций |
| [API.md](./API.md) | Документация API endpoints |
| [ROADMAP.md](./ROADMAP.md) | План развития Phase 2 |
| [CRON_SETUP.md](./CRON_SETUP.md) | Настройка сгорания бонусов |

### Для кого

- **Разработчики:** ARCHITECTURE.md, API.md
- **Продукт-менеджеры:** ROADMAP.md
- **DevOps:** CRON_SETUP.md

---

## Архитектура

### Backend

```
src/lib/points/
├── points-service.ts   # Бизнес-логика баллов
├── format.ts           # Утилиты форматирования
└── types.ts            # TypeScript типы

src/app/api/
├── user/
│   ├── balance/        # GET баланс
│   └── transactions/   # GET история
└── cron/
    └── expire-bonuses/ # Сгорание бонусов
```

### Frontend

```
src/components/points/
├── BalanceChip.tsx               # Компактный баланс (хедер)
├── BalanceWidget.tsx             # Детальный баланс (ЛК)
├── BalanceWidgetWrapper.tsx      # Wrapper с модалкой
└── TransactionHistoryModal.tsx   # История транзакций
```

### Database

```prisma
User {
  balance        Decimal   // Обычные баллы
  bonusBalance   Decimal   // Бонусные баллы
  bonusExpiresAt DateTime? // Когда сгорят
}

Transaction {
  type        String   // Тип операции
  amount      Decimal  // Сумма
  balanceType String   // balance | bonusBalance
}

Currency {
  code         String  // BYN, RUB, USD
  rateToPoints Decimal // Курс конвертации
}
```

---

## API Endpoints

### Пользовательские

```
GET  /api/user/balance        # Получить баланс
GET  /api/user/transactions   # История транзакций
```

### Cron (внутренние)

```
GET  /api/cron/expire-bonuses # Сгорание бонусов
```

---

## Phase 1 vs Phase 2

### ✅ Phase 1 (Реализовано)

- [x] Базовая инфраструктура
- [x] Начисление бонусов при регистрации
- [x] Сгорание бонусов (cron)
- [x] Отображение в UI
- [x] История транзакций

### 🔜 Phase 2 (Планируется)

- [ ] Покупка за баллы (лид-магниты, продукты)
- [ ] Пополнение баланса (Stripe, ЕРИП)
- [ ] Вывод средств специалистами
- [ ] Бонусы за действия
- [ ] Реферальная программа

---

## Как использовать (примеры кода)

### Backend: Начислить бонусы

```typescript
import { PointsService } from '@/lib/points/points-service';
import { Decimal } from '@prisma/client/runtime/library';

// При регистрации (автоматически)
await PointsService.grantRegistrationBonus(userId);

// За действие (Phase 2)
await PointsService.addPoints(
  userId,
  new Decimal(20),
  'bonus_reward',
  'bonusBalance',
  'Бонус за первый отзыв'
);
```

### Backend: Списать баллы

```typescript
// Проверить баланс
const hasEnough = await PointsService.hasEnoughPoints(
  userId,
  new Decimal(50)
);

if (!hasEnough) {
  return { error: 'Insufficient balance' };
}

// Списать
const transactions = await PointsService.deductPoints(
  userId,
  new Decimal(50),
  'purchase',
  'Покупка лид-магнита "Гайд по питанию"',
  { leadMagnetId: 'xxx' }
);
```

### Frontend: Отобразить баланс

```tsx
import { BalanceChip } from '@/components/points/BalanceChip';
import { BalanceWidget } from '@/components/points/BalanceWidget';

// В хедере
<BalanceChip />

// В личном кабинете
<BalanceWidget onOpenHistory={() => setIsOpen(true)} />
```

---

## Безопасность

### ACID-транзакции

Все операции выполняются внутри Prisma `$transaction` для атомарности.

### Audit Log

Каждая операция записывается в `Transaction` с:
- Балансом до/после операции
- Типом и описанием
- Метаданными

### Защита Cron

Endpoint `/api/cron/expire-bonuses` требует:
```
Authorization: Bearer <CRON_SECRET>
```

---

## Мониторинг

### Метрики

- Общий баланс всех пользователей
- Средний баланс на пользователя
- Количество просроченных бонусов/день
- Количество транзакций/день

### Логи

```bash
railway logs --filter="[CRON]"
railway logs --filter="[PointsService]"
```

---

## FAQ

### Почему баллы, а не рубли/доллары?

- **Гибкость:** Можно менять курсы без пересчёта базы
- **Интернационализация:** Одни баллы для всех стран
- **Геймификация:** Звучит менее формально

### Почему бонусы сгорают?

- **Urgency:** Стимулирует использование
- **Контроль затрат:** Ограничивает обязательства платформы
- **Fairness:** Активные пользователи получают больше

### Можно ли изменить срок сгорания?

Да, в `PointsService.BONUS_EXPIRY_DAYS` (сейчас 7 дней).

### Как тестировать локально?

```bash
# 1. Создать тестового пользователя
npm run test:auth

# 2. Проверить баланс
curl http://localhost:3000/api/user/balance \
  -H "Cookie: session_token=xxx"

# 3. Вручную запустить cron
curl http://localhost:3000/api/cron/expire-bonuses \
  -H "Authorization: Bearer test_secret"
```

---

## Поддержка

**Вопросы?** Откройте issue в репозитории или свяжитесь с командой:
- Telegram: @aura_support
- Email: support@aura.app

---

## Лицензия

Частный проект © 2025 Aura Platform

