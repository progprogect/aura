/**
 * Страница детального просмотра специалиста
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SpecialistDetailContent } from '@/components/admin/SpecialistDetailContent'

export const metadata: Metadata = {
  title: 'Специалист | Админ-панель | Эволюция 360',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SpecialistDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return <SpecialistDetailContent specialistId={params.id} />
}

