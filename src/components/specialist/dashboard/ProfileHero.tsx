/**
 * Hero-секция профиля для dashboard
 * Отображает аватар, имя, статусы и кнопку редактирования
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, CheckCircle2, Eye, EyeOff, User, Building2, Stethoscope } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { ProfileVisibilityModal } from './ProfileVisibilityModal'

interface ProfileHeroProps {
  // Базовые данные
  firstName: string
  lastName: string
  avatar?: string | null
  hasSpecialistProfile: boolean
  
  // Для специалистов/компаний
  specialistProfile?: {
    slug: string
    verified: boolean
    acceptingClients: boolean
    isVisible: boolean // вычисляется на сервере
    profileType?: 'specialist' | 'company'
    companyName?: string | null
    visibilityCriteria?: {
      notBlocked: boolean
      acceptingClients: boolean
      verified: boolean
      hasPositiveBalance: boolean
      balance: number
    }
  }
}

export function ProfileHero({
  firstName,
  lastName,
  avatar,
  hasSpecialistProfile,
  specialistProfile,
}: ProfileHeroProps) {
  const router = useRouter()
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)
  
  // Определяем тип профиля и отображаемое имя
  const profileType = specialistProfile?.profileType || 'specialist'
  const isCompany = profileType === 'company'
  const displayName = isCompany && specialistProfile?.companyName
    ? specialistProfile.companyName
    : `${firstName} ${lastName}`.trim()
  
  // Инициалы для аватара
  const initials = isCompany && specialistProfile?.companyName
    ? specialistProfile.companyName.substring(0, 2).toUpperCase()
    : `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Аватар */}
          <div className="flex-shrink-0">
            {hasSpecialistProfile && specialistProfile ? (
              <Avatar
                src={avatar || undefined}
                alt={displayName}
                size={80}
                verified={specialistProfile.verified}
                fallback={initials}
                className="sm:size-24"
              />
            ) : (
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg sm:h-24 sm:w-24">
                  {initials}
                </div>
              </div>
            )}
          </div>

          {/* Информация */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            {/* Имя/Название компании */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {displayName}
            </h1>

            {/* Статусы для специалистов/компаний */}
            {hasSpecialistProfile && specialistProfile && (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start mb-3">
                {/* Тип профиля */}
                <Badge 
                  variant={isCompany ? "default" : "secondary"} 
                  className={`flex items-center gap-1 ${isCompany ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}
                >
                  {isCompany ? (
                    <>
                      <Building2 className="h-3 w-3" />
                      <span>Компания</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-3 w-3" />
                      <span>Специалист</span>
                    </>
                  )}
                </Badge>

                {/* Верификация */}
                {specialistProfile.verified ? (
                  <Badge variant="verified" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Верифицирован</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>Не верифицирован</span>
                  </Badge>
                )}

                {/* Видимость профиля */}
                {specialistProfile.isVisible ? (
                  <Badge
                    variant="success"
                    className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setIsVisibilityModalOpen(true)}
                  >
                    <Eye className="h-3 w-3" />
                    <span>Профиль виден</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setIsVisibilityModalOpen(true)}
                  >
                    <EyeOff className="h-3 w-3" />
                    <span>Профиль не виден</span>
                  </Badge>
                )}
              </div>
            )}

            {/* Роль для обычных пользователей */}
            {!hasSpecialistProfile && (
              <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto sm:mx-0 mb-3">
                <User className="h-3 w-3" />
                <span>Пользователь</span>
              </Badge>
            )}

            {/* Кнопка редактирования */}
            {hasSpecialistProfile && specialistProfile ? (
              <Link href={`/specialist/${specialistProfile.slug}?edit=true`}>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full sm:w-auto gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Редактировать профиль</span>
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto gap-2"
                >
                  <span>Зарегистрироваться</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Модальное окно видимости профиля */}
      {hasSpecialistProfile && specialistProfile?.visibilityCriteria && (
        <ProfileVisibilityModal
          isOpen={isVisibilityModalOpen}
          onClose={() => setIsVisibilityModalOpen(false)}
          criteria={specialistProfile.visibilityCriteria}
          onCriteriaUpdate={() => router.refresh()}
        />
      )}
    </Card>
  )
}

