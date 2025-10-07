/**
 * Централизованная конфигурация приложения
 * Все константы и настройки в одном месте
 */

export const APP_CONFIG = {
  /**
   * Информация о приложении
   */
  app: {
    name: 'Аура',
    description: 'Платформа для поиска проверенных специалистов',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  /**
   * Пагинация
   */
  pagination: {
    default: 12,
    max: 100,
    loadMoreIncrement: 12,
  },

  /**
   * Кэширование (в миллисекундах)
   */
  cache: {
    categories: 30 * 60 * 1000, // 30 минут
    specialists: 5 * 60 * 1000, // 5 минут
    session: 7 * 24 * 60 * 60 * 1000, // 7 дней
    redis: 48 * 60 * 60, // 48 часов (в секундах для Redis)
  },

  /**
   * Debounce задержки (в миллисекундах)
   */
  debounce: {
    search: 300,
    urlUpdate: 500,
    analytics: 1000,
  },

  /**
   * AI модели и настройки
   */
  ai: {
    models: {
      chat: 'gpt-4o-mini', // Быстрая и эффективная модель для диалога
      embedding: 'text-embedding-3-small',
    },
    chat: {
      temperature: 0.7,
      maxTokens: 800, // Увеличено для follow-up вопросов
      topP: 0.9,
    },
    embeddings: {
      dimensions: 1536,
      batchSize: 20, // Одновременных запросов
      rateLimit: 20, // Задержка между запросами (ms)
    },
    search: {
      defaultLimit: 10,
      maxLimit: 50,
      similarityThreshold: 0.7, // Минимальная схожесть
    },
  },

  /**
   * Аналитика
   */
  analytics: {
    sessionTTL: 7 * 24 * 60 * 60 * 1000, // 7 дней
    redisKeyPrefix: 'chat:analytics',
    aggregationInterval: 24 * 60 * 60 * 1000, // Раз в день
    events: {
      sessionStarted: 'session_started',
      messageSent: 'message_sent',
      recommendationsShown: 'recommendations_shown',
      profileClicked: 'profile_clicked',
      catalogClicked: 'catalog_clicked',
      chatCompleted: 'chat_completed',
      chatAbandoned: 'chat_abandoned',
    } as const,
  },

  /**
   * Фильтры и опции
   */
  filters: {
    experience: [
      { value: 'any', label: 'Любой' },
      { value: '0-2', label: '0-2 года' },
      { value: '2-5', label: '2-5 лет' },
      { value: '5+', label: '5+ лет' },
    ],
    workFormats: [
      { value: 'online', label: 'Онлайн', emoji: '💻' },
      { value: 'offline', label: 'Оффлайн', emoji: '🏢' },
      { value: 'hybrid', label: 'Гибрид', emoji: '🔄' },
    ],
    sortBy: [
      { value: 'relevance', label: 'По релевантности' },
      { value: 'rating', label: 'По рейтингу' },
      { value: 'experience', label: 'По опыту' },
      { value: 'price', label: 'По цене' },
    ],
  },

  /**
   * Валидация
   */
  validation: {
    message: {
      maxLength: 10000,
      maxCount: 100,
    },
    sessionId: {
      maxLength: 100,
    },
    search: {
      minLength: 2,
      maxLength: 200,
    },
  },

  /**
   * Rate limiting
   */
  rateLimit: {
    chat: {
      requestsPerMinute: 10,
      requestsPerHour: 100,
    },
    embeddings: {
      requestsPerMinute: 3000, // OpenAI limit для tier 1
    },
  },
} as const

// Типы для конфигурации
export type AppConfig = typeof APP_CONFIG
export type CategoryKey = 'psychology' | 'fitness' | 'nutrition' | 'massage' | 'coaching' | 'medicine'
export type WorkFormat = 'online' | 'offline' | 'hybrid'
export type SortBy = 'relevance' | 'rating' | 'experience' | 'price'
export type ExperienceRange = 'any' | '0-2' | '2-5' | '5+'

