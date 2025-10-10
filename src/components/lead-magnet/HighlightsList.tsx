/**
 * Список "Что внутри" для лид-магнита
 */

'use client'

interface HighlightsListProps {
  items: string[]
}

export function HighlightsList({ items }: HighlightsListProps) {
  if (!items || items.length === 0) return null

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Что внутри:</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

