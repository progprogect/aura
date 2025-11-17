/**
 * Обёртка для LeadMagnetsList с поддержкой router.refresh
 */

'use client'

import { useRouter } from 'next/navigation'
import { LeadMagnetsList } from './LeadMagnetsList'
import type { LeadMagnetUI } from '@/types/lead-magnet'

interface LeadMagnetsListWrapperProps {
  leadMagnets: LeadMagnetUI[]
  specialistSlug?: string
}

export function LeadMagnetsListWrapper({ leadMagnets, specialistSlug }: LeadMagnetsListWrapperProps) {
  const router = useRouter()

  return (
    <LeadMagnetsList
      leadMagnets={leadMagnets}
      specialistSlug={specialistSlug}
      onRefresh={() => router.refresh()}
    />
  )
}

