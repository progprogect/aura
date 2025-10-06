import { Metadata } from 'next'
import { HeroSection } from '@/components/homepage/HeroSection'
import { HowItWorksSection } from '@/components/homepage/HowItWorksSection'
import { CategoriesSection } from '@/components/homepage/CategoriesSection'
import { AdvantagesSection } from '@/components/homepage/AdvantagesSection'
import { CTASection } from '@/components/homepage/CTASection'
import { HomepageErrorBoundary } from '@/components/homepage/HomepageErrorBoundary'

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
      
      <main className="min-h-screen bg-background">
        <HomepageErrorBoundary>
          <HeroSection />
          <HowItWorksSection />
          <CategoriesSection />
          <AdvantagesSection />
          <CTASection />
        </HomepageErrorBoundary>
      </main>
    </>
  );
}

