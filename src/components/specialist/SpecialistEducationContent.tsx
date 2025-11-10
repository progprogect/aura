/**
 * Базовый компонент образования без заголовка и обертки
 * Используется внутри Section для композиции
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Award, Plus, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EducationModal } from './edit/EducationModal'
import { CertificateModal } from './edit/CertificateModal'

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

export interface SpecialistEducationContentProps {
  education: Education[]
  certificates: Certificate[]
  isEditMode?: boolean
  onRefresh?: () => void
}

export function SpecialistEducationContent({ 
  education, 
  certificates, 
  isEditMode = false,
  onRefresh,
}: SpecialistEducationContentProps) {
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false)
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)
  const [editingEducation, setEditingEducation] = useState<Education | undefined>()
  const [editingCertificate, setEditingCertificate] = useState<Certificate | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (!isEditMode && education.length === 0 && certificates.length === 0) {
    return null
  }

  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Удалить образование?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/specialist/education/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success && onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteCertificate = async (id: string) => {
    if (!confirm('Удалить сертификат?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/specialist/certificates/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success && onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveSuccess = () => {
    if (onRefresh) {
      onRefresh()
    }
    setEditingEducation(undefined)
    setEditingCertificate(undefined)
  }

  return (
    <motion.div
      id="education"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="space-y-8"
    >
      {/* Образование */}
      {(education.length > 0 || isEditMode) && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <GraduationCap className="h-4 w-4" />
              Образование
            </h4>
            {isEditMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingEducation(undefined)
                  setIsEducationModalOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus size={14} />
                Добавить
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {education.length === 0 && isEditMode ? (
              <p className="text-sm text-gray-500 italic">
                Образование не добавлено. Нажмите &quot;Добавить&quot; для заполнения.
              </p>
            ) : (
              education.map(edu => (
                <div key={edu.id} className={`flex gap-3 ${isEditMode ? 'group' : ''}`}>
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
                  {isEditMode && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingEducation(edu)
                          setIsEducationModalOpen(true)
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Редактировать"
                      >
                        <Edit2 size={14} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        disabled={deletingId === edu.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Удалить"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Сертификаты */}
      {(certificates.length > 0 || isEditMode) && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Award className="h-4 w-4" />
              Сертификаты
            </h4>
            {isEditMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingCertificate(undefined)
                  setIsCertificateModalOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus size={14} />
                Добавить
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {certificates.length === 0 && isEditMode ? (
              <p className="text-sm text-gray-500 italic">
                Сертификаты не добавлены. Нажмите &quot;Добавить&quot; для заполнения.
              </p>
            ) : (
              certificates.map(cert => (
                <div key={cert.id} className={`flex gap-3 ${isEditMode ? 'group' : ''}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{cert.title}</div>
                    <div className="text-sm text-gray-600">{cert.organization}</div>
                    <div className="mt-1 text-xs text-gray-400">{cert.year}</div>
                  </div>
                  {isEditMode && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingCertificate(cert)
                          setIsCertificateModalOpen(true)
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Редактировать"
                      >
                        <Edit2 size={14} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteCertificate(cert.id)}
                        disabled={deletingId === cert.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Удалить"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Модальные окна */}
      <EducationModal
        isOpen={isEducationModalOpen}
        onClose={() => {
          setIsEducationModalOpen(false)
          setEditingEducation(undefined)
        }}
        education={editingEducation}
        onSave={handleSaveSuccess}
      />

      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => {
          setIsCertificateModalOpen(false)
          setEditingCertificate(undefined)
        }}
        certificate={editingCertificate}
        onSave={handleSaveSuccess}
      />
    </motion.div>
  )
}

