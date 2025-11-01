/**
 * Утилита для определения источника трафика
 */

export type TrafficSource = 'catalog' | 'search' | 'direct'

/**
 * Определить источник трафика из query параметров или referrer
 * @param searchParams Query параметры из URL
 * @param referer HTTP referer header (опционально)
 * @returns Источник трафика
 */
export function detectTrafficSource(
  searchParams: URLSearchParams | string | Record<string, string | string[] | undefined>,
  referer?: string | null
): TrafficSource {
  // Преобразуем searchParams в URLSearchParams если нужно
  let params: URLSearchParams
  if (searchParams instanceof URLSearchParams) {
    params = searchParams
  } else if (typeof searchParams === 'string') {
    params = new URLSearchParams(searchParams)
  } else {
    // Если это объект, создаем из него
    params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, Array.isArray(value) ? value[0] : value)
      }
    })
  }

  // 1. Проверяем query параметр source
  const sourceParam = params.get('source')
  if (sourceParam === 'catalog' || sourceParam === 'search' || sourceParam === 'direct') {
    return sourceParam
  }

  // 2. Определяем по referrer
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const pathname = refererUrl.pathname

      if (pathname.includes('/catalog')) {
        return 'catalog'
      }
      if (pathname.includes('/search') || pathname.includes('/find')) {
        return 'search'
      }
    } catch (error) {
      // Если не удалось распарсить referer - игнорируем
    }
  }

  // 3. По умолчанию - прямой переход
  return 'direct'
}

