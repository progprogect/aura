'use client'

import React from 'react'

/**
 * Скелетон для карточки специалиста
 */
export function SpecialistCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Фото специалиста */}
      <div className="h-48 bg-gray-200"></div>
      
      {/* Информация о специалисте */}
      <div className="p-4 space-y-3">
        {/* Имя и категория */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        
        {/* Специализации */}
        <div className="flex space-x-2">
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
          <div className="h-5 bg-gray-200 rounded-full w-20"></div>
        </div>
        
        {/* Описание */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-3/5"></div>
        </div>
        
        {/* Дополнительная информация */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/5"></div>
        </div>
      </div>
    </div>
  )
}

/**
 * Сетка скелетонов для загрузки специалистов
 */
export function SpecialistsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <SpecialistCardSkeleton key={index} />
      ))}
    </div>
  )
}

/**
 * Скелетон для панели фильтров
 */
export function FiltersSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
    </div>
  )
}

/**
 * Скелетон для поисковой строки
 */
export function SearchBarSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
    </div>
  )
}

/**
 * Полный скелетон страницы каталога
 */
export function CatalogPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Заголовок */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Поисковая строка */}
        <SearchBarSkeleton />
        
        {/* Фильтры */}
        <FiltersSkeleton />
        
        {/* Сетка специалистов */}
        <SpecialistsGridSkeleton />
      </div>
    </div>
  )
}
