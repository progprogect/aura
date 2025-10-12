/**
 * Типы для системы услуг и заказов
 */

export interface Service {
  id: string
  specialistProfileId: string
  title: string
  description: string
  slug: string
  highlights: string[]
  price: number
  currency: string
  deliveryDays: number | null
  emoji: string
  order: number
  isActive: boolean
  viewCount: number
  orderCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  serviceId: string
  service?: Service
  specialistProfileId: string
  clientName: string
  clientContact: string
  clientMessage: string | null
  status: OrderStatus
  amountPaid: number | null
  paymentMethod: string | null
  transactionId: string | null
  escrowReleased: boolean
  deadline: Date | null
  completedAt: Date | null
  disputeReason: string | null
  disputedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 
  | 'pending' 
  | 'paid' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'disputed'

// UI-friendly интерфейсы
export interface ServiceUI extends Service {
  // Дополнительные computed поля для UI
  formattedPrice?: string
  specialistName?: string
}

export interface OrderUI extends Order {
  service?: ServiceUI
  // Дополнительные computed поля
  formattedStatus?: string
  isOverdue?: boolean
}

