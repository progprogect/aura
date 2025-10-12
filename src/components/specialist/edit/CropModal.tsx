/**
 * CropModal - модальное окно для обрезки неквадратных изображений
 * Использует react-easy-crop для интерфейса crop
 */

'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cropper from 'react-easy-crop'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Area } from 'react-easy-crop'

interface CropModalProps {
  isOpen: boolean
  imageUrl: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onClose: () => void
}

/**
 * Создать cropped image из canvas
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  // Устанавливаем размер canvas равным размеру crop area
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Рисуем cropped изображение
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // Конвертируем canvas в Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Canvas is empty'))
      }
    }, 'image/jpeg', 0.95)
  })
}

/**
 * Создать Image element из src
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })
}

export function CropModal({ isOpen, imageUrl, onCropComplete, onClose }: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels) return

    setIsCropping(true)
    try {
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels)
      onCropComplete(croppedBlob)
    } catch (error) {
      console.error('Ошибка обрезки изображения:', error)
      alert('Ошибка обрезки изображения')
    } finally {
      setIsCropping(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Обрезать изображение
            </h2>
            <button
              onClick={onClose}
              disabled={isCropping}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Cropper Area */}
          <div className="relative w-full" style={{ height: '500px' }}>
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1} // Квадрат (1:1)
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteCallback}
              style={{
                containerStyle: {
                  backgroundColor: '#000'
                }
              }}
            />
          </div>

          {/* Controls */}
          <div className="bg-gray-50 px-6 py-4 space-y-4">
            {/* Zoom slider */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 min-w-[60px]">
                Масштаб
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
                disabled={isCropping}
              />
              <span className="text-sm text-gray-500 min-w-[40px]">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Hint */}
            <div className="text-xs text-gray-500 text-center">
              Перетащите изображение для позиционирования. Используйте колесо мыши или slider для масштабирования.
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleCropConfirm}
                disabled={isCropping}
                className="flex-1"
              >
                {isCropping ? (
                  'Обрезка...'
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Применить
                  </>
                )}
              </Button>
              <Button
                onClick={onClose}
                disabled={isCropping}
                variant="outline"
              >
                Отмена
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

