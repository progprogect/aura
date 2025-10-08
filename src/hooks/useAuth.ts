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
      const sessionToken = localStorage.getItem('sessionToken')
      
      if (!sessionToken) {
        setUser(null)
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      })

      const data = await response.json()

      if (data.success && data.profile) {
        setUser(data.profile)
      } else {
        setUser(null)
        localStorage.removeItem('sessionToken')
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('sessionToken')
    setUser(null)
    router.push('/')
  }

  const login = (sessionToken: string, profile: UserProfile) => {
    localStorage.setItem('sessionToken', sessionToken)
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
