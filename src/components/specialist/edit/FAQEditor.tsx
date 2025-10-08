/**
 * Редактор FAQ (часто задаваемые вопросы)
 */

'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface FAQ {
  id: string
  question: string
  answer: string
}

interface FAQEditorProps {
  faqs: FAQ[]
  onRefresh: () => void
}

export function FAQEditor({ faqs, onRefresh }: FAQEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/specialist/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
        }),
      })

      if (response.ok) {
        setNewQuestion('')
        setNewAnswer('')
        setIsAdding(false)
        onRefresh()
      } else {
        alert('Ошибка при добавлении вопроса')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка при добавлении вопроса')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот вопрос?')) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/specialist/faqs/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRefresh()
      } else {
        alert('Ошибка при удалении вопроса')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка при удалении вопроса')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Существующие FAQ */}
      {faqs.length > 0 && (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-50 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm mb-2">
                    {faq.question}
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(faq.id)}
                    disabled={isSaving}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Форма добавления */}
      {isAdding ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Вопрос
            </label>
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Например: Как проходит первая консультация?"
              maxLength={200}
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500">
              {newQuestion.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Ответ
            </label>
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Подробный ответ на вопрос..."
              rows={4}
              maxLength={1000}
              disabled={isSaving}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {newAnswer.length}/1000
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={isSaving || !newQuestion.trim() || !newAnswer.trim()}
              className="flex items-center gap-2"
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Добавить
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false)
                setNewQuestion('')
                setNewAnswer('')
              }}
              disabled={isSaving}
              variant="outline"
              size="sm"
            >
              Отмена
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          variant="outline"
          className="w-full border-dashed border-2 hover:border-blue-400 hover:bg-blue-50"
          size="lg"
        >
          <Plus size={18} className="mr-2" />
          Добавить вопрос
        </Button>
      )}

      {/* Подсказка */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          💡 <strong>FAQ помогает клиентам</strong> получить ответы на частые вопросы 
          без необходимости связываться с вами. Это экономит ваше время и повышает доверие.
        </p>
      </div>
    </div>
  )
}

