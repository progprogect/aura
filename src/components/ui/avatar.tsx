import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  src?: string
  alt?: string
  verified?: boolean
  fallback?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 120, src, alt, verified = false, fallback, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    // Инициалы для fallback
    const initials = React.useMemo(() => {
      if (fallback) return fallback
      if (alt) {
        return alt
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      }
      return '?'
    }, [alt, fallback])

    return (
      <div
        ref={ref}
        className={cn('relative inline-block', className)}
        style={{ width: size, height: size }}
        {...props}
      >
        {/* Аватар */}
        <div
          className={cn(
            'relative overflow-hidden rounded-full bg-gray-200',
            'border-2',
            verified
              ? 'border-transparent bg-gradient-to-br from-primary-500 to-primary-300 p-[3px]'
              : 'border-gray-200'
          )}
          style={{ width: size, height: size }}
        >
          {/* Внутренний контейнер (для градиентной рамки у верифицированных) */}
          <div className="h-full w-full overflow-hidden rounded-full bg-white">
            {src && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              // Fallback с инициалами
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white">
                <span style={{ fontSize: size / 3 }} className="font-semibold">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verified badge */}
        {verified && (
          <div
            className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-md"
            style={{
              width: size / 4,
              height: size / 4,
              minWidth: 20,
              minHeight: 20,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{
                width: size / 6,
                height: size / 6,
                minWidth: 12,
                minHeight: 12,
              }}
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export { Avatar }



