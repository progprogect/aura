// Конфигурация категорий специалистов

export type SpecialistCategory =
  | 'psychology'
  | 'fitness'
  | 'nutrition'
  | 'massage'
  | 'wellness'
  | 'coaching'
  | 'medicine'
  | 'other'

export interface CategoryField {
  label: string
  icon: string
  type?: 'array' | 'string' | 'number'
}

export interface CategoryConfig {
  name: string
  emoji: string
  priceLabel: string
  fields: Record<string, CategoryField>
}

export const CATEGORY_CONFIG: Record<SpecialistCategory, CategoryConfig> = {
  psychology: {
    name: 'Психология и терапия',
    emoji: '🧠',
    priceLabel: 'за сессию',
    fields: {
      methods: {
        label: 'Методы',
        icon: '🧠',
        type: 'array',
      },
      worksWith: {
        label: 'С чем работаю',
        icon: '🎯',
        type: 'array',
      },
      sessionFormats: {
        label: 'Формат сессий',
        icon: '👥',
        type: 'array',
      },
      sessionDuration: {
        label: 'Длительность',
        icon: '⏱',
        type: 'number',
      },
      targetGroups: {
        label: 'Работаю с',
        icon: '👨‍👩‍👧',
        type: 'array',
      },
      languages: {
        label: 'Языки консультаций',
        icon: '🌐',
        type: 'array',
      },
    },
  },

  fitness: {
    name: 'Фитнес и спорт',
    emoji: '🏋️',
    priceLabel: 'за тренировку',
    fields: {
      trainingTypes: {
        label: 'Специализация',
        icon: '🏋️',
        type: 'array',
      },
      sessionFormats: {
        label: 'Формат тренировок',
        icon: '👥',
        type: 'array',
      },
      gymLocation: {
        label: 'Где тренируем',
        icon: '📍',
        type: 'string',
      },
      achievements: {
        label: 'Достижения',
        icon: '🏆',
        type: 'array',
      },
      equipment: {
        label: 'Оборудование',
        icon: '🎽',
        type: 'array',
      },
    },
  },

  nutrition: {
    name: 'Питание и диетология',
    emoji: '🥗',
    priceLabel: 'за консультацию',
    fields: {
      approaches: {
        label: 'Подход',
        icon: '🥗',
        type: 'array',
      },
      specializations: {
        label: 'Работаю с',
        icon: '🎯',
        type: 'array',
      },
      programDuration: {
        label: 'Длительность программ',
        icon: '📅',
        type: 'string',
      },
      consultationFormats: {
        label: 'Форматы работы',
        icon: '📋',
        type: 'array',
      },
    },
  },

  massage: {
    name: 'Массаж и телесные практики',
    emoji: '💆',
    priceLabel: 'за сеанс',
    fields: {
      massageTypes: {
        label: 'Виды массажа',
        icon: '💆',
        type: 'array',
      },
      techniques: {
        label: 'Техники',
        icon: '🤲',
        type: 'array',
      },
      sessionDuration: {
        label: 'Длительность сеанса',
        icon: '⏱',
        type: 'number',
      },
      location: {
        label: 'Локация',
        icon: '📍',
        type: 'string',
      },
    },
  },

  wellness: {
    name: 'Wellness и холистические практики',
    emoji: '🧘',
    priceLabel: 'за сессию',
    fields: {
      practices: {
        label: 'Практики',
        icon: '🧘',
        type: 'array',
      },
      specializations: {
        label: 'Специализация',
        icon: '🎯',
        type: 'array',
      },
      sessionFormats: {
        label: 'Формат работы',
        icon: '👥',
        type: 'array',
      },
    },
  },

  coaching: {
    name: 'Коучинг и наставничество',
    emoji: '🎯',
    priceLabel: 'за сессию',
    fields: {
      coachingTypes: {
        label: 'Тип коучинга',
        icon: '🎯',
        type: 'array',
      },
      specializations: {
        label: 'Специализация',
        icon: '💼',
        type: 'array',
      },
      sessionFormats: {
        label: 'Формат работы',
        icon: '👥',
        type: 'array',
      },
      methods: {
        label: 'Методы',
        icon: '📊',
        type: 'array',
      },
    },
  },

  medicine: {
    name: 'Медицинские специалисты',
    emoji: '⚕️',
    priceLabel: 'за консультацию',
    fields: {
      specializations: {
        label: 'Специализация',
        icon: '⚕️',
        type: 'array',
      },
      treatments: {
        label: 'Виды лечения',
        icon: '💊',
        type: 'array',
      },
      consultationTypes: {
        label: 'Тип консультаций',
        icon: '🩺',
        type: 'array',
      },
    },
  },

  other: {
    name: 'Другие специалисты',
    emoji: '✨',
    priceLabel: 'за услугу',
    fields: {
      specializations: {
        label: 'Специализация',
        icon: '✨',
        type: 'array',
      },
      services: {
        label: 'Услуги',
        icon: '📋',
        type: 'array',
      },
    },
  },
}

// ========================================
// ПРИМЕЧАНИЕ:
// Этот файл используется ТОЛЬКО для seed-categories.ts
// В runtime приложение использует categoryConfigService
// который читает данные из БД
// ========================================



