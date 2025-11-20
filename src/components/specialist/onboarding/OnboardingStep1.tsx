/**
 * Шаг 1 онбординга: Имя, Фамилия и Категория
 */

'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useCategories } from '@/hooks/useCategories'

interface OnboardingStep1Props {
  data: {
    firstName: string
    lastName: string
    companyName?: string // Для компаний
    category: string
  }
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
  isCompany?: boolean
}

export function OnboardingStep1({ data, onChange, errors, isCompany = false }: OnboardingStep1Props) {
  const { categories, loading } = useCategories()

  // Формируем массив категорий для отображения
  const displayCategories = categories.map((cat) => ({
    id: cat.key,
    name: cat.name,
    emoji: cat.emoji,
    description: getCategoryDescription(cat.key),
  }))

  // Функция для получения описания категории
  function getCategoryDescription(key: string): string {
    const descriptions: Record<string, string> = {
      psychology: 'Психологи, психотерапевты',
      fitness: 'Тренеры, инструкторы',
      nutrition: 'Нутрициологи, диетологи',
      massage: 'Массажисты, остеопаты',
      wellness: 'Wellness-коучи',
      coaching: 'Лайф-коучи, бизнес-коучи',
      medicine: 'Врачи, специалисты',
      marketing: 'Маркетологи, специалисты по продвижению',
      sales: 'Специалисты по продажам и переговорам',
      education: 'Преподаватели, тренеры',
      'social-media': 'SMM-специалисты, эксперты по личному бренду',
      'business-consulting': 'Бизнес-консультанты',
      other: 'Другие направления',
    }
    return descriptions[key] || 'Специалисты'
  }
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isCompany ? 'О вашей компании' : 'Кто вы?'}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {isCompany ? 'Расскажите о вашей компании' : 'Расскажите немного о себе'}
        </p>
      </div>

      {/* Имя и Фамилия / Название компании */}
      {isCompany ? (
        <div className="space-y-2">
          <Label htmlFor="companyName">
            Название компании <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            type="text"
            placeholder="ООО 'Название компании'"
            value={data.companyName || ''}
            onChange={(e) => onChange('companyName', e.target.value)}
            className={`h-12 text-base ${errors?.companyName ? 'border-red-500' : ''}`}
            autoFocus
          />
          {errors?.companyName && (
            <p className="text-sm text-red-500">{errors.companyName}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Имя */}
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Имя <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Александр"
              value={data.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              className={`h-12 text-base ${errors?.firstName ? 'border-red-500' : ''}`}
              autoFocus
            />
            {errors?.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          {/* Фамилия */}
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Фамилия <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Морозов"
              value={data.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              className={`h-12 text-base ${errors?.lastName ? 'border-red-500' : ''}`}
            />
            {errors?.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>
      )}

      {/* Имя и Фамилия для компаний (контактное лицо) */}
      {isCompany && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Имя контактного лица <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Александр"
              value={data.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              className={`h-12 text-base ${errors?.firstName ? 'border-red-500' : ''}`}
            />
            {errors?.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Фамилия контактного лица <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Морозов"
              value={data.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              className={`h-12 text-base ${errors?.lastName ? 'border-red-500' : ''}`}
            />
            {errors?.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>
      )}

      {/* Категория */}
      <div className="space-y-3">
        <Label>
          Выберите категорию <span className="text-red-500">*</span>
        </Label>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Загрузка категорий...
          </div>
        ) : (
          <>
            {/* Десктоп: Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {displayCategories.map((category) => (
            <Card
              key={category.id}
              onClick={() => onChange('category', category.id)}
              className={`
                cursor-pointer transition-all duration-200 hover:shadow-md
                ${data.category === category.id 
                  ? 'ring-2 ring-blue-600 bg-blue-50 border-blue-600' 
                  : 'hover:border-gray-400'
                }
              `}
            >
              <div className="p-4 text-center">
                <div className="text-3xl mb-2">{category.emoji}</div>
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {category.name}
                </div>
                <div className="text-xs text-gray-500">
                  {category.description}
                </div>
              </div>
            </Card>
          ))}
        </div>

            {/* Мобильный: Вертикальный список */}
            <div className="md:hidden space-y-2">
              {displayCategories.map((category) => (
            <Card
              key={category.id}
              onClick={() => onChange('category', category.id)}
              className={`
                cursor-pointer transition-all duration-200
                ${data.category === category.id 
                  ? 'ring-2 ring-blue-600 bg-blue-50 border-blue-600' 
                  : 'active:bg-gray-50'
                }
              `}
            >
              <div className="p-4 flex items-center gap-4">
                <div className="text-3xl">{category.emoji}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.description}
                  </div>
                </div>
                {data.category === category.id && (
                  <div className="text-blue-600">✓</div>
                )}
                </div>
              </Card>
            ))}
            </div>
          </>
        )}

        {errors?.category && (
          <p className="text-sm text-red-500">{errors.category}</p>
        )}
      </div>
    </motion.div>
  )
}

