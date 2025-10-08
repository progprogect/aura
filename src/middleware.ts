/**
 * Middleware для обработки авторизации
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Проверяем токен сессии из cookies
  const sessionToken = request.cookies.get('sessionToken')?.value
  
  // Защищённые маршруты (требуют авторизации)
  const protectedRoutes = ['/specialist/dashboard', '/specialist/profile']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Маршруты авторизации (если уже авторизован, редиректим)
  const authRoutes = ['/auth/login', '/auth/register']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Если пользователь не авторизован и пытается зайти на защищённый маршрут
  if (isProtectedRoute && !sessionToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // Если пользователь уже авторизован и пытается зайти на страницу авторизации
  // (можно раскомментировать, если нужен редирект)
  // if (isAuthRoute && sessionToken) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/specialist/dashboard'
  //   return NextResponse.redirect(url)
  // }
  
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
