/**
 * Система пакетов для специалистов
 */

export const SPECIALIST_PACKAGES = {
  basic: {
    id: 'basic',
    name: 'Базовый пакет',
    description: '50 баллов для пополнения лимитов',
    price: 50,
    popular: false,
    features: [
      '50 просмотров контактов',
      '5 заявок от клиентов',
      'Идеально для начинающих'
    ]
  },
  standard: {
    id: 'standard',
    name: 'Стандартный пакет',
    description: '100 баллов для пополнения лимитов',
    price: 100,
    popular: true,
    features: [
      '100 просмотров контактов',
      '10 заявок от клиентов',
      'Оптимальный выбор'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Премиум пакет',
    description: '500 баллов для пополнения лимитов',
    price: 500,
    popular: false,
    features: [
      '500 просмотров контактов',
      '50 заявок от клиентов',
      'Для активных специалистов'
    ]
  }
} as const

export type PackageId = keyof typeof SPECIALIST_PACKAGES

export type SpecialistPackage = typeof SPECIALIST_PACKAGES[PackageId]

/**
 * Получить пакет по ID
 */
export function getPackage(packageId: PackageId): SpecialistPackage {
  return SPECIALIST_PACKAGES[packageId]
}

/**
 * Получить все пакеты
 */
export function getAllPackages(): SpecialistPackage[] {
  return Object.values(SPECIALIST_PACKAGES)
}

/**
 * Получить популярный пакет
 */
export function getPopularPackage(): SpecialistPackage | null {
  return Object.values(SPECIALIST_PACKAGES).find(pkg => pkg.popular) || null
}
