/**
 * Хук для получения популярных ресурсов на главной странице
 */

'use client'

import { useState, useEffect } from 'react'
import { ResourceViewModel } from '@/lib/resources/types'

interface UseHomepageResourcesReturn {
  resources: ResourceViewModel[]
  loading: boolean
  error: string | null
}

// Простой in-memory кэш (TTL 5 минут)
let cachedData: ResourceViewModel[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 минут

export function useHomepageResources(): UseHomepageResourcesReturn {
  const [resources, setResources] = useState<ResourceViewModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResources = async () => {
      // Проверяем кэш
      const now = Date.now()
      if (cachedData && now - cacheTimestamp < CACHE_TTL) {
        setResources(cachedData)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Запрашиваем 6 популярных ресурсов
        const params = new URLSearchParams({
          limit: '6',
          sortBy: 'popularity',
        })

        const response = await fetch(`/api/resources?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Не удалось загрузить ресурсы')
        }

        const data = await response.json()

        if (!data.resources || !Array.isArray(data.resources)) {
          throw new Error('Некорректный формат данных')
        }

        // Сохраняем в кэш
        cachedData = data.resources
        cacheTimestamp = now

        setResources(data.resources)
      } catch (err) {
        console.error('Error fetching homepage resources:', err)
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  return { resources, loading, error }
}

// Функция для очистки кэша (если понадобится)
export function clearHomepageResourcesCache() {
  cachedData = null
  cacheTimestamp = 0
}

