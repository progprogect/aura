'use client';

import { useState } from 'react';
import { BalanceWidget } from './BalanceWidget';
import { TransactionHistoryModal } from './TransactionHistoryModal';
import { PointsUsageModal } from './PointsUsageModal';

/**
 * Wrapper для BalanceWidget с модальными окнами истории и использования баллов
 */
export function BalanceWidgetWrapper() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);

  return (
    <>
      <BalanceWidget
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenUsageModal={() => setIsUsageModalOpen(true)}
      />
      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
      <PointsUsageModal
        isOpen={isUsageModalOpen}
        onClose={() => setIsUsageModalOpen(false)}
      />
    </>
  );
}

