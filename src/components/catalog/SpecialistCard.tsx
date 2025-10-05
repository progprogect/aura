'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Specialist } from './CatalogContent'

interface SpecialistCardProps {
  specialist: Specialist
}

export function SpecialistCard({ specialist }: SpecialistCardProps) {
  const [imageError, setImageError] = useState(false)
  
  // Получение эмодзи для категории
  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      psychology: '🧠',
      fitness: '💪',
      nutrition: '🥗',
      massage: '🤲',
      wellness: '🧘',
      coaching: '💼',
      medicine: '⚕️',
      other: '👨‍⚕️',
    }
    return emojiMap[category] || '👨‍⚕️'
  }
  
  // Форматирование цены
  const formatPrice = () => {
    if (!specialist.priceFrom) return null
    
    const from = Math.round(specialist.priceFrom / 100)
    const to = specialist.priceTo ? Math.round(specialist.priceTo / 100) : null
    
    if (to && to !== from) {
      return `${from} - ${to}₽`
    }
    return `${from}₽`
  }
  
  // Форматирование опыта
  const formatExperience = () => {
    if (!specialist.yearsOfPractice) return null
    
    const years = specialist.yearsOfPractice
    if (years === 1) return '1 год'
    if (years < 5) return `${years} года`
    return `${years} лет`
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link href={`/specialist/${specialist.slug}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
          {/* Фото специалиста */}
          <div className="relative h-48 bg-gray-100">
            {specialist.avatar && !imageError ? (
              <Image
                src={specialist.avatar}
                alt={`${specialist.fullName} фото`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-6xl text-gray-400">
                  {getCategoryEmoji(specialist.category)}
                </div>
              </div>
            )}
            
            {/* Verified badge */}
            {specialist.verified && (
              <div className="absolute top-3 right-3">
                <div className="bg-blue-500 rounded-full p-1.5 shadow-lg">
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          {/* Информация о специалисте */}
          <div className="p-4">
            {/* Имя и категория */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                {specialist.fullName}
              </h3>
              {specialist.verified && (
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Категория с эмодзи */}
            <div className="flex items-center gap-1 mb-2">
              <span className="text-lg">{getCategoryEmoji(specialist.category)}</span>
              <span className="text-sm text-gray-600 capitalize">
                {specialist.category === 'psychology' && 'Психология'}
                {specialist.category === 'fitness' && 'Фитнес'}
                {specialist.category === 'nutrition' && 'Питание'}
                {specialist.category === 'massage' && 'Массаж'}
                {specialist.category === 'wellness' && 'Велнес'}
                {specialist.category === 'coaching' && 'Коучинг'}
                {specialist.category === 'medicine' && 'Медицина'}
                {specialist.category === 'other' && 'Другое'}
              </span>
            </div>
            
            {/* Специализации */}
            {specialist.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {specialist.specializations.slice(0, 2).map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {spec}
                  </span>
                ))}
                {specialist.specializations.length > 2 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{specialist.specializations.length - 2}
                  </span>
                )}
              </div>
            )}
            
            {/* Описание */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {specialist.shortAbout}
            </p>
            
            {/* Дополнительная информация */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                {formatExperience() && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatExperience()}
                  </span>
                )}
                
                {specialist.city && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {specialist.city}
                  </span>
                )}
              </div>
              
              {formatPrice() && (
                <span className="font-medium text-gray-900">
                  {formatPrice()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
