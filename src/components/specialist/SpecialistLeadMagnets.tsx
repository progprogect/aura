/**
 * Отображение лид-магнитов в профиле специалиста (современный UX 2025)
 * Карточки-превью с визуальным акцентом, без лишних оберток
 */

'use client'

import { motion } from 'framer-motion'
import { LeadMagnetCard } from '@/components/lead-magnet/LeadMagnetCard'
import type { LeadMagnetUI } from '@/types/lead-magnet'

interface SpecialistLeadMagnetsProps {
  leadMagnets: LeadMagnetUI[]
  specialistSlug: string
  specialistName: string
}

export function SpecialistLeadMagnets({
  leadMagnets,
  specialistSlug,
  specialistName,
}: SpecialistLeadMagnetsProps) {
  // Фильтруем только лид-магниты со slug
  const validLeadMagnets = leadMagnets.filter(magnet => magnet.slug && magnet.slug !== '')
  
  // Graceful degradation: если нет валидных лид-магнитов
  if (validLeadMagnets.length === 0) {
    return null
  }

  return (
    <motion.section
      id="lead-magnets"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Заголовок секции */}
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <span className="text-purple-600 text-sm">🎁</span>
        </span>
        <h2 className="text-xl font-semibold text-gray-900">Полезные материалы</h2>
      </div>

      {/* Сетка карточек (квадратные карточки с оптимальным gap) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {validLeadMagnets.map((magnet, index) => (
          <LeadMagnetCard
            key={magnet.id}
            leadMagnet={magnet}
            specialistSlug={specialistSlug}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  )
}

