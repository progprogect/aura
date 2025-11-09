/**
 * Страница откликов специалиста
 */

import { Metadata } from 'next'
import { ProposalsList } from '@/components/requests/ProposalsList'

export const metadata: Metadata = {
  title: 'Мои отклики | Эколюция 360',
  description: 'Просмотр и управление вашими откликами на заявки',
}

export default function SpecialistProposalsPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProposalsList />
      </div>
    </div>
  )
}

