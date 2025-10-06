/**
 * Навигация интегрированная с hero секцией
 * Без разделительной линии, с прозрачным фоном
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function HeroNavigation() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    return pathname === path
  }
  
  return (
    <nav className="absolute top-0 left-0 right-0 z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Логотип - уменьшенный */}
          <Link href="/" className="flex items-center space-x-2">
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
          </div>
          
          {/* Мобильное меню */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
