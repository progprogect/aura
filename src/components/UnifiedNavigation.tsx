/**
 * Унифицированная навигация для всех страниц
 * Поддерживает варианты: hero (прозрачный фон) и standard (белый фон с тенью)
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User } from 'lucide-react'
import { BalanceChip } from '@/components/points/BalanceChip'
import Image from 'next/image'

interface UnifiedNavigationProps {
  variant?: 'hero' | 'standard'
}

export function UnifiedNavigation({ variant = 'standard' }: UnifiedNavigationProps) {
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

  // Унифицированные стили
  const navClassName = variant === 'hero'
    ? 'absolute top-0 left-0 right-0 z-10 bg-transparent'
    : 'bg-white shadow-sm border-b border-gray-200'
  
  const containerClassName = variant === 'hero'
    ? 'max-w-7xl mx-auto px-6 lg:px-8'
    : 'container mx-auto px-4'
  
  const heightClassName = variant === 'hero' ? 'h-20' : 'h-16'
  
  const logoDimension = variant === 'hero' ? 28 : 32
  const logoTextSize = variant === 'hero' ? 'text-xs' : 'text-sm'
  
  const brandTextSize = variant === 'hero'
    ? 'text-lg'
    : 'text-xl'
  
  const activeColor = 'text-blue-600'
  const inactiveColor = 'text-gray-700'
  const hoverColor = 'hover:text-blue-600'
  
  return (
    <nav className={navClassName}>
      <div className={containerClassName}>
        <div className={`flex items-center justify-between ${heightClassName}`}>
          {/* Логотип */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <Image
              src="/icons/logo-evolyutsiya.svg"
              alt="Эволюция 360"
              width={logoDimension}
              height={logoDimension}
              priority={variant === 'hero'}
              className="rounded-full shadow-sm"
            />
            <span className={`${brandTextSize} font-bold text-gray-900`}>Эволюция&nbsp;360</span>
          </Link>
          
          {/* Навигационные ссылки */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? activeColor 
                  : `${inactiveColor} ${hoverColor}`
              }`}
            >
              Главная
            </Link>
            <span className="relative group">
              <span className={`text-sm font-medium transition-colors opacity-60 cursor-not-allowed ${
                isActive('/chat') 
                  ? activeColor 
                  : inactiveColor
              }`}>
                AI-Помощник
              </span>
              <span className="absolute -top-2 -right-6 bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Скоро
              </span>
            </span>
            <Link
              href="/catalog"
              className={`text-sm font-medium transition-colors ${
                isActive('/catalog') 
                  ? activeColor 
                  : `${inactiveColor} ${hoverColor}`
              }`}
            >
              Каталог специалистов
            </Link>
            <Link
              href="/find-work"
              className={`text-sm font-medium transition-colors ${
                isActive('/find-work') 
                  ? activeColor 
                  : `${inactiveColor} ${hoverColor}`
              }`}
            >
              Найти клиентов
            </Link>
            
            {/* Показываем разные кнопки в зависимости от авторизации */}
            {!loading && (
              <div className="flex items-center space-x-3">
                {isAuthenticated ? (
                  <>
                    {variant === 'standard' && <BalanceChip />}
                    <Link
                      href="/profile"
                      className={`flex items-center space-x-2 text-sm font-medium transition-colors ${inactiveColor} ${hoverColor}`}
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
                      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${inactiveColor} hover:text-red-600`}
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
                <svg className={variant === 'hero' ? 'h-5 w-5' : 'h-6 w-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className={variant === 'hero' ? 'h-5 w-5' : 'h-6 w-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Мобильное меню - выпадающий список */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 ${
              variant === 'hero' 
                ? 'bg-white/95 backdrop-blur-sm rounded-b-lg shadow-lg'
                : 'bg-white'
            }`}>
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/') 
                    ? `${activeColor} bg-blue-50` 
                    : `${inactiveColor} ${hoverColor} hover:bg-gray-50`
                }`}
                onClick={closeMobileMenu}
              >
                Главная
              </Link>
              <div className="relative group">
                <span className={`block px-3 py-2 rounded-md text-base font-medium opacity-60 cursor-not-allowed ${
                  isActive('/chat') 
                    ? `${activeColor} bg-blue-50` 
                    : inactiveColor
                }`}>
                  AI-Помощник
                  <span className="ml-2 bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Скоро
                  </span>
                </span>
              </div>
              <Link
                href="/catalog"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/catalog') 
                    ? `${activeColor} bg-blue-50` 
                    : `${inactiveColor} ${hoverColor} hover:bg-gray-50`
                }`}
                onClick={closeMobileMenu}
              >
                Каталог специалистов
              </Link>
              <Link
                href="/find-work"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/find-work') 
                    ? `${activeColor} bg-blue-50` 
                    : `${inactiveColor} ${hoverColor} hover:bg-gray-50`
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
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${inactiveColor} ${hoverColor} hover:bg-gray-50`}
                        onClick={closeMobileMenu}
                      >
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-4 h-4 rounded-full object-cover inline mr-2"
                          />
                        ) : (
                          <User className="w-4 h-4 inline mr-2" />
                        )}
                        {user?.firstName} {user?.lastName}
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          closeMobileMenu()
                        }}
                        className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${inactiveColor} hover:text-red-600 hover:bg-red-50`}
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

