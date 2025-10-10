/**
 * PDF Preview Provider
 * Генерирует превью первой страницы PDF
 */

import { BasePreviewProvider } from './base.provider'
import type { PreviewGenerationOptions, PreviewGenerationResult } from '../core/types'
import { generatePDFCardPreview, isPDFUrl } from '../../pdf-preview-server'

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

      const pdfBuffer = await generatePDFCardPreview(options.fileUrl)

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

