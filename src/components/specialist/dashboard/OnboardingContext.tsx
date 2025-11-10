'use client'

import { createContext, useContext, useRef, ReactNode } from 'react'

type OnboardingContextType = {
  openOnboarding: () => void
  setOpenOnboarding: (open: () => void) => void
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const openOnboardingRef = useRef<(() => void) | null>(null)

  const openOnboarding = () => {
    if (openOnboardingRef.current) {
      openOnboardingRef.current()
    }
  }

  const setOpenOnboarding = (open: () => void) => {
    openOnboardingRef.current = open
  }

  return (
    <OnboardingContext.Provider value={{ openOnboarding, setOpenOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

