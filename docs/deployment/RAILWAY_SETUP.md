# 🚂 Настройка Railway для проекта Аура

## 📋 Пошаговая инструкция

### **Шаг 1: Создание проекта на Railway**

1. Зайди на [railway.app](https://railway.app)
2. Нажми **"New Project"**
3. Выбери **"Deploy from GitHub repo"**
4. Выбери репозиторий `progprogect/aura`
5. Railway автоматически обнаружит `Dockerfile` и `railway.toml`

---

### **Шаг 2: Добавление PostgreSQL**

1. В проекте нажми **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway автоматически создаст БД и добавит переменные окружения

**Важно:** Railway автоматически создаст переменную `DATABASE_URL` для сервиса Next.js

---

### **Шаг 3: Добавление Redis**

1. В проекте нажми **"+ New"** → **"Database"** → **"Add Redis"**
2. Railway автоматически создаст Redis и добавит переменную `REDIS_URL`

**Важно:** 
- Railway автоматически создаст переменную `REDIS_URL` для сервиса Next.js
- Формат: `redis://default:password@host:port`
- **Токен НЕ нужен** - всё в одной переменной!

---

### **Шаг 4: Настройка переменных окружения**

Railway автоматически создаст все нужные переменные!

Проверь в **Variables** что есть:

```env
# Автоматически от PostgreSQL
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Автоматически от Redis
REDIS_URL=${{Redis.REDIS_URL}}

# Автоматически от Railway
RAILWAY_PUBLIC_DOMAIN=aura-production-xxxx.up.railway.app

# Добавь вручную:
NEXT_PUBLIC_APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
```

**Вот и всё!** Больше ничего не нужно настраивать.

---

### **Шаг 5: Настройка деплоя**

Railway уже знает как деплоить благодаря `railway.toml` и `Dockerfile`.

**Проверь настройки:**
1. Перейди в **"Settings"** → **"Deploy"**
2. Убедись что:
   - **Builder:** Dockerfile
   - **Root Directory:** /
   - **Dockerfile Path:** Dockerfile

---

### **Шаг 6: Инициализация базы данных**

После первого успешного деплоя нужно **один раз** выполнить миграции:

#### **Вариант A: Через Railway CLI (рекомендую)**

```bash
# 1. Установи Railway CLI
npm install -g @railway/cli

# 2. Залогинься
railway login

# 3. Свяжись с проектом
railway link

# 4. Выполни миграции
railway run npx prisma db push

# 5. Загрузи категории (обязательно!)
railway run npm run db:seed-categories

# 6. (Опционально) Загрузи тестовых специалистов
railway run npm run db:seed
```

#### **Вариант B: Через Railway Dashboard (проще)**

1. Railway → Твой Next.js сервис → **Settings** → **Deploy**
2. В **"Custom Start Command"** временно измени на:
```bash
npx prisma db push && npm run db:seed-categories && node server.js
```
3. Сохрани и нажми **"Redeploy"**
4. После успешного деплоя верни команду на:
```bash
node server.js
```

---

## 🎯 Что получишь после настройки:

### **Автоматический CI/CD:**
```
git push → GitHub → Railway → Автодеплой
```

### **Твой сайт:**
```
https://aura-production-xxxx.up.railway.app
```

### **Сервисы:**
- 🚀 Next.js App (твой код)
- 🗄️ PostgreSQL (база данных)
- 🔴 Redis (аналитика)

---

## 🔧 Railway автоматически свяжет сервисы:

```
┌─────────────────────────────────────┐
│  Next.js App                        │
│  Variables:                         │
│  - DATABASE_URL → от PostgreSQL     │
│  - REDIS_URL → от Redis             │
│  - RAILWAY_PUBLIC_DOMAIN → авто     │
└─────────────────────────────────────┘
          ↓                ↓
┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │    Redis     │
│  (auto)      │   │    (auto)    │
└──────────────┘   └──────────────┘
```

**Всё связывается автоматически через `${{ServiceName.VARIABLE}}`**

---

## 📝 Переменные окружения - итого:

### **Railway автоматически создаст:**
- ✅ `DATABASE_URL` - при добавлении PostgreSQL
- ✅ `REDIS_URL` - при добавлении Redis
- ✅ `RAILWAY_PUBLIC_DOMAIN` - домен проекта

### **Тебе нужно добавить вручную:**
- ✅ `NEXT_PUBLIC_APP_URL` = `https://${{RAILWAY_PUBLIC_DOMAIN}}`
- ✅ `NODE_ENV` = `production`

**Всего 2 переменные вручную!** Остальное автоматически.

---

## ⚡ Быстрый старт:

1. ✅ **GitHub** - код уже залит
2. ⏳ **Railway** - создай проект из GitHub
3. ⏳ **PostgreSQL** - добавь базу данных
4. ⏳ **Redis** - добавь Redis
5. ⏳ **Variables** - добавь 2 переменные вручную
6. ⏳ **Deploy** - Railway задеплоит автоматически
7. ⏳ **Migrations** - выполни через CLI или Custom Start Command
8. ✅ **Готово!** Сайт работает

---

## 📞 Что делать дальше:

После создания сервисов на Railway, **НЕ нужно** присылать мне токены!

Railway всё свяжет автоматически. Просто:

1. Создай PostgreSQL
2. Создай Redis  
3. Добавь `NEXT_PUBLIC_APP_URL` и `NODE_ENV`
4. Передеплой
5. Выполни миграции через CLI

**И всё! 🎉**

---

## 🐛 Если что-то пошло не так:

**Проверь логи:**
Railway → Service → Deployments → View Logs

**Частые ошибки:**
- `DATABASE_URL not found` → Добавь PostgreSQL
- `REDIS_URL not found` → Добавь Redis
- `Prisma Client error` → Выполни `railway run npx prisma db push`

---

**Код в GitHub, инструкция готова! Настраивай Railway! 🚀**
