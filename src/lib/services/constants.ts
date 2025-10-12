/**
 * Константы для системы услуг и заказов
 */

export const SERVICE_LIMITS = {
  MAX_COUNT: 10,
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 1000,
  MAX_HIGHLIGHTS: 5,
  MIN_PRICE: 1,
  MAX_PRICE: 999999,
  MIN_DELIVERY_DAYS: 1,
  MAX_DELIVERY_DAYS: 90,
} as const

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  in_progress: 'В работе',
  completed: 'Завершён',
  cancelled: 'Отменён',
  disputed: 'Спор',
}

export const ORDER_STATUS_COLORS: Record<string, { 
  badge: string
  border: string
  bg: string 
}> = {
  pending: { 
    badge: 'bg-yellow-100 text-yellow-800', 
    border: 'border-yellow-300',
    bg: 'bg-yellow-50'
  },
  paid: { 
    badge: 'bg-green-100 text-green-800', 
    border: 'border-green-300',
    bg: 'bg-green-50'
  },
  in_progress: { 
    badge: 'bg-blue-100 text-blue-800', 
    border: 'border-blue-300',
    bg: 'bg-blue-50'
  },
  completed: { 
    badge: 'bg-gray-100 text-gray-800', 
    border: 'border-gray-300',
    bg: 'bg-gray-50'
  },
  cancelled: { 
    badge: 'bg-red-100 text-red-800', 
    border: 'border-red-300',
    bg: 'bg-red-50'
  },
  disputed: { 
    badge: 'bg-orange-100 text-orange-800', 
    border: 'border-orange-300',
    bg: 'bg-orange-50'
  },
}

// Валидные переходы статусов (FSM)
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled', 'in_progress'], // MVP: можно начать работу без оплаты
  paid: ['in_progress', 'cancelled', 'disputed'],
  in_progress: ['completed', 'disputed', 'cancelled'],
  completed: [], // финальный статус
  cancelled: [], // финальный статус
  disputed: ['completed', 'cancelled'], // после разрешения спора
}

