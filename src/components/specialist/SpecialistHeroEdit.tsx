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
      {/* Пояснительный блок */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-purple-600 text-xl mt-0.5">ℹ️</div>
          <div className="flex-1 text-sm text-purple-900">
            <p className="font-semibold mb-2">Основная информация профиля:</p>
            <ul className="space-y-1 text-purple-800">
              <li>• <strong>Фото и имя</strong> - первое впечатление о вас</li>
              <li>• <strong>Категория</strong> - основное направление работы (психология, фитнес, питание и т.д.)</li>
              <li>• <strong>Ключевые специализации</strong> - 3-5 главных навыков для поиска</li>
            </ul>
          </div>
        </div>
      </div>

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

