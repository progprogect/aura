/**
 * Контент страницы списка специалистов
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'

interface Specialist {
  id: string
  slug: string
  category: string
  specializations: string[]
  verified: boolean
  verifiedAt: string | null
  blocked: boolean
  blockedAt: string | null
  blockedReason: string | null
  acceptingClients: boolean
  profileViews: number
  contactViews: number
  averageRating: number
  totalReviews: number
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    phone: string
    email: string | null
    avatar: string | null
    blocked: boolean
  }
}

export function SpecialistsListContent() {
  const router = useRouter()
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all')
  const [blockedFilter, setBlockedFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchSpecialists = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(verifiedFilter !== 'all' && { verified: verifiedFilter }),
        ...(blockedFilter !== 'all' && { blocked: blockedFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
      })

      const response = await fetch(`/api/admin/specialists?${params}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка загрузки специалистов')
      }

      setSpecialists(data.specialists)
      setTotalPages(data.pagination.pages)
    } catch (err: any) {
      console.error('Ошибка загрузки специалистов:', err)
      setError(err.message || 'Ошибка загрузки специалистов')
    } finally {
      setLoading(false)
    }
  }, [page, search, verifiedFilter, blockedFilter, categoryFilter])

  useEffect(() => {
    fetchSpecialists()
  }, [fetchSpecialists])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchSpecialists()
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Специалисты</h1>
        <p className="text-sm text-gray-600 mt-1">
          Управление специалистами и верификация
        </p>
      </div>

      {/* Поиск и фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Поиск */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск по имени, slug, телефону..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Найти</Button>
            </form>

            {/* Фильтры */}
            <div className="flex flex-wrap gap-2">
              <select
                value={verifiedFilter}
                onChange={(e) => {
                  setVerifiedFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Все статусы верификации</option>
                <option value="true">Верифицированные</option>
                <option value="false">Не верифицированные</option>
              </select>

              <select
                value={blockedFilter}
                onChange={(e) => {
                  setBlockedFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Все статусы блокировки</option>
                <option value="true">Заблокированные</option>
                <option value="false">Активные</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Все категории</option>
                <option value="psychology">Психология</option>
                <option value="fitness">Фитнес</option>
                <option value="nutrition">Нутрициология</option>
                <option value="coaching">Коучинг</option>
                <option value="wellness">Велнесс</option>
                <option value="massage">Массаж</option>
                <option value="medicine">Медицина</option>
                <option value="other">Другое</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список специалистов */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">{error}</div>
          </CardContent>
        </Card>
      ) : specialists.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Специалисты не найдены
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {specialists.map((specialist) => (
              <Card key={specialist.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/admin/specialists/${specialist.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary"
                        >
                          {specialist.user.firstName} {specialist.user.lastName}
                        </Link>
                        <div className="flex items-center gap-2">
                          {specialist.verified && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Верифицирован
                            </Badge>
                          )}
                          {specialist.blocked && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Заблокирован
                            </Badge>
                          )}
                          {specialist.user.blocked && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Пользователь заблокирован
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Категория:</span> {specialist.category}
                        </p>
                        <p>
                          <span className="font-medium">Специализации:</span>{' '}
                          {specialist.specializations.join(', ') || 'Не указаны'}
                        </p>
                        <p>
                          <span className="font-medium">Телефон:</span> {specialist.user.phone}
                        </p>
                        <p>
                          <span className="font-medium">Просмотры:</span> {specialist.profileViews} профиль, {specialist.contactViews} контакты
                        </p>
                        {specialist.totalReviews > 0 && (
                          <p>
                            <span className="font-medium">Рейтинг:</span> {specialist.averageRating.toFixed(1)} ({specialist.totalReviews} отзывов)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/admin/specialists/${specialist.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Подробнее
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Назад
              </Button>
              <span className="text-sm text-gray-600">
                Страница {page} из {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Вперед
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

