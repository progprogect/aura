import { Suspense } from 'react'
import { Metadata } from 'next'
import { ResourcesContent } from '@/components/resources/ResourcesContent'
import { LoadingSpinner } from '@/components/resources/LoadingSpinner'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Библиотека ресурсов | Эволюция 360 — Полезные материалы от экспертов',
  description: 'Библиотека полезных ресурсов от верифицированных специалистов: файлы, ссылки, услуги. Найдите материалы для вашего развития.',
  keywords: [
    'ресурсы',
    'лид-магниты',
    'материалы',
    'файлы',
    'ссылки',
    'библиотека ресурсов',
    'полезные материалы',
    'экспертные ресурсы',
  ].join(', '),
  openGraph: {
    title: 'Библиотека ресурсов | Эволюция 360',
    description: 'Найдите полезные материалы от верифицированных специалистов для вашего развития.',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://aura.ru/library',
    siteName: 'Эволюция 360',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Библиотека ресурсов | Эволюция 360',
    description: 'Найдите полезные материалы от верифицированных специалистов.',
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
    canonical: 'https://aura.ru/library',
  },
}

export default function LibraryPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Библиотека ресурсов Эволюция 360",
    "description": "Библиотека полезных ресурсов от верифицированных специалистов",
    "url": "https://aura.ru/library",
    "numberOfItems": "множество",
    "itemListElement": {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "CreativeWork",
        "name": "Ресурсы от специалистов",
        "description": "Полезные материалы для развития от проверенных экспертов",
        "provider": {
          "@type": "Organization",
          "name": "Эволюция 360",
          "url": "https://aura.ru"
        }
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Библиотека ресурсов
            </h1>
            <p className="text-gray-600">
              Найдите полезные материалы от верифицированных специалистов
            </p>
          </div>
          
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ResourcesContent />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </>
  )
}

