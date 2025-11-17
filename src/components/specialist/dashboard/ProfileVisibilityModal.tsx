/**
 * Модальное окно с критериями видимости профиля
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
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
  onCriteriaUpdate?: () => void
}

export function ProfileVisibilityModal({
  isOpen,
  onClose,
  criteria,
  onCriteriaUpdate,
}: ProfileVisibilityModalProps) {
  const router = useRouter()
  const [acceptingClients, setAcceptingClients] = useState(criteria.acceptingClients)
  const [isToggling, setIsToggling] = useState(false)
  const [error, setError] = useState('')

  // Синхронизируем состояние с пропсами при изменении
  useEffect(() => {
    setAcceptingClients(criteria.acceptingClients)
  }, [criteria.acceptingClients])

  const allMet = criteria.notBlocked && acceptingClients && criteria.verified && criteria.hasPositiveBalance

  const handleToggleAcceptingClients = async () => {
    setIsToggling(true)
    setError('')

    try {
      const response = await fetch('/api/specialist/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: 'acceptingClients',
          value: !acceptingClients,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Ошибка при обновлении статуса')
        return
      }

      const result = await response.json()

      if (result.success) {
        setAcceptingClients(!acceptingClients)
        // Обновляем данные на странице
        if (onCriteriaUpdate) {
          onCriteriaUpdate()
        } else {
          router.refresh()
        }
      } else {
        setError(result.error || 'Ошибка при обновлении статуса')
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.')
    } finally {
      setIsToggling(false)
    }
  }

  const criteriaList = [
    {
      label: 'Профиль не заблокирован',
      met: criteria.notBlocked,
      description: 'Ваш профиль должен быть активен',
    },
    {
      label: 'Принимаете новых клиентов',
      met: acceptingClients,
      description: acceptingClients 
        ? 'Вы принимаете новых клиентов' 
        : 'Включите опцию "Принимаю клиентов" в настройках профиля',
      action: acceptingClients 
        ? { label: 'Выключить', onClick: handleToggleAcceptingClients, isToggle: true }
        : { label: 'Включить', onClick: handleToggleAcceptingClients, isToggle: true },
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
                    <>
                      {criterion.action.isToggle ? (
                        <Button 
                          size="sm" 
                          variant={criterion.met ? "outline" : "default"}
                          className="mt-2"
                          onClick={criterion.action.onClick}
                          disabled={isToggling}
                        >
                          {isToggling ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Обновление...
                            </>
                          ) : (
                            criterion.action.label
                          )}
                        </Button>
                      ) : criterion.action.href ? (
                        <Link href={criterion.action.href}>
                          <Button size="sm" variant="outline" className="mt-2">
                            {criterion.action.label}
                          </Button>
                        </Link>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ошибка */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </Dialog>
  )
}

