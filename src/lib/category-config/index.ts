// Main export file for category config system

export { categoryConfigService, CategoryConfigService } from './service'
export { createCategoryProvider } from './factory'

// Types
export type {
  CategoryConfig,
  CategoryField,
  CategoryConfigProvider,
} from './types'

// Providers (для продвинутого использования)
export { DatabaseCategoryProvider } from './providers/database.provider'
export { CachedCategoryProvider } from './providers/cached.provider'
