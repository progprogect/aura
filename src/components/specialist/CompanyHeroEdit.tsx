/**
 * Редактируемая версия Hero секции для компаний
 * Показывается в режиме редактирования
 */

'use client'

import { InlineInput } from './edit/InlineInput'
import { InlineTagsEditor } from './edit/InlineTagsEditor'
import { AvatarUploader } from './edit/AvatarUploader'
import { CategorySelector } from './edit/CategorySelector'
import { AddressInput } from '../specialist/onboarding/AddressInput'
import { useState } from 'react'

interface CompanyHeroEditProps {
  companyName: string | null
  firstName: string | null // Контактное лицо
  lastName: string | null // Контактное лицо
  avatar: string | null
  category: string
  tagline: string | null
  address: string | null
  addressCoordinates: { lat: number; lng: number } | null
  taxId: string | null
  website: string | null
  specializations: string[]
  onSaveField: (field: string, value: string | number | { lat: number; lng: number } | null) => Promise<any>
  onSaveArray: (field: string, values: string[]) => Promise<any>
  onRefresh: () => void
}

export function CompanyHeroEdit({
  companyName,
  firstName,
  lastName,
  avatar,
  category,
  tagline,
  address,
  addressCoordinates,
  taxId,
  website,
  specializations,
  onSaveField,
  onSaveArray,
  onRefresh
}: CompanyHeroEditProps) {
  const [localAddress, setLocalAddress] = useState(address || '')
  const [localCoordinates, setLocalCoordinates] = useState<{ lat: number; lng: number } | null>(addressCoordinates)

  const handleAddressChange = async (newAddress: string, coordinates?: { lat: number; lng: number }) => {
    setLocalAddress(newAddress)
    setLocalCoordinates(coordinates || null)
    
    // Сохраняем адрес
    await onSaveField('address', newAddress)
    
    // Сохраняем координаты
    if (coordinates) {
      await onSaveField('addressCoordinates', coordinates)
    } else {
      await onSaveField('addressCoordinates', null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Пояснительный блок */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl mt-0.5">ℹ️</div>
          <div className="flex-1 text-sm text-blue-900">
            <p className="font-semibold mb-2">Основная информация компании:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• <strong>Логотип и название</strong> - первое впечатление о вашей компании</li>
              <li>• <strong>Категория</strong> - основное направление работы</li>
              <li>• <strong>Ключевые специализации</strong> - 3-5 главных направлений для поиска</li>
              <li>• <strong>Адрес</strong> - будет отображаться на карте в профиле</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Аватар */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">Логотип компании</label>
        <AvatarUploader
          currentAvatar={avatar}
          onUploadSuccess={onRefresh}
        />
      </div>

      {/* Название компании */}
      <InlineInput
        value={companyName || ''}
        field="companyName"
        onSave={onSaveField}
        isEditMode={true}
        placeholder="ООО 'Название компании'"
        label="Название компании"
        maxLength={200}
      />

      {/* Контактное лицо */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">Контактное лицо</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InlineInput
            value={firstName || ''}
            field="firstName"
            onSave={onSaveField}
            isEditMode={true}
            placeholder="Имя контактного лица"
            label="Имя"
          />
          
          <InlineInput
            value={lastName || ''}
            field="lastName"
            onSave={onSaveField}
            isEditMode={true}
            placeholder="Фамилия контактного лица"
            label="Фамилия"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Имя и фамилия контактного лица для связи с клиентами
        </p>
      </div>

      {/* Категория */}
      <CategorySelector
        value={category}
        onSave={onSaveField}
        onRefresh={onRefresh}
        label="Категория"
      />

      {/* Слоган */}
      <InlineInput
        value={tagline || ''}
        field="tagline"
        onSave={onSaveField}
        isEditMode={true}
        placeholder="Краткий слоган компании (1-2 предложения)"
        label="Слоган"
        maxLength={200}
      />

      {/* Адрес */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">
          Адрес компании <span className="text-red-500">*</span>
        </label>
        <AddressInput
          value={localAddress}
          coordinates={localCoordinates}
          onChange={handleAddressChange}
          placeholder="Введите адрес компании"
        />
        <p className="text-xs text-gray-500 mt-2">
          Адрес будет отображаться на карте в профиле компании
        </p>
      </div>

      {/* УНП/ИНН */}
      <InlineInput
        value={taxId || ''}
        field="taxId"
        onSave={onSaveField}
        isEditMode={true}
        placeholder="Введите УНП или ИНН"
        label="УНП/ИНН"
        maxLength={50}
      />

      {/* Сайт */}
      <InlineInput
        value={website || ''}
        field="website"
        onSave={onSaveField}
        isEditMode={true}
        placeholder="https://www.yourcompany.com"
        label="Сайт компании"
        type="url"
      />

      {/* Специализации */}
      <InlineTagsEditor
        values={specializations}
        field="specializations"
        onSave={onSaveArray}
        isEditMode={true}
        placeholder="Например: Корпоративное обучение"
        maxTags={5}
        label="Специализации"
      />
    </div>
  )
}

