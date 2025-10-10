/**
 * Отображение лид-магнитов в профиле специалиста (упрощенная версия)
 */

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            🎁 Бесплатные материалы
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Полезные ресурсы от {specialistName.split(' ')[0]}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {validLeadMagnets.map((magnet, index) => {
                const href = `/specialist/${specialistSlug}/resources/${magnet.slug}`
                
                return (
                  <motion.div
                    key={magnet.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      href={href}
                      className="block border border-gray-200 rounded-lg p-4 hover:shadow-sm hover:border-gray-300 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{magnet.emoji}</span>
                        <h3 className="font-medium text-gray-900 text-sm group-hover:text-gray-700 flex-1">
                          {magnet.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {magnet.description}
                      </p>
                    </Link>
                  </motion.div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

