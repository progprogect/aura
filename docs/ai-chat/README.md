# 🤖 AI-Чат: Инструкция по запуску

## ✅ Что было реализовано

### 1. **Структурированный диалог**
- GPT ведёт пользователя пошагово (2-3 вопроса)
- Кнопки быстрого ответа
- Эмпатичный стиль общения

### 2. **Semantic Search (Embeddings)**
- PostgreSQL + pgvector для vector similarity search
- OpenAI `text-embedding-3-small` (1536 dimensions)
- Hybrid подход: keyword fallback если embeddings не готовы

### 3. **Аналитика через Redis**
- Real-time треки событий чата
- Метрики: сессии, сообщения, конверсия, клики
- Агрегация в PostgreSQL для долгосрочного хранения

### 4. **Полная интеграция**
- Страница `/chat` с полноэкранным чатом
- Сохранение сессий в localStorage + backend
- Streaming responses (текст появляется постепенно)
- Карточки специалистов встроены в переписку
- Кнопка на главной странице

---

## 🚀 Быстрый старт

### Шаг 1: Настройка окружения

Убедитесь, что в `.env.local` есть:

```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
OPENAI_API_KEY="sk-proj-..."
```

### Шаг 2: Включить pgvector в PostgreSQL

Подключитесь к вашей БД и выполните:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Шаг 3: Применить миграции

```bash
npx prisma migrate deploy
```

Или создать новую миграцию:

```bash
npx prisma migrate dev --name add_ai_chat
```

### Шаг 4: Сгенерировать embeddings

```bash
npm run ai:generate-embeddings
```

Это займёт ~2-5 минут для 20 специалистов.

### Шаг 5: Запустить dev сервер

```bash
npm run dev
```

Откройте http://localhost:3000

1. Нажмите "Попробовать AI-помощника" на главной
2. Или перейдите напрямую на http://localhost:3000/chat

---

## 🧪 Тестирование

### Примеры запросов для теста:

1. **"Хочу психолога для работы с тревогой"**
   - GPT должен спросить формат (онлайн/оффлайн)
   - Затем показать 3-5 психологов

2. **"Нужен фитнес-тренер для похудения"**
   - GPT должен спросить формат
   - Возможно спросит про город (если оффлайн)
   - Покажет тренеров

3. **"Ищу нутрициолога онлайн"**
   - GPT должен понять категорию и формат сразу
   - Спросит про цель (похудение/набор массы)
   - Покажет нутрициологов

### Проверка аналитики:

```bash
# В Redis
redis-cli
KEYS chat:analytics:*
GET chat:analytics:sessions:today:2025-10-06
```

```sql
-- В PostgreSQL
SELECT * FROM "ChatSession" ORDER BY "createdAt" DESC LIMIT 10;
SELECT * FROM "ChatAnalytics" ORDER BY date DESC LIMIT 5;
```

---

## 📊 API Endpoints

### POST /api/chat
Основной endpoint для диалога с GPT.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Хочу психолога"},
    {"role": "assistant", "content": "..."}
  ],
  "sessionId": "uuid"
}
```

**Response:** Streaming text + specialists JSON

### POST /api/embeddings/generate
Генерация embeddings для специалиста.

```json
{
  "specialistId": "clxxx",
  "all": false
}
```

### POST /api/embeddings/search
Тестирование semantic search.

```json
{
  "query": "психолог тревожность",
  "filters": {"category": "psychology"},
  "limit": 10
}
```

---

## 🎨 Компоненты

```
src/
├── app/
│   ├── chat/
│   │   └── page.tsx              # Страница чата
│   └── api/
│       ├── chat/route.ts         # Основной API
│       └── embeddings/
│           ├── generate/route.ts
│           └── search/route.ts
├── components/
│   └── chat/
│       ├── ChatContainer.tsx     # Контейнер
│       ├── ChatMessage.tsx       # Сообщение
│       ├── ChatInput.tsx         # Поле ввода
│       ├── SpecialistRecommendation.tsx
│       └── QuickReplyButtons.tsx
├── hooks/
│   ├── useChat.ts               # Логика чата
│   └── useChatSession.ts        # Управление сессией
└── lib/
    ├── ai/
    │   ├── openai.ts            # OpenAI клиент
    │   ├── embeddings.ts        # Генерация embeddings
    │   ├── semantic-search.ts   # Vector search
    │   └── prompts.ts           # System prompts
    └── analytics/
        └── chat-analytics.ts    # Redis трекинг
```

---

## 🔧 Troubleshooting

### Ошибка: "Module not found: Can't resolve 'lucide-react'"

```bash
npm install lucide-react
```

### Ошибка: "relation SpecialistEmbedding does not exist"

```bash
npx prisma migrate deploy
# или
npx prisma db push
```

### GPT не отвечает / Долго думает

- Проверьте OPENAI_API_KEY
- Проверьте квоту OpenAI API
- Посмотрите логи: console в браузере

### Embeddings не генерируются

- Проверьте, что pgvector включен: `SELECT * FROM pg_extension WHERE extname = 'vector';`
- Проверьте OPENAI_API_KEY
- Rate limits: OpenAI ограничивает 3000 req/min (tier 1)

---

## 📈 Метрики успеха

### Ключевые показатели:

1. **Конверсия в рекомендации**: Сколько % пользователей доходит до показа специалистов
2. **Среднее количество сообщений**: ~3-5 оптимально
3. **Клики на профили**: Сколько % переходят к специалистам
4. **Время в чате**: Среднее время сессии

### Где смотреть:

```sql
SELECT 
  date,
  "sessionsStarted",
  "completedChats",
  ROUND("completedChats"::numeric / "sessionsStarted" * 100, 2) as conversion_rate,
  "avgMessagesPerSession",
  "profileClicks"
FROM "ChatAnalytics"
ORDER BY date DESC
LIMIT 7;
```

---

## 🎯 Следующие шаги (опционально)

1. **A/B тесты**: Разные стили промптов
2. **Персонализация**: Запоминание предпочтений между сессиями
3. **Голосовой ввод**: Web Speech API
4. **Мультиязычность**: Поддержка английского/украинского
5. **Рекомендации на основе истории**: Collaborative filtering

---

## ✅ Checklist перед production

- [ ] pgvector включен в PostgreSQL
- [ ] Все embeddings сгенерированы
- [ ] OPENAI_API_KEY добавлен в Railway Variables
- [ ] Redis подключен и работает
- [ ] Протестированы 5-10 различных запросов
- [ ] Проверена мобильная версия
- [ ] Настроен мониторинг ошибок (Sentry/LogRocket)

---

Готово! 🚀

