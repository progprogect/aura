# 🚀 Пошаговый запуск на Railway

## ✅ Что уже сделано:

1. ✅ Код в GitHub: https://github.com/progprogect/aura
2. ✅ PostgreSQL добавлен на Railway
3. ✅ Redis добавлен на Railway
4. ✅ Переменные настроены (кроме NEXT_PUBLIC_APP_URL)

---

## 📝 Шаги для запуска:

### **Шаг 1: Проверь переменные окружения**

Railway → Твой Next.js сервис → **Variables**

Должно быть:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}  ← автоматически
REDIS_URL=${{Redis.REDIS_URL}}            ← автоматически
NODE_ENV=production                        ← вручную (если добавил)
```

**NEXT_PUBLIC_APP_URL пока НЕ нужен** - добавим после первого деплоя.

---

### **Шаг 2: Дождись первого деплоя**

Railway автоматически начал деплой когда ты подключил GitHub.

**Проверь статус:**
Railway → Next.js сервис → **Deployments**

Должно быть:
- 🟢 **Success** - отлично, переходи к Шагу 3
- 🔵 **Building** - подожди 3-5 минут
- 🔴 **Failed** - смотри логи (View Logs), пиши мне

---

### **Шаг 3: Получи домен**

После успешного деплоя Railway создаст домен:

Railway → Next.js сервис → **Settings** → **Networking** → **Public Networking**

Там будет URL типа:
```
https://aura-production-xxxx.up.railway.app
```

**Скопируй этот URL!**

---

### **Шаг 4: Добавь NEXT_PUBLIC_APP_URL**

Railway → Next.js сервис → **Variables** → **New Variable**

```
NEXT_PUBLIC_APP_URL=https://aura-production-xxxx.up.railway.app
```

(Вставь свой домен из Шага 3)

Railway автоматически передеплоит.

---

### **Шаг 5: Выполни миграции базы данных**

Теперь самое важное - инициализировать БД!

#### **Способ A: Через Railway UI (проще для первого раза)**

1. Railway → Next.js сервис → **Settings** → **Deploy**
2. Найди **"Custom Start Command"**
3. Временно измени на:
```bash
npx prisma db push && npm run db:seed-categories && node server.js
```
4. Нажми **"Redeploy"** (справа вверху)
5. Дождись успешного деплоя (3-5 минут)
6. Верни команду на:
```bash
node server.js
```
7. Сохрани

**Готово!** БД инициализирована, категории загружены.

---

#### **Способ B: Через Railway CLI** 

Если хочешь больше контроля:

```bash
# 1. Установить CLI (если еще нет)
npm install -g @railway/cli

# 2. Залогиниться
railway login

# 3. Связать с проектом
railway link
# (Выбери свой проект "Аура")

# 4. Выполнить миграции
railway run npx prisma db push

# 5. Загрузить категории (обязательно!)
railway run npm run db:seed-categories

# 6. (Опционально) Загрузить тестовых специалистов
railway run npm run db:seed
```

---

### **Шаг 6: Проверь работу!**

Открой свой сайт:
```
https://aura-production-xxxx.up.railway.app
```

Должна открыться главная страница с надписью "🚀 Проект в разработке"

**Проверь профили специалистов:**
```
https://твой-домен/specialist/anna-ivanova-psiholog
https://твой-домен/specialist/dmitriy-petrov-trener
https://твой-домен/specialist/elena-smirnova-nutriciolog
```

Если открываются - **всё работает!** 🎉

---

## 🐛 Возможные проблемы:

### **Проблема 1: Build failed**

**Смотри логи:**
Railway → Deployments → Failed deployment → **View Logs**

**Частые причины:**
- DATABASE_URL не установлен → Проверь что PostgreSQL связан
- Ошибка компиляции → Проверь логи, пиши мне

### **Проблема 2: "Page not found" на /specialist/[slug]**

**Причина:** БД не инициализирована (нет данных)

**Решение:**
```bash
railway run npm run db:seed-categories
railway run npm run db:seed
```

### **Проблема 3: Сайт не открывается**

**Проверь:**
- Деплой завершился успешно (🟢 Success)
- Public Networking включен (Settings → Networking)
- Домен создан

---

## 📊 Структура Railway (что у тебя должно быть):

```
Проект "Аура"
├── 🚀 aura-production (Next.js)
│   ├── Status: 🟢 Active
│   ├── Domain: aura-production-xxxx.up.railway.app
│   └── Variables:
│       ├── DATABASE_URL (auto) ✅
│       ├── REDIS_URL (auto) ✅
│       ├── NODE_ENV=production ✅
│       └── NEXT_PUBLIC_APP_URL (добавишь на Шаге 4)
│
├── 🗄️ Postgres
│   └── Status: 🟢 Active
│
└── 🔴 Redis  
    └── Status: 🟢 Active
```

---

## ⚡ Быстрый чеклист:

- [ ] Деплой завершился успешно
- [ ] Получил домен
- [ ] Добавил NEXT_PUBLIC_APP_URL
- [ ] Выполнил миграции (Custom Start Command или CLI)
- [ ] Открыл сайт - работает
- [ ] Открыл профиль специалиста - работает

---

## 🎯 Что делать сейчас:

1. **Проверь статус деплоя** в Railway
   - Если Success → переходи к Шагу 3 (получи домен)
   - Если Failed → пришли логи, помогу разобраться
   - Если Building → подожди 3-5 минут

2. **Получи домен** (Шаг 3)

3. **Добавь NEXT_PUBLIC_APP_URL** (Шаг 4)

4. **Выполни миграции** (Шаг 5) - **самое важное!**

5. **Проверь сайт** (Шаг 6)

---

**Скажи на каком шаге ты сейчас, и я помогу!** 🚀

Если деплой уже прошел успешно - дай мне знать, помогу с миграциями!

