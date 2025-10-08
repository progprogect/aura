'use client'

/**
 * 🧪 Панель для тестирования авторизации без SMS провайдера
 * Показывает тестовые номера и коды прямо в UI
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Phone, Key, UserPlus, LogIn } from 'lucide-react'
import { toast } from 'sonner'

// ========================================
// ТЕСТОВЫЕ ДАННЫЕ
// ========================================

const TEST_PHONES = [
  {
    phone: '+79999999999',
    code: '1234',
    name: 'Тестовый пользователь 1',
    description: 'Существующий специалист'
  },
  {
    phone: '+78888888888', 
    code: '5678',
    name: 'Тестовый пользователь 2',
    description: 'Существующий специалист'
  },
  {
    phone: '+77777777777',
    code: '9999', 
    name: 'Тестовый пользователь 3',
    description: 'Существующий специалист'
  },
  {
    phone: '+79151234567',
    code: '1234',
    name: 'Новый пользователь',
    description: 'Будет зарегистрирован'
  }
] as const

// ========================================
// КОМПОНЕНТ
// ========================================

interface TestAuthPanelProps {
  className?: string
}

export function TestAuthPanel({ className }: TestAuthPanelProps) {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // ========================================
  // УТИЛИТЫ
  // ========================================

  const copyToClipboard = async (text: string, type: 'phone' | 'code', phone?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      
      if (type === 'phone') {
        setCopiedPhone(phone || text)
        setTimeout(() => setCopiedPhone(null), 2000)
        toast.success('Номер скопирован!')
      } else {
        setCopiedCode(text)
        setTimeout(() => setCopiedCode(null), 2000)
        toast.success('Код скопирован!')
      }
    } catch (error) {
      toast.error('Не удалось скопировать')
    }
  }

  // ========================================
  // РЕНДЕР
  // ========================================

  return (
    <Card className={`border-2 border-orange-200 bg-orange-50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          🧪 Тестовая авторизация
        </CardTitle>
        <CardDescription className="text-orange-700">
          Используйте эти номера и коды для тестирования без SMS провайдера
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Инструкции */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📋 Как использовать:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Скопируйте номер телефона</li>
            <li>2. Вставьте в поле "Номер телефона"</li>
            <li>3. Нажмите "Отправить код"</li>
            <li>4. Скопируйте код из таблицы ниже</li>
            <li>5. Вставьте код и войдите</li>
          </ol>
        </div>

        {/* Тестовые номера */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Тестовые номера телефонов
          </h4>
          
          <div className="grid gap-3">
            {TEST_PHONES.map((testData) => (
              <div 
                key={testData.phone}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium">
                      {testData.phone}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {testData.name}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    {testData.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-green-600">
                    {testData.code}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(testData.phone, 'phone')}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Быстрые действия
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard('+79999999999', 'phone')}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-3 h-3" />
              Тест регистрации
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard('+79999999999', 'phone')}
              className="flex items-center gap-2"
            >
              <LogIn className="w-3 h-3" />
              Тест входа
            </Button>
          </div>
        </div>

        {/* Статус тестового режима */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">
              Тестовый режим активен
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            SMS коды выводятся в консоль браузера и терминал
          </p>
        </div>

        {/* Консольные команды */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">
            🔧 Для разработчиков:
          </h4>
          <div className="space-y-1 text-xs font-mono text-gray-700">
            <div>// Проверить в консоли браузера:</div>
            <div className="text-blue-600">console.log('[TEST SMS]')</div>
            <div>// Или запустить скрипт:</div>
            <div className="text-blue-600">npx ts-node scripts/test-auth.ts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ========================================
// ЭКСПОРТ ДАННЫХ ДЛЯ ДРУГИХ КОМПОНЕНТОВ
// ========================================

export { TEST_PHONES }
