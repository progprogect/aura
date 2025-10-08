/**
 * Навигация с учётом статуса авторизации
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User } from 'lucide-react'

export function AuthAwareNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout, loading } = useAuth()
  
  const isActive = (path: string) => {
    return pathname === path
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Aura</span>
          </Link>
          
          {/* Навигационные ссылки */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Главная
            </Link>
            <Link
              href="/chat"
              className={`text-sm font-medium transition-colors ${
                isActive('/chat') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              AI-Помощник
            </Link>
            <Link
              href="/catalog"
              className={`text-sm font-medium transition-colors ${
                isActive('/catalog') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Каталог специалистов
            </Link>
            
            {/* Показываем разные кнопки в зависимости от авторизации */}
            {!loading && (
              <div className="flex items-center space-x-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/specialist/dashboard"
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>{user?.firstName}</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Выйти</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className={`text-sm font-medium transition-colors ${
                        isActive('/auth/login')
                          ? 'text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Войти
                    </Link>
                    <Link
                      href="/auth/register"
                      className={`text-sm font-medium transition-colors ${
                        isActive('/auth/register')
                          ? 'text-blue-600 font-semibold' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Стать специалистом
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Мобильное меню */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
              aria-label="Открыть меню"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Мобильное меню - выпадающий список */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={closeMobileMenu}
              >
                Главная
              </Link>
              <Link
                href="/chat"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/chat') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={closeMobileMenu}
              >
                AI-Помощник
              </Link>
              <Link
                href="/catalog"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/catalog') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={closeMobileMenu}
              >
                Каталог специалистов
              </Link>
              
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/specialist/dashboard"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        onClick={closeMobileMenu}
                      >
                        <User className="w-4 h-4 inline mr-2" />
                        Профиль ({user?.firstName})
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          closeMobileMenu()
                        }}
                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Выйти
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActive('/auth/login') 
                            ? 'text-primary bg-primary/10' 
                            : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                        }`}
                        onClick={closeMobileMenu}
                      >
                        Войти
                      </Link>
                      <Link
                        href="/auth/register"
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActive('/auth/register')
                            ? 'text-blue-600 bg-blue-50 font-semibold' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                        onClick={closeMobileMenu}
                      >
                        Стать специалистом
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
