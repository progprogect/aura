/**
 * Страница для превращения обычного пользователя в специалиста
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stethoscope, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function BecomeSpecialistPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [specialistSlug, setSpecialistSlug] = useState('')
  const router = useRouter()

  const handleBecomeSpecialist = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/user/become-specialist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setSpecialistSlug(data.specialistProfile.slug)
        
        // Редирект в личный кабинет через 3 секунды
        setTimeout(() => {
          window.location.href = '/profile'
        }, 3000)
      } else {
        setError(data.error || 'Произошла ошибка при создании профиля специалиста')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setError('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                🎉 Поздравляем!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Вы успешно стали специалистом
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Профиль специалиста создан. Теперь вы можете заполнить информацию о себе в личном кабинете.
                </AlertDescription>
              </Alert>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Перенаправление в личный кабинет через 3 секунды...
                </p>
                <Button 
                  onClick={() => window.location.href = '/profile'}
                  className="w-full"
                  size="lg"
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Перейти в личный кабинет
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Заголовок */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Stethoscope className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Стать специалистом
          </h2>
          <p className="text-gray-600">
            Создайте свой профиль специалиста и начните помогать людям
          </p>
        </div>

        {/* Основная карточка */}
        <Card>
          <CardHeader>
            <CardTitle>Что вас ждёт?</CardTitle>
            <CardDescription>
              После создания профиля специалиста вы сможете:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <p className="text-sm text-gray-600">
                  Создать подробный профиль с информацией о ваших услугах
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <p className="text-sm text-gray-600">
                  Загрузить портфолио, сертификаты и отзывы клиентов
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <p className="text-sm text-gray-600">
                  Получать заявки от потенциальных клиентов
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <p className="text-sm text-gray-600">
                  Вести статистику и аналитику вашей работы
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleBecomeSpecialist}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Создание профиля...
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Стать специалистом
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <Link href="/profile" className="block">
                <Button variant="outline" className="w-full">
                  Вернуться в профиль
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Дополнительная информация */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Нужна помощь?
              </h3>
              <p className="text-xs text-gray-500">
                Если у вас есть вопросы о создании профиля специалиста, 
                свяжитесь с нашей службой поддержки.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
