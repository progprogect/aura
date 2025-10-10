'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LeadMagnet } from '@/types/lead-magnet'

interface ServicePreviewProps {
  leadMagnet: Pick<LeadMagnet, 'title' | 'description' | 'emoji' | 'highlights'>
  className?: string
}

export function ServicePreview({ leadMagnet, className }: ServicePreviewProps) {
  return (
    <div className={cn(
      "w-full h-full bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6 flex flex-col",
      className
    )}>
      {/* Заголовок с иконкой */}
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl text-white">{leadMagnet.emoji || '💼'}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {leadMagnet.title}
        </h3>
        {leadMagnet.description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {leadMagnet.description}
          </p>
        )}
      </div>

      {/* Highlights если есть */}
      {leadMagnet.highlights && leadMagnet.highlights.length > 0 && (
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Что включает:
          </h4>
          <ul className="space-y-1">
            {leadMagnet.highlights.slice(0, 3).map((highlight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-2 text-xs text-gray-700"
              >
                <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <span>{highlight}</span>
              </motion.li>
            ))}
            {leadMagnet.highlights.length > 3 && (
              <li className="text-xs text-gray-500 ml-6">
                и ещё {leadMagnet.highlights.length - 3} пункт{leadMagnet.highlights.length === 4 ? '' : 'ов'}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* CTA подсказка */}
      <div className="mt-4 text-center">
        <div className="text-xs text-green-600 font-medium">
          Нажмите &quot;Записаться на консультацию&quot; ниже
        </div>
      </div>
    </div>
  )
}
