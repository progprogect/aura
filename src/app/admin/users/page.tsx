/**
 * Страница списка пользователей
 */

import { Metadata } from 'next'
import { UsersListContent } from '@/components/admin/UsersListContent'

export const metadata: Metadata = {
  title: 'Пользователи | Админ-панель | Эволюция 360',
  robots: {
    index: false,
    follow: false,
  },
}

export default function UsersPage() {
  return <UsersListContent />
}

