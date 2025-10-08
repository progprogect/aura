/**
 * Тестовая страница для демонстрации международного PhoneInput
 */

'use client'

import { useState } from 'react'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { InternationalPhoneInput } from '@/components/auth/InternationalPhoneInput'

export default function TestPhonePage() {
  const [phone1, setPhone1] = useState('')
  const [phone2, setPhone2] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Тест международного PhoneInput
          </h1>
          <p className="text-gray-600">
            Попробуйте ввести номера разных стран
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Обычный PhoneInput (с поддержкой международных номеров)</h2>
            <PhoneInput
              value={phone1}
              onChange={setPhone1}
              placeholder="Введите номер..."
            />
            <div className="mt-2 text-sm text-gray-600">
              <strong>Введённое значение:</strong> {phone1 || 'пусто'}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">InternationalPhoneInput (с селектором стран)</h2>
            <InternationalPhoneInput
              value={phone2}
              onChange={setPhone2}
            />
            <div className="mt-2 text-sm text-gray-600">
              <strong>Введённое значение:</strong> {phone2 || 'пусто'}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Попробуйте ввести:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• +7 (999) 123-45-67 - Россия</li>
              <li>• +380 (99) 123-45-67 - Украина</li>
              <li>• +1 (555) 123-4567 - США</li>
              <li>• +49 30 12345678 - Германия</li>
              <li>• +33 1 23 45 67 89 - Франция</li>
              <li>• +44 20 1234 5678 - Великобритания</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
