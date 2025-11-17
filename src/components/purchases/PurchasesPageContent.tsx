/**
 * Контент страницы покупок с табами (Услуги / Лид-магниты)
 */

'use client'

import { useState } from 'react'
import { PurchasesList } from './PurchasesList'
import { PurchasedLeadMagnetsList } from './PurchasedLeadMagnetsList'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Gift } from 'lucide-react'

type TabType = 'services' | 'lead-magnets'

export function PurchasesPageContent() {
  const [activeTab, setActiveTab] = useState<TabType>('services')

  return (
    <div className="space-y-6">
      {/* Табы */}
      <div className="flex gap-2 border-b border-gray-200">
        <Button
          variant={activeTab === 'services' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('services')}
          className={`rounded-b-none border-b-2 ${
            activeTab === 'services' 
              ? 'border-blue-600' 
              : 'border-transparent'
          }`}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Услуги
        </Button>
        <Button
          variant={activeTab === 'lead-magnets' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('lead-magnets')}
          className={`rounded-b-none border-b-2 ${
            activeTab === 'lead-magnets' 
              ? 'border-blue-600' 
              : 'border-transparent'
          }`}
        >
          <Gift className="w-4 h-4 mr-2" />
          Лид-магниты
        </Button>
      </div>

      {/* Контент табов */}
      <div>
        {activeTab === 'services' && <PurchasesList />}
        {activeTab === 'lead-magnets' && <PurchasedLeadMagnetsList />}
      </div>
    </div>
  )
}

