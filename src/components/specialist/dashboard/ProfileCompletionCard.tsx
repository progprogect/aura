/**
 * Карточка с прогрессом заполнения профиля и заданиями
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Task {
  id: string
  title: string
  description: string
  bonus: number
  completed: boolean
}

interface ProfileCompletionCardProps {
  completionPercentage: number
  tasks: Task[]
  specialistSlug: string
}

// Маппинг ID задач на ID секций в профиле (для редактирования профиля)
const taskToProfileSectionMap: Record<string, string> = {
  avatar: 'hero',
  certificates: 'education',
  education: 'education',
  gallery: 'gallery',
  pricing: 'pricing',
  video: 'video',
}

// Маппинг задач для личного кабинета (не в редактирование профиля)
const dashboardTaskToSectionMap: Record<string, string> = {
  leadMagnets: 'lead-magnets',
  'lead-magnets': 'lead-magnets',
  services: 'services',
}

export function ProfileCompletionCard({ completionPercentage, tasks, specialistSlug }: ProfileCompletionCardProps) {
  const router = useRouter()
  const isComplete = completionPercentage === 100

  const handleTaskClick = (task: Task) => {
    if (task.completed) return
    
    // Проверяем, является ли задача задачей для личного кабинета
    const dashboardSectionId = dashboardTaskToSectionMap[task.id]
    if (dashboardSectionId) {
      // Переход в личный кабинет с параметром section для скролла
      router.push(`/profile?section=${dashboardSectionId}`)
    } else {
      // Переход на страницу профиля с параметрами редактирования
      const sectionId = taskToProfileSectionMap[task.id]
      if (sectionId) {
        router.push(`/specialist/${specialistSlug}?edit=true&section=${sectionId}&from=profile`)
      }
    }
  }

  return (
    <Card className="border-blue-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">
            {isComplete ? '✅ Профиль заполнен!' : '🎯 Завершите профиль'}
          </span>
          <Badge variant={isComplete ? "default" : "secondary"} className="text-lg px-3 py-1">
            {completionPercentage}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Прогресс-бар */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {isComplete
              ? 'Ваш профиль полностью заполнен. Отличная работа!'
              : `Ещё ${100 - completionPercentage}% до полного заполнения`
            }
          </p>
        </div>

        {/* Задания */}
        {tasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Улучшите профиль:</h4>
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => handleTaskClick(task)}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border transition-colors
                    ${task.completed 
                      ? 'bg-green-50 border-green-200 cursor-default' 
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer active:scale-[0.98]'
                    }
                  `}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${task.completed ? 'text-green-700' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      {!task.completed && (
                        <span className="text-xs font-medium text-blue-600">
                          +{task.bonus}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {task.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

