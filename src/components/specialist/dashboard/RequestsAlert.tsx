/**
 * Карточка-алерт с количеством новых заявок
 * Показывается только если newRequestsCount > 0
 */

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bell, Inbox, ArrowRight, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RequestsAlertProps {
  newRequestsCount: number
  specialistSlug?: string // для специалистов
  isSpecialist: boolean
}

export function RequestsAlert({
  newRequestsCount,
  specialistSlug,
  isSpecialist,
}: RequestsAlertProps) {
  // Показываем только если есть новые заявки
  if (newRequestsCount === 0) {
    return null
  }

  const requestsLink = isSpecialist
    ? '/specialist/requests'
    : '/requests' // для пользователей (если будет реализовано)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Левая часть: иконка и информация */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Новые заявки
                  </h3>
                  <Badge variant="destructive" className="text-sm font-bold">
                    {newRequestsCount}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {isSpecialist
                    ? 'У вас есть непрочитанные заявки от клиентов'
                    : 'У вас есть новые заявки'}
                </p>
              </div>
            </div>

            {/* Правая часть: кнопки */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
              <Link href={requestsLink} className="w-full sm:w-auto">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Inbox className="h-4 w-4" />
                  <span>Перейти к заявкам</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {isSpecialist && specialistSlug && (
                <Link href={`/specialist/${specialistSlug}`} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Профиль</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

