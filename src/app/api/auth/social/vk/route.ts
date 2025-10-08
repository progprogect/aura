/**
 * OAuth авторизация через VK (ВКонтакте)
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
      // Перенаправляем на VK OAuth
      const vkAuthUrl = new URL('https://oauth.vk.com/authorize')
      vkAuthUrl.searchParams.set('client_id', AUTH_CONFIG.social.vk.appId || '')
      vkAuthUrl.searchParams.set('redirect_uri', AUTH_CONFIG.social.vk.redirectUri || '')
      vkAuthUrl.searchParams.set('response_type', 'code')
      vkAuthUrl.searchParams.set('scope', 'email')
      vkAuthUrl.searchParams.set('state', state || 'login')

      return NextResponse.redirect(vkAuthUrl.toString())
    }

    // Обмениваем код на access_token
    const tokenResponse = await fetch('https://oauth.vk.com/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: AUTH_CONFIG.social.vk.appId || '',
        client_secret: AUTH_CONFIG.social.vk.appSecret || '',
        redirect_uri: AUTH_CONFIG.social.vk.redirectUri || '',
        code,
      })
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(`VK OAuth error: ${tokenData.error_description || tokenData.error}`)
    }

    // Получаем информацию о пользователе
    const userResponse = await fetch(
      `https://api.vk.com/method/users.get?user_id=${tokenData.user_id}&access_token=${tokenData.access_token}&fields=photo_200&v=5.131`
    )

    const userData = await userResponse.json()

    if (userData.error) {
      throw new Error(`VK API error: ${userData.error.error_msg}`)
    }

    const user = userData.response[0]

    // Обрабатываем OAuth callback через SocialAuthService
    const result = await SocialAuthService.handleOAuthCallback('vk', {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: tokenData.email,
      picture: user.photo_200,
      name: `${user.first_name} ${user.last_name}`
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
    console.error('[API/auth/social/vk] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка авторизации через VK' },
      { status: 500 }
    )
  }
}
