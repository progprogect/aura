'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface SpecialistAboutProps {
  about: string
}

export function SpecialistAbout({ about }: SpecialistAboutProps) {
  // Разбиваем текст на абзацы
  const paragraphs = about.split('\n\n').filter(Boolean)

  return (
    <motion.div
      id="about"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            💼 О себе
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="leading-relaxed text-gray-700"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}



