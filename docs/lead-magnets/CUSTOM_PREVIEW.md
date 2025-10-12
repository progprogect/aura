# Система кастомных превью для лид-магнитов

**Версия:** 2.0  
**Дата внедрения:** 2025-10-12  
**Статус:** Активна

## Обзор

Новая система позволяет специалистам загружать собственные превью для лид-магнитов или использовать автоматически сгенерированные fallback превью.

### Ключевые особенности

✅ **Кастомные превью** - специалист загружает своё изображение  
✅ **Fallback генерация** - автоматическое создание при отсутствии кастомного  
✅ **Квадратный формат (1:1)** - для всех устройств  
✅ **Crop функционал** - обрезка неквадратных изображений  
✅ **Синхронная обработка** - без queue и background jobs  
✅ **Простая архитектура** - легко поддерживать  

---

## Архитектура

### Backend

#### 1. Fallback Generator (`src/lib/lead-magnets/fallback-preview-generator.ts`)

Генерирует квадратное превью (800x800) через Node.js Canvas:
- Градиентный фон (зависит от типа лид-магнита)
- Emoji центрирована
- Экспорт в Buffer (PNG)

**Градиенты по типам:**
- `file` → синий (#3B82F6 → #1E40AF)
- `link` → фиолетовый (#8B5CF6 → #6D28D9)
- `service` → розовый (#EC4899 → #BE185D)

#### 2. Cloudinary Integration (`src/lib/cloudinary/config.ts`)

**Новые функции:**
- `uploadCustomPreview()` - загрузка кастомного превью
- `uploadFallbackPreview()` - загрузка сгенерированного fallback
- `deletePreview()` - удаление старого превью
- `generatePreviewUrlsFromPublicId()` - responsive URLs

**Responsive URLs:**
```typescript
{
  thumbnail: string  // 200x200
  card: string       // 400x400
  detail: string     // 800x800
}
```

#### 3. API Endpoints

**POST `/api/specialist/lead-magnets`**
- Принимает `previewFile` в FormData (опционально)
- Если `previewFile` → загрузка кастомного
- Если НЕТ → генерация fallback
- Сохранение `previewUrls` в БД

**PUT `/api/specialist/lead-magnets/[id]`**
- Аналогично POST
- Удаление старого превью при замене

---

### Frontend

#### 1. UI Компоненты

**PreviewUploader** (`src/components/specialist/edit/PreviewUploader.tsx`)
- Drag-n-drop зона
- Валидация (JPG/PNG/WebP, макс 5MB)
- Preview загруженного изображения

**CropModal** (`src/components/specialist/edit/CropModal.tsx`)
- Crop неквадратных изображений
- Использует `react-easy-crop`
- Zoom и позиционирование

**FallbackPreview** (`src/components/specialist/edit/FallbackPreview.tsx`)
- CSS версия fallback для preview
- Показывает как будет выглядеть автоматическое превью

**LeadMagnetModal** (`src/components/specialist/edit/LeadMagnetModal.tsx`)
- Интеграция всех компонентов
- Отправка через FormData

#### 2. Отображение

**CardPreview** (`src/components/lead-magnet/CardPreview.tsx`)
- Базовый компонент отображения
- Квадратный aspect-ratio (1:1)
- Использует `previewUrls.card`

**LeadMagnetCard** (`src/components/lead-magnet/LeadMagnetCard.tsx`)
- Карточка на странице специалиста
- Квадратное превью
- Адаптивная сетка

---

## TypeScript типы

```typescript
// PreviewUrls (все квадратные 1:1)
export interface PreviewUrls {
  thumbnail: string  // 200x200
  card: string       // 400x400
  detail: string     // 800x800
  original?: string
}

// LeadMagnet
export interface LeadMagnet {
  // ... existing fields
  previewUrls?: PreviewUrls | null
  customPreview?: boolean  // Флаг кастомного превью
}

// LeadMagnetFormData
export interface LeadMagnetFormData {
  // ... existing fields
  previewFile?: File  // Кастомное превью
}
```

---

## Использование

### Для специалистов

#### Загрузка кастомного превью

1. Открыть модальное окно создания/редактирования лид-магнита
2. В секции "Превью" загрузить изображение (drag-n-drop или кнопка)
3. Если изображение не квадратное → обрезать через crop modal
4. Сохранить

**Требования к изображению:**
- Формат: JPG, PNG, WebP
- Размер: максимум 5MB
- Рекомендуемый размер: 800x800px или больше

#### Fallback превью

Если превью не загружено → автоматически создаётся красивое превью с emoji на градиентном фоне.

### Для разработчиков

#### Добавление нового лид-магнита

```typescript
const formData = new FormData()
formData.append('type', 'file')
formData.append('title', 'Мой лид-магнит')
formData.append('description', 'Описание')
formData.append('emoji', '🎁')
formData.append('file', pdfFile)
formData.append('previewFile', imageFile) // Опционально

const response = await fetch('/api/specialist/lead-magnets', {
  method: 'POST',
  body: formData
})
```

#### Использование в компонентах

```tsx
import { CardPreview } from '@/components/lead-magnet/CardPreview'

<CardPreview 
  leadMagnet={leadMagnet} 
  size="responsive" 
/>
```

---

## Миграция данных

### Скрипт миграции

**Файл:** `scripts/migrate-lead-magnet-previews.ts`

**Запуск:**
```bash
# Тестовый прогон (без изменений)
npm run migrate:previews -- --dry-run

# Реальная миграция
npm run migrate:previews
```

**Что делает:**
1. Находит все активные лид-магниты
2. Генерирует fallback превью для каждого
3. Загружает в Cloudinary
4. Обновляет `previewUrls` в БД

---

## Performance

### Оптимизации

✅ **Responsive Images** - автоматический выбор размера  
✅ **CDN Caching** - Cloudinary CDN  
✅ **Lazy Loading** - Next.js Image оптимизация  
✅ **WebP/AVIF** - автоматическая конвертация (f_auto)  
✅ **Quality Auto** - оптимальное качество (q_auto)  

### Размеры файлов

- **Fallback превью:** ~50-80KB (PNG)
- **Кастомное превью:** оптимизируется Cloudinary

---

## Troubleshooting

### Превью не отображается

1. Проверить `previewUrls` в БД
2. Проверить доступность Cloudinary URLs
3. Проверить браузер console на ошибки

### Fallback не генерируется

1. Проверить установку `canvas` пакета
2. Проверить логи сервера
3. Проверить Cloudinary credentials

### Crop modal не работает

1. Проверить установку `react-easy-crop`
2. Проверить browser console

---

## Changelog

### [2.0.0] - 2025-10-12

#### Added
- Кастомные превью с загрузкой
- Fallback генератор через Canvas
- Crop функционал для неквадратных изображений
- Квадратные превью (1:1) везде

#### Changed
- API endpoints теперь принимают `previewFile`
- Все превью квадратные
- Синхронная обработка вместо queue

#### Removed
- Автоматическая генерация через queue
- Preview providers (PDF, Video, Image, Service)
- Background jobs система
- BullMQ зависимость (для preview)

---

## Связанные документы

- [Legacy Preview System](/docs/legacy/preview-system-old/README.md) - Старая система
- [Migration Script](/scripts/migrate-lead-magnet-previews.ts) - Скрипт миграции
- [API Documentation](/docs/api/lead-magnets.md) - API endpoints

---

## Поддержка

При возникновении проблем:
1. Проверить этот документ
2. Проверить логи сервера
3. Проверить Browser DevTools
4. Создать issue в репозитории

