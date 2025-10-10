/**
 * Серверная генерация превью для PDF файлов
 * Использует pdfjs-dist для рендеринга первой страницы в PNG
 */

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from 'canvas'

/**
 * Генерирует превью первой страницы PDF в формате PNG
 */
export async function generatePDFPreviewServer(
  pdfUrl: string,
  options: {
    scale?: number
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<Buffer | null> {
  const { scale = 2, maxWidth = 1200, maxHeight = 1600 } = options

  try {
    // Загружаем PDF документ
    const loadingTask = getDocument({
      url: pdfUrl,
      useSystemFonts: true,
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/standard_fonts/',
    })

    const pdfDocument = await loadingTask.promise

    // Получаем первую страницу
    const page = await pdfDocument.getPage(1)

    // Получаем viewport с масштабированием
    const viewport = page.getViewport({ scale })

    // Ограничиваем размеры
    let finalWidth = viewport.width
    let finalHeight = viewport.height

    if (finalWidth > maxWidth) {
      const ratio = maxWidth / finalWidth
      finalWidth = maxWidth
      finalHeight = finalHeight * ratio
    }

    if (finalHeight > maxHeight) {
      const ratio = maxHeight / finalHeight
      finalHeight = maxHeight
      finalWidth = finalWidth * ratio
    }

    // Создаем canvas для рендеринга
    const canvas = createCanvas(Math.floor(finalWidth), Math.floor(finalHeight))
    const context = canvas.getContext('2d')

    // Рендерим PDF страницу на canvas
    const renderViewport = page.getViewport({ 
      scale: finalWidth / viewport.width * scale 
    })
    
    await page.render({
      canvasContext: context as any,
      viewport: renderViewport,
      transform: null,
      background: 'transparent'
    } as any).promise

    // Конвертируем canvas в PNG Buffer
    const buffer = canvas.toBuffer('image/png')

    // Очищаем ресурсы
    await pdfDocument.destroy()

    return buffer
  } catch (error) {
    console.error('[PDF Preview Server] Ошибка генерации превью:', error)
    return null
  }
}

/**
 * Генерирует превью для карточки (меньший размер)
 */
export async function generatePDFCardPreview(pdfUrl: string): Promise<Buffer | null> {
  return generatePDFPreviewServer(pdfUrl, {
    scale: 1.5,
    maxWidth: 400,
    maxHeight: 500
  })
}

/**
 * Генерирует превью для детальной страницы
 */
export async function generatePDFDetailPreview(pdfUrl: string): Promise<Buffer | null> {
  return generatePDFPreviewServer(pdfUrl, {
    scale: 2,
    maxWidth: 1200,
    maxHeight: 1600
  })
}

/**
 * Проверяет, является ли URL PDF файлом
 */
export function isPDFUrl(url: string): boolean {
  return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?')
}

