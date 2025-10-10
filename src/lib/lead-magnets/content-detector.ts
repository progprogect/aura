/**
 * Умный детектор типа контента для лид-магнитов
 * Определяет тип контента по URL или расширению файла
 */

// Типы контента
export type ContentType = 
  | 'video' 
  | 'document' 
  | 'image' 
  | 'audio' 
  | 'archive' 
  | 'text' 
  | 'presentation' 
  | 'spreadsheet'
  | 'social'
  | 'unknown'

// Платформы
export type Platform = 
  | 'youtube' 
  | 'vimeo' 
  | 'dailymotion' 
  | 'twitch'
  | 'google-docs'
  | 'office-online'
  | 'notion'
  | 'figma'
  | 'soundcloud'
  | 'spotify'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'unknown'

export interface ContentInfo {
  type: ContentType
  platform?: Platform
  id?: string
  extension?: string
  mimeType?: string
  isEmbeddable: boolean
}

// Видео платформы
const VIDEO_PLATFORMS = {
  youtube: {
    patterns: [
      /youtube\.com\/watch\?v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ],
    thumbnailUrl: (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    embedUrl: (id: string) => `https://www.youtube.com/embed/${id}`,
    color: '#FF0000'
  },
  vimeo: {
    patterns: [
      /vimeo\.com\/(\d+)/,
      /vimeo\.com\/channels\/[\w-]+\/(\d+)/,
      /vimeo\.com\/groups\/[\w-]+\/videos\/(\d+)/
    ],
    thumbnailUrl: (id: string) => `https://vumbnail.com/${id}.jpg`,
    embedUrl: (id: string) => `https://player.vimeo.com/video/${id}`,
    color: '#1AB7EA'
  },
  dailymotion: {
    patterns: [
      /dailymotion\.com\/video\/([^_]+)/,
      /dai\.ly\/([^_]+)/
    ],
    thumbnailUrl: (id: string) => `https://www.dailymotion.com/thumbnail/video/${id}`,
    embedUrl: (id: string) => `https://www.dailymotion.com/embed/video/${id}`,
    color: '#0066CC'
  },
  twitch: {
    patterns: [
      /twitch\.tv\/videos\/(\d+)/,
      /twitch\.tv\/(\w+)\/clip\/(\w+)/
    ],
    thumbnailUrl: (id: string) => `https://static-cdn.jtvnw.net/ttv-boxart/./${id}.jpg`,
    embedUrl: (id: string) => `https://player.twitch.tv/?video=${id}`,
    color: '#9146FF'
  }
}

// Документ платформы
const DOCUMENT_PLATFORMS = {
  'google-docs': {
    patterns: [
      /docs\.google\.com\/document\/d\/([^\/]+)/,
      /docs\.google\.com\/document\/d\/([^\/]+)\/edit/
    ],
    embedUrl: (id: string) => `https://docs.google.com/document/d/${id}/preview`,
    color: '#4285F4'
  },
  'office-online': {
    patterns: [
      /office\.com\/.*\/viewer\.aspx\?src=([^&]+)/,
      /onedrive\.live\.com\/embed\?resid=([^&]+)/
    ],
    embedUrl: (id: string) => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(id)}`,
    color: '#D83B01'
  },
  notion: {
    patterns: [
      /notion\.so\/([^\/]+)/,
      /notion\.site\/([^\/]+)/
    ],
    embedUrl: (id: string) => `https://notion.so/${id}`,
    color: '#000000'
  },
  figma: {
    patterns: [
      /figma\.com\/file\/([^\/]+)/,
      /figma\.com\/proto\/([^\/]+)/
    ],
    embedUrl: (id: string) => `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/${id}`,
    color: '#F24E1E'
  }
}

// Аудио платформы
const AUDIO_PLATFORMS = {
  soundcloud: {
    patterns: [
      /soundcloud\.com\/([^\/]+)\/([^\/]+)/
    ],
    embedUrl: (id: string) => `https://w.soundcloud.com/player/?url=${encodeURIComponent(id)}`,
    color: '#FF5500'
  },
  spotify: {
    patterns: [
      /open\.spotify\.com\/(track|album|playlist)\/([^?]+)/
    ],
    embedUrl: (id: string) => `https://open.spotify.com/embed/${id}`,
    color: '#1DB954'
  }
}

// Социальные платформы
const SOCIAL_PLATFORMS = {
  instagram: {
    patterns: [/instagram\.com\/p\/([^\/]+)/],
    embedUrl: (id: string) => `https://www.instagram.com/p/${id}/embed/`,
    color: '#E4405F'
  },
  twitter: {
    patterns: [
      /twitter\.com\/\w+\/status\/(\d+)/,
      /x\.com\/\w+\/status\/(\d+)/
    ],
    embedUrl: (id: string) => `https://twitter.com/i/status/${id}`,
    color: '#1DA1F2'
  },
  linkedin: {
    patterns: [/linkedin\.com\/posts\/[^\/]+-(\d+)/],
    embedUrl: (id: string) => `https://www.linkedin.com/embed/feed/update/urn:li:activity:${id}`,
    color: '#0077B5'
  }
}

// Расширения файлов по типам
const FILE_EXTENSIONS = {
  // Изображения
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff'],
  
  // Видео
  video: ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v'],
  
  // Аудио
  audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
  
  // Документы
  document: ['.pdf', '.doc', '.docx', '.rtf', '.txt'],
  
  // Презентации
  presentation: ['.ppt', '.pptx', '.odp'],
  
  // Таблицы
  spreadsheet: ['.xls', '.xlsx', '.csv', '.ods'],
  
  // Архивы
  archive: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
  
  // Текстовые
  text: ['.txt', '.rtf', '.json', '.xml', '.md', '.log']
}

// MIME типы
const MIME_TYPES = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/avi': 'video',
  'video/quicktime': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/flac': 'audio',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-powerpoint': 'presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
  'application/vnd.ms-excel': 'spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'text/plain': 'text',
  'application/json': 'text',
  'application/xml': 'text'
}

/**
 * Определяет тип контента по URL
 */
export function detectContentFromUrl(url: string): ContentInfo {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    const pathname = urlObj.pathname

    // Проверяем видео платформы
    for (const [platform, config] of Object.entries(VIDEO_PLATFORMS)) {
      for (const pattern of config.patterns) {
        const match = url.match(pattern)
        if (match) {
          return {
            type: 'video',
            platform: platform as Platform,
            id: match[1] || match[2], // Для некоторых платформ ID может быть в разных группах
            isEmbeddable: true
          }
        }
      }
    }

    // Проверяем документ платформы
    for (const [platform, config] of Object.entries(DOCUMENT_PLATFORMS)) {
      for (const pattern of config.patterns) {
        const match = url.match(pattern)
        if (match) {
          return {
            type: 'document',
            platform: platform as Platform,
            id: match[1],
            isEmbeddable: true
          }
        }
      }
    }

    // Проверяем аудио платформы
    for (const [platform, config] of Object.entries(AUDIO_PLATFORMS)) {
      for (const pattern of config.patterns) {
        const match = url.match(pattern)
        if (match) {
          return {
            type: 'audio',
            platform: platform as Platform,
            id: match[1] || match[2],
            isEmbeddable: true
          }
        }
      }
    }

    // Проверяем социальные платформы
    for (const [platform, config] of Object.entries(SOCIAL_PLATFORMS)) {
      for (const pattern of config.patterns) {
        const match = url.match(pattern)
        if (match) {
          return {
            type: 'social',
            platform: platform as Platform,
            id: match[1],
            isEmbeddable: true
          }
        }
      }
    }

    // Проверяем популярные сервисы изображений
    const imageServices = [
      'unsplash.com',
      'images.unsplash.com',
      'cdn.unsplash.com',
      'pixabay.com',
      'pexels.com',
      'imgur.com',
      'flickr.com'
    ]
    
    if (imageServices.some(service => hostname.includes(service))) {
      return {
        type: 'image',
        extension: '.jpg', // По умолчанию для изображений с сервисов
        isEmbeddable: true
      }
    }

    // Проверяем прямые ссылки на изображения
    const imageExtensions = FILE_EXTENSIONS.image
    const isImageUrl = imageExtensions.some(ext => pathname.toLowerCase().endsWith(ext))
    if (isImageUrl) {
      return {
        type: 'image',
        extension: imageExtensions.find(ext => pathname.toLowerCase().endsWith(ext)),
        isEmbeddable: false
      }
    }

    return {
      type: 'unknown',
      isEmbeddable: false
    }

  } catch (error) {
    return {
      type: 'unknown',
      isEmbeddable: false
    }
  }
}

/**
 * Определяет тип файла по расширению
 */
export function detectContentFromFileExtension(filename: string): ContentInfo {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  
  for (const [type, extensions] of Object.entries(FILE_EXTENSIONS)) {
    if (extensions.includes(extension)) {
      return {
        type: type as ContentType,
        extension,
        isEmbeddable: type === 'image' || type === 'video' || type === 'document'
      }
    }
  }

  return {
    type: 'unknown',
    extension,
    isEmbeddable: false
  }
}


/**
 * Определяет тип файла по MIME типу
 */
export function detectContentFromMimeType(mimeType: string): ContentInfo {
  const type = MIME_TYPES[mimeType as keyof typeof MIME_TYPES]
  
  if (type) {
    return {
      type: type as ContentType,
      mimeType,
      isEmbeddable: type === 'image' || type === 'video' || type === 'document'
    }
  }

  return {
    type: 'unknown',
    mimeType,
    isEmbeddable: false
  }
}

/**
 * Получает информацию о превью для видео платформы
 */
export function getVideoThumbnailUrl(platform: Platform, id: string): string | null {
  const config = VIDEO_PLATFORMS[platform as keyof typeof VIDEO_PLATFORMS]
  return config ? config.thumbnailUrl(id) : null
}

/**
 * Получает embed URL для платформы
 */
export function getEmbedUrl(platform: Platform, id: string): string | null {
  const videoConfig = VIDEO_PLATFORMS[platform as keyof typeof VIDEO_PLATFORMS]
  if (videoConfig) return videoConfig.embedUrl(id)
  
  const docConfig = DOCUMENT_PLATFORMS[platform as keyof typeof DOCUMENT_PLATFORMS]
  if (docConfig) return docConfig.embedUrl(id)
  
  const audioConfig = AUDIO_PLATFORMS[platform as keyof typeof AUDIO_PLATFORMS]
  if (audioConfig) return audioConfig.embedUrl(id)
  
  const socialConfig = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS]
  if (socialConfig) return socialConfig.embedUrl(id)
  
  return null
}

/**
 * Получает цвет платформы
 */
export function getPlatformColor(platform: Platform): string {
  const videoConfig = VIDEO_PLATFORMS[platform as keyof typeof VIDEO_PLATFORMS]
  if (videoConfig) return videoConfig.color
  
  const docConfig = DOCUMENT_PLATFORMS[platform as keyof typeof DOCUMENT_PLATFORMS]
  if (docConfig) return docConfig.color
  
  const audioConfig = AUDIO_PLATFORMS[platform as keyof typeof AUDIO_PLATFORMS]
  if (audioConfig) return audioConfig.color
  
  const socialConfig = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS]
  if (socialConfig) return socialConfig.color
  
  return '#6B7280' // Серый по умолчанию
}
