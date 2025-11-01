/**
 * Quiz-форма создания заявки пользователя
 * Пошаговая форма с встроенной SMS-авторизацией
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { SMSCodeInput } from '@/components/auth/SMSCodeInput'
import { SMSCodeModal } from '@/components/auth/SMSCodeModal'
import { useAuth } from '@/hooks/useAuth'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'

interface Category {
  key: string
  name: string
  emoji: string
  isActive: boolean
}

interface RequestQuizProps {
  defaultCategory?: string
  defaultTitle?: string
  onClose?: () => void
}

type QuizStep = 'title' | 'category' | 'description' | 'budget' | 'auth' | 'loading'

export function RequestQuiz({ defaultCategory, defaultTitle, onClose }: RequestQuizProps) {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  
  // Если defaultTitle задан, начинаем с category (пропускаем title)
  // Если пользователь авторизован, пропускаем шаг auth
  const initialStep: QuizStep = defaultTitle ? 'category' : (defaultCategory ? 'category' : 'title')
  const [step, setStep] = useState<QuizStep>(initialStep)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Данные формы
  const [formData, setFormData] = useState({
    title: defaultTitle || '',
    category: defaultCategory || '',
    description: '',
    budget: null as number | null
  })

  // SMS-авторизация
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [smsCodeToShow, setSmsCodeToShow] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Загрузка категорий
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories.filter((c: Category) => c.isActive))
          setLoadingCategories(false)
        }
      })
      .catch(() => setLoadingCategories(false))
  }, [])

  // Таймер обратного отсчёта для SMS
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

  const handleNext = () => {
    setError('')
    
    // Валидация перед переходом
    if (step === 'title' && formData.title.trim().length < 5) {
      setError('Заголовок должен быть минимум 5 символов')
      return
    }

    if (step === 'category' && !formData.category) {
      setError('Выберите категорию')
      return
    }
    
    // Если пользователь уже авторизован, пропускаем шаг auth
    if (step === 'budget' && isAuthenticated) {
      // Сразу создаём заявку
      handleCreateRequest()
      return
    }

    if (step === 'description' && formData.description.trim().length < 50) {
      setError('Описание должно быть минимум 50 символов')
      return
    }

    if (step === 'budget' && formData.budget !== null) {
      if (formData.budget < 50 || formData.budget > 2000) {
        setError('Бюджет должен быть от 50 до 2000 баллов')
        return
      }
    }

    // Переход на следующий шаг
    const steps: QuizStep[] = ['title', 'category', 'description', 'budget', 'auth']
    const currentIndex = steps.indexOf(step)
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1]
      // Если следующий шаг auth и пользователь уже авторизован, пропускаем и создаём заявку
      if (nextStep === 'auth' && isAuthenticated) {
        // Создаём заявку сразу
        handleCreateRequest()
        return
      }
      setStep(nextStep)
    }
  }

  // Если defaultTitle задан, используем его и переходим к следующему шагу
  useEffect(() => {
    if (defaultTitle && !formData.title) {
      setFormData(prev => ({ ...prev, title: defaultTitle }))
      // Если мы на шаге title и defaultTitle задан, автоматически переходим к category
      if (step === 'title') {
        const timer = setTimeout(() => {
          setStep('category')
        }, 300)
        return () => clearTimeout(timer)
      }
    }
  }, [defaultTitle])

  const handleBack = () => {
    setError('')
    const steps: QuizStep[] = ['title', 'category', 'description', 'budget', 'auth']
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  const handleSendSMSCode = async () => {
    if (!phone.trim()) {
      setError('Введите номер телефона')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Сначала пробуем отправить код для входа (если пользователь уже существует)
      // Если пользователь не существует, потом отправим код для регистрации
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'login' }),
      })

      const data = await response.json()

      if (data.success) {
        setCodeSent(true)
        setCodeExpiry(new Date(Date.now() + 5 * 60 * 1000))
        setTimeLeft(300)
        
        if (data.code) {
          // Показываем код в модальном окне
          setSmsCodeToShow(data.code)
          setShowCodeModal(true)
          console.log(`🔐 SMS КОД для ${phone}: ${data.code}`)
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

  // Создание заявки (используется когда пользователь уже авторизован)
  const handleCreateRequest = async () => {
    // Проверяем, что пользователь авторизован
    if (!isAuthenticated) {
      setError('Требуется авторизация для создания заявки')
      setStep('auth')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    setStep('loading')

    try {
      const requestResponse = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Важно: отправляем cookies с session_token
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          budget: formData.budget
        }),
      })

      const requestData = await requestResponse.json()

      if (requestResponse.status === 401) {
        // Сессия недействительна или отсутствует
        setError('Сессия истекла. Пожалуйста, авторизуйтесь снова.')
        setStep('auth')
        setLoading(false)
        return
      }

      if (requestData.success) {
        // Всегда редиректим на страницу созданной заявки
        router.push(`/requests/${requestData.request.id}`)
      } else {
        setError(requestData.error || 'Ошибка при создании заявки')
        setStep('budget')
        setLoading(false)
      }
    } catch (error) {
      setError('Произошла ошибка. Попробуйте еще раз.')
      setStep('budget')
      setLoading(false)
    }
  }

  const handleVerifyCodeAndSubmit = async () => {
    if (!smsCode || smsCode.length !== 4) {
      setError('Введите 4-значный код')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Сначала пробуем войти, если пользователь существует
      let authData: any = null
      let sessionToken: string | null = null

      const loginResponse = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: smsCode }),
      })

      const loginData = await loginResponse.json()

      if (loginData.success) {
        // Пользователь существует, вошли успешно
        authData = loginData
        sessionToken = loginData.sessionToken
      } else {
        // Пользователь не существует, регистрируем
        const authResponse = await fetch('/api/auth/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            code: smsCode,
            firstName: 'Пользователь',
            lastName: 'Пользователь'
          }),
        })

        authData = await authResponse.json()

        if (!authData.success) {
          setError(authData.error || loginData.error || 'Ошибка авторизации')
          setLoading(false)
          return
        }

        sessionToken = authData.sessionToken
      }

      if (!sessionToken) {
        setError('Не удалось получить сессию')
        setLoading(false)
        return
      }

      // Теперь создаём заявку
      setStep('loading')
      
      const requestResponse = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Важно: отправляем cookies с session_token
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          budget: formData.budget
        }),
      })

      const requestData = await requestResponse.json()

      if (requestData.success) {
        // Всегда редиректим на страницу созданной заявки
        router.push(`/requests/${requestData.request.id}`)
      } else {
        setError(requestData.error || 'Ошибка при создании заявки')
        setStep('auth')
        setLoading(false)
      }
    } catch (error) {
      setError('Произошла ошибка. Попробуйте еще раз.')
      setStep('auth')
      setLoading(false)
    }
  }

  const currentStepIndex = ['title', 'category', 'description', 'budget', 'auth'].indexOf(step)
  const totalSteps = 5

  return (
    <>
      {/* Модальное окно SMS кода */}
      <SMSCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        code={smsCodeToShow}
        phone={phone}
        purpose="registration"
      />

      <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 mx-0 sm:mx-auto">
        {/* Прогресс */}
        {step !== 'loading' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-medium text-foreground">
                Шаг {currentStepIndex + 1} из {totalSteps}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-primary h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Ошибки */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Контент */}
        <AnimatePresence mode="wait">
          {step === 'title' && (
            <motion.div
              key="title"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="title">Заголовок заявки</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Например: Нужен психолог для работы с тревогой"
                  maxLength={100}
                  className="mt-2 h-11 text-base touch-manipulation"
                  style={{ fontSize: '16px' }}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {formData.title.length}/100 символов
                </p>
              </div>
            </motion.div>
          )}

          {step === 'category' && (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <Label>Выберите категорию</Label>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.key }))}
                        className={`p-4 rounded-lg border-2 transition-all text-left touch-manipulation min-h-[88px] active:scale-95 ${
                          formData.category === cat.key
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="text-2xl mb-1.5">{cat.emoji}</div>
                        <div className="text-sm font-medium">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'description' && (
            <motion.div
              key="description"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="description">Опишите задачу</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Расскажите подробнее о том, что вам нужно..."
                  rows={6}
                  maxLength={2000}
                  className="mt-2 resize-none"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {formData.description.length}/2000 символов (минимум 50)
                </p>
              </div>
            </motion.div>
          )}

          {step === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="budget">Бюджет (опционально)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData(prev => ({ 
                      ...prev, 
                      budget: value === '' ? null : parseInt(value) 
                    }))
                  }}
                  placeholder="От 50 до 2000 баллов"
                  min={50}
                  max={2000}
                  className="mt-2 h-11 text-base touch-manipulation"
                  style={{ fontSize: '16px' }}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Если не указать, специалисты предложат свою цену
                </p>
              </div>
            </motion.div>
          )}

          {step === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {!codeSent ? (
                <div>
                  <Label htmlFor="phone">Ваш телефон</Label>
                  <div className="mt-2">
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    На этот номер придёт код для подтверждения
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="smsCode">Код из SMS</Label>
                  <SMSCodeInput
                    value={smsCode}
                    onChange={setSmsCode}
                    onComplete={handleVerifyCodeAndSubmit}
                    className="mt-2"
                  />
                  {timeLeft > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Код действителен: {formatTime(timeLeft)}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 space-y-4"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Создаём заявку...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопки навигации */}
        {step !== 'loading' && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t gap-4">
            <div className="flex-shrink-0">
              {currentStepIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  size="lg"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Назад
                </Button>
              )}
            </div>

            <div className="flex-1 flex justify-end">
              {step === 'auth' && !codeSent ? (
                <Button
                  onClick={handleSendSMSCode}
                  disabled={loading || !phone.trim()}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Отправить код
                </Button>
              ) : step === 'auth' && codeSent ? (
                <Button
                  onClick={handleVerifyCodeAndSubmit}
                  disabled={loading || smsCode.length !== 4}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-1" />
                  )}
                  Опубликовать заявку
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Далее
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  )
}

