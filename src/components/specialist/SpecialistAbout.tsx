'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InlineTextarea } from './edit/InlineTextarea'

export interface SpecialistAboutProps {
  about: string
  isEditMode?: boolean
  onSave?: (field: string, value: string) => Promise<any>
}

export function SpecialistAbout({ about, isEditMode = false, onSave }: SpecialistAboutProps) {
  // Разбиваем текст на абзацы (только в режиме просмотра)
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
        <CardContent className="pt-6">
          {isEditMode && onSave ? (
            <InlineTextarea
              value={about}
              field="about"
              onSave={onSave}
              isEditMode={isEditMode}
              placeholder="Расскажите о вашем опыте, методах работы, с какими запросами работаете..."
              minRows={6}
              label="Подробное описание"
            />
          ) : (
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
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}



