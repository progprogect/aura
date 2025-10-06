/**
 * Упрощенный хук для загрузки специалистов на главной странице
 * Показывает 6 верифицированных популярных специалистов
 */

'use client'

import { useState, useEffect } from 'react'
import { SpecialistViewModel } from '@/lib/catalog/types'

interface UseHomepageSpecialistsReturn {
  specialists: SpecialistViewModel[]
  loading: boolean
  error: string | null
}

// Простой in-memory кэш (TTL 5 минут)
let cachedData: SpecialistViewModel[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 минут

export function useHomepageSpecialists(): UseHomepageSpecialistsReturn {
  const [specialists, setSpecialists] = useState<SpecialistViewModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpecialists = async () => {
      // Проверяем кэш
      const now = Date.now()
      if (cachedData && now - cacheTimestamp < CACHE_TTL) {
        setSpecialists(cachedData)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Запрашиваем 6 верифицированных популярных специалистов
        const params = new URLSearchParams({
          limit: '6',
          verified: 'true',
          sortBy: 'rating', // По популярности (profileViews)
        })

        const response = await fetch(`/api/specialists?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Не удалось загрузить специалистов')
        }

        const data = await response.json()

        if (!data.specialists || !Array.isArray(data.specialists)) {
          throw new Error('Некорректный формат данных')
        }

        // Сохраняем в кэш
        cachedData = data.specialists
        cacheTimestamp = now

        setSpecialists(data.specialists)
      } catch (err) {
        console.error('Error fetching homepage specialists:', err)
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }

    fetchSpecialists()
  }, [])

  return { specialists, loading, error }
}

// Функция для очистки кэша (если понадобится)
export function clearHomepageCache() {
  cachedData = null
  cacheTimestamp = 0
}

