/**
 * РЕДИРЕКТ: Dashboard специалиста теперь в /profile
 * Этот файл оставлен для обратной совместимости
 */

import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Личный кабинет | Эколюция 360',
  description: 'Управление профилем специалиста',
  robots: 'noindex, nofollow',
}

// Все пользователи (включая специалистов) теперь используют /profile
export default async function DashboardPage() {
  redirect('/profile')
}

