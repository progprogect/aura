/**
 * Компонент карты для отображения адреса компании на Yandex Maps
 */

'use client'

import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

interface CompanyMapProps {
  address: string
  coordinates?: { lat: number; lng: number } | null
  className?: string
}

declare global {
  interface Window {
    ymaps: any
  }
}

export function CompanyMap({ address, coordinates, className = '' }: CompanyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Проверяем наличие координат
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return
    }

    // Проверяем наличие Yandex Maps API
    if (!window.ymaps) {
      // Загружаем Yandex Maps API
      const script = document.createElement('script')
      const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || ''
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
      script.async = true
      script.onload = () => {
        window.ymaps.ready(() => {
          initMap()
        })
      }
      document.head.appendChild(script)
    } else {
      // API уже загружен
      window.ymaps.ready(() => {
        initMap()
      })
    }

    function initMap() {
      if (!mapRef.current || !window.ymaps) return

      // Удаляем предыдущую карту, если она существует
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
      }

      // Создаем карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: [coordinates.lat, coordinates.lng],
        zoom: 15,
        controls: ['zoomControl', 'fullscreenControl']
      })

      // Добавляем метку
      const placemark = new window.ymaps.Placemark(
        [coordinates.lat, coordinates.lng],
        {
          balloonContent: address,
          iconCaption: address
        },
        {
          preset: 'islands#blueDotIconWithCaption'
        }
      )

      map.geoObjects.add(placemark)
      mapInstanceRef.current = map
    }

    return () => {
      // Очистка при размонтировании
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
    }
  }, [coordinates, address])

  // Если нет координат, показываем только адрес
  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Адрес компании</p>
            <p className="text-sm text-gray-600">{address || 'Адрес не указан'}</p>
            <p className="text-xs text-gray-500 mt-2">
              Для отображения на карте необходимо указать координаты адреса
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Адрес на карте</h3>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        <div ref={mapRef} className="w-full h-64 sm:h-80" />
      </div>
      <p className="text-sm text-gray-600">{address}</p>
    </div>
  )
}

