'use client';

import { useEffect, useState } from 'react';
import { Coins, Loader2 } from 'lucide-react';
import { formatPointsShort } from '@/lib/points/format';
import { UserBalance } from '@/types/points';

/**
 * Компактный чип баланса для хедера
 */
export function BalanceChip() {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/user/balance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  const total = parseFloat(balance.total);
  const isNegative = total < 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
      isNegative
        ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200'
        : 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 hover:from-amber-100 hover:to-amber-200'
    }`}>
      <Coins className={`w-4 h-4 ${isNegative ? 'text-red-600' : 'text-amber-600'}`} />
      <span className={`font-medium text-sm ${isNegative ? 'text-red-900' : 'text-amber-900'}`}>
        {formatPointsShort(total)}
      </span>
    </div>
  );
}

