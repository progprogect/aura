# 🔐 Система авторизации специалистов

Полноценная система авторизации для специалистов платформы "Аура" с поддержкой SMS-верификации и социальных провайдеров.

## ✨ Возможности

### 🔑 Методы авторизации
- **Номер телефона + SMS-код** - основной метод
- **Google** - OAuth авторизация
- **ВКонтакте** - OAuth авторизация  
- **Яндекс** - OAuth авторизация
- **WhatsApp** - через WhatsApp Business API
- **Telegram** - через Telegram Bot API

### 🛡️ Безопасность
- Rate limiting (3 SMS в час на номер)
- Защита от брутфорс-атак
- Device fingerprinting
- Автоматическое продление сессий
- Токены сессий с истечением

### 📱 UX особенности
- Адаптивный дизайн для мобильных устройств
- Анимации переходов между шагами
- Автоформатирование номеров телефонов
- Таймер обратного отсчёта для SMS
- Автоматический переход между полями

## 🚀 Быстрый старт

### 1. Настройка переменных окружения

Добавьте в `.env.local`:

```env
# SMS провайдер
SMSRU_API_ID=your_smsru_api_id

# Социальные провайдеры
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

VK_APP_ID=your_vk_app_id
VK_APP_SECRET=your_vk_app_secret

YANDEX_CLIENT_ID=your_yandex_client_id
YANDEX_CLIENT_SECRET=your_yandex_client_secret

# WhatsApp Business API
WHATSAPP_BUSINESS_ID=your_whatsapp_business_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=your_telegram_bot_username

# JWT секрет
JWT_SECRET=your_jwt_secret
```

### 2. Тестовые номера

Для разработки используются тестовые номера:
- `+79999999999` → код `1234`
- `+78888888888` → код `5678`  
- `+77777777777` → код `9999`
- `+79990000000` → ошибка (для тестирования)

### 3. Запуск

```bash
npm run dev
```

Откройте:
- Регистрация: http://localhost:3000/auth/register
- Вход: http://localhost:3000/auth/login

## 📋 API Endpoints

### POST `/api/auth/send-sms`
Отправка SMS кода для верификации.

**Тело запроса:**
```json
{
  "phone": "+79999999999",
  "purpose": "registration" | "login" | "recovery"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "SMS отправлен"
}
```

### POST `/api/auth/register`
Регистрация нового специалиста.

**Тело запроса:**
```json
{
  "phone": "+79999999999",
  "code": "1234",
  "provider": "phone"
}
```

**Ответ:**
```json
{
  "success": true,
  "specialist": {
    "id": "specialist_id",
    "firstName": "Новый",
    "lastName": "Специалист",
    "phone": "+79999999999",
    "verified": false,
    "subscriptionTier": "FREE"
  },
  "sessionToken": "session_token",
  "isNewUser": true,
  "requiresProfileCompletion": true
}
```

### POST `/api/auth/login`
Вход существующего специалиста.

**Тело запроса:**
```json
{
  "phone": "+79999999999",
  "code": "1234",
  "provider": "phone"
}
```

### GET `/api/auth/profile`
Получение профиля текущего специалиста.

**Заголовки:**
```
Authorization: Bearer session_token
```

## 🧪 Тестирование

### Автоматические тесты
```bash
npm run test:auth
```

### Ручное тестирование

1. **Регистрация через телефон:**
   - Откройте `/auth/register`
   - Введите тестовый номер `+79999999999`
   - Получите код `1234`
   - Завершите регистрацию

2. **Вход через телефон:**
   - Откройте `/auth/login`
   - Введите тот же номер
   - Получите код `1234`
   - Войдите в систему

3. **Проверка сессии:**
   - Токен сохраняется в localStorage
   - Сессия автоматически продлевается
   - Можно проверить через `/api/auth/profile`

## 🏗️ Архитектура

### Модели базы данных

```typescript
// Сессии авторизации
model AuthSession {
  id              String   @id @default(cuid())
  specialistId    String
  sessionToken    String   @unique
  deviceFingerprint String?
  userAgent       String?
  ipAddress       String?
  isActive        Boolean  @default(true)
  expiresAt       DateTime
  lastUsedAt      DateTime @default(now())
}

// SMS верификация
model SMSVerification {
  id        String   @id @default(cuid())
  phone     String
  code      String
  purpose   String   // "registration" | "login" | "recovery"
  isUsed    Boolean  @default(false)
  attempts  Int      @default(0)
  expiresAt DateTime
}

// Социальные аккаунты
model SocialAccount {
  id           String   @id @default(cuid())
  specialistId String
  provider     String   // "google" | "vk" | "yandex" | "whatsapp" | "telegram"
  providerId   String
  email        String?
  name         String?
  picture      String?
  rawData      Json?
  isPrimary    Boolean  @default(false)
  isVerified   Boolean  @default(false)
}
```

### Сервисы

- **`auth-service.ts`** - основной сервис авторизации
- **`sms-service.ts`** - отправка и проверка SMS
- **`session-service.ts`** - управление сессиями
- **`utils.ts`** - утилиты и валидация

## 🔧 Конфигурация

### SMS провайдеры
```typescript
const SMS_CONFIG = {
  smsru: {
    apiId: process.env.SMSRU_API_ID,
    baseUrl: 'https://sms.ru/sms/send',
    sender: 'Aura'
  },
  mock: {
    codes: {
      '+79999999999': '1234',
      '+78888888888': '5678'
    }
  }
}
```

### Rate limiting
```typescript
const RATE_LIMITS = {
  smsPerPhone: '3/hour',
  registrationPerIP: '5/hour',
  loginAttempts: '10/hour'
}
```

## 📱 Мобильная оптимизация

- Touch-friendly элементы (минимум 44px)
- Автоматическое форматирование номеров
- Адаптивная типографика
- Плавные анимации переходов
- Оптимизация для медленных соединений

## 🚀 Деплой

### Production настройки

1. **SMS провайдер:** Переключитесь на реальный SMS.ru
2. **Rate limiting:** Включите строгие лимиты
3. **Безопасность:** Включите device fingerprinting
4. **Мониторинг:** Настройте логирование

### Railway деплой

```bash
# Переменные окружения в Railway
SMSRU_API_ID=your_production_api_id
GOOGLE_CLIENT_ID=your_production_client_id
# ... остальные переменные
```

## 🔍 Мониторинг

### Метрики для отслеживания
- Конверсия регистрации по шагам
- Время выполнения каждого шага
- Ошибки отправки SMS
- Успешность проверки кодов
- Активность сессий

### Логирование
```typescript
// Все операции логируются
debugLog('Отправка SMS', { phone, purpose })
debugLog('Создание сессии', { specialistId })
debugLog('Проверка кода', { phone, success })
```

## 🛠️ Разработка

### Добавление нового провайдера

1. Добавьте конфигурацию в `config.ts`
2. Обновите типы в `types.ts`
3. Добавьте обработку в `auth-service.ts`
4. Создайте OAuth endpoint в `api/`

### Кастомизация форм

Формы используют компоненты:
- `PhoneInput` - ввод номера телефона
- `SMSCodeInput` - ввод SMS кода
- `AuthProviderButtons` - кнопки социальных сетей

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в консоли браузера
2. Убедитесь в корректности переменных окружения
3. Проверьте статус SMS провайдера
4. Используйте тестовые номера для отладки
