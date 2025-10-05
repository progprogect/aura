# 🚀 Быстрый старт проекта "Аура"

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Настройка Upstash Redis (бесплатно)

1. Зайдите на [upstash.com](https://upstash.com)
2. Создайте аккаунт (бесплатно)
3. Создайте новую Redis базу данных
4. Скопируйте `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN`

## Шаг 3: Настройка PostgreSQL на Railway

### Вариант A: Локальная база данных

Если у вас установлен PostgreSQL локально:

```bash
# Создайте базу данных
createdb aura

# Добавьте в .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/aura"
```

### Вариант B: Railway PostgreSQL (рекомендуется)

1. Зайдите на [railway.app](https://railway.app)
2. Создайте новый проект
3. Добавьте PostgreSQL из маркетплейса
4. Скопируйте `DATABASE_URL` из переменных окружения

## Шаг 4: Создайте .env.local

Создайте файл `.env.local` в корне проекта:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/aura"

# Redis
REDIS_URL="https://your-redis.upstash.io"
REDIS_TOKEN="your-token-here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Шаг 5: Инициализация базы данных

```bash
# Генерация Prisma Client
npx prisma generate

# Когда добавите модели, создайте миграции
# npx prisma migrate dev --name init
```

## Шаг 6: Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 🎨 Добавление UI компонентов

Проект использует shadcn/ui. Добавляйте компоненты по мере необходимости:

```bash
# Кнопка
npx shadcn-ui@latest add button

# Карточка
npx shadcn-ui@latest add card

# Форма и инпут
npx shadcn-ui@latest add form input

# Все основные компоненты
npx shadcn-ui@latest add button card input label form
```

## 📊 Просмотр данных

Откройте Prisma Studio для визуального просмотра базы данных:

```bash
npx prisma studio
```

## 🐛 Отладка

### Проблема: Prisma не находит модели

```bash
npx prisma generate
```

### Проблема: Redis connection error

Проверьте, что `REDIS_URL` и `REDIS_TOKEN` правильно настроены в `.env.local`

### Проблема: Database connection error

Проверьте, что `DATABASE_URL` правильно настроен и база данных запущена

## 📦 Полезные команды

```bash
# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm run start

# Линтинг
npm run lint

# Prisma Studio
npx prisma studio

# Создание миграции
npx prisma migrate dev --name migration_name
```

## 🎯 Следующие шаги

1. ✅ Проект настроен и запущен
2. Добавить модели в `prisma/schema.prisma`
3. Создать страницу профиля специалиста
4. Добавить аутентификацию
5. Создать каталог специалистов

---

**Готово! Теперь можно начинать разработку** 🚀



