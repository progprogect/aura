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
      // Сначала пробуем получить данные пользователя (для всех типов)
      const userResponse = await fetch('/api/auth/user/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const userData = await userResponse.json()

      if (userData.success && userData.user) {
        // Если пользователь - специалист, получаем полный профиль
        if (userData.user.hasSpecialistProfile) {
          const profileResponse = await fetch('/api/auth/profile', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const profileData = await profileResponse.json()
          if (profileData.success && profileData.profile) {
            setUser(profileData.profile)
          } else {
            // Если профиль специалиста не найден, используем базовые данные
            setUser({
              id: userData.user.id,
              firstName: userData.user.firstName,
              lastName: userData.user.lastName,
              email: userData.user.email,
              phone: userData.user.phone,
              avatar: userData.user.avatar
            } as any)
          }
        } else {
          // Обычный пользователь - используем базовые данные
          setUser({
            id: userData.user.id,
            firstName: userData.user.firstName,
            lastName: userData.user.lastName,
            email: userData.user.email,
            phone: userData.user.phone,
            avatar: userData.user.avatar
          } as any)
        }
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
