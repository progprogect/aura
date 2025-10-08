/**
 * Обёртка для AuthLoginForm с Suspense для useSearchParams
 */

'use client'

import { Suspense } from 'react'
import { AuthLoginForm } from './AuthLoginForm'

function AuthLoginFormWithParams() {
  return <AuthLoginForm />
}

export function AuthLoginFormWrapper() {
  return (
    <Suspense fallback={
      <div className="bg-card rounded-xl shadow-lg border p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <AuthLoginFormWithParams />
    </Suspense>
  )
}
