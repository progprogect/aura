'use client'

import { ProfileOnboardingManager } from './ProfileOnboardingManager'
import { useOnboarding } from './OnboardingContext'

type ProfileContentWrapperProps = {
  initialStep?: number
  initialCompleted?: boolean
  initialSeen?: boolean
  guideHref?: string
  quickActionsProps: {
    slug?: string
    newRequestsCount?: number
    newOrdersCount?: number
    isSpecialist?: boolean
    purchasesStats?: {
      total: number
      paid: number
      completed: number
      cancelled: number
      disputed: number
    }
  }
}

export function ProfileContentWrapper({
  initialStep,
  initialCompleted,
  initialSeen,
  guideHref,
}: Omit<ProfileContentWrapperProps, 'quickActionsProps'>) {
  const onboardingContext = useOnboarding()

  const handleOpenRequest = (open: () => void) => {
    if (onboardingContext) {
      onboardingContext.setOpenOnboarding(open)
    }
  }

  return (
    <ProfileOnboardingManager
      initialStep={initialStep}
      initialCompleted={initialCompleted}
      initialSeen={initialSeen}
      guideHref={guideHref}
      onOpenRequest={handleOpenRequest}
    />
  )
}

