/**
 * API для автодополнения адресов через Nominatim (OpenStreetMap)
 * Бесплатный геокодер без необходимости API ключа
 */

import { NextRequest, NextResponse } from 'next/server'

interface NominatimAddress {
  display_name: string
  lat: string
  lon: string
  place_id: number
  type: string
  importance: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Запрос должен содержать минимум 3 символа' },
        { status: 400 }
      )
    }

    // Nominatim API endpoint
    // Используем формат JSON для получения структурированных данных
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&addressdetails=1` +
      `&limit=10` +
      `&countrycodes=ru,by` + // Ограничиваем поиск Россией и Беларусью
      `&accept-language=ru` // Русский язык для результатов

    // Важно: Nominatim требует User-Agent для идентификации приложения
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Evolution360/1.0 (contact@evolution360.ru)', // Требуется Nominatim
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('[geocoder] Nominatim API error:', response.status, response.statusText)
      return NextResponse.json(
        { success: false, error: 'Ошибка при запросе к геокодеру' },
        { status: 500 }
      )
    }

    const data: NominatimAddress[] = await response.json()

    // Преобразуем данные Nominatim в наш формат
    const addresses = data.map((item) => ({
      text: item.display_name,
      coordinates: {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      },
      placeId: item.place_id,
      type: item.type,
      importance: item.importance,
    }))

    // Сортируем по важности (более релевантные адреса первыми)
    addresses.sort((a, b) => b.importance - a.importance)

    return NextResponse.json({
      success: true,
      addresses,
    })

  } catch (error) {
    console.error('[geocoder] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

