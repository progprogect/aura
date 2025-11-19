'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SmartPreview } from './SmartPreview'
import { SlideContent } from './SlideContent'
import type { LeadMagnet } from '@/types/lead-magnet'

interface LeadMagnetSlideProps {
  leadMagnet: LeadMagnet
  specialistId: string
  specialistSlug: string
  specialistName: string
  hasPurchased?: boolean
  className?: string
}

export function LeadMagnetSlide({ 
  leadMagnet, 
  specialistId, 
  specialistSlug, 
  specialistName,
  hasPurchased = false,
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
                 <SmartPreview 
                   leadMagnet={leadMagnet} 
                   specialistId={specialistId}
                   specialistName={specialistName}
                   hasPurchased={hasPurchased}
                 />
          
          {/* Контент с интегрированной кнопкой */}
          <SlideContent 
            leadMagnet={leadMagnet}
            specialistId={specialistId}
            specialistName={specialistName}
            hasPurchased={hasPurchased}
          />
        </div>

        {/* Tablet: горизонтальная сетка 50/50 */}
        <div className="hidden md:block lg:hidden space-y-12">
          {/* Превью + контент с интегрированной кнопкой */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <SmartPreview 
                   leadMagnet={leadMagnet} 
                   specialistId={specialistId}
                   specialistName={specialistName}
                   hasPurchased={hasPurchased}
                 />
            <SlideContent 
              leadMagnet={leadMagnet}
              specialistId={specialistId}
              specialistName={specialistName}
              hasPurchased={hasPurchased}
            />
          </div>
        </div>

        {/* Desktop: широкий макет с превью 40% + контент 60% */}
        <div className="hidden lg:block">
          {/* Превью + контент с интегрированной кнопкой */}
          <div className="grid grid-cols-12 gap-12">
            {/* Превью - 5 колонок (40%) */}
            <div className="col-span-5">
                 <SmartPreview 
                   leadMagnet={leadMagnet} 
                   specialistId={specialistId}
                   specialistName={specialistName}
                   hasPurchased={hasPurchased}
                 />
            </div>
            
            {/* Контент с интегрированной кнопкой - 7 колонок (60%) */}
            <div className="col-span-7">
              <SlideContent 
                leadMagnet={leadMagnet}
                specialistId={specialistId}
                specialistName={specialistName}
                hasPurchased={hasPurchased}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
