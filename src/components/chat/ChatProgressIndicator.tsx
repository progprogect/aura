/**
 * Индикатор прогресса диалога
 */

'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Zap, Filter, Search, CheckCircle2 } from 'lucide-react'

interface ChatProgressIndicatorProps {
  currentStep: number
  totalSteps?: number
}

const STEPS = [
  { id: 1, label: 'Проблема', icon: MessageCircle },
  { id: 2, label: 'Формат', icon: Zap },
  { id: 3, label: 'Уточнение', icon: Filter },
  { id: 4, label: 'Подбор', icon: Search },
  { id: 5, label: 'Готово', icon: CheckCircle2 },
]

export function ChatProgressIndicator({ currentStep, totalSteps = 5 }: ChatProgressIndicatorProps) {
  // Если диалог завершён (показаны специалисты), не показываем индикатор
  if (currentStep >= totalSteps) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50 px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-2">
          {STEPS.slice(0, totalSteps).map((step, index) => {
            const Icon = step.icon
            const isActive = index + 1 === currentStep
            const isCompleted = index + 1 < currentStep
            const isPending = index + 1 > currentStep

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Шаг */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center gap-1"
                >
                  {/* Иконка */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                      ${isActive ? 'bg-primary/20 text-primary ring-2 ring-primary' : ''}
                      ${isPending ? 'bg-muted text-muted-foreground' : ''}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Название */}
                  <span
                    className={`
                      text-xs font-medium transition-colors duration-300 hidden sm:block
                      ${isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'}
                    `}
                  >
                    {step.label}
                  </span>
                </motion.div>

                {/* Линия */}
                {index < totalSteps - 1 && (
                  <div className="flex-1 h-0.5 mx-2 bg-border relative overflow-hidden">
                    {isCompleted && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="absolute inset-0 bg-primary"
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

