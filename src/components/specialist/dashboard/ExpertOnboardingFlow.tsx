'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

type ExpertOnboardingFlowProps = {
  initialStep?: number
  initialCompleted?: boolean
  initialSeen?: boolean
  guideHref?: string
  onOpenRequest?: (open: () => void) => void
}

type Step = {
  id: string
  title: string
  ctaLabel: string
  illustration: string
  allowSkip?: boolean
  footnote?: string
  isFinal?: boolean
  secondaryLinkLabel?: string
  content: () => JSX.Element
}

const GUIDE_FALLBACK_URL = '/profile?section=guide'

export function ExpertOnboardingFlow({
  initialStep = 0,
  initialCompleted = false,
  initialSeen = false,
  guideHref = GUIDE_FALLBACK_URL,
  onOpenRequest,
}: ExpertOnboardingFlowProps) {
  const steps = useMemo<Step[]>(
    () => [
      {
        id: 'intro',
        title: 'Эволюция 360 помогает находить клиентов',
        ctaLabel: 'Дальше',
        illustration: '/onboarding/expert-onboarding-step-1.webp',
        allowSkip: true,
        content: () => (
          <div className="space-y-3 text-sm md:text-base text-gray-700">
            <p>
              За пару минут расскажем, как устроена работа на платформе и как вы будете
              зарабатывать.
            </p>
            <p>
              Сначала познакомьтесь с логикой — к заполнению профиля вы сможете вернуться в
              кабинете, когда будете готовы.
            </p>
          </div>
        ),
      },
      {
        id: 'requests',
        title: 'Два способа получать заказы',
        ctaLabel: 'Понятно, дальше',
        illustration: '/onboarding/expert-onboarding-step-2.webp',
        allowSkip: true,
        content: () => (
          <div className="space-y-3 text-sm md:text-base text-gray-700">
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <span>Клиенты находят вас в каталоге и оставляют заявку.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <span>Вы находите запросы на доске заявок и откликаетесь.</span>
              </li>
            </ul>
            <p>Мы уведомим вас в обоих случаях — решайте, с кем работать.</p>
          </div>
        ),
        footnote: 'В среднем первые заявки появляются в течение 2 дней.',
      },
      {
        id: 'points',
        title: 'Баллы — ваш внутренний бюджет',
        ctaLabel: 'Понял, идём дальше',
        illustration: '/onboarding/expert-onboarding-step-3.webp',
        allowSkip: true,
        content: () => (
          <div className="space-y-3 text-sm md:text-base text-gray-700">
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span>На старте у вас 50 бонусных баллов.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span>−10 баллов — когда клиент отправляет вам заявку.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span>−1 балл — когда клиент просматривает ваши контакты.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span>−1 балл — за ваш отклик на заявку на доске.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span>Размещение — 100 баллов в месяц, первые 2 недели бесплатно.</span>
              </li>
            </ul>
          </div>
        ),
        footnote:
          'Так мы снижаем конкуренцию и отсеиваем случайных специалистов и мошенников.',
      },
      {
        id: 'points-usage',
        title: 'Куда потратить бонусные баллы',
        ctaLabel: 'Понятно, дальше',
        illustration: '/onboarding/expert-onboarding-step-3.webp',
        allowSkip: true,
        content: () => (
          <div className="space-y-3 text-sm md:text-base text-gray-700">
            <p className="font-medium">
              При регистрации вы получили 50 бонусных баллов. Они сгорят через 7 дней — используйте их!
            </p>
            <p>Куда можно потратить баллы:</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong>Полезные материалы от экспертов</strong> — гайды, чек-листы, программы от проверенных специалистов
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                <span>
                  <strong>Услуги экспертов и компаний</strong> — консультации, программы, курсы и другие услуги
                </span>
              </li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-amber-900">
                💡 <strong>Важно:</strong> Бонусные баллы сгорают через 7 дней. Используйте их первыми при покупке — система автоматически списывает их в первую очередь.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'payments',
        title: 'Как вы получаете деньги',
        ctaLabel: 'Последний шаг',
        illustration: '/onboarding/expert-onboarding-step-4.webp',
        allowSkip: true,
        content: () => (
          <div className="space-y-3 text-sm md:text-base text-gray-700">
            <p>
              Клиенты платят онлайн — баллы поступают вам, как только заявка выполнена. Ими можно
              пользоваться на платформе или вывести на карту (комиссия 2%).
            </p>
            <p>
              Первые ваши клиенты получают 50 баллов скидки, чтобы познакомиться именно с вами.
              Они могут пройти услугу до 50 баллов бесплатно или получить скидку на более дорогой
              формат.
            </p>
          </div>
        ),
      },
      {
        id: 'next',
        title: 'Что делать дальше',
        ctaLabel: 'Перейти в кабинет',
        illustration: '/onboarding/expert-onboarding-step-5.webp',
        allowSkip: false,
        isFinal: true,
        content: () => (
          <div className="space-y-3 text-sm md:text-base text-gray-700">
            <ol className="list-decimal space-y-2 pl-4">
              <li>Следуйте гайду в кабинете — он уже ждёт в разделе «Мой гайд».</li>
              <li>Когда будете готовы, заполните профиль и опубликуйте услуги.</li>
              <li>Следите за заявками и отвечайте оперативно.</li>
              <li>Контролируйте баланс баллов в кошельке.</li>
            </ol>
          </div>
        ),
      },
    ],
    []
  )

  const [currentStep, setCurrentStep] = useState(() =>
    Math.min(Math.max(initialStep, 0), steps.length - 1)
  )
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  // Показываем автоматически ТОЛЬКО если пользователь никогда не видел онбординг
  // Не зависим от initialCompleted - показываем один раз при первом входе
  const [isOpen, setIsOpen] = useState(!initialSeen)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(initialSeen)

  const stepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const StepContent = stepData.content

  // Предоставляем функцию открытия онбординга извне
  useEffect(() => {
    if (onOpenRequest) {
      onOpenRequest(() => {
        setIsOpen(true)
      })
    }
  }, [onOpenRequest])

  // При первом открытии онбординга устанавливаем флаг "просмотрен"
  // Это нужно сделать сразу при открытии, чтобы даже при закрытии без завершения
  // онбординг больше не показывался автоматически
  useEffect(() => {
    if (isOpen && !hasSeenOnboarding) {
      // Устанавливаем флаг локально сразу
      setHasSeenOnboarding(true)
      // Сохраняем в БД асинхронно (не блокируем UI)
      fetch('/api/specialist/onboarding-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seen: true }),
      }).catch((err) => {
        console.error('Не удалось сохранить флаг просмотра онбординга:', err)
        // Не критично - флаг уже установлен локально
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasSeenOnboarding])

  async function updateProgress(payload: { step?: number; completed?: boolean; seen?: boolean }) {
    try {
      setIsSaving(true)
      setError(null)
      const response = await fetch('/api/specialist/onboarding-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Не удалось сохранить прогресс')
      }

      const data = await response.json()

      if (typeof data.step === 'number') {
        setCurrentStep(Math.min(Math.max(data.step, 0), steps.length - 1))
      }

      if (data.completedAt) {
        setIsCompleted(true)
      } else if (payload.completed === false) {
        setIsCompleted(false)
      }
    } catch (err) {
      console.error(err)
      setError('Не удалось сохранить прогресс. Попробуйте ещё раз.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleNext() {
    const nextStep = Math.min(currentStep + 1, steps.length - 1)
    setCurrentStep(nextStep)
    await updateProgress({ step: nextStep })
  }

  async function handlePrevious() {
    const prevStep = Math.max(currentStep - 1, 0)
    setCurrentStep(prevStep)
    await updateProgress({ step: prevStep })
  }

  async function handleSkip() {
    // Устанавливаем флаг просмотра при пропуске
    setHasSeenOnboarding(true)
    await updateProgress({ step: currentStep, seen: true })
    setIsOpen(false)
  }

  async function handleComplete() {
    await updateProgress({ step: steps.length - 1, completed: true, seen: true })
    setIsOpen(false)
  }

  // Убираем ReminderCard - онбординг показывается только один раз
  // Пользователь может открыть его вручную через кнопку "Как работает платформа"
  const ReminderCard = () => null

  return (
    <div className="mb-6">
      <ReminderCard />

      <Dialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          // При закрытии всегда устанавливаем флаг просмотра
          // чтобы онбординг больше не показывался автоматически
          if (!hasSeenOnboarding) {
            setHasSeenOnboarding(true)
            updateProgress({ step: currentStep, seen: true }).catch((err) => {
              console.error('Не удалось сохранить флаг просмотра при закрытии:', err)
            })
          }
        }}
        title={stepData.title}
        footer={
          <div className="space-y-4 w-full">
            <div>
              <div className="text-xs font-medium text-gray-500">
                Шаг {currentStep + 1} из {steps.length}
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 break-words">{error}</p>}

            <div className="flex flex-col gap-3 w-full">
              {/* Основная кнопка действия - всегда видна */}
              <div className="flex justify-end w-full">
                <Button
                  onClick={stepData.isFinal ? handleComplete : handleNext}
                  disabled={isSaving}
                  className="w-full md:w-auto min-w-[120px] text-sm md:text-base"
                >
                  {isSaving ? 'Сохраняем...' : stepData.ctaLabel}
                </Button>
              </div>

              {/* Вспомогательные кнопки */}
              <div className="flex items-center justify-between gap-2 w-full flex-wrap">
                <div className="flex items-center gap-2 flex-shrink-0">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={isSaving}
                      className="text-sm md:text-base"
                    >
                      Назад
                    </Button>
                  )}
                </div>
                {stepData.allowSkip ? (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={isSaving}
                    className="text-sm text-gray-500 md:text-base flex-shrink-0"
                  >
                    Вернуться позже
                  </Button>
                ) : (
                  <div className="text-sm text-gray-400 md:text-base">
                    Почти готово — завершите онбординг
                  </div>
                )}
              </div>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:w-1/2 md:max-w-md">
            <Image
              src={stepData.illustration}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-[center_top]"
              style={{ objectPosition: 'center 1%' }}
              priority
            />
          </div>
          <div className="flex w-full flex-col justify-center md:w-1/2">
            <div className="space-y-4">
              <StepContent />
              {stepData.footnote && (
                <p className="text-xs text-gray-400 md:text-sm">{stepData.footnote}</p>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

