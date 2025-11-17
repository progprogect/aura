/**
 * Компонент выбора типа профиля при регистрации
 * Позволяет выбрать между "Специалист" и "Компания"
 */

'use client'

import { motion } from 'framer-motion'
import { User, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type ProfileType = 'specialist' | 'company'

interface ProfileTypeSelectorProps {
  selectedType: ProfileType | null
  onSelect: (type: ProfileType) => void
  className?: string
}

export function ProfileTypeSelector({
  selectedType,
  onSelect,
  className,
}: ProfileTypeSelectorProps) {
  const options: Array<{
    type: ProfileType
    title: string
    description: string
    icon: typeof User
    emoji: string
  }> = [
    {
      type: 'specialist',
      title: 'Я специалист',
      description: 'Индивидуальный эксперт, фрилансер',
      icon: User,
      emoji: '👤',
    },
    {
      type: 'company',
      title: 'Я компания',
      description: 'Организация, центр, студия',
      icon: Building2,
      emoji: '🏢',
    },
  ]

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Выберите тип профиля
        </h2>
        <p className="text-gray-600 text-sm">
          Это поможет нам настроить ваш профиль
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = selectedType === option.type

          return (
            <motion.div
              key={option.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 h-full',
                  isSelected
                    ? 'border-2 border-blue-600 bg-blue-50 shadow-md'
                    : 'border-2 border-gray-200 hover:border-gray-400 hover:shadow-sm'
                )}
                onClick={() => onSelect(option.type)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Иконка */}
                    <div
                      className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-colors',
                        isSelected
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      )}
                    >
                      {option.emoji}
                    </div>

                    {/* Заголовок */}
                    <div className="space-y-2">
                      <h3
                        className={cn(
                          'text-lg font-semibold',
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        )}
                      >
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>

                    {/* Индикатор выбора */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center"
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

