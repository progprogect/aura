import {
  Coins,
  Gift,
  ShoppingCart,
  ArrowUpCircle,
  ArrowDownCircle,
  Timer,
  Award,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { TransactionType } from '@/types/points';

/**
 * Форматировать баллы для отображения (без потери точности)
 * Показывает все значащие цифры, убирает только лишние нули в конце
 */
export function formatPoints(amount: string | number | any): string {
  let value: string;
  
  if (typeof amount === 'string') {
    value = amount;
  } else if (amount && typeof amount === 'object' && 'toString' in amount) {
    // Decimal из decimal.js или Prisma
    value = amount.toString();
  } else if (typeof amount === 'number') {
    // Для чисел используем toFixed с достаточной точностью, затем убираем лишние нули
    value = amount.toFixed(10);
  } else {
    value = String(amount);
  }
  
  return formatDecimalPoints(value);
}

/**
 * Форматировать Decimal значение без потери точности
 * Убирает только trailing zeros, сохраняет все значащие цифры
 */
function formatDecimalPoints(value: string): string {
  // Убираем trailing zeros после точки, но оставляем точку если была дробная часть
  if (value.includes('.')) {
    // Убираем только нули в конце после точки
    value = value.replace(/0+$/, '');
    // Если после точки ничего не осталось, убираем точку
    if (value.endsWith('.')) {
      value = value.slice(0, -1);
    }
  }
  
  return value;
}

/**
 * Форматировать баллы с сокращением для компактного отображения
 */
export function formatPointsShort(amount: string | number): string {
  const points = formatPoints(amount);
  return `${points} б.`;
}

/**
 * Получить метку транзакции
 */
export function getTransactionLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    bonus_registration: 'Бонус за регистрацию',
    bonus_reward: 'Бонусное начисление',
    bonus_expired: 'Срок действия истёк',
    purchase: 'Покупка',
    refund: 'Возврат',
    withdrawal: 'Вывод средств',
    deposit: 'Пополнение',
    service_purchase: 'Покупка услуги',
    service_completion: 'Завершение услуги',
    auto_completion: 'Автозавершение услуги',
    dispute_refund: 'Возврат по спору',
    contact_view: 'Просмотр контакта',
    request_received: 'Получение заявки',
    package_purchase: 'Покупка пакета',
    lead_magnet_purchase: 'Покупка лид-магнита',
  };
  
  return labels[type] || type;
}

/**
 * Получить иконку транзакции
 */
export function getTransactionIcon(type: TransactionType) {
  const icons: Record<TransactionType, any> = {
    bonus_registration: Gift,
    bonus_reward: Award,
    bonus_expired: Timer,
    purchase: ShoppingCart,
    refund: ArrowUpCircle,
    withdrawal: ArrowDownCircle,
    deposit: ArrowUpCircle,
    service_purchase: ShoppingCart,
    service_completion: ArrowUpCircle,
    auto_completion: ArrowUpCircle,
    dispute_refund: ArrowUpCircle,
    contact_view: Eye,
    request_received: MessageSquare,
    package_purchase: ShoppingCart,
    lead_magnet_purchase: Gift,
  };
  
  return icons[type] || Coins;
}

/**
 * Получить цвет для типа транзакции
 */
export function getTransactionColor(type: TransactionType): string {
  // Положительные операции
  if (['bonus_registration', 'bonus_reward', 'deposit', 'refund', 'service_completion', 'auto_completion', 'dispute_refund'].includes(type)) {
    return 'text-green-600';
  }
  
  // Отрицательные операции
  if (['purchase', 'withdrawal', 'bonus_expired', 'service_purchase', 'contact_view', 'request_received', 'lead_magnet_purchase'].includes(type)) {
    return 'text-red-600';
  }
  
  return 'text-gray-600';
}

/**
 * Форматировать дату относительно текущего времени
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'только что';
  } else if (diffMins < 60) {
    return `${diffMins} мин. назад`;
  } else if (diffHours < 24) {
    return `${diffHours} ч. назад`;
  } else if (diffDays === 1) {
    return 'вчера';
  } else if (diffDays < 7) {
    return `${diffDays} дн. назад`;
  } else {
    return then.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: then.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Форматировать время до истечения бонусов
 */
export function formatTimeUntilExpiry(expiresAt: Date | string): string {
  const now = new Date();
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const diffMs = expiry.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'истёк';
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays >= 1) {
    return `${diffDays} ${getDayWord(diffDays)}`;
  } else if (diffHours >= 1) {
    return `${diffHours} ${getHourWord(diffHours)}`;
  } else {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins} ${getMinuteWord(diffMins)}`;
  }
}

/**
 * Получить правильное склонение слова "день"
 */
function getDayWord(days: number): string {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'дней';
  }
  
  if (lastDigit === 1) {
    return 'день';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'дня';
  }
  
  return 'дней';
}

/**
 * Получить правильное склонение слова "час"
 */
function getHourWord(hours: number): string {
  const lastDigit = hours % 10;
  const lastTwoDigits = hours % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'часов';
  }
  
  if (lastDigit === 1) {
    return 'час';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'часа';
  }
  
  return 'часов';
}

/**
 * Получить правильное склонение слова "минута"
 */
function getMinuteWord(minutes: number): string {
  const lastDigit = minutes % 10;
  const lastTwoDigits = minutes % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'минут';
  }
  
  if (lastDigit === 1) {
    return 'минута';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'минуты';
  }
  
  return 'минут';
}

