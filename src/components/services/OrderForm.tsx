/**
 * Форма заказа услуги клиентом
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@/hooks/useUser'

interface OrderFormProps {
  serviceId: string
  serviceName: string
  specialistName: string
  servicePrice: number
}

export function OrderForm({ serviceId, serviceName, specialistName, servicePrice }: OrderFormProps) {
  const { user } = useUser()
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientContact: '',
    clientMessage: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userBalance, setUserBalance] = useState<{ total: number; balance: number; bonusBalance: number } | null>(null)
  // Услуги всегда оплачиваются баллами
  const orderMode = 'paid' as const

  // Загружаем баланс пользователя
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/user/balance')
        if (response.ok) {
          const data = await response.json()
          setUserBalance(data)
        }
      } catch (error) {
        console.error('Ошибка загрузки баланса:', error)
      }
    }

    if (user) {
      fetchBalance()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Проверяем авторизацию для оплаты баллами
    if (orderMode === 'paid' && !user) {
      // Сохраняем URL текущей страницы для redirect после авторизации
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('orderRedirectUrl', window.location.pathname)
      }
      setError('Для заказа услуги необходимо войти в систему. У вас будут бонусные баллы для первой покупки!')
      return
    }

    if (!formData.clientName.trim()) {
      setError('Укажите ваше имя')
      return
    }

    if (!formData.clientContact.trim()) {
      setError('Укажите телефон для связи')
      return
    }

    // Проверяем баланс для оплаты баллами
    if (orderMode === 'paid' && userBalance && userBalance.total < servicePrice) {
      setError(`Недостаточно баллов. Нужно: ${servicePrice}, доступно: ${userBalance.total}`)
      return
    }

    setIsSubmitting(true)

    try {
      // Услуги всегда оплачиваются баллами
      const endpoint = '/api/orders/create-with-points'
      const body = {
        serviceId,
        clientName: formData.clientName,
        clientContact: formData.clientContact,
        clientMessage: formData.clientMessage || null,
        pointsUsed: Math.round(servicePrice) // Убеждаемся что передаем целое число
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({
          clientName: '',
          clientContact: '',
          clientMessage: '',
        })
        
        // Обновляем баланс после покупки
        const fetchBalance = async () => {
          try {
            const balanceResponse = await fetch('/api/user/balance')
            if (balanceResponse.ok) {
              const balanceData = await balanceResponse.json()
              setUserBalance(balanceData)
            }
          } catch (error) {
            console.error('Ошибка обновления баланса:', error)
          }
        }
        fetchBalance()
      } else {
        if (data.code === 'INSUFFICIENT_POINTS') {
          setError(`Недостаточно баллов. Нужно: ${data.required}, доступно: ${data.available}`)
        } else {
          setError(data.error || 'Ошибка отправки заказа')
        }
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setError('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Заказ оплачен!
          </h3>
          <p className="text-gray-600 mb-6">
            Заказ оплачен за {servicePrice} баллов! Баллы заморожены на 7 дней.
          </p>
          <Button
            onClick={() => setSuccess(false)}
            variant="outline"
            className="w-full"
          >
            Оформить ещё заказ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📋 Оформить заказ
      </h3>

      {/* Информация о заказе */}
      <div className="mb-6">
        {user && userBalance ? (
          /* Информация для авторизованных пользователей */
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Стоимость:</span>
              <span className="font-semibold text-green-800">{servicePrice} баллов</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-green-700">Ваш баланс:</span>
              <span className="font-semibold text-green-800">{userBalance.total} баллов</span>
            </div>
            {userBalance.total < servicePrice && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Недостаточно баллов. <a href="/points" className="underline">Купить баллы</a>
              </p>
            )}
            {userBalance.total >= servicePrice && (
              <p className="text-xs text-green-600 mt-2">
                💰 Баллы будут заморожены на 7 дней до выполнения услуги
              </p>
            )}
          </div>
        ) : (
          /* Информация для неавторизованных */
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">💎 Заказ за баллы</h4>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-blue-700">Стоимость:</span>
              <span className="font-semibold text-blue-800">{servicePrice} баллов</span>
            </div>
            <p className="text-xs text-blue-600 mb-3">
              🎁 После регистрации вы получите бонусные баллы для первой покупки!
            </p>
            <div className="flex gap-2">
              <a 
                href="/auth/login"
                className="flex-1 text-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Войти
              </a>
              <a 
                href="/auth/user/register"
                className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Регистрация
              </a>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <Label htmlFor="clientName">Ваше имя *</Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            placeholder="Иван"
            required
            maxLength={100}
          />
        </div>

        {/* Contact */}
        <div>
          <Label htmlFor="clientContact">Телефон *</Label>
          <Input
            id="clientContact"
            value={formData.clientContact}
            onChange={(e) => setFormData(prev => ({ ...prev, clientContact: e.target.value }))}
            placeholder="+375 29 123 45 67"
            required
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            Специалист свяжется с вами по этому номеру
          </p>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="clientMessage">Сообщение (опционально)</Label>
          <textarea
            id="clientMessage"
            value={formData.clientMessage}
            onChange={(e) => setFormData(prev => ({ ...prev, clientMessage: e.target.value }))}
            placeholder="Расскажите о вашем запросе, удобном времени для связи..."
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.clientMessage.length}/500
          </p>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg text-sm bg-green-50 text-green-800">
          <p className="font-medium mb-1">💰 Оплаченный заказ</p>
          <p className="text-xs">
            Баллы заморожены на 7 дней. После выполнения услуги специалист получит оплату.
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isSubmitting || (userBalance ? userBalance.total < servicePrice : false)}
        >
          {isSubmitting ? 'Обработка...' : `Оплатить ${servicePrice} баллов`}
        </Button>
      </form>
    </div>
  )
}

