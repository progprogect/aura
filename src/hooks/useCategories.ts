'use client'

import { useState, useEffect } from 'react'

interface Category {
  key: string
  name: string
  emoji: string
  isActive: boolean
  order: number
}

// Глобальный кэш категорий
let categoriesCache: Category[] | null = null
let categoriesPromise: Promise<Category[]> | null = null

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Если данные уже в кэше, используем их
    if (categoriesCache) {
      setCategories(categoriesCache)
      setLoading(false)
      return
    }
    
    // Если запрос уже выполняется, ждем его
    if (categoriesPromise) {
      categoriesPromise
        .then(setCategories)
        .catch(setError)
        .finally(() => setLoading(false))
      return
    }
    
    // Выполняем новый запрос
    categoriesPromise = fetchCategories()
    categoriesPromise
      .then(data => {
        categoriesCache = data
        setCategories(data)
      })
      .catch(err => {
        setError(err.message)
        categoriesPromise = null // Сбрасываем промис при ошибке
      })
      .finally(() => setLoading(false))
  }, [])
  
  return { categories, loading, error }
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories')
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch categories')
  }
  
  return data.categories.sort((a: Category, b: Category) => a.order - b.order)
}

// Функция для очистки кэша (например, при обновлении категорий)
export function clearCategoriesCache() {
  categoriesCache = null
  categoriesPromise = null
}
