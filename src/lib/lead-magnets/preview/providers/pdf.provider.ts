/**
 * PDF Preview Provider
 * Генерирует превью первой страницы PDF
 */

import { BasePreviewProvider } from './base.provider'
import type { PreviewGenerationOptions, PreviewGenerationResult } from '../core/types'

// Динамический импорт PDF preview для избежания проблем с canvas на сервере
async function loadPDFPreview() {
  try {
    const pdfPreviewModule = await import('../../pdf-preview-server')
    return pdfPreviewModule
  } catch (error) {
    console.warn('[PDFPreviewProvider] PDF preview недоступен (canvas not available):', error)
    return null
  }
}

function isPDFUrl(url: string): boolean {
  return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?')
}

export class PDFPreviewProvider extends BasePreviewProvider {
  name = 'PDFPreviewProvider'

  canHandle(options: PreviewGenerationOptions): boolean {
    if (options.type !== 'file' || !options.fileUrl) {
      return false
    }

    return isPDFUrl(options.fileUrl)
  }

  async generate(options: PreviewGenerationOptions): Promise<PreviewGenerationResult> {
    if (!options.fileUrl) {
      return this.errorResult('PDF URL is required')
    }

    try {
      console.log(`[${this.name}] Генерация превью для PDF: ${options.title}`)

      // Динамическая загрузка PDF preview модуля
      const pdfModule = await loadPDFPreview()
      
      if (!pdfModule) {
        console.warn(`[${this.name}] Canvas недоступен, пропускаем PDF preview`)
        return this.errorResult('PDF preview not available (canvas module not loaded)')
      }

      const pdfBuffer = await pdfModule.generatePDFCardPreview(options.fileUrl)

      if (!pdfBuffer) {
        return this.errorResult('Failed to generate PDF preview')
      }

      console.log(`[${this.name}] ✅ PDF превью сгенерировано`)

      return this.successResult(pdfBuffer, 'pdf', {
        format: 'png',
        size: pdfBuffer.length
      })
    } catch (error) {
      return this.handleError(error, 'PDF generation failed')
    }
  }
}

