'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

type ExpertOnboardingFlowProps = {
  initialStep?: number
  initialCompleted?: boolean
  guideHref?: string
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
  guideHref = GUIDE_FALLBACK_URL,
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
                <span>На старте у вас 50 бонусных баллов (1 балл = 1 BYN по курсу).</span>
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
        secondaryLinkLabel: 'Открыть гайд сразу',
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
  const [isOpen, setIsOpen] = useState(!initialCompleted)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const StepContent = stepData.content

  async function updateProgress(payload: { step?: number; completed?: boolean }) {
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

  async function handleSkip() {
    await updateProgress({ step: currentStep })
    setIsOpen(false)
  }

  async function handleComplete() {
    await updateProgress({ step: steps.length - 1, completed: true })
    setIsOpen(false)
  }

  const ReminderCard = () =>
    !isCompleted && !isOpen ? (
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm md:flex md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-blue-700">
            Продолжите знакомство с платформой
          </div>
          <p className="text-sm text-gray-600">
            Мы сохранили последний шаг. Вернитесь, чтобы быстрее получить первых клиентов.
          </p>
        </div>
        <Button className="mt-4 w-full md:mt-0 md:w-auto" onClick={() => setIsOpen(true)}>
          Продолжить онбординг
        </Button>
      </div>
    ) : null

  const CompletedCard = () =>
    isCompleted ? (
      <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm md:flex md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-emerald-700">Онбординг пройден</div>
          <p className="text-sm text-gray-700">
            Следуйте гайду в кабинете — он поможет заполнить профиль, настроить услуги и получать
            заказы.
          </p>
        </div>
        <Button asChild variant="secondary" className="mt-4 w-full md:mt-0 md:w-auto">
          <Link href={guideHref}>Открыть гайд</Link>
        </Button>
      </div>
    ) : null

  return (
    <div className="mb-6">
      <ReminderCard />
      <CompletedCard />

      <Dialog
        isOpen={isOpen && !isCompleted}
        onClose={() => {
          setIsOpen(false)
          if (!isCompleted) {
            updateProgress({ step: currentStep })
          }
        }}
        title={stepData.title}
        footer={
          <div className="space-y-4">
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

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {stepData.allowSkip ? (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isSaving}
                  className="order-2 text-sm text-gray-500 md:order-1 md:text-base"
                >
                  Вернуться позже
                </Button>
              ) : (
                <div className="order-2 text-sm text-gray-400 md:order-1 md:text-base">
                  Почти готово — завершите онбординг
                </div>
              )}

              <div className="flex flex-col gap-3 md:flex-row md:order-2">
                {stepData.isFinal && stepData.secondaryLinkLabel && (
                  <Button asChild variant="outline" disabled={isSaving} className="md:order-1">
                    <Link href={guideHref}>{stepData.secondaryLinkLabel}</Link>
                  </Button>
                )}
                <Button
                  onClick={stepData.isFinal ? handleComplete : handleNext}
                  disabled={isSaving}
                  className="md:order-2"
                >
                  {isSaving ? 'Сохраняем...' : stepData.ctaLabel}
                </Button>
              </div>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 md:w-1/2">
            <Image
              src={stepData.illustration}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="flex w-full flex-col justify-between md:w-1/2">
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

