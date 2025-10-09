'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Eye, CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { cn, formatNumber } from '@/lib/utils'
import { WORK_FORMAT_LABELS } from '@/lib/constants'
import { ContactsModal } from './ContactsModal'

export interface SpecialistHeroProps {
  firstName: string | null
  lastName: string | null
  avatar?: string | null
  category: string
  categoryEmoji?: string
  categoryName?: string
  specializations: string[]
  tagline?: string | null
  city?: string | null
  country?: string
  workFormats: string[]
  yearsOfPractice?: number | null
  verified: boolean
  profileViews: number
  // Контакты для модального окна
  email?: string | null
  telegram?: string | null
  whatsapp?: string | null
  instagram?: string | null
  website?: string | null
}

export function SpecialistHero({
  firstName,
  lastName,
  avatar,
  category,
  categoryEmoji = '✨',
  categoryName,
  specializations,
  tagline,
  city,
  country,
  workFormats,
  yearsOfPractice,
  verified,
  profileViews,
  email,
  telegram,
  whatsapp,
  instagram,
  website,
}: SpecialistHeroProps) {
  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Специалист'
  const [isContactsModalOpen, setIsContactsModalOpen] = React.useState(false)

  // Скролл к форме связи
  const handleContactClick = () => {
    const contactSection = document.getElementById('contact')
    contactSection?.scrollIntoView({ behavior: 'smooth' })
  }

  // Показать контакты
  const handleShowContactsClick = () => {
    setIsContactsModalOpen(true)
  }

  return (
    <>
      {/* МОБИЛКА: Tinder-style Hero с большим фото */}
      <div className="relative md:hidden">
        {/* Большое фото с градиентом */}
        <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
          {avatar ? (
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              src={avatar}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary-400 to-primary-600" />
          )}
          
          {/* Градиент снизу */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Контент поверх фото */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {/* Имя с галочкой верификации */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold drop-shadow-lg flex items-center gap-2"
            >
              {fullName}
              {verified && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-full bg-blue-500 p-1 shadow-lg"
                >
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </motion.h1>
            
            {/* Специализация, опыт, локация */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/90"
            >
              <span className="font-medium">
                {categoryEmoji} {specializations[0] || 'Специалист'}
              </span>
              {yearsOfPractice && (
                <>
                  <span>·</span>
                  <span>{yearsOfPractice} {yearsOfPractice === 1 ? 'год' : yearsOfPractice < 5 ? 'года' : 'лет'} опыта</span>
                </>
              )}
              {city && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {city}
                  </span>
                </>
              )}
            </motion.div>
            
            {/* Теги специализаций (grid 2 колонки) */}
            {specializations.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 grid grid-cols-2 gap-2"
              >
                {specializations.slice(1, 5).map((spec, index) => (
                  <div
                    key={index}
                    className="rounded-full bg-white/20 px-3 py-1.5 text-center text-xs font-medium backdrop-blur-sm"
                  >
                    {spec}
                  </div>
                ))}
              </motion.div>
            )}
            
            {/* Просмотры */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-3 flex items-center gap-1.5 text-sm text-white/80"
            >
              <Eye className="h-4 w-4" />
              {formatNumber(profileViews)} просмотров
            </motion.div>
          </div>
        </div>
        
        {/* Sticky кнопки действий */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="sticky top-0 z-10 flex gap-3 border-b border-gray-200 bg-white p-4 shadow-sm"
        >
          <Button
            size="lg"
            onClick={handleContactClick}
            className="flex-1 gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Связаться
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleShowContactsClick}
            className="flex-1 gap-2"
          >
            <Phone className="h-4 w-4" />
            Контакты
          </Button>
        </motion.div>
        
        {/* Tagline под кнопками */}
        {tagline && (
          <div className="bg-white px-4 pb-6 pt-2">
            <p className="text-center text-base leading-relaxed text-gray-700">
              {tagline}
            </p>
          </div>
        )}
      </div>

      {/* ДЕСКТОП: Улучшенный Hero без градиента */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative hidden bg-white md:block"
      >
        
        <div className="container mx-auto max-w-5xl px-4 py-8 lg:py-12">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Аватар */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Avatar
                src={avatar || undefined}
                alt={fullName}
                size={140}
                verified={verified}
                fallback={`${firstName?.[0] || '?'}${lastName?.[0] || '?'}`}
                className="md:size-[220px] lg:size-[260px] xl:size-[300px] 2xl:size-[320px]"
              />
            </motion.div>

            {/* Основная информация */}
            <div className="flex-1 text-center md:text-left">
              {/* Имя с галочкой верификации */}
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-semibold text-gray-900 md:text-3xl lg:text-4xl flex items-center gap-3"
              >
                {fullName}
                {verified && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-full bg-blue-500 p-1.5 shadow-md"
                  >
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </motion.div>
                )}
              </motion.h1>

              {/* Специализации и локация */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600 md:justify-start lg:text-base"
              >
                {/* Категория и специализация */}
                <span className="font-medium">
                  {categoryEmoji} {categoryName || 'Специалист'}
                  {specializations[0] && specializations[0] !== categoryName && (
                    <span className="text-gray-500"> • {specializations[0]}</span>
                  )}
                </span>

                {/* Разделитель */}
                <span className="text-gray-400">·</span>

                {/* Локация */}
                {city && (
                  <>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {city}
                    </span>
                    <span className="text-gray-400">·</span>
                  </>
                )}

                {/* Форматы работы */}
                <span className="flex items-center gap-1">
                  {workFormats.map(format => WORK_FORMAT_LABELS[format] || format).join(', ')}
                </span>
              </motion.div>

              {/* Опыт работы */}
              {yearsOfPractice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="mt-1 text-sm text-gray-600 lg:text-base"
                >
                  {yearsOfPractice} {yearsOfPractice === 1 ? 'год' : yearsOfPractice < 5 ? 'года' : 'лет'} опыта
                </motion.div>
              )}

              {/* Tagline */}
              {tagline && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-base leading-relaxed text-gray-700 lg:text-lg"
                >
                  {tagline}
                </motion.p>
              )}

              {/* Просмотры */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 flex flex-wrap items-center justify-center md:justify-start"
              >
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  {formatNumber(profileViews)} просмотров
                </span>
              </motion.div>

              {/* Дополнительные специализации (теги) */}
              {specializations.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start"
                >
                  {specializations.slice(1, 4).map((spec, index) => (
                    <Tag key={index} variant="default">
                      {spec}
                    </Tag>
                  ))}
                </motion.div>
              )}

              {/* Кнопки действий */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start"
              >
                <Button
                  size="lg"
                  onClick={handleContactClick}
                  className="gap-2 shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Связаться
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleShowContactsClick}
                  className="gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Показать контакты
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Модальное окно контактов */}
      <ContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        onContactClick={handleContactClick}
        specialistName={fullName}
        email={email}
        telegram={telegram}
        whatsapp={whatsapp}
        instagram={instagram}
        website={website}
      />
    </>
  )
}
