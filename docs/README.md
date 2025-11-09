# 📚 Документация проекта "Эколюция 360"

Добро пожаловать в документацию платформы для поиска специалистов.

---

## 🗂️ Структура документации

### 🤖 AI-Чат
Полная документация по AI-помощнику для подбора специалистов.

📁 **[ai-chat/](./ai-chat/)**
- [README.md](./ai-chat/README.md) - Полное описание системы AI-чата
- [MONGODB_SETUP.md](./ai-chat/MONGODB_SETUP.md) - Настройка MongoDB для embeddings
- [PGVECTOR_ALTERNATIVES.md](./ai-chat/PGVECTOR_ALTERNATIVES.md) - Альтернативные варианты векторного поиска

### 🏗️ Архитектура
Описание архитектурных решений и паттернов.

📁 **[architecture/](./architecture/)**
- [ARCHITECTURE_SIMPLIFIED.md](./architecture/ARCHITECTURE_SIMPLIFIED.md) - Упрощённая архитектура
- [CATEGORY_SYSTEM.md](./architecture/CATEGORY_SYSTEM.md) - Система категорий
- [SIMPLIFIED_COMPLETE.md](./architecture/SIMPLIFIED_COMPLETE.md) - Полное описание упрощений

### 📋 Каталог
Документация по каталогу специалистов.

📁 **[catalog/](./catalog/)**
- [CATALOG_ARCHITECTURE.md](./catalog/CATALOG_ARCHITECTURE.md) - Архитектура каталога
- [CATALOG_REFACTORING_SUMMARY.md](./catalog/CATALOG_REFACTORING_SUMMARY.md) - Итоги рефакторинга
- [CATALOG_TESTING_CHECKLIST.md](./catalog/CATALOG_TESTING_CHECKLIST.md) - Чеклист тестирования

### 🚀 Deployment
Инструкции по развёртыванию на Railway.

📁 **[deployment/](./deployment/)**
- [RAILWAY_SETUP.md](./deployment/RAILWAY_SETUP.md) - Первоначальная настройка
- [RAILWAY_BUILD_ARGS.md](./deployment/RAILWAY_BUILD_ARGS.md) - Build аргументы
- [RAILWAY_DEPLOY_STEPS.md](./deployment/RAILWAY_DEPLOY_STEPS.md) - Шаги деплоя
- [AI_CHAT_DEPLOY.md](./deployment/AI_CHAT_DEPLOY.md) - Деплой AI-чата
- [RAILWAY_AI_CHAT.md](./deployment/RAILWAY_AI_CHAT.md) - Настройка AI на Railway
- [RAILWAY_VARIABLES.md](./deployment/RAILWAY_VARIABLES.md) - Переменные окружения
- [POST_DEPLOY_CHECKLIST.md](./deployment/POST_DEPLOY_CHECKLIST.md) - ✅ Чеклист после деплоя

### 📖 Руководства
Быстрые старты и гайды.

📁 **[guides/](./guides/)**
- [QUICKSTART.md](./guides/QUICKSTART.md) - Быстрый старт
- [IMPLEMENTATION.md](./guides/IMPLEMENTATION.md) - Детали реализации

### 🔍 Аудиты
Отчёты по аудитам кода и архитектуры.

📁 **[audits/](./audits/)**
- [2025-10-06-ai-chat-complete.md](./audits/2025-10-06-ai-chat-complete.md) - Финальный отчёт AI-чата
- [2025-10-06-ai-chat-report.md](./audits/2025-10-06-ai-chat-report.md) - Детальный анализ

### 🗄️ Legacy
Устаревшая документация (для истории).

📁 **[legacy/](./legacy/)**
- Старые аудиты и отчёты

---

## 🚀 Быстрые ссылки

### Для разработчиков:
- 🏁 [Быстрый старт](./guides/QUICKSTART.md)
- 🏗️ [Архитектура](./architecture/ARCHITECTURE_SIMPLIFIED.md)
- 🤖 [AI-Чат](./ai-chat/README.md)

### Для деплоя:
- 🚂 [Railway Setup](./deployment/RAILWAY_SETUP.md)
- ✅ [Post-Deploy Checklist](./deployment/POST_DEPLOY_CHECKLIST.md)
- ⚙️ [Переменные окружения](./deployment/RAILWAY_VARIABLES.md)

### Для поддержки:
- 📋 [Каталог](./catalog/CATALOG_ARCHITECTURE.md)
- 🔍 [Аудиты](./audits/)

---

## 📁 Структура проекта

```
аура/
├── docs/                   # Вся документация здесь
│   ├── README.md          # Этот файл
│   ├── ai-chat/           # AI-чат
│   ├── architecture/      # Архитектура
│   ├── catalog/           # Каталог
│   ├── deployment/        # Деплой
│   ├── guides/            # Гайды
│   ├── audits/            # Аудиты
│   └── legacy/            # Архив
│
├── scripts/               # Служебные скрипты
│   ├── legacy/           # Старые скрипты (архив)
│   └── maintenance/      # Maintenance скрипты
│
├── prisma/
│   ├── schema.prisma
│   ├── seed*.ts
│   └── scripts/          # Prisma служебные скрипты
│       ├── generate-embeddings.ts
│       └── setup-mongodb.ts
│
├── src/                  # Исходный код
├── public/              # Статика
├── README.md            # Главный README
└── ... конфигурация
```

---

Обновлено: 2025-10-06
