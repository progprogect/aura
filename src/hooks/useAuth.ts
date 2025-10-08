/**
 * Хук для работы с авторизацией
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { UserProfile } from '@/lib/auth/types'

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Проверяем авторизацию через API (cookies автоматически отправляются)
      const response = await fetch('/api/auth/profile', {
        credentials: 'include', // Включаем cookies
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && data.profile) {
        setUser(data.profile)
      } else {
        setUser(null)
        // Очищаем localStorage если он есть (для совместимости)
        localStorage.removeItem('sessionToken')
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Вызываем API для очистки cookies на сервере
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    } finally {
      // Очищаем localStorage если он есть (для совместимости)
      localStorage.removeItem('sessionToken')
      setUser(null)
      router.push('/')
    }
  }

  const login = (sessionToken: string, profile: UserProfile) => {
    // Больше не сохраняем в localStorage - используем cookies
    setUser(profile)
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth
  }
}
