/**
 * OAuth авторизация через Google
 */

import { NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth/config'
import { SocialAuthService } from '@/lib/auth/business-logic'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      // Перенаправляем на Google OAuth
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      googleAuthUrl.searchParams.set('client_id', AUTH_CONFIG.social.google.clientId || '')
      googleAuthUrl.searchParams.set('redirect_uri', AUTH_CONFIG.social.google.redirectUri || '')
      googleAuthUrl.searchParams.set('response_type', 'code')
      googleAuthUrl.searchParams.set('scope', 'openid email profile')
      googleAuthUrl.searchParams.set('state', state || 'login')

      return NextResponse.redirect(googleAuthUrl.toString())
    }

    // Обмениваем код на токен
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: AUTH_CONFIG.social.google.clientId,
        client_secret: AUTH_CONFIG.social.google.clientSecret,
        redirect_uri: AUTH_CONFIG.social.google.redirectUri,
        grant_type: 'authorization_code'
      })
    })

    const tokens = await tokenResponse.json()

    // Получаем информацию о пользователе
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })

    const userData = await userResponse.json()

    // Обрабатываем OAuth callback через SocialAuthService
    const result = await SocialAuthService.handleOAuthCallback('google', {
      id: userData.id,
      firstName: userData.given_name,
      lastName: userData.family_name,
      email: userData.email,
      picture: userData.picture,
      name: userData.name
    })

    if (result.success) {
      // Устанавливаем токен сессии в куки и перенаправляем
      const response = NextResponse.redirect(new URL('/specialist/dashboard', request.url))
      response.cookies.set('session_token', result.sessionToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 дней
        path: '/',
      })
      return response
    } else {
      // Ошибка авторизации - перенаправляем на страницу входа с ошибкой
      const errorUrl = new URL('/auth/login', request.url)
      errorUrl.searchParams.set('error', result.error || 'Ошибка авторизации')
      return NextResponse.redirect(errorUrl)
    }

  } catch (error) {
    console.error('[API/auth/social/google] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка авторизации через Google' },
      { status: 500 }
    )
  }
}
