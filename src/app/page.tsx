import { Metadata } from 'next'
import { HeroSection } from '@/components/homepage/HeroSection'
import { HowItWorksSection } from '@/components/homepage/HowItWorksSection'
import { CategoriesSection } from '@/components/homepage/CategoriesSection'
import { AdvantagesSection } from '@/components/homepage/AdvantagesSection'
import { CTASection } from '@/components/homepage/CTASection'
import { HomepageErrorBoundary } from '@/components/homepage/HomepageErrorBoundary'

export const metadata: Metadata = {
  title: 'Аура — Найдите своего специалиста по здоровью за 2 минуты',
  description: 'AI-помощник поможет найти идеального эксперта для решения ваших задач. Проверенные специалисты: нутрициологи, тренеры, психологи и другие профессионалы.',
  keywords: ['специалист по здоровью', 'нутрициолог', 'тренер', 'психолог', 'консультант', 'AI помощник'],
  openGraph: {
    title: 'Аура — Найдите своего специалиста по здоровью за 2 минуты',
    description: 'AI-помощник поможет найти идеального эксперта для решения ваших задач',
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
          <CTASection />
        </HomepageErrorBoundary>
      </main>
    </>
  );
}