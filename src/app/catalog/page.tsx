import { Suspense } from 'react'
import { Metadata } from 'next'
import { CatalogContentOptimized } from '@/components/catalog/CatalogContentOptimized'
import { CatalogPageSkeleton } from '@/components/catalog/SkeletonLoader'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Каталог специалистов | Aura — Найдите своего эксперта',
  description: 'Каталог проверенных специалистов: психологи, коучи, тренеры, нутрициологи. Онлайн и очные консультации. Верифицированные эксперты с опытом работы.',
  keywords: [
    'специалисты',
    'психологи', 
    'коучи',
    'тренеры',
    'нутрициологи',
    'каталог специалистов',
    'онлайн консультации',
    'верифицированные эксперты',
    'поиск специалиста',
    'консультанты по здоровью'
  ].join(', '),
  openGraph: {
    title: 'Каталог специалистов | Aura',
    description: 'Найдите проверенного специалиста для решения ваших задач. Психологи, коучи, тренеры и другие эксперты.',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://aura.ru/catalog',
    siteName: 'Aura',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Каталог специалистов | Aura',
    description: 'Найдите проверенного специалиста для решения ваших задач.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://aura.ru/catalog',
  },
}

export default function CatalogPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Каталог специалистов Aura",
    "description": "Каталог проверенных специалистов: психологи, коучи, тренеры, нутрициологи",
    "url": "https://aura.ru/catalog",
    "numberOfItems": "множество",
    "itemListElement": {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Service",
        "name": "Консультации специалистов",
        "description": "Онлайн и очные консультации с верифицированными экспертами",
        "provider": {
          "@type": "Organization",
          "name": "Aura",
          "url": "https://aura.ru"
        }
      }
    }
  }

  return (
    <>
      {/* Структурированные данные для SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
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
          
          <ErrorBoundary>
            <Suspense fallback={<CatalogPageSkeleton />}>
              <CatalogContentOptimized />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </>
  )
}
