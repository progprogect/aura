/**
 * Модальное окно с критериями видимости профиля
 */

'use client'

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ProfileVisibilityModalProps {
  isOpen: boolean
  onClose: () => void
  criteria: {
    notBlocked: boolean
    acceptingClients: boolean
    verified: boolean
    hasPositiveBalance: boolean
    balance: number
  }
}

export function ProfileVisibilityModal({
  isOpen,
  onClose,
  criteria,
}: ProfileVisibilityModalProps) {
  const allMet = criteria.notBlocked && criteria.acceptingClients && criteria.verified && criteria.hasPositiveBalance

  const criteriaList = [
    {
      label: 'Профиль не заблокирован',
      met: criteria.notBlocked,
      description: 'Ваш профиль должен быть активен',
    },
    {
      label: 'Принимаете новых клиентов',
      met: criteria.acceptingClients,
      description: 'Включите опцию "Принимаю клиентов" в настройках профиля',
      action: criteria.acceptingClients ? null : { label: 'Включить', href: '/profile' },
    },
    {
      label: 'Профиль верифицирован',
      met: criteria.verified,
      description: 'Администратор должен подтвердить ваш профиль',
    },
    {
      label: 'Положительный баланс баллов',
      met: criteria.hasPositiveBalance,
      description: `Текущий баланс: ${criteria.balance} баллов. Пополните баланс, чтобы профиль был виден.`,
      action: criteria.hasPositiveBalance ? null : { label: 'Пополнить баланс', href: '/specialist/packages' },
    },
  ]

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Видимость профиля"
    >
      <div className="space-y-4">
        {/* Общий статус */}
        <div className={`p-4 rounded-lg border-2 ${allMet ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-3">
            {allMet ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {allMet ? 'Профиль виден клиентам' : 'Профиль скрыт из каталога'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {allMet
                  ? 'Все критерии выполнены. Ваш профиль отображается в каталоге и поиске.'
                  : 'Для отображения профиля необходимо выполнить все критерии ниже.'}
              </p>
            </div>
          </div>
        </div>

        {/* Список критериев */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Критерии видимости:</h3>
          {criteriaList.map((criterion, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                criterion.met
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {criterion.met ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-medium ${criterion.met ? 'text-green-900' : 'text-red-900'}`}>
                      {criterion.label}
                    </p>
                    <Badge
                      variant={criterion.met ? 'success' : 'destructive'}
                      className="text-xs"
                    >
                      {criterion.met ? 'Выполнено' : 'Не выполнено'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{criterion.description}</p>
                  {criterion.action && (
                    <Link href={criterion.action.href}>
                      <Button size="sm" variant="outline" className="mt-2">
                        {criterion.action.label}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  )
}

