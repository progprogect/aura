/**
 * Форма входа для специалистов
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { SMSCodeInput } from '@/components/auth/SMSCodeInput'
import { AuthProviderButtons } from '@/components/auth/AuthProviderButtons'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

type LoginStep = 'phone' | 'code' | 'success'

export function AuthLoginForm() {
  const [step, setStep] = useState<LoginStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const router = useRouter()
  const { login } = useAuth()

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
    if (!phone) {
      setError('Введите номер телефона')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'login' })
      })

      const result = await response.json()

      if (result.success) {
        setStep('code')
        setCodeExpiry(new Date(Date.now() + 5 * 60 * 1000)) // 5 минут
      } else {
        setError(result.error || 'Ошибка отправки SMS')
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!code || code.length !== 4) {
      setError('Введите 4-значный код')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, provider: 'phone' })
      })

      const result = await response.json()

      if (result.success) {
        setStep('success')
        // Используем хук для авторизации
        login(result.sessionToken, result.specialist)
        // Перенаправляем в личный кабинет
        setTimeout(() => {
          router.push('/specialist/dashboard')
        }, 1500)
      } else {
        setError(result.error || 'Неверный код')
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    // Перенаправляем на OAuth провайдера
    window.location.href = `/api/auth/${provider}`
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
          Добро пожаловать!
        </h1>
        <p className="text-muted-foreground">
          Войдите в личный кабинет специалиста
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

            {/* Социальные сети */}
            <AuthProviderButtons
              onProviderClick={handleSocialLogin}
              mode="login"
              disabled={loading}
            />
          </motion.div>
        )}

        {/* Шаг 2: Ввод кода */}
        {step === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Введите код из SMS</h3>
              <p className="text-sm text-muted-foreground">
                Мы отправили код на номер {phone}
              </p>
            </div>

            <SMSCodeInput
              value={code}
              onChange={setCode}
              onComplete={handleVerifyCode}
              disabled={loading}
              length={4}
            />

            {/* Таймер */}
            {timeLeft > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Код действителен {formatTime(timeLeft)}</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 4}
                className="w-full"
                size="lg"
              >
                {loading ? 'Проверяем...' : 'Войти'}
              </Button>

              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={loading || timeLeft > 0}
                className="w-full"
              >
                {timeLeft > 0 ? `Повторить через ${formatTime(timeLeft)}` : 'Отправить код повторно'}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setStep('phone')}
              className="w-full"
            >
              Изменить номер телефона
            </Button>
          </motion.div>
        )}

        {/* Шаг 3: Успешный вход */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Добро пожаловать!</h3>
              <p className="text-sm text-muted-foreground">
                Перенаправляем в личный кабинет...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Ссылка на регистрацию */}
    <div className="text-center">
      <p className="text-sm text-muted-foreground">
        Ещё нет аккаунта?{' '}
        <a 
          href="/auth/register" 
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Зарегистрироваться
        </a>
      </p>
    </div>
  </div>
  )
}
