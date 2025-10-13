/**
 * Хук для получения данных пользователя (алиас для useAuth)
 */

import { useAuth } from './useAuth'

export function useUser() {
  const { user, loading, isAuthenticated } = useAuth()
  
  return {
    user,
    loading,
    isAuthenticated
  }
}
