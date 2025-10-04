'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface SpecialistVideoProps {
  videoUrl?: string | null
}

export function SpecialistVideo({ videoUrl }: SpecialistVideoProps) {
  if (!videoUrl) {
    return null
  }

  // Извлекаем ID видео из URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getYouTubeId(videoUrl)

  if (!videoId) {
    return null
  }

  return (
    <motion.div
      id="video"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            🎬 Видео-презентация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-lg" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Видео-презентация"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}



