'use client'

import { useRef } from 'react'
import { ExpertOnboardingFlow } from './ExpertOnboardingFlow'

type ProfileOnboardingManagerProps = {
  initialStep?: number
  initialCompleted?: boolean
  guideHref?: string
  onOpenRequest?: (open: () => void) => void
}

export function ProfileOnboardingManager({
  initialStep,
  initialCompleted,
  guideHref,
  onOpenRequest,
}: ProfileOnboardingManagerProps) {
  const openOnboardingRef = useRef<(() => void) | null>(null)

  const handleOpenRequest = (open: () => void) => {
    openOnboardingRef.current = open
    if (onOpenRequest) {
      onOpenRequest(open)
    }
  }

  return (
    <ExpertOnboardingFlow
      initialStep={initialStep}
      initialCompleted={initialCompleted}
      guideHref={guideHref}
      onOpenRequest={handleOpenRequest}
    />
  )
}

