/**
 * Страница комиссий и кешбэка в админ-панели
 */

import { Metadata } from 'next'
import { RevenueDashboard } from '@/components/admin/RevenueDashboard'

export const metadata: Metadata = {
  title: 'Комиссии и кешбэк | Админ-панель | Эволюция 360',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RevenuePage() {
  return <RevenueDashboard />
}

