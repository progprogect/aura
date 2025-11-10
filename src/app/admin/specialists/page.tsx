/**
 * Страница списка специалистов
 */

import { Metadata } from 'next'
import { SpecialistsListContent } from '@/components/admin/SpecialistsListContent'

export const metadata: Metadata = {
  title: 'Специалисты | Админ-панель | Эволюция 360',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SpecialistsPage() {
  return <SpecialistsListContent />
}

