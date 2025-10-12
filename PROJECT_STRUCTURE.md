# 📁 Структура проекта

## 📂 Корень проекта

```
Аура/
├── 📄 README.md                      # Главная документация
├── 📄 README_UNIFIED_AUTH.md         # Документация unified auth
├── 📄 package.json                   # Зависимости
├── 📄 tsconfig.json                  # TypeScript конфигурация
├── 📄 next.config.js                 # Next.js конфигурация
├── 📄 tailwind.config.ts             # Tailwind CSS конфигурация
├── 📄 postcss.config.mjs             # PostCSS конфигурация
├── 📄 components.json                # shadcn/ui конфигурация
├── 📄 railway.toml                   # Railway deploy конфигурация
├── 📄 Dockerfile                     # Docker образ
├── 📄 .env.template                  # Шаблон переменных окружения
├── 📄 .env.social.template           # Шаблон для social auth
│
├── 📁 src/                           # Исходный код приложения
│   ├── 📁 app/                       # Next.js App Router
│   ├── 📁 components/                # React компоненты
│   ├── 📁 lib/                       # Библиотеки и утилиты
│   ├── 📁 hooks/                     # React hooks
│   ├── 📁 config/                    # Конфигурация
│   └── 📄 middleware.ts              # Next.js middleware (auth)
│
├── 📁 prisma/                        # Prisma ORM
│   ├── 📄 schema.prisma              # Database schema
│   ├── 📄 seed.ts                    # Database seed
│   ├── 📁 migrations/                # Database migrations
│   └── 📁 scripts/                   # Utility scripts
│
├── 📁 public/                        # Статические файлы
│   ├── 📁 avatars/                   # Аватары специалистов
│   ├── 📁 icons/                     # SVG иконки
│   └── 📄 robots.txt                 # SEO
│
├── 📁 docs/                          # Документация
│   ├── 📁 ai-chat/                   # AI чат документация
│   ├── 📁 architecture/              # Архитектурная документация
│   ├── 📁 auth/                      # Авторизация документация
│   ├── 📁 catalog/                   # Каталог документация
│   ├── 📁 deployment/                # Деплой на Railway
│   ├── 📁 guides/                    # Руководства
│   ├── 📁 audits/                    # Отчёты аудита
│   └── 📁 legacy/                    # ⚠️ Устаревшая документация
│
└── 📁 scripts/                       # Вспомогательные скрипты
    ├── 📁 maintenance/               # Скрипты обслуживания
    ├── 📁 legacy/                    # ⚠️ Устаревшие скрипты
    └── 📄 README.md                  # Описание скриптов
```

---

## 🗂️ Детальная структура `/src`

### `/src/app/` — Next.js App Router

```
app/
├── (marketing)/                      # Marketing pages (группа роутов)
│   └── page.tsx                      # Главная страница
│
├── api/                              # API Routes
│   ├── auth/                         # Авторизация
│   │   ├── user/                     # 👤 Для обычных пользователей
│   │   │   ├── register/             # POST регистрация
│   │   │   ├── login/                # POST вход
│   │   │   ├── me/                   # GET профиль
│   │   │   └── become-specialist/    # POST стать специалистом
│   │   ├── register/                 # POST регистрация специалиста
│   │   ├── login/                    # POST вход специалиста
│   │   ├── send-sms/                 # POST отправка SMS
│   │   ├── logout/                   # POST выход
│   │   └── profile/                  # GET профиль (legacy)
│   │
│   ├── specialist/                   # Специалисты API
│   │   ├── onboarding/               # POST онбординг
│   │   ├── profile/                  # PATCH обновление профиля
│   │   ├── avatar/                   # POST загрузка аватара
│   │   ├── stats/                    # GET статистика
│   │   ├── certificates/             # CRUD сертификаты
│   │   ├── education/                # CRUD образование
│   │   ├── gallery/                  # CRUD галерея
│   │   ├── faqs/                     # CRUD FAQ
│   │   ├── lead-magnets/             # CRUD лид-магниты
│   │   └── requests/                 # GET/PATCH заявки
│   │
│   ├── specialists/                  # GET каталог специалистов
│   ├── chat/                         # POST AI-чат
│   ├── ai/                           # POST AI запросы
│   ├── analytics/                    # Аналитика
│   │   ├── profile-view/             # POST просмотр профиля
│   │   ├── contact-view/             # POST просмотр контактов
│   │   ├── conversion/               # POST конверсия
│   │   └── track/                    # POST трекинг
│   │
│   ├── embeddings/                   # Embeddings
│   │   ├── generate/                 # POST генерация
│   │   └── search/                   # POST поиск
│   │
│   ├── categories/                   # GET категории
│   └── consultation-request/         # POST заявка на консультацию
│
├── auth/                             # Auth pages
│   ├── user/                         # 👤 Для пользователей
│   │   ├── login/                    # Страница входа
│   │   └── register/                 # Страница регистрации
│   ├── login/                        # Вход специалиста (legacy)
│   └── register/                     # Регистрация специалиста
│
├── specialist/                       # Specialist pages
│   ├── [slug]/                       # Публичный профиль
│   ├── dashboard/                    # Личный кабинет
│   ├── onboarding/                   # Онбординг
│   └── requests/                     # Заявки
│
├── catalog/                          # Каталог специалистов
├── chat/                             # AI-чат
├── test-phone/                       # 🧪 Тестовая страница телефона
│
├── sitemap.ts                        # SEO sitemap
├── robots.ts                         # SEO robots.txt
├── layout.tsx                        # Root layout
└── globals.css                       # Global styles
```

---

### `/src/components/` — React компоненты

```
components/
├── ui/                               # shadcn/ui компоненты
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
│
├── auth/                             # Авторизация
│   ├── AuthRegisterForm.tsx          # Регистрация специалиста
│   ├── AuthLoginForm.tsx             # Вход специалиста
│   ├── AuthUserRegisterForm.tsx      # 👤 Регистрация пользователя
│   ├── AuthUserLoginForm.tsx         # 👤 Вход пользователя
│   └── PhoneInput.tsx                # Компонент телефона
│
├── specialist/                       # Компоненты специалиста
│   ├── SpecialistProfile.tsx         # Публичный профиль
│   ├── SpecialistHero.tsx            # Hero секция
│   ├── SpecialistAbout.tsx           # О себе
│   ├── SpecialistContact.tsx         # Контакты
│   ├── edit/                         # Редактирование
│   │   ├── EditModeToggle.tsx
│   │   ├── ContactsEditor.tsx
│   │   └── ...
│   └── onboarding/                   # Онбординг
│       ├── OnboardingWizard.tsx
│       ├── OnboardingStep1.tsx
│       └── ...
│
├── catalog/                          # Каталог
│   ├── CatalogPage.tsx               # Главная страница каталога
│   ├── SpecialistCard.tsx            # Карточка специалиста
│   ├── SpecialistGrid.tsx            # Сетка карточек
│   └── CatalogFilters.tsx            # Фильтры
│
├── chat/                             # AI-чат
│   ├── ChatInterface.tsx             # Главный интерфейс
│   ├── ChatMessage.tsx               # Сообщение
│   ├── SpecialistRecommendation.tsx  # Рекомендация
│   └── MessageInput.tsx              # Ввод сообщения
│
├── homepage/                         # Главная страница
│   ├── HeroSection.tsx
│   ├── FeaturedSpecialists.tsx
│   └── ...
│
└── Navigation.tsx                    # Навигация
```

---

### `/src/lib/` — Библиотеки и утилиты

```
lib/
├── auth/                             # Авторизация
│   ├── user-auth-service.ts          # 👤 Сервис пользователей
│   ├── specialist-auth-service.ts    # Сервис специалистов
│   ├── api-auth.ts                   # API auth utils
│   ├── server.ts                     # Server-side auth
│   ├── business-logic.ts             # Бизнес-логика (SMS)
│   ├── types.ts                      # Типы
│   └── legacy/                       # ⚠️ Устаревший код
│       └── social-auth-disabled/     # Отключённые social OAuth
│
├── ai/                               # AI модули
│   ├── client.ts                     # OpenAI client
│   ├── semantic-search.ts            # Семантический поиск
│   ├── embeddings.ts                 # Генерация embeddings
│   ├── mongodb-client.ts             # MongoDB для векторов
│   ├── smart-search.ts               # Умный поиск
│   ├── personalized-search.ts        # Персонализированный поиск
│   └── types.ts                      # AI типы
│
├── catalog/                          # Каталог
│   ├── types.ts                      # Типы
│   ├── utils.ts                      # Утилиты
│   └── constants.ts                  # Константы
│
├── cloudinary/                       # Загрузка медиа
│   └── config.ts                     # Cloudinary конфигурация
│
├── analytics/                        # Аналитика
│   ├── chat-analytics.ts             # Аналитика чата
│   └── tracking.ts                   # Трекинг событий
│
├── phone/                            # Телефон
│   ├── country-codes.ts              # Коды стран
│   └── validation.ts                 # Валидация
│
├── validations/                      # Валидация
│   └── api.ts                        # API схемы
│
├── redis.ts                          # Redis client
├── prisma.ts                         # Prisma client
├── validation.ts                     # Общая валидация
├── category-config.ts                # Конфигурация категорий
└── specialist-config.ts              # Конфигурация специалистов
```

---

## ⚠️ Legacy Code (устаревший код)

### Можно безопасно удалить:
```
docs/legacy/                          # Старая документация
  └── unified-auth/                   # Отчёты о миграции
  └── test-results/                   # Старые результаты тестов
```

### Сохранить (будет переработано):
```
src/lib/auth/legacy/
  └── social-auth-disabled/           # Google, VK, Yandex OAuth
                                      # Будет восстановлено для unified
```

---

## 🔐 Конфигурационные файлы

### Environment Variables:
- `.env` — production переменные (gitignored)
- `.env.template` — шаблон для основных переменных
- `.env.social.template` — шаблон для social auth

### TypeScript:
- `tsconfig.json` — основная конфигурация
- `next-env.d.ts` — Next.js типы

### Build:
- `next.config.js` — Next.js config
- `tailwind.config.ts` — Tailwind config
- `postcss.config.mjs` — PostCSS config

### Deploy:
- `railway.toml` — Railway конфигурация
- `Dockerfile` — Docker образ

---

## 📝 Документация

### Главная:
- `README.md` — основная документация проекта
- `README_UNIFIED_AUTH.md` — unified auth система

### Детальная (в `/docs`):
- `/ai-chat` — AI-чат и семантический поиск
- `/architecture` — архитектура приложения
- `/auth` — система авторизации
- `/catalog` — каталог специалистов
- `/deployment` — деплой на Railway
- `/guides` — руководства разработчика

---

## 🗑️ Что можно удалить

### Безопасно удалить сейчас:
```bash
rm -rf docs/legacy/unified-auth
rm -rf docs/legacy/test-results
```

### Удалить позже (после восстановления social auth):
```bash
rm -rf src/lib/auth/legacy
```

---

**Последнее обновление:** 9 октября 2025  
**Статус:** ✅ Структура оптимизирована

