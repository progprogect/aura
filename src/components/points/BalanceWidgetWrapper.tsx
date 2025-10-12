'use client';

import { useState } from 'react';
import { BalanceWidget } from './BalanceWidget';
import { TransactionHistoryModal } from './TransactionHistoryModal';

/**
 * Wrapper для BalanceWidget с модальным окном истории
 */
export function BalanceWidgetWrapper() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      <BalanceWidget onOpenHistory={() => setIsHistoryOpen(true)} />
      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
}

