/**
 * Редактируемая версия Hero секции
 * Показывается в режиме редактирования
 */

'use client'

import { InlineInput } from './edit/InlineInput'
import { InlineTagsEditor } from './edit/InlineTagsEditor'
import { AvatarUploader } from './edit/AvatarUploader'
import { CategorySelector } from './edit/CategorySelector'

interface SpecialistHeroEditProps {
  firstName: string
  lastName: string
  avatar: string | null
  category: string
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
  category,
  tagline,
  city,
  specializations,
  onSaveField,
  onSaveArray,
  onRefresh
}: SpecialistHeroEditProps) {
  return (
    <div className="space-y-6">
      {/* Аватар */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">Фото профиля</label>
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

      {/* Категория */}
      <CategorySelector
        value={category}
        onSave={onSaveField}
        label="Категория"
      />

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
    </div>
  )
}

