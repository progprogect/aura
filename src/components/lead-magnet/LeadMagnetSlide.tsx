'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SmartPreview } from './SmartPreview'
import { SlideContent } from './SlideContent'
import { SlideCTA } from './SlideCTA'
import type { LeadMagnet } from '@/types/lead-magnet'

interface LeadMagnetSlideProps {
  leadMagnet: LeadMagnet
  specialistId: string
  specialistSlug: string
  specialistName: string
  className?: string
}

export function LeadMagnetSlide({ 
  leadMagnet, 
  specialistId, 
  specialistSlug, 
  specialistName, 
  className 
}: LeadMagnetSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "w-full max-w-7xl mx-auto",
        className
      )}
    >
      {/* Минималистичный контейнер без лишних рамок */}
      <div className="space-y-8 md:space-y-12 lg:space-y-16">
        {/* Mobile: вертикальная стопка */}
        <div className="block md:hidden space-y-8">
          {/* Превью */}
          <SmartPreview leadMagnet={leadMagnet} />
          
          {/* Контент */}
          <SlideContent leadMagnet={leadMagnet} />
          
          {/* CTA */}
          <SlideCTA
            leadMagnet={leadMagnet}
            specialistId={specialistId}
            specialistSlug={specialistSlug}
            specialistName={specialistName}
          />
        </div>

        {/* Tablet: горизонтальная сетка 50/50 */}
        <div className="hidden md:block lg:hidden space-y-12">
          {/* Верхняя часть: превью + контент */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SmartPreview leadMagnet={leadMagnet} />
            <SlideContent leadMagnet={leadMagnet} />
          </div>
          
          {/* Нижняя часть: CTA */}
          <SlideCTA
            leadMagnet={leadMagnet}
            specialistId={specialistId}
            specialistSlug={specialistSlug}
            specialistName={specialistName}
          />
        </div>

        {/* Desktop: широкий макет с превью 40% + контент 60% */}
        <div className="hidden lg:block">
          {/* Верхняя часть: превью + контент */}
          <div className="grid grid-cols-12 gap-12 mb-16">
            {/* Превью - 5 колонок (40%) */}
            <div className="col-span-5">
              <SmartPreview leadMagnet={leadMagnet} />
            </div>
            
            {/* Контент - 7 колонок (60%) */}
            <div className="col-span-7">
              <SlideContent leadMagnet={leadMagnet} />
            </div>
          </div>
          
          {/* Нижняя часть: CTA */}
          <SlideCTA
            leadMagnet={leadMagnet}
            specialistId={specialistId}
            specialistSlug={specialistSlug}
            specialistName={specialistName}
          />
        </div>
      </div>
    </motion.div>
  )
}
