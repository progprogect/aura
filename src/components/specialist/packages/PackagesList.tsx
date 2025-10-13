/**
 * Список пакетов для покупки
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Package, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PackageData {
  id: string
  name: string
  description: string
  price: number
  popular: boolean
  features: string[]
}

interface PackagesData {
  packages: PackageData[]
  popularPackage: PackageData | null
  currentLimits: {
    totalBalance: number
  }
}

interface PackagesListProps {
  specialistId: string
}

export function PackagesList({ specialistId }: PackagesListProps) {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [currentBalance, setCurrentBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/specialist/packages')
      if (!response.ok) {
        throw new Error('Ошибка загрузки пакетов')
      }
      const data: PackagesData = await response.json()
      setPackages(data.packages)
      setCurrentBalance(data.currentLimits.totalBalance)
    } catch (error) {
      console.error('Ошибка загрузки пакетов:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (packageId: string, packagePrice: number) => {
    if (currentBalance < packagePrice) {
      alert('Недостаточно баллов для покупки пакета')
      return
    }

    setPurchasing(packageId)

    try {
      const response = await fetch('/api/specialist/packages/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Пакет "${data.package.name}" успешно куплен!`)
        // Обновляем баланс
        setCurrentBalance(data.newBalance.total)
        // Обновляем список пакетов
        fetchPackages()
      } else {
        alert(data.error || 'Ошибка покупки пакета')
      }
    } catch (error) {
      console.error('Ошибка покупки пакета:', error)
      alert('Ошибка покупки пакета')
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Выберите пакет
        </h2>
        <p className="text-gray-600">
          Пополните баланс для получения больше контактов и заявок
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative ${pkg.popular ? 'md:-mt-4' : ''}`}
          >
            <Card className={`p-6 h-full flex flex-col ${pkg.popular ? 'border-blue-500 shadow-lg' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Популярный
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {pkg.description}
                </p>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {pkg.price}
                </div>
                <div className="text-sm text-gray-500">баллов</div>
              </div>

              <div className="flex-1 mb-6">
                <ul className="space-y-3">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handlePurchase(pkg.id, pkg.price)}
                disabled={currentBalance < pkg.price || purchasing === pkg.id}
                className={`w-full ${pkg.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                variant={pkg.popular ? 'default' : 'outline'}
              >
                {purchasing === pkg.id ? (
                  'Покупка...'
                ) : currentBalance < pkg.price ? (
                  'Недостаточно баллов'
                ) : (
                  'Купить'
                )}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>
          Баллы списываются автоматически при просмотре контактов и получении заявок
        </p>
      </div>
    </div>
  )
}
