/**
 * Контент страницы списка пользователей
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast, ToastContainer } from '@/components/ui/toast'
import {
  Search,
  Loader2,
  Eye,
  XCircle,
  UserCheck,
  User,
} from 'lucide-react'
import Link from 'next/link'

interface UserListItem {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string | null
  avatar: string | null
  blocked: boolean
  blockedAt: string | null
  blockedReason: string | null
  balance: string
  bonusBalance: string
  hasSpecialistProfile: boolean
  specialistProfile: {
    id: string
    slug: string
    category: string
    verified: boolean
    blocked: boolean
  } | null
  createdAt: string
}

export function UsersListContent() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [blockedFilter, setBlockedFilter] = useState<string>('all')
  const [hasSpecialistFilter, setHasSpecialistFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(blockedFilter !== 'all' && { blocked: blockedFilter }),
        ...(hasSpecialistFilter !== 'all' && {
          hasSpecialistProfile: hasSpecialistFilter,
        }),
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка загрузки пользователей')
      }

      setUsers(data.users)
      setTotalPages(data.pagination.pages)
    } catch (err: any) {
      console.error('Ошибка загрузки пользователей:', err)
      setError(err.message || 'Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, search, blockedFilter, hasSpecialistFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleBlockUser = async (blocked: boolean) => {
    if (!selectedUser) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked, reason: blockReason || null }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка блокировки')
      }

      addToast({
        type: 'success',
        title: blocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
      })

      setBlockModalOpen(false)
      setBlockReason('')
      setSelectedUser(null)
      fetchUsers()
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Ошибка',
        description: err.message,
      })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <p className="text-sm text-gray-600 mt-1">
          Управление пользователями платформы
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
                  placeholder="Поиск по имени, телефону, email..."
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
                value={hasSpecialistFilter}
                onChange={(e) => {
                  setHasSpecialistFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Все пользователи</option>
                <option value="true">Со специалистом</option>
                <option value="false">Без специалиста</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список пользователей */}
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
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Пользователи не найдены
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </span>
                        <div className="flex items-center gap-2">
                          {user.blocked && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Заблокирован
                            </Badge>
                          )}
                          {user.hasSpecialistProfile && user.specialistProfile && (
                            <Badge variant="default" className="bg-purple-100 text-purple-800">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Специалист
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Телефон:</span> {user.phone}
                        </p>
                        {user.email && (
                          <p>
                            <span className="font-medium">Email:</span> {user.email}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Баланс:</span> {parseFloat(user.balance).toLocaleString()} баллов
                        </p>
                        <p>
                          <span className="font-medium">Бонусные баллы:</span> {parseFloat(user.bonusBalance).toLocaleString()} баллов
                        </p>
                        {user.specialistProfile && (
                          <div className="mt-2 pt-2 border-t">
                            <p>
                              <span className="font-medium">Профиль специалиста:</span>{' '}
                              {user.specialistProfile.verified && (
                                <Badge variant="default" className="bg-green-100 text-green-800 text-xs mr-1">
                                  Верифицирован
                                </Badge>
                              )}
                              {user.specialistProfile.blocked && (
                                <Badge variant="destructive" className="text-xs mr-1">
                                  Заблокирован
                                </Badge>
                              )}
                              <Link
                                href={`/admin/specialists/${user.specialistProfile.id}`}
                                className="text-primary hover:underline"
                              >
                                {user.specialistProfile.slug}
                              </Link>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setBlockModalOpen(true)
                        }}
                      >
                        {user.blocked ? (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            Разблокировать
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Заблокировать
                          </>
                        )}
                      </Button>
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

      {/* Модальное окно блокировки */}
      <Dialog
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false)
          setBlockReason('')
          setSelectedUser(null)
        }}
        title={
          selectedUser
            ? selectedUser.blocked
              ? 'Разблокировать пользователя'
              : 'Заблокировать пользователя'
            : 'Блокировка пользователя'
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setBlockModalOpen(false)
                setBlockReason('')
                setSelectedUser(null)
              }}
            >
              Отмена
            </Button>
            <Button
              variant={selectedUser?.blocked ? 'default' : 'destructive'}
              onClick={() => {
                if (selectedUser) {
                  handleBlockUser(!selectedUser.blocked)
                }
              }}
              disabled={actionLoading || !selectedUser}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : selectedUser?.blocked ? (
                'Разблокировать'
              ) : (
                'Заблокировать'
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedUser && (
            <>
              <p className="text-sm text-gray-600">
                {selectedUser.blocked
                  ? 'Пользователь будет разблокирован'
                  : 'Пользователь будет заблокирован'}
              </p>
              <div>
                <Label htmlFor="block-reason">Причина (опционально)</Label>
                <Input
                  id="block-reason"
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Укажите причину блокировки"
                />
              </div>
            </>
          )}
        </div>
      </Dialog>

      {/* Toast контейнер */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}

