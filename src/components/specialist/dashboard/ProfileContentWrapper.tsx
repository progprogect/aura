'use client'

import { ProfileOnboardingManager } from './ProfileOnboardingManager'
import { useOnboarding } from './OnboardingContext'

type ProfileContentWrapperProps = {
  initialStep?: number
  initialCompleted?: boolean
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
  guideHref,
}: Omit<ProfileContentWrapperProps, 'quickActionsProps'>) {
  const { setOpenOnboarding } = useOnboarding()

  const handleOpenRequest = (open: () => void) => {
    setOpenOnboarding(open)
  }

  return (
    <ProfileOnboardingManager
      initialStep={initialStep}
      initialCompleted={initialCompleted}
      guideHref={guideHref}
      onOpenRequest={handleOpenRequest}
    />
  )
}

