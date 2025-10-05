/**
 * Форматирование цен для отображения
 */

/**
 * Форматирование цены из копеек в рубли
 * @param priceInKopeks - Цена в копейках
 * @param currency - Валюта (по умолчанию RUB)
 * @returns Отформатированная строка с ценой
 * 
 * @example
 * formatPrice(500000) // "5 000₽"
 * formatPrice(1200000) // "12 000₽"
 */
export function formatPrice(
  priceInKopeks: number,
  currency: string = 'RUB'
): string {
  const priceInRubles = Math.round(priceInKopeks / 100)
  
  // Форматирование с разделителями тысяч
  const formatted = priceInRubles.toLocaleString('ru-RU')
  
  // Символ валюты
  const currencySymbol = getCurrencySymbol(currency)
  
  return `${formatted}${currencySymbol}`
}

/**
 * Форматирование диапазона цен
 * @param priceFrom - Цена от (в копейках)
 * @param priceTo - Цена до (в копейках), опционально
 * @param currency - Валюта
 * @returns Отформатированная строка с диапазоном
 * 
 * @example
 * formatPriceRange(500000) // "5 000₽"
 * formatPriceRange(500000, 800000) // "5 000 - 8 000₽"
 * formatPriceRange(500000, 500000) // "5 000₽" (если цены равны)
 */
export function formatPriceRange(
  priceFrom: number | null,
  priceTo: number | null = null,
  currency: string = 'RUB'
): string | null {
  if (!priceFrom) return null
  
  const from = Math.round(priceFrom / 100)
  const to = priceTo ? Math.round(priceTo / 100) : null
  
  const currencySymbol = getCurrencySymbol(currency)
  
  // Если цены равны или нет верхней границы
  if (!to || to === from) {
    return `${from.toLocaleString('ru-RU')}${currencySymbol}`
  }
  
  // Диапазон цен
  return `${from.toLocaleString('ru-RU')} - ${to.toLocaleString('ru-RU')}${currencySymbol}`
}

/**
 * Получение символа валюты
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
    KZT: '₸',
    BYN: 'Br',
  }
  
  return symbols[currency] || currency
}

/**
 * Форматирование цены с описанием
 * @param priceFrom - Цена от
 * @param priceTo - Цена до
 * @param description - Описание (например, "за сессию")
 * @param currency - Валюта
 * 
 * @example
 * formatPriceWithDescription(500000, null, "за сессию") // "5 000₽ за сессию"
 */
export function formatPriceWithDescription(
  priceFrom: number | null,
  priceTo: number | null = null,
  description: string | null = null,
  currency: string = 'RUB'
): string | null {
  const priceRange = formatPriceRange(priceFrom, priceTo, currency)
  
  if (!priceRange) return null
  if (!description) return priceRange
  
  return `${priceRange} ${description}`
}

