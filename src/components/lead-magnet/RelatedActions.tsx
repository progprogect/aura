/**
 * Контекстные действия на детальной странице лид-магнита
 * "Другие материалы" + "Готовы к консультации?"
 */

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { LeadMagnetCard } from './LeadMagnetCard'
import type { LeadMagnetUI } from '@/types/lead-magnet'

interface RelatedActionsProps {
  otherLeadMagnets: LeadMagnetUI[]
  specialistSlug: string
  specialistName: string
}

export function RelatedActions({ 
  otherLeadMagnets, 
  specialistSlug, 
  specialistName 
}: RelatedActionsProps) {
  // Показываем только первые 3 других материала
  const limitedMagnets = otherLeadMagnets.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Другие материалы от специалиста */}
      {limitedMagnets.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Другие материалы от {specialistName.split(' ')[0]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {limitedMagnets.map((magnet, index) => (
              <LeadMagnetCard
                key={magnet.id}
                leadMagnet={magnet}
                specialistSlug={specialistSlug}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Призыв к консультации (консистентный стиль) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="bg-gray-50 rounded-xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Готовы к консультации?
        </h3>
        
        <p className="text-gray-600 mb-4">
          Получите персональную помощь от {specialistName}
        </p>
        
        <Link
          href={`/specialist/${specialistSlug}#contact`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200 group"
        >
          <span>Связаться с {specialistName.split(' ')[0]}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </motion.section>
    </div>
  )
}
