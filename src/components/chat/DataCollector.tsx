/**
 * DataCollector - компонент для сбора структурированных данных
 * Отображает вопросы с вариантами ответов и собирает ответы пользователя
 */

'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, ArrowRight, SkipForward } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StructuredQuestion, QuestionOption } from '@/lib/ai/question-generator'

interface DataCollectorProps {
  questions: StructuredQuestion[]
  onComplete: (collectedData: Record<string, any>) => void
  onSkip: () => void
  isLoading?: boolean
}

export function DataCollector({ questions, onComplete, onSkip, isLoading = false }: DataCollectorProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [collectedData, setCollectedData] = useState<Record<string, any>>({})
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const canProceed = currentQuestion.required ? 
    (selectedOptions[currentQuestion.id]?.length > 0) : 
    true

  const handleOptionSelect = useCallback((questionId: string, optionValue: string) => {
    setSelectedOptions(prev => {
      const current = prev[questionId] || []
      
      if (currentQuestion.type === 'single_choice') {
        return { ...prev, [questionId]: [optionValue] }
      } else if (currentQuestion.type === 'multiple_choice') {
        const newSelection = current.includes(optionValue)
          ? current.filter(v => v !== optionValue)
          : [...current, optionValue]
        return { ...prev, [questionId]: newSelection }
      }
      
      return prev
    })
  }, [currentQuestion])

  const handleNext = useCallback(() => {
    if (!canProceed) return

    // Сохраняем ответ на текущий вопрос
    const answer = selectedOptions[currentQuestion.id] || []
    setCollectedData(prev => ({
      ...prev,
      [currentQuestion.id]: answer.length === 1 ? answer[0] : answer
    }))

    if (isLastQuestion) {
      // Завершаем сбор данных
      const finalData = {
        ...collectedData,
        [currentQuestion.id]: answer.length === 1 ? answer[0] : answer
      }
      onComplete(finalData)
    } else {
      // Переходим к следующему вопросу
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOptions({}) // Очищаем выбор для следующего вопроса
    }
  }, [canProceed, currentQuestion, selectedOptions, isLastQuestion, collectedData, onComplete])

  const handleSkip = useCallback(() => {
    if (currentQuestion.required) return // Нельзя пропустить обязательный вопрос

    if (isLastQuestion) {
      onComplete(collectedData)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOptions({})
    }
  }, [currentQuestion, isLastQuestion, collectedData, onComplete])

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setSelectedOptions({})
    }
  }, [currentQuestionIndex])

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              {/* Прогресс */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Вопрос {currentQuestionIndex + 1} из {questions.length}
                  </Badge>
                  {currentQuestion.required && (
                    <Badge variant="destructive" className="text-xs">
                      Обязательный
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                </div>
              </div>

              {/* Вопрос */}
              <h3 className="text-lg font-semibold mb-4">
                {currentQuestion.question}
              </h3>

              {/* Подсказка */}
              {currentQuestion.helpText && (
                <p className="text-sm text-muted-foreground mb-4">
                  {currentQuestion.helpText}
                </p>
              )}

              {/* Варианты ответов */}
              {currentQuestion.options && (
                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOptions[currentQuestion.id]?.includes(option.value)
                    const Icon = currentQuestion.type === 'single_choice' ? 
                      (isSelected ? CheckCircle : Circle) : 
                      (isSelected ? CheckCircle : Circle)

                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* Кнопки управления */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentQuestionIndex > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBack}
                      disabled={isLoading}
                    >
                      Назад
                    </Button>
                  )}
                  
                  {!currentQuestion.required && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <SkipForward className="w-4 h-4" />
                      Пропустить
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canProceed || isLoading}
                  className="gap-2"
                >
                  {isLastQuestion ? 'Завершить' : 'Далее'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/**
 * Компонент для отображения собранных данных (для отладки)
 */
export function CollectedDataPreview({ data }: { data: Record<string, any> }) {
  if (Object.keys(data).length === 0) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h4 className="font-semibold mb-2">Собранные данные:</h4>
        <div className="space-y-1 text-sm">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-medium">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
