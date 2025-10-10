/**
 * Переключатель "Принимаю новых клиентов"
 * Управление видимостью профиля в каталоге
 */

'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface AcceptingClientsToggleProps {
  acceptingClients: boolean
  onToggle: (value: boolean) => Promise<void>
}

export function AcceptingClientsToggle({ 
  acceptingClients, 
  onToggle 
}: AcceptingClientsToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async () => {
    setIsUpdating(true)
    try {
      await onToggle(!acceptingClients)
    } catch (error) {
      console.error('Ошибка обновления статуса:', error)
      alert('Ошибка обновления статуса')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            {acceptingClients ? '🟢' : '🔴'} Статус приема клиентов
          </h3>
          <p className="text-sm text-gray-600">
            {acceptingClients 
              ? 'Ваш профиль отображается в каталоге и доступен для поиска'
              : 'Профиль скрыт из каталога. Доступен только по прямой ссылке'
            }
          </p>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isUpdating}
          className={`
            relative w-14 h-8 rounded-full transition-colors duration-200 flex-shrink-0 ml-4
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            ${acceptingClients 
              ? 'bg-green-600 focus-visible:ring-green-600' 
              : 'bg-gray-300 focus-visible:ring-gray-400'
            }
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          role="switch"
          aria-checked={acceptingClients}
          aria-label="Принимаю новых клиентов"
        >
          {isUpdating ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin text-white" />
            </span>
          ) : (
            <span
              className={`
                absolute top-1 left-1
                block w-6 h-6 bg-white rounded-full shadow-sm
                transform transition-transform duration-200
                ${acceptingClients ? 'translate-x-6' : 'translate-x-0'}
              `}
            />
          )}
        </button>
      </div>

      {/* Подсказка */}
      {!acceptingClients && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            💡 <strong>Внимание:</strong> Когда вы выключаете прием клиентов, ваш профиль скрывается из результатов поиска и каталога.
            Однако профиль остается доступным по прямой ссылке.
          </p>
        </div>
      )}
    </div>
  )
}

