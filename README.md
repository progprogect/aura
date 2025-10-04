# 🌟 Аура

Платформа для поиска проверенных специалистов в сфере здоровья: нутрициологов, тренеров, психологов и других профессионалов.

## 🚀 Стек технологий

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma ORM
- **Analytics:** Upstash Redis
- **Deployment:** Railway

## 📋 Требования

- Node.js 20+
- PostgreSQL (можно использовать Railway)
- Redis (Upstash для аналитики)

## 🛠 Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` и создайте `.env.local`:

```bash
cp .env.example .env.local
```

Заполните переменные окружения:

```env
DATABASE_URL="postgresql://user:password@host:5432/aura"
REDIS_URL="redis://default:xxx@xxx.upstash.io:6379"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Настройка базы данных

```bash
# Генерация Prisma Client
npx prisma generate

# Создание миграций (когда добавите модели)
npx prisma migrate dev --name init

# Открыть Prisma Studio для просмотра данных
npx prisma studio
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🎨 UI компоненты (shadcn/ui)

Для добавления компонентов используйте:

```bash
# Пример: добавить кнопку
npx shadcn-ui@latest add button

# Добавить карточку
npx shadcn-ui@latest add card

# Добавить форму
npx shadcn-ui@latest add form
```

## 📁 Структура проекта

```
Аура/
├── prisma/              # Prisma схема и миграции
├── public/              # Статические файлы
│   └── icons/          # SVG иконки
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Главная страница
│   │   └── api/        # API endpoints
│   ├── components/     # React компоненты
│   │   ├── ui/         # shadcn/ui компоненты
│   │   └── specialist/ # Компоненты специалистов
│   └── lib/            # Утилиты и конфигурация
│       ├── db.ts       # Prisma client
│       ├── redis.ts    # Redis для аналитики
│       └── utils.ts    # Вспомогательные функции
└── ...config files
```

## 🚢 Деплой на Railway

### 1. Создайте проект на Railway

1. Зайдите на [railway.app](https://railway.app)
2. Создайте новый проект
3. Добавьте PostgreSQL базу данных

### 2. Подключите репозиторий

1. Подключите GitHub репозиторий
2. Railway автоматически обнаружит `Dockerfile` и `railway.toml`

### 3. Добавьте переменные окружения

В настройках проекта добавьте:
- `DATABASE_URL` (автоматически из PostgreSQL сервиса)
- `REDIS_URL` (из Upstash)
- `NEXT_PUBLIC_APP_URL` (ваш Railway домен)

### 4. Деплой

Railway автоматически задеплоит приложение при каждом push в основную ветку.

## 📊 Аналитика

Система аналитики использует Redis для быстрого подсчета:

- Просмотры профилей специалистов
- Просмотры контактов
- Leaderboard популярных специалистов

## 🔐 Безопасность

- Используйте сильные пароли для DATABASE_URL
- Не коммитьте `.env.local` в git
- Храните секреты в Railway Variables

## 📝 TODO

- [ ] Создать модели Prisma (User, Specialist)
- [ ] Добавить аутентификацию (NextAuth.js)
- [ ] Создать страницу профиля специалиста
- [ ] Реализовать каталог специалистов
- [ ] Добавить админ-панель
- [ ] Настроить аналитику просмотров

## 🤝 Разработка

При разработке следуйте принципам:

- **KISS** - Keep It Simple, Stupid
- **DRY** - Don't Repeat Yourself
- **SOLID** - Объектно-ориентированное проектирование

## 📄 Лицензия

Частный проект



