# Icon System

Централизованная система иконок для проекта.

## Использование

### Базовый компонент Icon

```tsx
import { Icon } from '@/components/ui/icons/Icon'
import { Search, X, Filter } from '@/components/ui/icons/catalog-icons'

// С aria-label (для интерактивных элементов)
<Icon icon={Search} size={24} aria-label="Поиск" />

// Декоративная иконка (aria-hidden автоматически)
<Icon icon={X} size={16} />

// С кастомными стилями
<Icon 
  icon={Filter} 
  size={20} 
  className="text-blue-500 hover:text-blue-600" 
/>
```

### ButtonIcon (для кнопок)

```tsx
import { ButtonIcon } from '@/components/ui/icons/Icon'
import { Search } from '@/components/ui/icons/catalog-icons'

<button>
  <ButtonIcon icon={Search} />
  Найти специалиста
</button>
```

### ListIcon (для списков и карточек)

```tsx
import { ListIcon } from '@/components/ui/icons/Icon'
import { Clock, MapPin } from '@/components/ui/icons/catalog-icons'

<span>
  <ListIcon icon={Clock} />
  5 лет опыта
</span>

<span>
  <ListIcon icon={MapPin} />
  Москва
</span>
```

## Доступные иконки

Все иконки экспортируются из `catalog-icons.tsx`:

### Поиск и фильтрация
- `Search` - Поиск
- `X` - Закрыть / Очистить
- `Filter` - Фильтры
- `ChevronDown` - Стрелка вниз
- `ChevronUp` - Стрелка вверх
- `SlidersHorizontal` - Настройки фильтров

### Специалисты
- `CheckCircle2` - Верификация
- `Check` - Галочка
- `Clock` - Время / Опыт
- `MapPin` - Локация
- `Users` - Группа людей
- `User` - Пользователь
- `Briefcase` - Профессия
- `Award` - Достижения
- `GraduationCap` - Образование

### Навигация
- `ArrowRight` - Стрелка вправо
- `ArrowLeft` - Стрелка влево
- `ExternalLink` - Внешняя ссылка
- `MoreVertical` - Меню (три точки)

### Состояния
- `Loader2` - Загрузка (spinner)
- `AlertCircle` - Ошибка / Предупреждение
- `Info` - Информация
- `CheckCircle` - Успех

### Фильтры
- `DollarSign` - Цена
- `Calendar` - Дата
- `Star` - Рейтинг
- `TrendingUp` - Популярность

## Добавление новой иконки

1. Найдите иконку на [lucide.dev](https://lucide.dev)
2. Добавьте export в `catalog-icons.tsx`:
```tsx
export { NewIcon } from 'lucide-react'
```
3. Используйте в компонентах:
```tsx
import { NewIcon } from '@/components/ui/icons/catalog-icons'
```

## Accessibility

- **Всегда** добавляйте `aria-label` для интерактивных иконок
- **Никогда** не добавляйте `aria-label` для декоративных иконок
- Используйте `aria-hidden` для декоративных иконок (автоматически)

### Примеры

✅ **Правильно:**
```tsx
// Интерактивная иконка - есть aria-label
<button>
  <Icon icon={Search} aria-label="Поиск" />
</button>

// Декоративная иконка в кнопке - aria-hidden
<button>
  <ButtonIcon icon={Search} />
  Найти специалиста
</button>
```

❌ **Неправильно:**
```tsx
// Интерактивная иконка без aria-label
<button>
  <Icon icon={Search} />
</button>

// Декоративная иконка с aria-label (дублирует текст)
<button>
  <Icon icon={Search} aria-label="Поиск" />
  Найти специалиста
</button>
```

## Размеры

Стандартные размеры:
- `14px` - Мелкие иконки в тексте (ListIcon)
- `16px` - Иконки в кнопках (ButtonIcon)
- `20px` - Стандартные иконки (по умолчанию)
- `24px` - Крупные иконки
- `32px` - Очень крупные иконки (hero секции)

## Стилизация

Иконки lucide-react поддерживают все стандартные SVG атрибуты:

```tsx
<Icon 
  icon={Search}
  size={20}
  color="blue"              // Цвет обводки
  strokeWidth={2}           // Толщина обводки
  className="text-blue-500" // Tailwind классы
/>
```

## Анимации

Используйте Tailwind анимации:

```tsx
<Icon 
  icon={Loader2}
  className="animate-spin" 
/>

<Icon 
  icon={ChevronDown}
  className="transition-transform group-hover:translate-y-1" 
/>
```

