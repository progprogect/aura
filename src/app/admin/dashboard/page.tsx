/**
 * Главная страница админ-панели со статистикой
 */

import { Metadata } from 'next'
import { AdminDashboardContent } from '@/components/admin/AdminDashboardContent'

export const metadata: Metadata = {
  title: 'Статистика | Админ-панель | Эволюция 360',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminDashboardPage() {
  return <AdminDashboardContent />
}

