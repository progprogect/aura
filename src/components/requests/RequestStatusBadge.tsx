/**
 * Переиспользуемый компонент для отображения статуса заявки
 * Унифицирует стили статусов во всём проекте
 */

import { Badge } from '@/components/ui/badge'

export type RequestStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  open: {
    label: 'Открыта',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
  in_progress: {
    label: 'В работе',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  completed: {
    label: 'Завершена',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  cancelled: {
    label: 'Отменена',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
}

interface RequestStatusBadgeProps {
  status: string
  className?: string
}

/**
 * Компонент статуса заявки
 * 
 * @example
 * <RequestStatusBadge status="open" />
 */
export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  const config = STATUS_CONFIG[status as RequestStatus] || {
    label: status,
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  }

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className || ''}`.trim()}
    >
      {config.label}
    </Badge>
  )
}

