'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface GalleryItem {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnailUrl?: string | null
  caption?: string | null
}

export interface SpecialistGalleryProps {
  items: GalleryItem[]
}

export function SpecialistGallery({ items }: SpecialistGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const openLightbox = React.useCallback((index: number) => {
    setSelectedIndex(index)
    setIsOpen(true)
    // Блокируем скролл body
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = React.useCallback(() => {
    setIsOpen(false)
    setSelectedIndex(null)
    // Разблокируем скролл
    document.body.style.overflow = ''
  }, [])

  const goToPrevious = React.useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }, [selectedIndex])

  const goToNext = React.useCallback(() => {
    if (selectedIndex !== null && selectedIndex < items.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }, [selectedIndex, items.length])

  // Клавиатурная навигация
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeLightbox, goToPrevious, goToNext])

  if (!items || items.length === 0) {
    return null
  }

  return (
    <>
      <motion.div
        id="gallery"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              🖼 Галерея
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Квадратная сетка 3x3 (Instagram-style) */}
            <div className="grid grid-cols-3 gap-1">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative aspect-square cursor-pointer overflow-hidden"
                  onClick={() => openLightbox(index)}
                >
                  {/* Изображение */}
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={item.caption || `Фото ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 33vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Overlay при hover */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

                  {/* Индикатор видео */}
                  {item.type === 'video' && (
                    <div className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow">
                      <Play className="h-4 w-4 text-gray-900" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={closeLightbox}
          >
            {/* Кнопка закрытия */}
            <button
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Навигация влево */}
            {selectedIndex > 0 && (
              <button
                className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Навигация вправо */}
            {selectedIndex < items.length - 1 && (
              <button
                className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20 md:right-16"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Контент */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={items[selectedIndex].url}
                alt={items[selectedIndex].caption || ''}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />

              {/* Подпись */}
              {items[selectedIndex].caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <p className="text-sm">{items[selectedIndex].caption}</p>
                </div>
              )}

              {/* Счетчик */}
              <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
                {selectedIndex + 1} / {items.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}



