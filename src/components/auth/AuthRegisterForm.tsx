/**
 * Форма регистрации для специалистов
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
import { Clock, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

type RegisterStep = 'phone' | 'code' | 'profile' | 'success'

export function AuthRegisterForm() {
  const [step, setStep] = useState<RegisterStep>('phone')
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

  const handleSendCode = async () => {
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
        body: JSON.stringify({ phone, purpose: 'registration' }),
      })

      const data = await response.json()

      if (data.success) {
        setStep('code')
        setCodeExpiry(new Date(Date.now() + 5 * 60 * 1000)) // 5 минут
        setTimeLeft(300)
        
        // Показываем код в alert (временное решение до настройки SMS провайдера)
        if (data.code) {
          alert(`🔐 Ваш код для регистрации: ${data.code}\n\n(Код также выведен в консоль браузера)`)
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

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 4) {
      setError('Введите 4-значный код')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'phone', phone, code }),
      })

      const data = await response.json()

      if (data.success) {
        // Используем хук для авторизации
        login(data.sessionToken, data.specialist)
        setStep('success')
        
        // Перенаправляем на заполнение профиля через 2 секунды
        setTimeout(() => {
          router.push('/specialist/profile/edit')
        }, 2000)
      } else {
        setError(data.error || 'Неверный код')
      }
    } catch (error) {
      setError('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    await handleSendCode()
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Присоединяйтесь к Ауре
        </h1>
        <p className="text-muted-foreground">
          Зарегистрируйтесь как специалист и начните помогать людям
        </p>
      </div>

      {/* Форма */}
      <div className="bg-card rounded-xl shadow-lg border p-6 space-y-6">
        <AnimatePresence mode="wait">
        {step === 'phone' && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Регистрация</h2>
              <p className="text-muted-foreground">
                Введите номер телефона для получения кода подтверждения
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
                <Label htmlFor="phone">Номер телефона</Label>
                <PhoneInput
                  id="phone"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+7 (999) 999-99-99"
                  disabled={loading}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleSendCode}
                disabled={loading}
              >
                {loading ? 'Отправка...' : 'Получить код'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <AuthProviderButtons />
          </motion.div>
        )}

        {step === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Подтверждение</h2>
              <p className="text-muted-foreground">
                Введите код из SMS, отправленный на номер
              </p>
              <p className="text-sm font-medium">{phone}</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Код подтверждения</Label>
                <SMSCodeInput
                  id="code"
                  value={code}
                  onChange={setCode}
                  disabled={loading}
                />
                {timeLeft > 0 && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    Код действителен: {formatTime(timeLeft)}
                  </div>
                )}
              </div>

              <Button 
                className="w-full" 
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 4}
              >
                {loading ? 'Проверка...' : 'Подтвердить'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={handleResendCode}
                disabled={loading || timeLeft > 240}
              >
                Отправить код повторно
              </Button>

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setStep('phone')}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Изменить номер
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Регистрация успешна!</h2>
              <p className="text-muted-foreground">
                Сейчас вы будете перенаправлены на страницу заполнения профиля
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-100" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-200" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Ссылка на вход */}
    <div className="text-center">
      <p className="text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <a 
          href="/auth/login" 
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Войти
        </a>
      </p>
    </div>
  </div>
  )
}
