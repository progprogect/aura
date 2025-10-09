/**
 * Middleware для обработки авторизации
 * Поддерживает unified auth систему (User + SpecialistProfile)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Проверяем токен сессии из cookies (единый для всех пользователей)
  const sessionToken = request.cookies.get('session_token')?.value
  
  // Отладочные логи (только в development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${pathname} - sessionToken: ${sessionToken ? 'exists' : 'missing'}`)
  }
  
  // Защищённые маршруты специалистов
  // Note: /specialist/dashboard редиректит на /profile (см. src/app/specialist/dashboard/page.tsx)
  const specialistRoutes = ['/specialist/profile', '/specialist/onboarding', '/specialist/requests']
  const isSpecialistRoute = specialistRoutes.some(route => pathname.startsWith(route))
  
  // Защищённые маршруты обычных пользователей
  const userProtectedRoutes: string[] = ['/profile', '/favorites', '/auth/user/become-specialist']
  const isUserProtectedRoute = userProtectedRoutes.some(route => pathname.startsWith(route))
  
  // Маршруты авторизации (не требуют дополнительных проверок)
  const authRoutes = ['/auth/login', '/auth/register', '/auth/user/register', '/auth/user/become-specialist']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Если не авторизован и пытается зайти на защищённый маршрут специалиста
  if (isSpecialistRoute && !sessionToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/register' // Для специалистов редирект на регистрацию специалиста
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // Если не авторизован и пытается зайти на защищённый маршрут пользователя
  if (isUserProtectedRoute && !sessionToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login' // Используем единый вход
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
}
