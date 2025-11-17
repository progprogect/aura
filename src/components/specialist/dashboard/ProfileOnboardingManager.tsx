'use client'

import { useRef } from 'react'
import { ExpertOnboardingFlow } from './ExpertOnboardingFlow'
import { CompanyOnboardingFlow } from './CompanyOnboardingFlow'

type ProfileOnboardingManagerProps = {
  initialStep?: number
  initialCompleted?: boolean
  initialSeen?: boolean
  guideHref?: string
  onOpenRequest?: (open: () => void) => void
  profileType?: 'specialist' | 'company'
}

export function ProfileOnboardingManager({
  initialStep,
  initialCompleted,
  initialSeen,
  guideHref,
  onOpenRequest,
  profileType = 'specialist',
}: ProfileOnboardingManagerProps) {
  const openOnboardingRef = useRef<(() => void) | null>(null)

  const handleOpenRequest = (open: () => void) => {
    openOnboardingRef.current = open
    if (onOpenRequest) {
      onOpenRequest(open)
    }
  }

  const isCompany = profileType === 'company'

  return isCompany ? (
    <CompanyOnboardingFlow
      initialStep={initialStep}
      initialCompleted={initialCompleted}
      initialSeen={initialSeen}
      guideHref={guideHref}
      onOpenRequest={handleOpenRequest}
    />
  ) : (
    <ExpertOnboardingFlow
      initialStep={initialStep}
      initialCompleted={initialCompleted}
      initialSeen={initialSeen}
      guideHref={guideHref}
      onOpenRequest={handleOpenRequest}
    />
  )
}

