/**
 * Карточка отклика специалиста
 */

'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Wallet, Calendar, Check } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'

interface ProposalCardProps {
  id: string
  message: string
  proposedPrice: number
  createdAt: string | Date
  status: string
  specialist: {
    id: string
    slug: string
    user: {
      firstName: string
      lastName: string
      avatar: string | null
    }
    verified: boolean
  }
  isOwner?: boolean
  onAccept?: () => void
  accepting?: boolean
}

export function ProposalCard({
  id,
  message,
  proposedPrice,
  createdAt,
  status,
  specialist,
  isOwner = false,
  onAccept,
  accepting = false
}: ProposalCardProps) {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const formattedDate = format(date, 'd MMMM yyyy, HH:mm', { locale: ru })
  
  const initials = `${specialist.user.firstName[0]}${specialist.user.lastName[0]}`.toUpperCase()

  return (
    <Card className={status === 'accepted' ? 'border-primary bg-primary/5' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar 
              src={specialist.user.avatar || undefined} 
              alt={`${specialist.user.firstName} ${specialist.user.lastName}`}
              fallback={initials}
              size={40}
              className="flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link 
                  href={`/specialists/${specialist.slug}`}
                  className="font-semibold hover:underline truncate"
                >
                  {specialist.user.firstName} {specialist.user.lastName}
                </Link>
                {specialist.verified && (
                  <Badge variant="verified" className="text-xs flex-shrink-0">
                    Проверен
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {status === 'accepted' && (
              <Badge className="bg-green-100 text-green-700 border-green-300">
                <Check className="h-3 w-3 mr-1" />
                Принят
              </Badge>
            )}
            {status === 'rejected' && (
              <Badge variant="outline" className="text-muted-foreground">
                Отклонён
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t">
          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <Wallet className="h-4 w-4" />
            <span>{proposedPrice} баллов</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {isOwner && status === 'pending' && onAccept && (
          <Button 
            onClick={onAccept}
            disabled={accepting}
            className="w-full mt-2"
            size="lg"
          >
            {accepting ? 'Принимаем...' : 'Принять отклик'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

