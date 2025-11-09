/**
 * Форма регистрации для обычных пользователей
 * Упрощённая версия - только имя, фамилия, телефон
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { SMSCodeInput } from '@/components/auth/SMSCodeInput'
import { SMSCodeModal } from '@/components/auth/SMSCodeModal'
import { Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type RegisterStep = 'phone' | 'code' | 'profile' | 'success'

export function AuthUserRegisterForm() {
  const [step, setStep] = useState<RegisterStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const router = useRouter()

  // Таймер обратного отсчёта
  useEffect(() => {
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
  }, [codeExpiry])

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
        
        // Показываем код в модальном окне
        if (data.code) {
          setSmsCode(data.code)
          setShowCodeModal(true)
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

  const handleVerifyCode = async (smsCode?: string) => {
    // Очищаем ошибку и переходим к вводу имени и фамилии
    // Валидация не нужна, т.к. onComplete вызывается только при length=4
    setError('')
    setStep('profile')
  }

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Введите имя и фамилию')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          code,
          firstName: firstName.trim(),
          lastName: lastName.trim()
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStep('success')
        
        // Редирект в личный кабинет или на сохраненную страницу заказа
        // Используем window.location для полной перезагрузки (чтобы useAuth обновился)
        setTimeout(() => {
          const orderRedirectUrl = sessionStorage.getItem('orderRedirectUrl')
          if (orderRedirectUrl) {
            sessionStorage.removeItem('orderRedirectUrl')
            window.location.href = orderRedirectUrl
          } else {
            window.location.href = '/profile'
          }
        }, 2000)
      } else {
        setError(data.error || 'Ошибка при регистрации')
        // Если ошибка в коде, возвращаемся к вводу кода
        if (data.error?.includes('код')) {
          setStep('code')
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
    await handleSendCode()
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Добро пожаловать в Эколюцию&nbsp;360
        </h1>
        <p className="text-muted-foreground">
          Зарегистрируйтесь, чтобы сохранять избранных специалистов
        </p>
      </div>

      {/* Форма */}
      <div className="bg-card rounded-xl shadow-lg border p-6 space-y-6">
        <AnimatePresence mode="wait">
        {/* Шаг 1: Ввод телефона */}
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
                  value={phone}
                  onChange={setPhone}
                  onEnter={handleSendCode}
                  disabled={loading}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <Button
                onClick={handleSendCode}
                disabled={loading || !phone}
                className="w-full"
                size="lg"
              >
                {loading ? 'Отправляем...' : 'Получить код'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Шаг 2: Ввод кода */}
        {step === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
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
                  onComplete={handleVerifyCode}
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
                  onClick={() => handleVerifyCode()}
                  disabled={loading || code.length !== 4}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Проверяем...' : 'Продолжить'}
                  <ArrowRight className="ml-2 h-4 w-4" />
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

        {/* Шаг 3: Ввод имени и фамилии */}
        {step === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Давайте познакомимся</h2>
              <p className="text-muted-foreground">
                Как к вам обращаться?
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
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Иван"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Петров"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && firstName && lastName) {
                      handleRegister()
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleRegister}
                disabled={loading || !firstName || !lastName}
                className="w-full"
                size="lg"
              >
                {loading ? 'Создаём профиль...' : 'Создать профиль'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Шаг 4: Успех */}
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
              <h2 className="text-2xl font-bold">Добро пожаловать!</h2>
              <p className="text-muted-foreground">
                Ваш профиль успешно создан
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              Перенаправляем на главную страницу...
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Ссылка на вход */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link 
            href="/auth/login" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Войти
          </Link>
        </p>
      </div>

      {/* Модальное окно с SMS кодом */}
      <SMSCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        code={smsCode}
        phone={phone}
        purpose="registration"
      />
    </div>
  )
}

