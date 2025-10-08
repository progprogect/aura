/**
 * OAuth авторизация через Yandex
 */

import { NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth/config'
import { SocialAuthService } from '@/lib/auth/business-logic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      // Перенаправляем на Yandex OAuth
      const yandexAuthUrl = new URL('https://oauth.yandex.ru/authorize')
      yandexAuthUrl.searchParams.set('response_type', 'code')
      yandexAuthUrl.searchParams.set('client_id', AUTH_CONFIG.social.yandex.clientId || '')
      yandexAuthUrl.searchParams.set('redirect_uri', AUTH_CONFIG.social.yandex.redirectUri || '')
      yandexAuthUrl.searchParams.set('state', state || 'login')

      return NextResponse.redirect(yandexAuthUrl.toString())
    }

    // Обмениваем код на токен
    const tokenResponse = await fetch('https://oauth.yandex.ru/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: AUTH_CONFIG.social.yandex.clientId || '',
        client_secret: AUTH_CONFIG.social.yandex.clientSecret || '',
      })
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(`Yandex OAuth error: ${tokenData.error_description || tokenData.error}`)
    }

    // Получаем информацию о пользователе
    const userResponse = await fetch('https://login.yandex.ru/info', {
      headers: { Authorization: `OAuth ${tokenData.access_token}` }
    })

    const user = await userResponse.json()

    if (!user.id) {
      throw new Error('Не удалось получить данные пользователя от Yandex')
    }

    // Обрабатываем OAuth callback через SocialAuthService
    const result = await SocialAuthService.handleOAuthCallback('yandex', {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.default_email,
      picture: user.default_avatar_id ? `https://avatars.yandex.net/get-yapic/${user.default_avatar_id}/islands-200` : null,
      name: user.real_name || user.display_name
    })

    if (result.success) {
      // Устанавливаем токен сессии в куки и перенаправляем
      const response = NextResponse.redirect(new URL('/specialist/dashboard', request.url))
      response.cookies.set('session_token', result.sessionToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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
    console.error('[API/auth/social/yandex] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка авторизации через Yandex' },
      { status: 500 }
    )
    }
}
