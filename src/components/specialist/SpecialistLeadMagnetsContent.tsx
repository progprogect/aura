/**
 * Базовый компонент лид-магнитов без заголовка
 * Используется внутри Section для композиции
 */

'use client'

import { motion } from 'framer-motion'
import { LeadMagnetCard } from '@/components/lead-magnet/LeadMagnetCard'
import type { LeadMagnetUI } from '@/types/lead-magnet'

export interface SpecialistLeadMagnetsContentProps {
  leadMagnets: LeadMagnetUI[]
  specialistSlug: string
  specialistName: string
}

export function SpecialistLeadMagnetsContent({
  leadMagnets,
  specialistSlug,
  specialistName,
}: SpecialistLeadMagnetsContentProps) {
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
      {/* Сетка карточек (квадратные карточки с оптимальным gap) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {validLeadMagnets.map((magnet, index) => (
          <motion.div
            key={magnet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LeadMagnetCard
              leadMagnet={magnet}
              specialistSlug={specialistSlug}
              index={index}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

