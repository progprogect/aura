# ✅ POST-DEPLOY CHECKLIST для Railway

## 🚨 ВАЖНО! Выполните эти шаги ПОСЛЕ деплоя

Railway сейчас деплоит ваше приложение. Но чтобы AI-чат заработал, нужно:

---

## 1️⃣ Настроить переменные окружения (ОБЯЗАТЕЛЬНО!)

Откройте **Railway Dashboard → ваш проект → Settings → Variables**

### Добавьте вручную:

```bash
# 1. MongoDB URL (маппинг из MONGO_PUBLIC_URL)
MONGODB_URL=${{MongoDB.MONGO_PUBLIC_URL}}

# 2. OpenAI API Key (ваш ключ)
OPENAI_API_KEY=sk-proj-ваш-ключ-здесь
```

### Проверьте автоматические переменные:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}  # должен быть
REDIS_URL=${{Redis.REDIS_URL}}           # должен быть
```

**После добавления переменных Railway автоматически передеплоит!**

---

## 2️⃣ Дождитесь успешного деплоя

Откройте **Railway Dashboard → Deployments**

Дождитесь статуса: **✅ Success** (зелёная галочка)

⏱️ Обычно это ~2-3 минуты.

---

## 3️⃣ Выполните команды в Railway Shell

Откройте **Railway → ваш проект → кликните на ваш сервис (Next.js) → вкладка "Deployments" → три точки справа → "View Logs & Shell"**

Или через Railway CLI:

```bash
railway shell
```

### Выполните по очереди:

```bash
# 1. Миграции БД (создать таблицы для чата)
npx prisma db push

# 2. Создать индексы в MongoDB
npx tsx prisma/setup-mongodb.ts

# 3. Сгенерировать embeddings для специалистов
npm run ai:generate-embeddings
```

⏱️ Шаг 3 займёт ~2-5 минут (20 специалистов).

---

## 4️⃣ Проверка работы

### Откройте ваш сайт:

```
https://ваше-приложение.railway.app/chat
```

### Протестируйте:

Напишите в чат:
```
Хочу психолога для работы с тревогой
```

✅ **Ожидаемый результат:**
1. GPT спросит: "Какой формат работы?" с кнопками
2. После выбора "Онлайн" → покажет 3-5 психологов
3. Карточки кликабельны → переход к профилю

❌ **Если не работает:**

Проверьте логи:
```bash
railway logs --tail 100
```

Ищите ошибки типа:
- `MONGODB_URL is not set`
- `OPENAI_API_KEY is not set`
- `No embeddings found`

---

## 5️⃣ Проверьте данные в БД

### PostgreSQL (проверка сессий):

```bash
railway run -- psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"ChatSession\";"
```

### MongoDB (проверка embeddings):

```bash
railway run -- mongosh $MONGODB_URL --eval "db.specialist_embeddings.countDocuments()"
```

**Должно быть:** 20 embeddings

### Redis (проверка аналитики):

```bash
railway run -- redis-cli -u $REDIS_URL KEYS "chat:analytics:*"
```

---

## 🎯 Итого

После выполнения всех шагов:

✅ AI-чат работает на production  
✅ Semantic search находит специалистов  
✅ Аналитика трекает события  
✅ Сессии сохраняются  
✅ Всё готово к использованию!  

---

## 📞 Если что-то не работает

1. Проверьте переменные: **Railway → Settings → Variables**
2. Проверьте логи: `railway logs --follow`
3. Проверьте embeddings: `mongosh $MONGODB_URL --eval "db.specialist_embeddings.countDocuments()"`
4. Пересоздайте embeddings: `railway run npm run ai:generate-embeddings`

---

**Время на настройку:** ~10 минут  
**Успехов с деплоем! 🚀**

