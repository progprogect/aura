/**
 * Шаг 2 онбординга: Описание и Специализации
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { parseSpecializations, canAddSpecialization, MAX_SPECIALIZATIONS } from '@/lib/utils/specializations'

interface OnboardingStep2Props {
  data: {
    tagline: string
    about: string
    specializations: string[]
  }
  onChange: (field: string, value: string | string[]) => void
  errors?: Record<string, string>
}

export function OnboardingStep2({ data, onChange, errors }: OnboardingStep2Props) {
  const [newSpecialization, setNewSpecialization] = useState('')

  // Обработка добавления специализаций (поддержка запятых и одиночных значений)
  const handleAddSpecializations = () => {
    if (!newSpecialization.trim()) return

    const parsed = parseSpecializations(newSpecialization, data.specializations)
    
    if (parsed.length > 0) {
      const newList = [...data.specializations, ...parsed].slice(0, MAX_SPECIALIZATIONS)
      onChange('specializations', newList)
      setNewSpecialization('')
    }
  }

  // Обработка потери фокуса - автоматический парсинг запятых
  const handleBlur = () => {
    if (newSpecialization.trim()) {
      handleAddSpecializations()
    }
  }

  const handleRemoveSpecialization = (spec: string) => {
    onChange('specializations', data.specializations.filter(s => s !== spec))
  }

  // Обработка Enter: если есть запятая - парсинг, иначе - добавление одного значения
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSpecializations()
    }
  }

  const aboutLength = data.about.length
  const taglineLength = data.tagline.length

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
          Расскажите о себе
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Опишите ваш подход и специализации
        </p>
      </div>

      {/* Краткий слоган */}
      <div className="space-y-2">
        <Label htmlFor="tagline">
          Краткое описание
          <span className="text-gray-500 text-xs ml-2">(опционально)</span>
        </Label>
        <Input
          id="tagline"
          type="text"
          placeholder="Например: Помогаю справиться с тревогой и стрессом через КПТ"
          value={data.tagline}
          onChange={(e) => onChange('tagline', e.target.value)}
          className="h-12 text-base"
          maxLength={200}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            1-2 предложения, которые лучше всего описывают вас
          </p>
          <span className={`text-xs ${taglineLength > 200 ? 'text-red-500' : 'text-gray-400'}`}>
            {taglineLength}/200
          </span>
        </div>
      </div>

      {/* Подробное описание */}
      <div className="space-y-2">
        <Label htmlFor="about">
          Подробное описание <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="about"
          placeholder="Расскажите о вашем опыте, методах работы, с какими запросами работаете..."
          value={data.about}
          onChange={(e) => onChange('about', e.target.value)}
          className={`
            flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
            ring-offset-background placeholder:text-muted-foreground 
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
            disabled:cursor-not-allowed disabled:opacity-50
            ${errors?.about ? 'border-red-500' : ''}
          `}
          rows={6}
        />
        <div className="flex justify-between items-center">
          {errors?.about ? (
            <p className="text-sm text-red-500">{errors.about}</p>
          ) : (
            <p className="text-xs text-gray-500">
              Минимум 50 символов. Опишите ваш подход и опыт работы.
            </p>
          )}
          <span className={`text-xs ${aboutLength < 50 ? 'text-red-500' : 'text-gray-400'}`}>
            {aboutLength} {aboutLength < 50 && `(минимум 50)`}
          </span>
        </div>
      </div>

      {/* Специализации */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="specializations">
            Специализации <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-gray-600">
            Что вы умеете? Укажите ваши ключевые навыки и методы работы
          </p>
        </div>
        
        {/* Существующие специализации */}
        {data.specializations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.specializations.map((spec) => (
              <Badge
                key={spec}
                variant="secondary"
                className="px-3 py-1.5 text-sm flex items-center gap-2 touch-manipulation"
              >
                {spec}
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialization(spec)}
                  className="hover:text-red-500 transition-colors touch-manipulation"
                  aria-label={`Удалить ${spec}`}
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Добавление новой специализации */}
        {canAddSpecialization(data.specializations.length) && (
          <div className="flex gap-2">
            <Input
              id="specializations"
              type="text"
              placeholder="Например: КПТ-терапия, работа с тревогой, семейная терапия"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              className="h-12 text-base flex-1"
            />
            <Button
              type="button"
              onClick={handleAddSpecializations}
              disabled={!newSpecialization.trim()}
              className="h-12 px-4 md:px-6 shrink-0"
            >
              <Plus size={18} className="md:mr-2" />
              <span className="hidden md:inline">Добавить</span>
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          {errors?.specializations ? (
            <p className="text-sm text-red-500">{errors.specializations}</p>
          ) : (
            <p className="text-xs text-gray-500">
              Можно вводить через запятую или по одной (Enter или кнопка). Добавьте от 1 до {MAX_SPECIALIZATIONS} специализаций.
            </p>
          )}
          <span className={`text-xs font-medium ${data.specializations.length === 0 ? 'text-red-500' : data.specializations.length >= MAX_SPECIALIZATIONS ? 'text-blue-600' : 'text-gray-400'}`}>
            {data.specializations.length}/{MAX_SPECIALIZATIONS}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

