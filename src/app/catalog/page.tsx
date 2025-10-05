import { Suspense } from 'react'
import { Metadata } from 'next'
import { CatalogContent } from '@/components/catalog/CatalogContent'

export const metadata: Metadata = {
  title: 'Каталог специалистов | Aura',
  description: 'Найдите подходящего специалиста для решения ваших задач. Психологи, коучи, тренеры и другие эксперты.',
  keywords: 'специалисты, психологи, коучи, тренеры, каталог, поиск',
}

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Каталог специалистов
          </h1>
          <p className="text-gray-600">
            Найдите эксперта, который поможет решить ваши задачи
          </p>
        </div>
        
        <Suspense fallback={<div>Загрузка...</div>}>
          <CatalogContent />
        </Suspense>
      </div>
    </div>
  )
}
