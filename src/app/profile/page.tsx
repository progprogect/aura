/**
 * Личный кабинет пользователя
 */

import { redirect } from 'next/navigation'
import { getUnifiedUserFromSession } from '@/lib/auth/unified-auth-service'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Phone, Mail, Calendar, Stethoscope, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'

async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    if (!sessionToken) {
      return null
    }

    const user = await getUnifiedUserFromSession(sessionToken)
    return user
  } catch (error) {
    console.error('Ошибка получения пользователя:', error)
    return null
  }
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  // Если не авторизован → на страницу входа
  if (!user) {
    redirect('/auth/login')
  }

  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                👋 Привет, {user.firstName}!
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Добро пожаловать в ваш личный кабинет
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {user.hasSpecialistProfile ? (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Stethoscope className="h-3 w-3" />
                  <span>Специалист</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>Пользователь</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Личная информация</span>
                </CardTitle>
                <CardDescription>
                  Ваши основные данные
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Имя</label>
                    <p className="text-lg font-semibold text-gray-900">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Фамилия</label>
                    <p className="text-lg font-semibold text-gray-900">{user.lastName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>Телефон</span>
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{user.phone}</p>
                </div>
                
                {user.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </label>
                    <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Аватар */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={fullName}
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
                    <p className="text-sm text-gray-500">
                      {user.hasSpecialistProfile ? 'Специалист' : 'Пользователь'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Действия */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Действия</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.hasSpecialistProfile ? (
                  <>
                    <Link href="/specialist/dashboard" className="block">
                      <Button className="w-full" variant="default">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Панель специалиста
                      </Button>
                    </Link>
                    <Link href="/specialist/profile/edit" className="block">
                      <Button className="w-full" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Настройки профиля
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/api/auth/user/become-specialist" className="block">
                    <Button className="w-full" variant="default">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Стать специалистом
                    </Button>
                  </Link>
                )}
                
                <form action="/api/auth/logout" method="POST" className="block">
                  <Button type="submit" className="w-full" variant="outline">
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Активность</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Регистрация</span>
                    <span className="text-sm font-medium">
                      {new Date().toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Тип аккаунта</span>
                    <span className="text-sm font-medium">
                      {user.hasSpecialistProfile ? 'Специалист' : 'Пользователь'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
