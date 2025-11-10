/**
 * Layout для админ-панели
 * Middleware уже защищает роуты, здесь только добавляем навигацию для авторизованных
 */

import { getAdminFromCookies } from '@/lib/admin/auth'
import { AdminLayoutContent } from '@/components/admin/AdminLayoutContent'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Проверяем авторизацию (middleware уже сделал редирект если нужно)
  const admin = await getAdminFromCookies()

  // Если админ авторизован - показываем layout с навигацией
  // Если не авторизован (например, на странице login) - показываем без навигации
  if (admin) {
    return <AdminLayoutContent>{children}</AdminLayoutContent>
  }

  // Для страницы login просто показываем children без навигации
  return <>{children}</>
}

