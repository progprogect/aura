# ⚙️ ВАЖНО! Настройка переменных в Railway

## 🚨 Обязательные шаги после деплоя

Railway автоматически начнёт деплой после push. Но **ДО** того как всё заработает, нужно добавить переменные!

---

## 1️⃣ Добавьте переменные окружения

Откройте: **Railway Dashboard → ваш проект → Settings → Variables**

### Переменные которые Railway создаст автоматически:

✅ `DATABASE_URL` - PostgreSQL (автоматически из сервиса Postgres)
✅ `REDIS_URL` - Redis (автоматически из сервиса Redis)  
✅ `MONGO_PUBLIC_URL` - MongoDB (автоматически из сервиса MongoDB)

### Переменные которые НУЖНО добавить вручную:

#### ⚠️ MONGODB_URL

```
Variable name: MONGODB_URL
Value: ${{MongoDB.MONGO_PUBLIC_URL}}
```

**Важно:** Railway создаёт `MONGO_PUBLIC_URL`, но наш код использует `MONGODB_URL`

#### ⚠️ OPENAI_API_KEY

```
Variable name: OPENAI_API_KEY
Value: sk-proj-your-key-here
```

**Замените** `your-key-here` на ваш реальный ключ от OpenAI.

#### ⚠️ NEXT_PUBLIC_APP_URL

```
Variable name: NEXT_PUBLIC_APP_URL
Value: https://${{RAILWAY_PUBLIC_DOMAIN}}
```

---

## 2️⃣ После деплоя - выполните команды

Откройте Railway → ваш проект → кликните на сервис → вкладка "Deploy" → три точки → "Shell"

Выполните по очереди:

```bash
# 1. Применить миграции БД (создать таблицы ChatSession, ChatAnalytics)
npx prisma db push

# 2. Создать индексы в MongoDB
npx tsx prisma/setup-mongodb.ts

# 3. Сгенерировать embeddings для всех специалистов
npm run ai:generate-embeddings
```

⏱️ Генерация embeddings займёт ~2-5 минут.

---

## 3️⃣ Проверка

### Откройте ваше приложение:

```
https://ваше-приложение.railway.app/chat
```

Напишите: **"Хочу психолога для работы с тревогой"**

✅ Если GPT ответил и показал специалистов - **всё работает!**

❌ Если ошибка - проверьте логи:

```bash
railway logs --follow
```

---

## 🔍 Частые проблемы

### "MONGODB_URL is not set"
→ Добавьте переменную `MONGODB_URL` = `${{MongoDB.MONGO_PUBLIC_URL}}`

### "OPENAI_API_KEY is not set"  
→ Добавьте переменную `OPENAI_API_KEY` с вашим ключом

### "No embeddings found"
→ Запустите в Railway Shell: `npm run ai:generate-embeddings`

### Build успешен, но чат не работает
→ Проверьте что embeddings сгенерированы: 
```bash
mongosh $MONGODB_URL --eval "db.specialist_embeddings.countDocuments()"
```
Должно быть 20.

---

## 📋 Checklist перед тестированием

- [ ] PostgreSQL сервис добавлен в Railway
- [ ] MongoDB сервис добавлен в Railway  
- [ ] Redis сервис добавлен в Railway
- [ ] `MONGODB_URL` = `${{MongoDB.MONGO_PUBLIC_URL}}` добавлена
- [ ] `OPENAI_API_KEY` добавлена (ваш ключ)
- [ ] `NEXT_PUBLIC_APP_URL` = `https://${{RAILWAY_PUBLIC_DOMAIN}}` добавлена
- [ ] Деплой завершён успешно (зелёная галочка)
- [ ] Выполнена команда: `npx prisma db push`
- [ ] Выполнена команда: `npx tsx prisma/setup-mongodb.ts`
- [ ] Выполнена команда: `npm run ai:generate-embeddings`
- [ ] Протестирован чат на live URL

---

## ✅ После выполнения всех шагов

Ваш AI-чат будет полностью функционален на production! 🚀

---

**Важно:** Не забудьте добавить переменные **ДО** того как будете тестировать!

