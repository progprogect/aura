/**
 * Навигация интегрированная с hero секцией
 * Без разделительной линии, с прозрачным фоном
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User } from 'lucide-react'
import Image from 'next/image'

export function HeroNavigation() {
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
    <nav className="absolute top-0 left-0 right-0 z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Логотип - уменьшенный */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <Image
              src="/icons/logo-ecolyutsiya.svg"
              alt="Эколюция 360"
              width={28}
              height={28}
              className="rounded-full shadow-sm"
              priority
            />
            <span className="text-lg font-bold text-gray-900">Эколюция&nbsp;360</span>
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
            <span className="relative group">
              <span className={`text-sm font-medium transition-colors opacity-60 cursor-not-allowed ${
                isActive('/chat') 
                  ? 'text-primary' 
                  : 'text-gray-700'
              }`}>
                AI-Помощник
              </span>
              <span className="absolute -top-2 -right-6 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Скоро
              </span>
            </span>
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
            <Link
              href="/find-work"
              className={`text-sm font-medium transition-colors ${
                isActive('/find-work') 
                  ? 'text-primary' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Найти клиентов
            </Link>
            {!loading && (
              <div className="flex items-center space-x-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span>{user?.firstName} {user?.lastName}</span>
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
              <div className="relative group">
                <span className={`block px-3 py-2 rounded-md text-base font-medium opacity-60 cursor-not-allowed ${
                  isActive('/chat') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-700'
                }`}>
                  AI-Помощник
                  <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Скоро
                  </span>
                </span>
              </div>
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
                href="/find-work"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/find-work') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
                onClick={closeMobileMenu}
              >
                Найти клиентов
              </Link>
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span>{user?.firstName} {user?.lastName}</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          closeMobileMenu()
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Выйти</span>
                      </button>
                    </>
                  ) : (
                    <>
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
