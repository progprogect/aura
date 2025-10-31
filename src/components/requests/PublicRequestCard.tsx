/**
 * Карточка заявки для публичного раздела (find-work)
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MessageSquare, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface PublicRequestCardProps {
  id: string
  title: string
  description: string
  category: string
  budget: number | null
  proposalsCount: number
  createdAt: string | Date
  categoryEmoji?: string
  categoryName?: string
  canRespond?: boolean
  onRespond?: () => void
}

export function PublicRequestCard({
  id,
  title,
  description,
  category,
  budget,
  proposalsCount,
  createdAt,
  categoryEmoji,
  categoryName,
  canRespond = false,
  onRespond
}: PublicRequestCardProps) {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const formattedDate = format(date, 'd MMMM yyyy', { locale: ru })
  const truncatedDescription = description.length > 150 
    ? description.substring(0, 150) + '...' 
    : description

  return (
    <Card className="hover:shadow-lg transition-all duration-200 h-full flex flex-col">
      <Link href={`/requests/${id}`} className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold line-clamp-2 min-w-0">
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {categoryEmoji && <span className="text-base">{categoryEmoji}</span>}
            <span className="text-muted-foreground">{categoryName || category}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncatedDescription}
          </p>

          <div className="flex items-center gap-3 sm:gap-4 text-sm pt-3 border-t flex-wrap">
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
              <span className={proposalsCount > 0 ? 'font-medium' : 'text-muted-foreground'}>
                {proposalsCount} {proposalsCount === 1 ? 'отклик' : proposalsCount < 5 ? 'отклика' : 'откликов'}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 mt-auto">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>
            {canRespond && onRespond && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onRespond()
                }}
                className="flex-shrink-0"
              >
                Откликнуться
              </Button>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}

