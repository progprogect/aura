/**
 * Единая форма входа для всех типов пользователей
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { SMSCodeInput } from '@/components/auth/SMSCodeInput'
import { SMSCodeModal } from '@/components/auth/SMSCodeModal'
import { Clock, AlertCircle, CheckCircle2, ArrowRight, User, Stethoscope } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type LoginStep = 'phone' | 'code' | 'success'

export function AuthUnifiedLoginForm() {
  const [step, setStep] = useState<LoginStep>('phone')
  const [userType, setUserType] = useState<'user' | 'specialist' | null>(null)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
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

  // Убираем выбор роли - определяем автоматически

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
        body: JSON.stringify({ phone, purpose: 'login' }),
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
    // Используем переданный код или текущее состояние
    const codeToUse = smsCode || code
    
    // Валидация
    if (!codeToUse || codeToUse.length !== 4) {
      setError('Введите код из 4 цифр')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      // Используем единый endpoint - роль определяется автоматически
      const response = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: codeToUse }),
      })

      const data = await response.json()

      if (data.success) {
        // Определяем тип пользователя по ответу
        const isSpecialist = data.user?.hasSpecialistProfile
        setUserType(isSpecialist ? 'specialist' : 'user')
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
        setError(data.error || 'Ошибка при входе')
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

  const goBack = () => {
    if (step === 'code') {
      setStep('phone')
      setCode('')
    }
    setError('')
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
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Вход в систему</h2>
                <p className="text-muted-foreground">
                  Введите номер телефона для получения кода подтверждения
                </p>
              </div>

              <div className="space-y-2">
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  onEnter={handleSendCode}
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

              <div className="space-y-3">
                <Button
                  onClick={handleSendCode}
                  disabled={loading || !phone}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Отправляем...' : 'Получить код'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

              </div>
            </motion.div>
          )}

          {/* Шаг 3: Ввод кода */}
          {step === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Подтвердите вход</h2>
                <p className="text-muted-foreground">
                  Введите код из SMS на номер {phone}
                </p>
              </div>

              <SMSCodeInput
                value={code}
                onChange={setCode}
                onComplete={handleVerifyCode}
                disabled={loading}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => handleVerifyCode()}
                  disabled={loading || !code || code.length !== 4}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Проверяем...' : 'Войти'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="flex items-center justify-between">
                  <Button
                    onClick={goBack}
                    variant="ghost"
                    size="sm"
                  >
                    Изменить номер
                  </Button>

                  {timeLeft > 0 ? (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Повторно отправить через {formatTime(timeLeft)}</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleResendCode}
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                    >
                      Отправить код повторно
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Шаг 4: Успешный вход */}
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
                <h2 className="text-2xl font-bold">Вход выполнен!</h2>
                <p className="text-muted-foreground">
                  {userType === 'specialist' 
                    ? 'Перенаправляем в личный кабинет специалиста...' 
                    : 'Перенаправляем на главную страницу...'
                  }
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

      {/* Ссылка на регистрацию */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Ещё нет аккаунта?{' '}
          <Link 
            href="/auth/register" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Зарегистрироваться
          </Link>
          {' '}или{' '}
          <Link 
            href="/auth/user/register" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Зарегистрироваться как пользователь
          </Link>
        </p>
      </div>

      {/* Модальное окно с SMS кодом */}
      <SMSCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        code={smsCode}
        phone={phone}
        purpose="login"
      />
    </div>
  )
}
