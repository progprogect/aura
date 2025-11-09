# 🏗️ Архитектура каталога специалистов

## 📖 Обзор

Каталог специалистов - это ключевая часть платформы Эколюция 360, позволяющая пользователям искать и фильтровать специалистов по различным критериям.

**Версия:** 3.0 (полностью рефакторенная)
**Дата:** 2025-10-05

---

## 🎯 Принципы архитектуры

### 1. **Разделение ответственности (Separation of Concerns)**
- **Presentation Layer** - React компоненты (UI)
- **Business Logic Layer** - Хуки и утилиты
- **Data Layer** - API и кэширование

### 2. **KISS (Keep It Simple, Stupid)**
- Минимум абстракций
- Понятные названия
- Прямолинейная логика

### 3. **DRY (Don't Repeat Yourself)**
- Форматтеры вынесены в отдельные модули
- Переиспользуемые хуки
- Централизованные константы

### 4. **SOLID**
- Single Responsibility - каждый модуль имеет одну ответственность
- Open/Closed - легко расширять без изменения существующего кода
- Dependency Inversion - зависимость от абстракций, не реализаций

---

## 📂 Структура файлов

```
src/
├── app/
│   └── catalog/
│       └── page.tsx                    # Server Component (Suspense wrapper)
│
├── components/
│   ├── catalog/
│   │   ├── CatalogContent.tsx          # Главный client компонент
│   │   ├── SearchBar.tsx               # Поисковая строка
│   │   ├── FilterButton.tsx            # Кнопка фильтров
│   │   ├── FilterModal.tsx             # Модалка фильтров
│   │   ├── SpecialistCard.tsx          # Карточка специалиста
│   │   ├── SpecialistGrid.tsx          # Сетка карточек
│   │   ├── LoadingSpinner.tsx          # Спиннер загрузки
│   │   └── SkeletonLoader.tsx          # Skeleton экраны
│   │
│   └── ui/
│       └── icons/
│           ├── Icon.tsx                 # Базовый компонент иконки
│           ├── catalog-icons.tsx        # Экспорт иконок для каталога
│           └── README.md                # Документация по иконкам
│
├── hooks/
│   ├── useSpecialists.ts               # Загрузка специалистов
│   ├── useCategories.ts                # Загрузка категорий
│   ├── useURLState.ts                  # Синхронизация с URL
│   └── useCatalogFilters.ts            # Централизованное управление фильтрами
│
└── lib/
    ├── catalog/
    │   ├── types.ts                    # Типы каталога
    │   ├── constants.ts                # Константы
    │   ├── utils.ts                    # Утилиты
    │   └── api-contract.ts             # API контракт и трансформеры
    │
    └── formatters/
        ├── price.ts                    # Форматирование цен
        ├── experience.ts               # Форматирование опыта
        └── category.ts                 # Работа с категориями
```

---

## 🔄 Поток данных

```
┌─────────────────────────────────────────────────────────────┐
│                    User Action                               │
│  (Изменение фильтра, поиск, пагинация)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                useCatalogFilters Hook                        │
│  • Обновляет URL (с debounce для поиска)                     │
│  • Валидирует изменения                                      │
│  • Batch updates (несколько фильтров за раз)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 useSpecialists Hook                          │
│  • Проверяет кэш (5 минут TTL)                               │
│  • Если есть - возвращает из кэша                            │
│  • Если нет - делает API запрос                              │
│  • Отменяет предыдущие запросы (AbortController)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Route                                 │
│  /api/specialists                                            │
│  • Валидация параметров (Zod)                                │
│  • Построение Prisma запроса                                 │
│  • Пагинация, сортировка, фильтрация                         │
│  • Трансформация DTO → ViewModel                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
│  • Prisma ORM                                                │
│  • Индексированные запросы                                   │
│  • Безопасность от SQL injection                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Response                                  │
│  • Кэшируется в памяти (Map)                                 │
│  • Возвращается в компонент                                  │
│  • Рендерится UI                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Ключевые компоненты

### **1. CatalogContent**
**Роль:** Главный orchestrator каталога
**Обязанности:**
- Управление состоянием модального окна
- Координация между компонентами
- Обработка ошибок (Toast уведомления)

```typescript
export function CatalogContent() {
  const { filters, setters, updateFilters, resetFilters } = useCatalogFilters()
  const { specialists, pagination, loading, loadMore } = useSpecialists(filters)
  // ...
}
```

### **2. useCatalogFilters**
**Роль:** Централизованное управление фильтрами
**Features:**
- Автоматическая синхронизация с URL
- Batch updates (несколько изменений = 1 history entry)
- Debounce для поиска (300ms)
- Shallow routing (не скроллит наверх)

```typescript
const {
  filters,           // Текущие фильтры
  setters,           // Функции для обновления
  updateFilters,     // Batch update
  resetFilters,      // Сброс
  activeFiltersCount // Количество активных
} = useCatalogFilters()
```

### **3. useSpecialists**
**Роль:** Загрузка и кэширование специалистов
**Features:**
- In-memory кэш (Map) с TTL 5 минут
- AbortController для отмены запросов
- Race condition protection
- Load more pagination

```typescript
const {
  specialists,  // Массив специалистов
  pagination,   // Информация о пагинации
  loading,      // Состояние загрузки
  error,        // Ошибка
  refetch,      // Перезагрузка
  loadMore      // Загрузка следующей страницы
} = useSpecialists(filters)
```

### **4. useCategories + useCategoryMap**
**Роль:** Загрузка категорий с кэшированием
**Features:**
- TTL 30 минут (категории меняются редко)
- Stale-while-revalidate (показывает старые данные пока загружает новые)
- Retry логика (3 попытки)
- CategoryMap для быстрого доступа

```typescript
const { categoryMap, loading } = useCategoryMap()
const psychology = categoryMap.get('psychology')
```

---

## 🎨 Компонентная архитектура

### **Иерархия компонентов**

```
CatalogContent (orchestrator)
├── SearchBar
│   └── Icon (Search, X)
│
├── FilterButton
│   └── Icon (Filter, ChevronDown)
│
├── SpecialistGrid
│   ├── SpecialistCard (× N)
│   │   ├── Image (avatar)
│   │   ├── Icon (CheckCircle2, Clock, MapPin)
│   │   └── Formatters (price, experience, category)
│   │
│   └── LoadMore Button
│       └── Icon (ChevronDown, Loader2)
│
└── FilterModal (dialog)
    ├── Icon (X)
    └── Filters (radio, checkbox)
```

### **Переиспользуемые компоненты**

#### Icon Component
Единообразная обёртка над lucide-react:
```typescript
<Icon icon={Search} size={20} aria-label="Поиск" />
```

#### Форматтеры
Переиспользуемые функции форматирования:
```typescript
formatPriceRange(50000, 80000, 'RUB')  // "5 000 - 8 000₽"
formatExperience(3)                    // "3 года"
getCategoryLabel('psychology', map)    // "Психология и терапия"
```

---

## 🔄 Управление состоянием

### **URL как источник истины**

Все фильтры хранятся в URL параметрах:
```
/catalog?category=psychology&verified=true&format=online,hybrid&search=КПТ
```

**Преимущества:**
- ✅ Можно поделиться ссылкой
- ✅ Работает кнопка "Назад"
- ✅ Сохраняется при перезагрузке
- ✅ SEO friendly

### **Локальное состояние**

Минимально необходимое:
- `isFilterModalOpen` - открыта ли модалка
- `imageError` - ошибка загрузки изображения (в карточке)

### **Server State (React Query pattern)**

Данные с сервера кэшируются в памяти:
```typescript
// In-memory кэш
const cache = new Map<string, CacheEntry>()

interface CacheEntry {
  data: SpecialistViewModel[]
  timestamp: number
}
```

---

## ⚡ Оптимизации

### **1. Кэширование**

| Тип данных | TTL | Стратегия |
|-----------|-----|-----------|
| Специалисты | 5 мин | Cache-first |
| Категории | 30 мин | Stale-while-revalidate |
| Поиск | 2 мин | Cache-first |

### **2. Debouncing**

| Параметр | Delay | Причина |
|----------|-------|---------|
| Search | 300ms | Избежать лишних запросов |
| URL update | 100ms | Batch updates |

### **3. Race Condition Protection**

```typescript
// AbortController отменяет предыдущие запросы
const abortControllerRef = useRef<AbortController | null>(null)

if (abortControllerRef.current) {
  abortControllerRef.current.abort()
}
```

### **4. Мемоизация**

```typescript
// useMemo для тяжёлых вычислений
const filters = useMemo(() => ({
  category, experience, format, verified, sortBy, search
}), [category, experience, format, verified, sortBy, search])

// useCallback для функций в зависимостях
const updateFilters = useCallback((updates) => {
  // ...
}, [dependencies])
```

---

## ♿ Accessibility

### **Keyboard Navigation**
- ✅ Tab переключает фокус
- ✅ Enter/Space активируют элементы
- ✅ Escape закрывает модалку

### **Screen Readers**
- ✅ ARIA labels на всех интерактивных элементах
- ✅ aria-hidden для декоративных иконок
- ✅ aria-live для динамического контента
- ✅ role="dialog" для модалки

### **Focus Management**
- ✅ Фокус переходит в модалку при открытии
- ✅ Фокус возвращается после закрытия
- ✅ Focus trap внутри модалки

---

## 🧪 Тестирование

См. [CATALOG_TESTING_CHECKLIST.md](../CATALOG_TESTING_CHECKLIST.md)

---

## 📈 Метрики производительности

### **Целевые метрики**
- FCP (First Contentful Paint): < 1.8s
- LCP (Largest Contentful Paint): < 2.5s
- TTI (Time to Interactive): < 3.8s
- CLS (Cumulative Layout Shift): < 0.1

### **Мониторинг**
```typescript
// Web Vitals можно добавить в app/layout.tsx
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'
```

---

## 🔮 Будущие улучшения

### **Phase 2**
- [ ] Виртуализация списка (react-window) для больших списков
- [ ] Infinite scroll вместо "Загрузить еще"
- [ ] Сохранённые фильтры (localStorage)
- [ ] История поиска

### **Phase 3**
- [ ] Персонализация (рекомендации на основе истории)
- [ ] A/B тестирование вариантов UI
- [ ] Advanced analytics (tracking кликов, времени на странице)

---

## 🆘 Troubleshooting

### **Проблема: Infinite loop при изменении фильтров**
**Решение:** Используйте `JSON.stringify(filters)` в зависимостях useEffect

### **Проблема: URL не обновляется**
**Решение:** Проверьте что используете хуки useURL* правильно

### **Проблема: Категории не загружаются**
**Решение:** 
1. Проверьте `/api/categories` endpoint
2. Проверьте БД (npx prisma studio)
3. Очистите кэш: `clearCategoriesCache()`

### **Проблема: Кэш не очищается**
**Решение:** TTL автоматически очищает старые записи. Для ручной очистки:
```typescript
import { clearCategoriesCache } from '@/hooks/useCategories'
clearCategoriesCache()
```

---

## 📚 Дополнительные ресурсы

- [API Contract](./CATALOG_API_CONTRACT.md)
- [Testing Checklist](../CATALOG_TESTING_CHECKLIST.md)
- [Icon System](../../src/components/ui/icons/README.md)
- [Filtering Guide](./CATALOG_FILTERING.md)

---

**Версия документа:** 1.0
**Последнее обновление:** 2025-10-05
**Автор:** AI Assistant

