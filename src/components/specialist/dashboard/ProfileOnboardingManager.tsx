'use client'

import { useRef } from 'react'
import { ExpertOnboardingFlow } from './ExpertOnboardingFlow'

type ProfileOnboardingManagerProps = {
  initialStep?: number
  initialCompleted?: boolean
  initialSeen?: boolean
  guideHref?: string
  onOpenRequest?: (open: () => void) => void
}

export function ProfileOnboardingManager({
  initialStep,
  initialCompleted,
  initialSeen,
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
      initialSeen={initialSeen}
      guideHref={guideHref}
      onOpenRequest={handleOpenRequest}
    />
  )
}

