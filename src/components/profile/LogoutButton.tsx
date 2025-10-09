'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      console.log('[LogoutButton] Выход из системы...')
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      console.log('[LogoutButton] Успешный выход, редирект на главную')
      // Редирект на главную
      window.location.href = '/'
    } catch (error) {
      console.error('[LogoutButton] Ошибка при выходе:', error)
      // Даже при ошибке редиректим
      window.location.href = '/'
    }
  }

  return (
    <Button 
      onClick={handleLogout}
      className="w-full" 
      variant="outline"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Выйти
    </Button>
  )
}

