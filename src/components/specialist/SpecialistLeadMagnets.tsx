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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Заголовок */}
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          🎁 Бесплатные материалы
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Полезные ресурсы от {specialistName.split(' ')[0]}
        </p>
      </div>

      {/* Сетка карточек */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

