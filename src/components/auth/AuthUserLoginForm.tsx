/**
 * Форма входа для обычных пользователей
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { SMSCodeInput } from '@/components/auth/SMSCodeInput'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type LoginStep = 'phone' | 'code' | 'success'

export function AuthUserLoginForm() {
  const [step, setStep] = useState<LoginStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const router = useRouter()

  // Таймер обратного отсчёта
  useState(() => {
    if (!codeExpiry) return

    const timer = setInterval(() => {
      const now = new Date()
      const diff = codeExpiry.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft(0)
        clearInterval(timer)
      } else {
        setTimeLeft(Math.floor(diff / 1000))
      }
    }, 1000)

    return () => clearInterval(timer)
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendSMS = async () => {
    if (!phone.trim()) {
      setError('Введите номер телефона')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'login' }),
      })

      const data = await response.json()

      if (data.success) {
        setStep('code')
        setCodeExpiry(new Date(Date.now() + 5 * 60 * 1000)) // 5 минут
        setTimeLeft(300)
        
        // Показываем код в alert (тестовый режим)
        if (data.code) {
          alert(`🔐 Ваш код для входа: ${data.code}\n\n(Код также выведен в консоль браузера)`)
          console.log(`🔐 SMS КОД: ${data.code}`)
        }
      } else {
        setError(data.error || 'Ошибка при отправке кода')
      }
    } catch (error) {
      setError('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!code || code.length !== 4) {
      setError('Введите код из 4 цифр')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })

      const data = await response.json()

      if (data.success) {
        setStep('success')
        
        // Если пользователь является специалистом, редирект в кабинет
        // Иначе на главную
        setTimeout(() => {
          if (data.user?.hasSpecialistProfile) {
            router.push('/specialist/dashboard')
          } else {
            router.push('/')
          }
          router.refresh()
        }, 1500)
      } else {
        setError(data.error || 'Ошибка при входе')
        if (data.error?.includes('код')) {
          setCode('')
        }
      }
    } catch (error) {
      setError('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setCode('')
    await handleSendSMS()
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          С возвращением!
        </h1>
        <p className="text-muted-foreground">
          Войдите в свой аккаунт
        </p>
      </div>

      {/* Форма */}
      <div className="bg-card rounded-xl shadow-lg border p-6 space-y-6">
        <AnimatePresence mode="wait">
        {/* Шаг 1: Ввод телефона */}
        {step === 'phone' && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                onEnter={handleSendSMS}
                disabled={loading}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSendSMS}
              disabled={loading || !phone}
              className="w-full"
              size="lg"
            >
              {loading ? 'Отправляем...' : 'Получить код'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Ещё нет аккаунта?{' '}
              <Link href="/auth/user/register" className="text-primary hover:underline font-medium">
                Зарегистрироваться
              </Link>
            </div>
          </motion.div>
        )}

        {/* Шаг 2: Ввод кода */}
        {step === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Введите код</h2>
              <p className="text-muted-foreground">
                Код отправлен на {phone}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Код подтверждения</Label>
                <SMSCodeInput
                  value={code}
                  onChange={setCode}
                  onComplete={handleLogin}
                  disabled={loading}
                />
              </div>

              {timeLeft > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Код действителен: {formatTime(timeLeft)}</span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleLogin}
                  disabled={loading || code.length !== 4}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Входим...' : 'Войти'}
                </Button>

                <Button
                  onClick={handleResendCode}
                  disabled={loading || timeLeft > 240}
                  variant="outline"
                  className="w-full"
                >
                  Отправить код повторно
                </Button>

                <Button
                  onClick={() => {
                    setStep('phone')
                    setCode('')
                    setError('')
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  Изменить номер
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Шаг 3: Успех */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center py-8"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Вход выполнен!</h2>
              <p className="text-muted-foreground">
                Перенаправляем...
              </p>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  )
}

