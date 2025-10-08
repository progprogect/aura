/**
 * Навигация интегрированная с hero секцией
 * Без разделительной линии, с прозрачным фоном
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function HeroNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
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
    <nav className="absolute top-0 left-0 right-0 z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Логотип - уменьшенный */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Aura</span>
          </Link>
          
          {/* Навигационные ссылки */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Главная
            </Link>
            <Link
              href="/chat"
              className={`text-sm font-medium transition-colors ${
                isActive('/chat') 
                  ? 'text-primary' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              AI-Помощник
            </Link>
            <Link
              href="/catalog"
              className={`text-sm font-medium transition-colors ${
                isActive('/catalog') 
                  ? 'text-primary' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Специалисты
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  isActive('/auth/login')
                    ? 'border-blue-600 bg-blue-100 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100'
                }`}
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  isActive('/auth/register')
                    ? 'border-blue-700 bg-blue-700 text-white' 
                    : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white active:bg-blue-700 active:border-blue-700'
                }`}
              >
                Стать специалистом
              </Link>
            </div>
          </div>
          
          {/* Мобильное меню */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
              aria-label="Открыть меню"
            >
              {isMobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Мобильное меню - выпадающий список */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-sm border-t border-gray-200 rounded-b-lg shadow-lg">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
                onClick={closeMobileMenu}
              >
                Главная
              </Link>
              <Link
                href="/chat"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/chat') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
                onClick={closeMobileMenu}
              >
                AI-Помощник
              </Link>
              <Link
                href="/catalog"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/catalog') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
                onClick={closeMobileMenu}
              >
                Специалисты
              </Link>
              <Link
                href="/auth/login"
                className={`block px-4 py-2.5 rounded-lg border text-base font-medium transition-all duration-200 ${
                  isActive('/auth/login') 
                    ? 'border-blue-600 bg-blue-100 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100'
                }`}
                onClick={closeMobileMenu}
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className={`block px-4 py-2.5 rounded-lg border text-base font-medium transition-all duration-200 ${
                  isActive('/auth/register')
                    ? 'border-blue-700 bg-blue-700 text-white' 
                    : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white active:bg-blue-700 active:border-blue-700'
                }`}
                onClick={closeMobileMenu}
              >
                Стать специалистом
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
