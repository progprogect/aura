import { Metadata } from 'next'
import { HeroSection } from '@/components/homepage/HeroSection'
import { HowItWorksSection } from '@/components/homepage/HowItWorksSection'
import { CategoriesSection } from '@/components/homepage/CategoriesSection'
import { AdvantagesSection } from '@/components/homepage/AdvantagesSection'
import { FeaturedSpecialists } from '@/components/homepage/FeaturedSpecialists'
import { ErrorBoundary, HomepageErrorFallback } from '@/components/ui/error-boundary'

export const metadata: Metadata = {
  title: 'Эволюция 360 — Всё для полноценного развития',
  description: 'Сервис, где вы найдёте специалистов и программы для гармоничного развития: психологи, нутрициологи, тренеры, коучи и другие эксперты.',
  keywords: ['развитие', 'здоровье', 'комплексный подход', 'нутрициолог', 'тренер', 'психолог', 'эксперт', 'консультант'],
  openGraph: {
    title: 'Эволюция 360 — Всё для полноценного развития',
    description: 'Выберите специалистов и решения для гармоничного роста и баланса жизни',
    type: 'website',
    locale: 'ru_RU',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Эволюция 360',
    description: 'Сервис, где можно найти специалистов и решения для полноценного развития',
    url: 'https://aura-health.ru',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://aura-health.ru/catalog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="min-h-screen bg-background">
        <ErrorBoundary fallback={HomepageErrorFallback}>
          <HeroSection />
          <FeaturedSpecialists />
          <HowItWorksSection />
          <CategoriesSection />
          <AdvantagesSection />
        </ErrorBoundary>
      </main>
    </>
  );
}