'use client'

import { QuickActions, QuickActionsProps } from './QuickActions'
import { useOnboarding } from './OnboardingContext'

export function QuickActionsWrapper(props: QuickActionsProps) {
  // Хук всегда доступен, так как компонент используется внутри OnboardingProvider
  const { openOnboarding } = useOnboarding()

  return <QuickActions {...props} onOpenOnboarding={openOnboarding || props.onOpenOnboarding} />
}

