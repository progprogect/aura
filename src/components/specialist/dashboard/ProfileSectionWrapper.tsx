'use client'

import { ReactNode } from 'react'
import { OnboardingProvider } from './OnboardingContext'

type ProfileSectionWrapperProps = {
  children: ReactNode
}

export function ProfileSectionWrapper({ children }: ProfileSectionWrapperProps) {
  return <OnboardingProvider>{children}</OnboardingProvider>
}

