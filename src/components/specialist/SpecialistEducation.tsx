'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface Education {
  id: string
  institution: string
  degree: string
  year: number
  description?: string | null
}

export interface Certificate {
  id: string
  title: string
  organization: string
  year: number
  fileUrl?: string | null
}

export interface SpecialistEducationProps {
  education: Education[]
  certificates: Certificate[]
}

export function SpecialistEducation({ education, certificates }: SpecialistEducationProps) {
  if (education.length === 0 && certificates.length === 0) {
    return null
  }

  return (
    <motion.div
      id="education"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            🎓 Образование и квалификации
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Образование */}
          {education.length > 0 && (
            <div>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <GraduationCap className="h-4 w-4" />
                Образование
              </h4>
              <div className="space-y-4">
                {education.map(edu => (
                  <div key={edu.id} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                      <GraduationCap className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{edu.institution}</div>
                      <div className="text-sm text-gray-600">{edu.degree}</div>
                      {edu.description && (
                        <div className="mt-1 text-sm text-gray-500">{edu.description}</div>
                      )}
                      <div className="mt-1 text-xs text-gray-400">{edu.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Сертификаты */}
          {certificates.length > 0 && (
            <div>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Award className="h-4 w-4" />
                Сертификаты
              </h4>
              <div className="space-y-4">
                {certificates.map(cert => (
                  <div key={cert.id} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{cert.title}</div>
                      <div className="text-sm text-gray-600">{cert.organization}</div>
                      <div className="mt-1 text-xs text-gray-400">{cert.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}



