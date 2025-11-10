/**
 * Навигация для страниц авторизации
 */

'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface AuthNavigationProps {
  showBackButton?: boolean
  backHref?: string
}

export function AuthNavigation({ 
  showBackButton = true, 
  backHref = '/' 
}: AuthNavigationProps) {
  return (
    <nav className="absolute top-0 left-0 right-0 z-10 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Логотип */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
        >
          <Image
            src="/icons/logo-evolutsia360.png"
            alt="Эволюция 360"
            width={38}
            height={38}
            className="rounded-full shadow"
            priority
          />
          Эволюция&nbsp;360
        </Link>
        
        {/* Кнопка "Назад" */}
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href={backHref}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Link>
          </Button>
        )}
      </div>
    </nav>
  )
}
