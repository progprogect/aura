# 🏗️ Preview System V3 - Архитектура

## 📋 Обзор

Production-ready система генерации и управления превью для лид-магнитов с:
- ✅ Clean Architecture (SOLID principles)
- ✅ Cloudinary CDN с responsive images
- ✅ BullMQ queue для фоновой обработки
- ✅ Provider Pattern для расширяемости
- ✅ TypeScript type safety

---

## 🏛️ Архитектурная диаграмма

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌────────────────┐  ┌──────────────────────────────┐   │
│  │ UI Components  │  │ Preview Components           │   │
│  │ - CardPreview  │  │ - ResponsivePreview          │   │
│  │ - SmartPreview │  │ - PDFPreview, VideoEmbed     │   │
│  └────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                  │
│  POST /api/specialist/lead-magnets  (создание)          │
│  POST /api/lead-magnet/preview/generate                 │
│  GET  /api/lead-magnet/preview/status/:jobId            │
│  POST /api/lead-magnet/preview/batch                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              BullMQ Queue System (Redis)                 │
│  ┌──────────────┐         ┌──────────────────────┐      │
│  │ Preview Queue│ ──────▶ │ Preview Worker       │      │
│  │ - Jobs       │         │ - Process Generation │      │
│  │ - Priority   │         │ - Retry Logic        │      │
│  └──────────────┘         └──────────────────────┘      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│           Preview Generation System (Core)               │
│  ┌────────────────────────────────────────────────┐     │
│  │  Generator (Manager Pattern)                   │     │
│  │  - Выбор provider                              │     │
│  │  - Координация генерации                       │     │
│  └────────────────────────────────────────────────┘     │
│                            │                             │
│      ┌────────────┬────────┴────────┬─────────────┐     │
│      ▼            ▼                 ▼             ▼     │
│  ┌───────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  PDF  │  │  Image   │  │  Video   │  │ Service  │   │
│  │Provider│ │ Provider │  │ Provider │  │ Provider │   │
│  └───────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudinary Storage + CDN                    │
│  - Responsive images (thumbnail, card, detail)          │
│  - WebP/AVIF automatic conversion                       │
│  - On-the-fly transformations                           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 PostgreSQL Database                      │
│  LeadMagnet:                                            │
│    - previewUrls: Json (responsive URLs)                │
│    - previewImage: String (deprecated, backup)          │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Структура файлов

```
src/
├── lib/
│   ├── queue/                          # BullMQ Queue System
│   │   ├── config.ts                   # Redis connection
│   │   ├── preview-queue.ts            # Queue functions
│   │   ├── preview-worker.ts           # Worker logic
│   │   └── worker-start.ts             # Entry point
│   │
│   ├── cloudinary/                     # Cloudinary Integration
│   │   ├── config.ts                   # Basic config + PDF fix
│   │   └── preview-uploader.ts         # Responsive upload
│   │
│   └── lead-magnets/
│       └── preview/                    # Clean Architecture
│           ├── core/
│           │   ├── types.ts            # TypeScript interfaces
│           │   └── generator.ts        # Manager Pattern
│           ├── providers/
│           │   ├── base.provider.ts    # Abstract base
│           │   ├── pdf.provider.ts     # PDF generation
│           │   ├── image.provider.ts   # Image optimization
│           │   ├── video.provider.ts   # Video thumbnails
│           │   └── service.provider.ts # Service cards
│           ├── storage/
│           │   └── cloudinary.storage.ts # CDN upload
│           ├── utils/
│           │   ├── constants.ts        # Gradients, icons
│           │   └── helpers.ts          # Utilities
│           └── index.ts                # Public API
│
├── components/
│   └── lead-magnet/
│       ├── preview/                    # Preview Components
│       │   ├── ResponsivePreview.tsx   # srcset component
│       │   ├── VideoEmbed.tsx
│       │   ├── PDFPreview.tsx
│       │   └── ServiceForm.tsx
│       ├── CardPreview.tsx             # Card preview
│       └── SmartPreview.tsx            # Smart preview
│
└── app/api/lead-magnet/preview/       # API Routes
    ├── generate/route.ts               # POST - generate
    ├── status/[jobId]/route.ts         # GET - status
    └── batch/route.ts                  # POST - batch

prisma/scripts/                         # Migration Scripts
├── fix-pdf-access.ts                   # PDF 401 fix
├── migrate-preview-to-cdn.ts           # Base64 → Cloudinary
└── rollback-preview-migration.ts       # Rollback
```

---

## 🔄 Процесс генерации превью

### 1. Создание лид-магнита

```typescript
// POST /api/specialist/lead-magnets
1. Валидация данных
2. Загрузка файла (если есть) в Cloudinary
3. Создание записи в БД
4. Добавление задачи в queue ✨
5. Ответ пользователю (не ждём генерации)
```

### 2. Фоновая обработка (Worker)

```typescript
// Preview Worker
1. Получение задачи из queue
2. Выбор provider через Generator
3. Генерация превью (PDF/Image/Video/Service)
4. Загрузка в Cloudinary (3 размера)
5. Сохранение previewUrls в БД
6. Retry при ошибках (3 попытки)
```

### 3. Отображение на Frontend

```typescript
// ResponsivePreview component
1. Получение previewUrls из БД
2. Генерация srcset (400w, 800w, 1200w)
3. Browser выбирает оптимальный размер
4. Lazy loading изображения
```

---

## 🧩 Provider Pattern

### Как работает

1. **Manager** (Generator) получает request на генерацию
2. Проходит по списку зарегистрированных providers
3. Каждый provider проверяет `canHandle()` 
4. Первый подходящий provider выполняет `generate()`

### Добавление нового Provider

```typescript
// providers/custom.provider.ts
export class CustomPreviewProvider extends BasePreviewProvider {
  name = 'CustomPreviewProvider'

  canHandle(options: PreviewGenerationOptions): boolean {
    // Логика проверки
    return options.type === 'custom'
  }

  async generate(options: PreviewGenerationOptions): Promise<PreviewGenerationResult> {
    // Логика генерации
    const buffer = await generateCustomPreview(options)
    return this.successResult(buffer, 'custom')
  }
}

// Регистрация в core/generator.ts
this.registerProvider(new CustomPreviewProvider())
```

---

## 📊 База данных

### LeadMagnet Schema

```prisma
model LeadMagnet {
  // ...existing fields
  
  // DEPRECATED: старое поле (backup)
  previewImage String?
  
  // NEW: Responsive preview URLs
  previewUrls Json?  // { thumbnail, card, detail, original }
}
```

### PreviewUrls JSON Structure

```typescript
{
  thumbnail: "https://res.cloudinary.com/.../w_400,h_300/...",
  card: "https://res.cloudinary.com/.../w_800,h_600/...",
  detail: "https://res.cloudinary.com/.../w_1200,h_900/...",
  original: "https://res.cloudinary.com/..." // optional
}
```

---

## 🚀 API Endpoints

### POST /api/lead-magnet/preview/generate
Генерация превью для одного лид-магнита

**Request:**
```json
{
  "leadMagnetId": "clxxx..."
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "preview-clxxx...",
  "message": "Preview generation job added to queue"
}
```

### GET /api/lead-magnet/preview/status/:jobId
Проверка статуса генерации

**Response:**
```json
{
  "success": true,
  "jobId": "preview-clxxx...",
  "status": "completed",
  "progress": 100,
  "data": { /* job data */ }
}
```

### POST /api/lead-magnet/preview/batch
Массовая генерация

**Request:**
```json
{
  "regenerateAll": true
}
// или
{
  "leadMagnetIds": ["id1", "id2", ...]
}
```

---

## ⚙️ Конфигурация

### Environment Variables

```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CLOUDINARY_PREVIEW_FOLDER="aura/previews"

# Redis (для BullMQ)
REDIS_PUBLIC_URL="redis://..."
```

### Queue Configuration

```typescript
// src/lib/queue/config.ts
{
  attempts: 3,                    // 3 попытки
  backoff: {
    type: 'exponential',
    delay: 2000                  // 2s, 4s, 8s
  },
  removeOnComplete: {
    age: 24 * 3600,              // 24 часа
    count: 100
  }
}
```

---

## 🛠️ Использование

### Frontend

```tsx
// Компонент с responsive preview
import { ResponsivePreview } from '@/components/lead-magnet/preview/ResponsivePreview'

<ResponsivePreview 
  urls={leadMagnet.previewUrls}
  alt={leadMagnet.title}
  type="card"  // или "detail"
  priority={false}
/>
```

### Backend

```typescript
// Прямая генерация (без queue)
import { generatePreview } from '@/lib/lead-magnets/preview'

const result = await generatePreview({
  type: 'pdf',
  fileUrl: 'https://...',
  title: 'Document',
  //...
})

// С queue
import { addGeneratePreviewJob } from '@/lib/queue/preview-queue'

const jobId = await addGeneratePreviewJob({
  leadMagnetId: '...',
  type: 'pdf',
  //...
})
```

---

## 🔧 Запуск Worker

### Development
```bash
npx ts-node src/lib/queue/worker-start.ts
```

### Production (Dockerfile/Railway)
```bash
npm run worker:preview
```

Добавить в `package.json`:
```json
{
  "scripts": {
    "worker:preview": "ts-node src/lib/queue/worker-start.ts"
  }
}
```

---

## 📈 Мониторинг

### Логирование

Все операции логируются:
```
[Preview Generator] Генерация превью для: Title (тип: pdf)
[Preview Generator] Используется provider: PDFPreviewProvider
[PDFPreviewProvider] ✅ PDF превью сгенерировано
[Cloudinary Storage] ✅ Превью загружено
[Preview Worker] ✅ Задача completed
```

### Метрики (через Redis)

- Количество задач в очереди
- Успешные/провальные генерации
- Среднее время обработки

---

## 🧪 Тестирование

### Unit Tests
```typescript
// providers/*.provider.spec.ts
describe('PDFPreviewProvider', () => {
  it('should generate PDF preview', async () => {
    const provider = new PDFPreviewProvider()
    const result = await provider.generate(options)
    expect(result.success).toBe(true)
  })
})
```

### Integration Tests
```typescript
// Full flow test
it('should generate and upload preview', async () => {
  const result = await generatePreview(options)
  const uploaded = await uploadPreviewToCloudinary(result.previewBuffer, 'id')
  expect(uploaded.urls).toHaveProperty('thumbnail')
})
```

---

## 🔐 Безопасность

1. **PDF 401 Fix:** `resource_type: 'raw'` + `access_mode: 'public'`
2. **Rate Limiting:** 500ms delay в batch обработке
3. **Error Handling:** Graceful fallbacks на всех уровнях
4. **Retry Logic:** 3 попытки с exponential backoff

---

## 📝 Миграция данных

### Перенос в Cloudinary
```bash
npx ts-node prisma/scripts/migrate-preview-to-cdn.ts
```

### Rollback
```bash
npx ts-node prisma/scripts/rollback-preview-migration.ts
```

---

## 🎯 Acceptance Criteria

- ✅ AC1: Clean Architecture (core/providers/storage/utils)
- ✅ AC2: Нет дублирования кода
- ✅ AC3: UI компоненты <200 строк
- ✅ AC4: Cloudinary с 3 размерами
- ✅ AC5: srcset для responsive
- ✅ AC6: BullMQ queue с retry
- ✅ AC7: Миграция base64 → CDN
- ✅ AC8: Без регрессий
- 🟡 AC9: Unit тесты (pending)
- ✅ AC10: Документация

---

**Дата:** 2025-10-10  
**Версия:** 3.0.0  
**Статус:** ✅ Production-Ready (тесты pending)

