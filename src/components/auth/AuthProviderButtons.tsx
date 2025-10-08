/**
 * Кнопки для входа через социальные сети
 */

'use client'

import { Button } from '@/components/ui/button'

export function AuthProviderButtons() {
  const handleSocialLogin = (provider: string) => {
    // TODO: Реализовать социальную авторизацию
    console.log(`Вход через ${provider}`)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Или войти через
          </span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => handleSocialLogin('google')}
        type="button"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </Button>

      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => handleSocialLogin('vk')}
        type="button"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.18 14.49h-1.46c-.61 0-.8-.49-1.89-1.59-.95-.93-1.37-1.06-1.61-1.06-.33 0-.42.09-.42.53v1.45c0 .39-.13.63-1.14.63-1.68 0-3.55-.99-4.86-2.84-1.97-2.76-2.51-4.85-2.51-5.27 0-.24.09-.47.53-.47h1.46c.39 0 .54.18.69.6.75 2.15 2.01 4.03 2.52 4.03.2 0 .28-.09.28-.58v-2.25c-.06-.97-.57-1.05-.57-1.39 0-.2.16-.39.42-.39h2.29c.33 0 .44.18.44.56v3.03c0 .33.14.44.24.44.2 0 .36-.11.73-.48 1.14-1.28 1.95-3.26 1.95-3.26.11-.23.28-.47.72-.47h1.46c.44 0 .54.23.44.56-.16.82-1.95 3.59-1.95 3.59-.16.26-.22.38 0 .68.16.21.7.69 1.06 1.11.65.75 1.14 1.38 1.28 1.81.13.43-.07.65-.51.65z"/>
        </svg>
        ВКонтакте
      </Button>

      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => handleSocialLogin('yandex')}
        type="button"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.93 14.5h-2.13V9.26H9.78V7.5h4.15v9z"/>
        </svg>
        Яндекс
      </Button>
    </div>
  )
}
