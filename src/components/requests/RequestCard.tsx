/**
 * Карточка заявки для списка
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RequestStatusBadge } from './RequestStatusBadge'
import { Calendar, MessageSquare, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface RequestCardProps {
  id: string
  title: string
  category: string
  budget: number | null
  proposalsCount: number
  status: string
  createdAt: string | Date
  categoryEmoji?: string
  categoryName?: string
}


export function RequestCard({
  id,
  title,
  category,
  budget,
  proposalsCount,
  status,
  createdAt,
  categoryEmoji,
  categoryName
}: RequestCardProps) {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const formattedDate = format(date, 'd MMMM yyyy', { locale: ru })

  return (
    <Link href={`/requests/${id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-semibold line-clamp-2 flex-1 min-w-0">
              {title}
            </CardTitle>
            <RequestStatusBadge status={status} className="flex-shrink-0" />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {categoryEmoji && <span className="text-base">{categoryEmoji}</span>}
            <span>{categoryName || category}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-sm pt-2 flex-wrap">
            {budget ? (
              <div className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{budget} баллов</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span>Бюджет не указан</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className={proposalsCount > 0 ? 'font-medium text-primary' : 'text-muted-foreground'}>
                {proposalsCount} {proposalsCount === 1 ? 'отклик' : proposalsCount < 5 ? 'отклика' : 'откликов'}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-full">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">Создано {formattedDate}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

