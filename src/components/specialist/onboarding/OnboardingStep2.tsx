/**
 * Шаг 2 онбординга: Описание и Специализации
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

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

  const handleAddSpecialization = () => {
    const trimmed = newSpecialization.trim()
    if (trimmed && !data.specializations.includes(trimmed)) {
      onChange('specializations', [...data.specializations, trimmed])
      setNewSpecialization('')
    }
  }

  const handleRemoveSpecialization = (spec: string) => {
    onChange('specializations', data.specializations.filter(s => s !== spec))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSpecialization()
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
        <Label htmlFor="specializations">
          Специализации <span className="text-red-500">*</span>
        </Label>
        
        {/* Существующие специализации */}
        {data.specializations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.specializations.map((spec) => (
              <Badge
                key={spec}
                variant="secondary"
                className="px-3 py-1.5 text-sm flex items-center gap-2"
              >
                {spec}
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialization(spec)}
                  className="hover:text-red-500 transition-colors"
                  aria-label={`Удалить ${spec}`}
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Добавление новой специализации */}
        {data.specializations.length < 5 && (
          <div className="flex gap-2">
            <Input
              id="specializations"
              type="text"
              placeholder="Например: КПТ-терапия, Работа с тревогой..."
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 text-base flex-1"
            />
            <button
              type="button"
              onClick={handleAddSpecialization}
              disabled={!newSpecialization.trim()}
              className="
                px-4 h-12 rounded-md bg-blue-600 text-white font-medium
                hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              Добавить
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          {errors?.specializations ? (
            <p className="text-sm text-red-500">{errors.specializations}</p>
          ) : (
            <p className="text-xs text-gray-500">
              Добавьте от 1 до 5 специализаций. Нажмите Enter или кнопку &quot;Добавить&quot;.
            </p>
          )}
          <span className={`text-xs ${data.specializations.length === 0 ? 'text-red-500' : 'text-gray-400'}`}>
            {data.specializations.length}/5
          </span>
        </div>
      </div>
    </motion.div>
  )
}

