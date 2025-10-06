import { Metadata } from 'next'
import { HeroSection } from '@/components/homepage/HeroSection'
import { HowItWorksSection } from '@/components/homepage/HowItWorksSection'
import { CategoriesSection } from '@/components/homepage/CategoriesSection'
import { AdvantagesSection } from '@/components/homepage/AdvantagesSection'
import { FeaturedSpecialists } from '@/components/homepage/FeaturedSpecialists'
import { HomepageErrorBoundary } from '@/components/homepage/HomepageErrorBoundary'

export const metadata: Metadata = {
  title: 'Аура — Ваш путь к здоровому образу жизни',
  description: 'Платформа для поиска проверенных специалистов в сфере здоровья и саморазвития. Психологи, нутрициологи, тренеры и другие эксперты помогут вам достичь целей.',
  keywords: ['здоровый образ жизни', 'специалисты по здоровью', 'саморазвитие', 'нутрициолог', 'тренер', 'психолог', 'консультант'],
  openGraph: {
    title: 'Аура — Ваш путь к здоровому образу жизни',
    description: 'Платформа для поиска проверенных специалистов в сфере здоровья и саморазвития',
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
    name: 'Аура',
    description: 'Платформа для поиска проверенных специалистов в сфере здоровья',
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
        <HomepageErrorBoundary>
          <HeroSection />
          <HowItWorksSection />
          <CategoriesSection />
          <AdvantagesSection />
          <FeaturedSpecialists />
        </HomepageErrorBoundary>
      </main>
    </>
  );
}