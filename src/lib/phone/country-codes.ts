/**
 * Коды стран и их форматы для телефонных номеров
 */

export interface CountryCode {
  code: string // Международный код (например, "7", "380", "1")
  name: string // Название страны
  flag: string // Эмодзи флага
  format: string // Формат маски (например, "+7 (###) ###-##-##")
  placeholder: string // Плейсхолдер
  length: number // Общая длина номера включая код страны
  nationalFormat?: string // Национальный формат
}

export const COUNTRY_CODES: Record<string, CountryCode> = {
  // Россия и страны СНГ
  '7': {
    code: '7',
    name: 'Россия',
    flag: '🇷🇺',
    format: '+7 (###) ###-##-##',
    placeholder: '+7 (999) 123-45-67',
    length: 11,
    nationalFormat: '+7 (###) ###-##-##'
  },
  
  // Украина
  '380': {
    code: '380',
    name: 'Украина',
    flag: '🇺🇦',
    format: '+380 (##) ###-##-##',
    placeholder: '+380 (99) 123-45-67',
    length: 12,
    nationalFormat: '+380 (##) ###-##-##'
  },
  
  // Беларусь
  '375': {
    code: '375',
    name: 'Беларусь',
    flag: '🇧🇾',
    format: '+375 (##) ###-##-##',
    placeholder: '+375 (29) 123-45-67',
    length: 12,
    nationalFormat: '+375 (##) ###-##-##'
  },
  
  // Казахстан (использует тот же код 7, что и Россия)
  // Для различения можно использовать диапазоны номеров
  // '7-kz': { 
  //   code: '7',
  //   name: 'Казахстан',
  //   flag: '🇰🇿',
  //   format: '+7 (###) ###-##-##',
  //   placeholder: '+7 (700) 123-45-67',
  //   length: 11,
  //   nationalFormat: '+7 (###) ###-##-##'
  // },
  
  // США и Канада
  '1': {
    code: '1',
    name: 'США/Канада',
    flag: '🇺🇸',
    format: '+1 (###) ###-####',
    placeholder: '+1 (555) 123-4567',
    length: 11,
    nationalFormat: '+1 (###) ###-####'
  },
  
  // Германия
  '49': {
    code: '49',
    name: 'Германия',
    flag: '🇩🇪',
    format: '+49 ### ########',
    placeholder: '+49 30 12345678',
    length: 12,
    nationalFormat: '+49 ### ########'
  },
  
  // Франция
  '33': {
    code: '33',
    name: 'Франция',
    flag: '🇫🇷',
    format: '+33 # ## ## ## ##',
    placeholder: '+33 1 23 45 67 89',
    length: 11,
    nationalFormat: '+33 # ## ## ## ##'
  },
  
  // Великобритания
  '44': {
    code: '44',
    name: 'Великобритания',
    flag: '🇬🇧',
    format: '+44 #### ######',
    placeholder: '+44 20 1234 5678',
    length: 12,
    nationalFormat: '+44 #### ######'
  },
  
  // Китай
  '86': {
    code: '86',
    name: 'Китай',
    flag: '🇨🇳',
    format: '+86 ### #### ####',
    placeholder: '+86 138 1234 5678',
    length: 13,
    nationalFormat: '+86 ### #### ####'
  },
  
  // Япония
  '81': {
    code: '81',
    name: 'Япония',
    flag: '🇯🇵',
    format: '+81 ##-####-####',
    placeholder: '+81 90-1234-5678',
    length: 12,
    nationalFormat: '+81 ##-####-####'
  },
  
  // Южная Корея
  '82': {
    code: '82',
    name: 'Южная Корея',
    flag: '🇰🇷',
    format: '+82 ##-####-####',
    placeholder: '+82 10-1234-5678',
    length: 12,
    nationalFormat: '+82 ##-####-####'
  },
  
  // Индия
  '91': {
    code: '91',
    name: 'Индия',
    flag: '🇮🇳',
    format: '+91 ##### #####',
    placeholder: '+91 98765 43210',
    length: 12,
    nationalFormat: '+91 ##### #####'
  },
  
  // Турция
  '90': {
    code: '90',
    name: 'Турция',
    flag: '🇹🇷',
    format: '+90 ### ### ## ##',
    placeholder: '+90 555 123 45 67',
    length: 12,
    nationalFormat: '+90 ### ### ## ##'
  },
  
  // Бразилия
  '55': {
    code: '55',
    name: 'Бразилия',
    flag: '🇧🇷',
    format: '+55 ## #####-####',
    placeholder: '+55 11 99999-9999',
    length: 13,
    nationalFormat: '+55 ## #####-####'
  },
  
  // Австралия
  '61': {
    code: '61',
    name: 'Австралия',
    flag: '🇦🇺',
    format: '+61 ### ### ###',
    placeholder: '+61 412 345 678',
    length: 11,
    nationalFormat: '+61 ### ### ###'
  }
}

/**
 * Определяет код страны по введённым цифрам
 */
export function detectCountryCode(input: string): CountryCode | null {
  const digits = input.replace(/\D/g, '')
  
  if (!digits) return null
  
  // Проверяем коды разной длины (от длинных к коротким)
  const possibleCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length)
  
  for (const code of possibleCodes) {
    if (digits.startsWith(code)) {
      return COUNTRY_CODES[code]
    }
  }
  
  // Если ничего не найдено, возвращаем Россию по умолчанию
  return COUNTRY_CODES['7']
}

/**
 * Форматирует номер телефона согласно маске страны
 */
export function formatPhoneNumber(input: string, countryCode?: CountryCode): string {
  const digits = input.replace(/\D/g, '')
  if (!digits) return ''
  
  const country = countryCode || detectCountryCode(digits)
  if (!country) return digits
  
  const format = country.format
  let result = ''
  let digitIndex = 0
  
  for (let i = 0; i < format.length; i++) {
    const char = format[i]
    
    if (char === '#') {
      if (digitIndex < digits.length) {
        result += digits[digitIndex]
        digitIndex++
      } else {
        break
      }
    } else {
      result += char
    }
  }
  
  return result
}

/**
 * Нормализует номер телефона в международный формат
 */
export function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (!digits) return ''
  
  const country = detectCountryCode(digits)
  if (!country) return digits
  
  // Если номер начинается с 8 и это Россия, заменяем на 7
  if (country.code === '7' && digits.startsWith('8')) {
    return '+' + '7' + digits.slice(1)
  }
  
  // Если номер уже содержит код страны, добавляем +
  if (digits.startsWith(country.code)) {
    return '+' + digits
  }
  
  // Иначе добавляем код страны
  return '+' + country.code + digits
}

/**
 * Получает плейсхолдер для кода страны
 */
export function getPlaceholder(countryCode?: CountryCode): string {
  return countryCode?.placeholder || COUNTRY_CODES['7'].placeholder
}

/**
 * Валидирует номер телефона
 */
export function validatePhoneNumber(input: string): { isValid: boolean; error?: string } {
  const digits = input.replace(/\D/g, '')
  
  if (!digits) {
    return { isValid: false, error: 'Номер телефона обязателен' }
  }
  
  const country = detectCountryCode(digits)
  if (!country) {
    return { isValid: false, error: 'Неверный код страны' }
  }
  
  if (digits.length < country.length - 1) {
    return { isValid: false, error: `Номер слишком короткий для ${country.name}` }
  }
  
  if (digits.length > country.length) {
    return { isValid: false, error: `Номер слишком длинный для ${country.name}` }
  }
  
  return { isValid: true }
}
