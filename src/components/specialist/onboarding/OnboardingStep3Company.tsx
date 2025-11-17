/**
 * Шаг 3 онбординга для компаний: Контакты, адрес и реквизиты
 */

'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { AddressInput } from './AddressInput'

interface OnboardingStep3CompanyProps {
  data: {
    phone: string
    email: string
    address: string
    addressCoordinates?: { lat: number; lng: number } | null
    taxId: string
    website: string
    country: string
    workFormats: string[]
  }
  onChange: (field: string, value: string | string[] | { lat: number; lng: number } | undefined) => void
  errors?: Record<string, string>
}

const WORK_FORMATS = [
  { id: 'online', name: 'Онлайн', emoji: '💻', description: 'Консультации через видеосвязь' },
  { id: 'offline', name: 'Офлайн', emoji: '🏢', description: 'Личные встречи в офисе' },
  { id: 'hybrid', name: 'Гибрид', emoji: '🔄', description: 'Онлайн и офлайн' },
]

export function OnboardingStep3Company({ data, onChange, errors }: OnboardingStep3CompanyProps) {
  const toggleWorkFormat = (formatId: string) => {
    const currentFormats = data.workFormats
    if (currentFormats.includes(formatId)) {
      // Убираем формат (но минимум 1 должен остаться)
      if (currentFormats.length > 1) {
        onChange('workFormats', currentFormats.filter(f => f !== formatId))
      }
    } else {
      // Добавляем формат
      onChange('workFormats', [...currentFormats, formatId])
    }
  }

  const handleAddressChange = (address: string, coordinates?: { lat: number; lng: number }) => {
    onChange('address', address)
    onChange('addressCoordinates', coordinates)
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
          Контакты и адрес компании
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Как с вами связаться и где находится ваша компания
        </p>
      </div>

      {/* Телефон */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Телефон <span className="text-red-500">*</span>
        </Label>
        <PhoneInput
          id="phone"
          value={data.phone}
          onChange={(value) => onChange('phone', value)}
          disabled
          className="h-12 text-base bg-gray-50"
        />
        <p className="text-xs text-gray-500">
          ✓ Номер уже подтверждён при регистрации
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={`h-12 text-base ${errors?.email ? 'border-red-500' : ''}`}
          required
        />
        {errors?.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
        <p className="text-xs text-gray-500">
          Для связи с клиентами и уведомлений
        </p>
      </div>

      {/* Адрес */}
      <div className="space-y-2">
        <AddressInput
          value={data.address}
          coordinates={data.addressCoordinates}
          onChange={handleAddressChange}
          error={errors?.address}
        />
      </div>

      {/* УНП/ИНН */}
      <div className="space-y-2">
        <Label htmlFor="taxId">
          УНП/ИНН <span className="text-red-500">*</span>
        </Label>
        <Input
          id="taxId"
          type="text"
          placeholder="123456789"
          value={data.taxId}
          onChange={(e) => onChange('taxId', e.target.value)}
          className={`h-12 text-base ${errors?.taxId ? 'border-red-500' : ''}`}
          required
        />
        {errors?.taxId && (
          <p className="text-sm text-red-500">{errors.taxId}</p>
        )}
        <p className="text-xs text-gray-500">
          Укажите налоговый номер компании
        </p>
      </div>

      {/* Сайт */}
      <div className="space-y-2">
        <Label htmlFor="website">
          Сайт
          <span className="text-gray-500 text-xs ml-2">(опционально)</span>
        </Label>
        <Input
          id="website"
          type="url"
          placeholder="https://example.com"
          value={data.website}
          onChange={(e) => onChange('website', e.target.value)}
          className={`h-12 text-base ${errors?.website ? 'border-red-500' : ''}`}
        />
        {errors?.website && (
          <p className="text-sm text-red-500">{errors.website}</p>
        )}
        <p className="text-xs text-gray-500">
          Ссылка на официальный сайт компании
        </p>
      </div>

      {/* Формат работы */}
      <div className="space-y-3">
        <Label>
          Формат работы <span className="text-red-500">*</span>
        </Label>
        
        {/* Десктоп: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-3">
          {WORK_FORMATS.map((format) => {
            const isSelected = data.workFormats.includes(format.id)
            
            return (
              <div
                key={format.id}
                onClick={() => toggleWorkFormat(format.id)}
                className={`
                  cursor-pointer rounded-lg border-2 p-4 text-center
                  transition-all duration-200 hover:shadow-md
                  ${isSelected 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-400'
                  }
                `}
              >
                <div className="text-3xl mb-2">{format.emoji}</div>
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {format.name}
                </div>
                <div className="text-xs text-gray-500">
                  {format.description}
                </div>
                {isSelected && (
                  <div className="mt-2 text-blue-600 text-sm font-medium">✓ Выбрано</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Мобильный: Вертикальный список */}
        <div className="md:hidden space-y-2">
          {WORK_FORMATS.map((format) => {
            const isSelected = data.workFormats.includes(format.id)
            
            return (
              <div
                key={format.id}
                onClick={() => toggleWorkFormat(format.id)}
                className={`
                  cursor-pointer rounded-lg border-2 p-4 flex items-center gap-4
                  transition-all duration-200 active:bg-gray-50
                  ${isSelected 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200'
                  }
                `}
              >
                <div className="text-3xl">{format.emoji}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {format.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="text-blue-600 text-lg">✓</div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-gray-500">
          Выберите один или несколько форматов работы
        </p>
      </div>
    </motion.div>
  )
}

