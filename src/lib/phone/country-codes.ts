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
  },
  
  // Испания
  '34': {
    code: '34',
    name: 'Испания',
    flag: '🇪🇸',
    format: '+34 ### ## ## ##',
    placeholder: '+34 612 34 56 78',
    length: 11,
    nationalFormat: '+34 ### ## ## ##'
  },
  
  // Италия
  '39': {
    code: '39',
    name: 'Италия',
    flag: '🇮🇹',
    format: '+39 ### ### ####',
    placeholder: '+39 312 345 6789',
    length: 12,
    nationalFormat: '+39 ### ### ####'
  },
  
  // Польша
  '48': {
    code: '48',
    name: 'Польша',
    flag: '🇵🇱',
    format: '+48 ### ### ###',
    placeholder: '+48 123 456 789',
    length: 11,
    nationalFormat: '+48 ### ### ###'
  },
  
  // Нидерланды
  '31': {
    code: '31',
    name: 'Нидерланды',
    flag: '🇳🇱',
    format: '+31 ## ### ####',
    placeholder: '+31 6 12345678',
    length: 11,
    nationalFormat: '+31 ## ### ####'
  },
  
  // Швеция
  '46': {
    code: '46',
    name: 'Швеция',
    flag: '🇸🇪',
    format: '+46 ## ### ## ##',
    placeholder: '+46 70 123 45 67',
    length: 11,
    nationalFormat: '+46 ## ### ## ##'
  },
  
  // Норвегия
  '47': {
    code: '47',
    name: 'Норвегия',
    flag: '🇳🇴',
    format: '+47 ### ## ###',
    placeholder: '+47 123 45 678',
    length: 10,
    nationalFormat: '+47 ### ## ###'
  },
  
  // Дания
  '45': {
    code: '45',
    name: 'Дания',
    flag: '🇩🇰',
    format: '+45 ## ## ## ##',
    placeholder: '+45 12 34 56 78',
    length: 10,
    nationalFormat: '+45 ## ## ## ##'
  },
  
  // Финляндия
  '358': {
    code: '358',
    name: 'Финляндия',
    flag: '🇫🇮',
    format: '+358 ## ### ####',
    placeholder: '+358 50 123 4567',
    length: 11,
    nationalFormat: '+358 ## ### ####'
  },
  
  // Швейцария
  '41': {
    code: '41',
    name: 'Швейцария',
    flag: '🇨🇭',
    format: '+41 ## ### ## ##',
    placeholder: '+41 79 123 45 67',
    length: 11,
    nationalFormat: '+41 ## ### ## ##'
  },
  
  // Австрия
  '43': {
    code: '43',
    name: 'Австрия',
    flag: '🇦🇹',
    format: '+43 ### ### ####',
    placeholder: '+43 664 123 4567',
    length: 12,
    nationalFormat: '+43 ### ### ####'
  },
  
  // Чехия
  '420': {
    code: '420',
    name: 'Чехия',
    flag: '🇨🇿',
    format: '+420 ### ### ###',
    placeholder: '+420 123 456 789',
    length: 11,
    nationalFormat: '+420 ### ### ###'
  },
  
  // Венгрия
  '36': {
    code: '36',
    name: 'Венгрия',
    flag: '🇭🇺',
    format: '+36 ## ### ####',
    placeholder: '+36 20 123 4567',
    length: 11,
    nationalFormat: '+36 ## ### ####'
  },
  
  // Румыния
  '40': {
    code: '40',
    name: 'Румыния',
    flag: '🇷🇴',
    format: '+40 ### ### ###',
    placeholder: '+40 123 456 789',
    length: 11,
    nationalFormat: '+40 ### ### ###'
  },
  
  // Болгария
  '359': {
    code: '359',
    name: 'Болгария',
    flag: '🇧🇬',
    format: '+359 ## ### ####',
    placeholder: '+359 87 123 4567',
    length: 11,
    nationalFormat: '+359 ## ### ####'
  },
  
  // Греция
  '30': {
    code: '30',
    name: 'Греция',
    flag: '🇬🇷',
    format: '+30 ### ### ####',
    placeholder: '+30 694 123 4567',
    length: 12,
    nationalFormat: '+30 ### ### ####'
  },
  
  // Португалия
  '351': {
    code: '351',
    name: 'Португалия',
    flag: '🇵🇹',
    format: '+351 ### ### ###',
    placeholder: '+351 123 456 789',
    length: 11,
    nationalFormat: '+351 ### ### ###'
  },
  
  // Израиль
  '972': {
    code: '972',
    name: 'Израиль',
    flag: '🇮🇱',
    format: '+972 ##-###-####',
    placeholder: '+972 50-123-4567',
    length: 11,
    nationalFormat: '+972 ##-###-####'
  },
  
  // ОАЭ
  '971': {
    code: '971',
    name: 'ОАЭ',
    flag: '🇦🇪',
    format: '+971 ## ### ####',
    placeholder: '+971 50 123 4567',
    length: 11,
    nationalFormat: '+971 ## ### ####'
  },
  
  // Саудовская Аравия
  '966': {
    code: '966',
    name: 'Саудовская Аравия',
    flag: '🇸🇦',
    format: '+966 ## ### ####',
    placeholder: '+966 50 123 4567',
    length: 11,
    nationalFormat: '+966 ## ### ####'
  },
  
  // Египет
  '20': {
    code: '20',
    name: 'Египет',
    flag: '🇪🇬',
    format: '+20 ## #### ####',
    placeholder: '+20 10 1234 5678',
    length: 12,
    nationalFormat: '+20 ## #### ####'
  },
  
  // ЮАР
  '27': {
    code: '27',
    name: 'ЮАР',
    flag: '🇿🇦',
    format: '+27 ## ### ####',
    placeholder: '+27 82 123 4567',
    length: 11,
    nationalFormat: '+27 ## ### ####'
  },
  
  // Аргентина
  '54': {
    code: '54',
    name: 'Аргентина',
    flag: '🇦🇷',
    format: '+54 ## ####-####',
    placeholder: '+54 11 1234-5678',
    length: 12,
    nationalFormat: '+54 ## ####-####'
  },
  
  // Мексика
  '52': {
    code: '52',
    name: 'Мексика',
    flag: '🇲🇽',
    format: '+52 ## #### ####',
    placeholder: '+52 55 1234 5678',
    length: 12,
    nationalFormat: '+52 ## #### ####'
  },
  
  // Чили
  '56': {
    code: '56',
    name: 'Чили',
    flag: '🇨🇱',
    format: '+56 # #### ####',
    placeholder: '+56 9 1234 5678',
    length: 11,
    nationalFormat: '+56 # #### ####'
  },
  
  // Колумбия
  '57': {
    code: '57',
    name: 'Колумбия',
    flag: '🇨🇴',
    format: '+57 ### ### ####',
    placeholder: '+57 300 123 4567',
    length: 12,
    nationalFormat: '+57 ### ### ####'
  },
  
  // Перу
  '51': {
    code: '51',
    name: 'Перу',
    flag: '🇵🇪',
    format: '+51 ### ### ###',
    placeholder: '+51 999 123 456',
    length: 11,
    nationalFormat: '+51 ### ### ###'
  },
  
  // Таиланд
  '66': {
    code: '66',
    name: 'Таиланд',
    flag: '🇹🇭',
    format: '+66 ##-###-####',
    placeholder: '+66 81-234-5678',
    length: 11,
    nationalFormat: '+66 ##-###-####'
  },
  
  // Сингапур
  '65': {
    code: '65',
    name: 'Сингапур',
    flag: '🇸🇬',
    format: '+65 #### ####',
    placeholder: '+65 8123 4567',
    length: 10,
    nationalFormat: '+65 #### ####'
  },
  
  // Малайзия
  '60': {
    code: '60',
    name: 'Малайзия',
    flag: '🇲🇾',
    format: '+60 ##-### ####',
    placeholder: '+60 12-345 6789',
    length: 11,
    nationalFormat: '+60 ##-### ####'
  },
  
  // Индонезия
  '62': {
    code: '62',
    name: 'Индонезия',
    flag: '🇮🇩',
    format: '+62 ###-###-####',
    placeholder: '+62 812-345-6789',
    length: 12,
    nationalFormat: '+62 ###-###-####'
  },
  
  // Вьетнам
  '84': {
    code: '84',
    name: 'Вьетнам',
    flag: '🇻🇳',
    format: '+84 ## ### ## ##',
    placeholder: '+84 90 123 45 67',
    length: 11,
    nationalFormat: '+84 ## ### ## ##'
  },
  
  // Филиппины
  '63': {
    code: '63',
    name: 'Филиппины',
    flag: '🇵🇭',
    format: '+63 ### ### ####',
    placeholder: '+63 917 123 4567',
    length: 12,
    nationalFormat: '+63 ### ### ####'
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
  
  // Если ничего не найдено, возвращаем null
  return null
}

/**
 * Форматирует номер телефона согласно маске страны
 * Исправлена логика: код страны не дублируется в национальной части
 */
export function formatPhoneNumber(input: string, countryCode?: CountryCode): string {
  const digits = input.replace(/\D/g, '')
  if (!digits) return ''
  
  const country = countryCode || detectCountryCode(digits)
  if (!country) return '+' + digits
  
  // Извлекаем код страны и национальные цифры
  const codeLength = country.code.length
  let nationalDigits = ''
  
  if (digits.startsWith(country.code)) {
    // Если номер начинается с кода страны - извлекаем только национальные цифры
    nationalDigits = digits.substring(codeLength)
  } else {
    // Если код страны отсутствует - все цифры считаем национальными
    nationalDigits = digits
  }
  
  // Начинаем с префикса кода страны
  let result = `+${country.code}`
  
  // Если нет национальных цифр - возвращаем только код с пробелом
  if (!nationalDigits) {
    return result + ' '
  }
  
  // Парсим формат чтобы найти где начинается национальная часть
  const format = country.format
  
  // Находим позицию где заканчивается код страны в формате
  // Ищем строку "+код_страны" или просто "код_страны"
  const codePrefix = `+${country.code}`
  let formatStartIndex = format.indexOf(codePrefix)
  
  if (formatStartIndex === -1) {
    // Префикс не найден, начинаем с начала
    formatStartIndex = 0
  } else {
    // Пропускаем код страны и один пробел после него (если есть)
    formatStartIndex += codePrefix.length
    if (formatStartIndex < format.length && format[formatStartIndex] === ' ') {
      formatStartIndex++
    }
  }
  
  // Добавляем пробел после кода страны
  result += ' '
  
  // Форматируем национальные цифры начиная с позиции после кода
  let formatIndex = formatStartIndex
  let nationalDigitIndex = 0
  
  while (formatIndex < format.length && nationalDigitIndex < nationalDigits.length) {
    const char = format[formatIndex]
    
    if (char === '#') {
      // Добавляем цифру
      result += nationalDigits[nationalDigitIndex]
      nationalDigitIndex++
    } else {
      // Это разделитель (скобка, пробел, дефис и т.д.)
      // Проверяем: будет ли следующая цифра после этого разделителя?
      let willHaveDigitAfter = false
      for (let i = formatIndex + 1; i < format.length; i++) {
        if (format[i] === '#') {
          // Нашли # впереди - проверяем есть ли у нас цифра для него
          willHaveDigitAfter = nationalDigitIndex < nationalDigits.length
          break
        }
      }
      
      // Добавляем разделитель только если после него будет цифра
      if (willHaveDigitAfter) {
        result += char
      }
    }
    
    formatIndex++
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
  
  // ИСПРАВЛЕНИЕ: НЕ добавляем код страны автоматически
  // Пользователь должен сам ввести код страны
  return digits
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
