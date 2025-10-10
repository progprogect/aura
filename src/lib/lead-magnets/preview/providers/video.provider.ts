/**
 * Video Preview Provider
 * Получение thumbnails для видео платформ (YouTube, Vimeo, etc)
 */

import { BasePreviewProvider } from './base.provider'
import type { PreviewGenerationOptions, PreviewGenerationResult } from '../core/types'
import { 
  isYouTubeUrl, 
  getYouTubeThumbnail, 
  isVimeoUrl 
} from '../../preview'
import { 
  detectContentFromUrl, 
  getVideoThumbnailUrl 
} from '../../content-detector'
import { generateCardPreview } from '../../image-optimizer'

export class VideoPreviewProvider extends BasePreviewProvider {
  name = 'VideoPreviewProvider'

  canHandle(options: PreviewGenerationOptions): boolean {
    if (options.type !== 'link' || !options.linkUrl) {
      return false
    }

    return isYouTubeUrl(options.linkUrl) || isVimeoUrl(options.linkUrl)
  }

  async generate(options: PreviewGenerationOptions): Promise<PreviewGenerationResult> {
    if (!options.linkUrl) {
      return this.errorResult('Video URL is required')
    }

    try {
      console.log(`[${this.name}] Получение thumbnail для видео: ${options.title}`)

      let thumbnailUrl: string | null = null

      // YouTube
      if (isYouTubeUrl(options.linkUrl)) {
        thumbnailUrl = getYouTubeThumbnail(options.linkUrl)
      } 
      // Vimeo и другие платформы
      else {
        const contentInfo = detectContentFromUrl(options.linkUrl)
        if (contentInfo.type === 'video' && contentInfo.platform && contentInfo.id) {
          thumbnailUrl = getVideoThumbnailUrl(contentInfo.platform as any, contentInfo.id)
        }
      }

      if (!thumbnailUrl) {
        return this.errorResult('Could not get video thumbnail')
      }

      // Оптимизируем thumbnail
      const buffer = await generateCardPreview(thumbnailUrl)

      console.log(`[${this.name}] ✅ Video thumbnail получен и оптимизирован`)

      return this.successResult(buffer, 'video-thumbnail', {
        format: 'webp',
        size: buffer.length
      })
    } catch (error) {
      return this.handleError(error, 'Video thumbnail fetch failed')
    }
  }
}

