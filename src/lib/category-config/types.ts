// Типы и интерфейсы для системы конфигурации категорий

export interface CategoryField {
  key: string
  label: string
  icon: string
  type: 'array' | 'string' | 'number' | 'boolean'
  required?: boolean
  placeholder?: string
  helpText?: string
}

export interface CategoryConfig {
  key: string
  name: string
  emoji: string
  priceLabel: string
  fields: Record<string, CategoryField>
}

// Интерфейс провайдера конфигурации категорий
export interface CategoryConfigProvider {
  /**
   * Получить все активные категории
   */
  getCategories(): Promise<CategoryConfig[]>

  /**
   * Получить конфигурацию конкретной категории
   * @param categoryKey - ключ категории (например, "psychology")
   * @returns конфигурация категории или null если не найдена
   */
  getCategoryConfig(categoryKey: string): Promise<CategoryConfig | null>

  /**
   * Получить поля конкретной категории
   * @param categoryKey - ключ категории
   * @returns словарь полей или пустой объект
   */
  getCategoryFields(categoryKey: string): Promise<Record<string, CategoryField>>

  /**
   * Проверить существование категории
   * @param categoryKey - ключ категории
   * @returns true если категория существует
   */
  hasCategory(categoryKey: string): Promise<boolean>
}
