import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aura — Найдите своего специалиста по здоровью',
  description: 'Платформа для поиска проверенных специалистов: психологи, коучи, тренеры, нутрициологи. Онлайн и очные консультации. Верифицированные эксперты с опытом работы.',
  keywords: [
    'специалисты по здоровью',
    'психологи', 
    'коучи',
    'тренеры',
    'нутрициологи',
    'онлайн консультации',
    'верифицированные эксперты',
    'поиск специалиста',
    'консультанты по здоровью',
    'платформа специалистов'
  ].join(', '),
  openGraph: {
    title: 'Aura — Найдите своего специалиста по здоровью',
    description: 'Платформа для поиска проверенных специалистов в сфере здоровья',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://aura.ru',
    siteName: 'Aura',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura — Найдите своего специалиста по здоровью',
    description: 'Платформа для поиска проверенных специалистов в сфере здоровья',
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
    canonical: 'https://aura.ru',
  },
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Aura",
    "description": "Платформа для поиска проверенных специалистов в сфере здоровья",
    "url": "https://aura.ru",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://aura.ru/catalog?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "provider": {
      "@type": "Organization",
      "name": "Aura",
      "url": "https://aura.ru"
    }
  }

  return (
    <>
      {/* Структурированные данные для SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Аура
          </h1>
          <p className="text-2xl text-gray-600">
            Платформа для поиска специалистов по здоровью
          </p>
          
          <div className="pt-8 space-y-4">
            <Link
              href="/catalog"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Найти специалиста
            </Link>
            
            <div className="text-sm text-gray-500">
              Психологи • Коучи • Тренеры • Нутрициологи
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

