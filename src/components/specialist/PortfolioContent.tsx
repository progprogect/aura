/**
 * Отображение портфолио для клиентов
 * Адаптивное: горизонтальный скролл на мобилке, grid на десктопе
 * С lightbox для полноэкранного просмотра
 */

'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Video } from 'lucide-react'

export interface PortfolioItem {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnailUrl?: string | null
  title: string
  description?: string | null
}

export interface PortfolioContentProps {
  items: PortfolioItem[]
}

export function PortfolioContent({ items }: PortfolioContentProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const [imageErrors, setImageErrors] = React.useState<Set<string>>(new Set())

  const openLightbox = React.useCallback((index: number) => {
    setSelectedIndex(index)
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = React.useCallback(() => {
    setIsOpen(false)
    setSelectedIndex(null)
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

  const currentItem = selectedIndex !== null ? items[selectedIndex] : null

  return (
    <>
      <motion.div
        id="portfolio"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Мобильный: Горизонтальный скролл */}
        <div className="md:hidden -mx-4 sm:-mx-6">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-4 sm:px-6">
            {items.map((item, index) => {
              const imageUrl = item.thumbnailUrl || item.url
              const hasError = imageErrors.has(item.id)
              
              const normalizedUrl = imageUrl?.startsWith('http') 
                ? imageUrl 
                : imageUrl?.startsWith('/') 
                  ? imageUrl 
                  : imageUrl

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="w-[calc(100vw-2rem)] min-w-[280px] max-w-[320px] snap-start flex-shrink-0 cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Превью */}
                    <div className="relative aspect-video bg-gray-100">
                      {!hasError && normalizedUrl && item.type === 'photo' ? (
                        <Image
                          src={normalizedUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 280px, 320px"
                          className="object-cover"
                          onError={() => {
                            setImageErrors(prev => new Set(prev).add(item.id))
                          }}
                          unoptimized={normalizedUrl.startsWith('http')}
                        />
                      ) : item.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          {item.thumbnailUrl ? (
                            <Image
                              src={item.thumbnailUrl}
                              alt={item.title}
                              fill
                              sizes="(max-width: 640px) 280px, 320px"
                              className="object-cover"
                              unoptimized={item.thumbnailUrl.startsWith('http')}
                            />
                          ) : (
                            <Video className="w-12 h-12 text-white opacity-50" />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <span className="text-4xl">🖼️</span>
                        </div>
                      )}
                    </div>
                    {/* Информация */}
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Десктоп: Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => {
            const imageUrl = item.thumbnailUrl || item.url
            const hasError = imageErrors.has(item.id)
            
            const normalizedUrl = imageUrl?.startsWith('http') 
              ? imageUrl 
              : imageUrl?.startsWith('/') 
                ? imageUrl 
                : imageUrl

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                {/* Превью */}
                <div className="relative aspect-video bg-gray-100">
                  {!hasError && normalizedUrl && item.type === 'photo' ? (
                    <>
                      <Image
                        src={normalizedUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => {
                          setImageErrors(prev => new Set(prev).add(item.id))
                        }}
                        unoptimized={normalizedUrl.startsWith('http')}
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                    </>
                  ) : item.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      {item.thumbnailUrl ? (
                        <>
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.title}
                            fill
                            sizes="(max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                            unoptimized={item.thumbnailUrl.startsWith('http')}
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Video className="w-12 h-12 text-white opacity-80" />
                          </div>
                        </>
                      ) : (
                        <Video className="w-12 h-12 text-white opacity-50" />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span className="text-4xl">🖼️</span>
                    </div>
                  )}
                </div>
                {/* Информация */}
                <div className="p-4">
                  <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && selectedIndex !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={closeLightbox}
          >
            <button
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </button>

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

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {currentItem.type === 'photo' ? (
                <img
                  src={currentItem.url}
                  alt={currentItem.title}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />
              ) : (
                <video
                  src={currentItem.url}
                  controls
                  className="max-h-[90vh] max-w-[90vw]"
                >
                  Ваш браузер не поддерживает видео.
                </video>
              )}

              {/* Информация о работе */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">{currentItem.title}</h3>
                {currentItem.description && (
                  <p className="text-sm text-gray-200">{currentItem.description}</p>
                )}
              </div>

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

