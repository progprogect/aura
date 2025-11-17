/**
 * Wizard для онбординга специалиста
 * Управляет переходами между шагами и валидацией
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { OnboardingProgress } from './OnboardingProgress'
import { OnboardingStep1 } from './OnboardingStep1'
import { OnboardingStep2 } from './OnboardingStep2'
import { OnboardingStep3 } from './OnboardingStep3'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface OnboardingWizardProps {
  initialPhone: string
}

export function OnboardingWizard({ initialPhone }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Состояние формы
  const [formData, setFormData] = useState({
    // Шаг 1
    firstName: '',
    lastName: '',
    category: '',
    
    // Шаг 2
    tagline: '',
    about: '',
    specializations: [] as string[],
    
    // Шаг 3
    phone: initialPhone,
    email: '',
    city: '',
    country: 'Россия',
    workFormats: ['online'] as string[],
  })

  const totalSteps = 3

  // Обновление поля
  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Валидация текущего шага
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Введите имя'
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = 'Имя должно содержать минимум 2 символа'
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Введите фамилию'
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = 'Фамилия должна содержать минимум 2 символа'
      }

      if (!formData.category) {
        newErrors.category = 'Выберите категорию'
      }
    }

    if (step === 2) {
      if (!formData.about.trim()) {
        newErrors.about = 'Напишите описание'
      } else if (formData.about.trim().length < 50) {
        newErrors.about = 'Описание должно содержать минимум 50 символов'
      }

      if (formData.specializations.length === 0) {
        newErrors.specializations = 'Добавьте хотя бы одну специализацию'
      }
    }

    if (step === 3) {
      if (!formData.email || !formData.email.trim()) {
        newErrors.email = 'Введите email'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Некорректный email'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Следующий шаг
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  // Предыдущий шаг
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Отправка формы
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/specialist/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        // Показываем успех на 2 секунды
        setCurrentStep(4) // "Успех" экран
        
        setTimeout(() => {
          router.push('/profile')
        }, 2000)
      } else {
        // Обрабатываем ошибки валидации с сервера
        if (data.details) {
          const serverErrors: Record<string, string> = {}
          data.details.forEach((error: any) => {
            const field = error.path[0]
            serverErrors[field] = error.message
          })
          setErrors(serverErrors)
        } else {
          setErrors({ general: data.error || 'Ошибка при создании профиля' })
        }
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setErrors({ general: 'Произошла ошибка. Попробуйте позже.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Прогресс */}
        {currentStep <= 3 && (
          <div className="mb-8">
            <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        )}

        {/* Контент */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <OnboardingStep1
                key="step1"
                data={formData}
                onChange={handleChange}
                errors={errors}
              />
            )}
            
            {currentStep === 2 && (
              <OnboardingStep2
                key="step2"
                data={formData}
                onChange={handleChange}
                errors={errors}
              />
            )}
            
            {currentStep === 3 && (
              <OnboardingStep3
                key="step3"
                data={formData}
                onChange={handleChange}
                errors={errors}
              />
            )}

            {currentStep === 4 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Профиль создан!
                </h2>
                <p className="text-gray-600">
                  Перенаправляем вас в личный кабинет...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Общая ошибка */}
          {errors.general && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
        </div>

        {/* Навигация */}
        {currentStep <= 3 && (
          <div className="flex items-center justify-between gap-4">
            {/* Кнопка "Назад" */}
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                <span className="hidden md:inline">Назад</span>
              </Button>
            ) : (
              <div />
            )}

            {/* Кнопка "Далее" / "Создать профиль" */}
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 ml-auto"
              >
                <span>Далее</span>
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 ml-auto bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Создаём...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Создать профиль</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Мобильная навигация (sticky bottom) */}
        {currentStep <= 3 && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between gap-4 z-50">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                size="lg"
                className="flex-1"
              >
                <ChevronLeft size={20} />
              </Button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={loading}
                size="lg"
                className="flex-1"
              >
                Далее
                <ChevronRight size={20} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Создаём...' : 'Создать'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

