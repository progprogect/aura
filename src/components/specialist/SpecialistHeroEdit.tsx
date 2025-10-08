/**
 * Редактируемая версия Hero секции
 * Показывается в режиме редактирования
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { InlineInput } from './edit/InlineInput'
import { InlineTagsEditor } from './edit/InlineTagsEditor'
import { AvatarUploader } from './edit/AvatarUploader'

interface SpecialistHeroEditProps {
  firstName: string
  lastName: string
  avatar: string | null
  tagline: string | null
  city: string | null
  specializations: string[]
  onSaveField: (field: string, value: string | number) => Promise<any>
  onSaveArray: (field: string, values: string[]) => Promise<any>
  onRefresh: () => void
}

export function SpecialistHeroEdit({
  firstName,
  lastName,
  avatar,
  tagline,
  city,
  specializations,
  onSaveField,
  onSaveArray,
  onRefresh
}: SpecialistHeroEditProps) {
  return (
    <div className="bg-blue-50 border-t-4 border-blue-600 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900">
                Редактирование профиля
              </h3>
            </div>

            {/* Аватар */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Фото профиля</h4>
              <AvatarUploader
                currentAvatar={avatar}
                onUploadSuccess={onRefresh}
              />
            </div>

            {/* Имя и Фамилия */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InlineInput
                value={firstName}
                field="firstName"
                onSave={onSaveField}
                isEditMode={true}
                placeholder="Александр"
                label="Имя"
              />
              
              <InlineInput
                value={lastName}
                field="lastName"
                onSave={onSaveField}
                isEditMode={true}
                placeholder="Морозов"
                label="Фамилия"
              />
            </div>

            {/* Слоган */}
            <InlineInput
              value={tagline || ''}
              field="tagline"
              onSave={onSaveField}
              isEditMode={true}
              placeholder="Краткий слоган (1-2 предложения)"
              label="Слоган"
              maxLength={200}
            />

            {/* Город */}
            <InlineInput
              value={city || ''}
              field="city"
              onSave={onSaveField}
              isEditMode={true}
              placeholder="Москва"
              label="Город"
            />

            {/* Специализации */}
            <InlineTagsEditor
              values={specializations}
              field="specializations"
              onSave={onSaveArray}
              isEditMode={true}
              placeholder="Например: КПТ-терапия"
              maxTags={5}
              label="Специализации"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

