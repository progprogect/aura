// Утилиты для генерации превью PDF файлов

/**
 * Генерирует превью первой страницы PDF файла
 * @param pdfUrl URL PDF файла
 * @returns Promise<string> - Data URL превью изображения
 */
export async function generatePDFPreview(pdfUrl: string): Promise<string | null> {
  try {
    // Динамически импортируем PDF.js только когда нужно
    const pdfjsLib = await import('pdfjs-dist')
    
    // Настраиваем worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    
    // Загружаем PDF документ
    const loadingTask = pdfjsLib.getDocument(pdfUrl)
    const pdf = await loadingTask.promise
    
    // Получаем первую страницу
    const page = await pdf.getPage(1)
    
    // Настраиваем canvas для рендеринга
    const scale = 2 // Увеличиваем разрешение для четкости
    const viewport = page.getViewport({ scale })
    
    // Создаем canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('Не удалось получить контекст canvas')
    }
    
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    // Рендерим страницу в canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }
    
    await page.render(renderContext).promise
    
    // Конвертируем в data URL
    return canvas.toDataURL('image/jpeg', 0.8)
  } catch (error) {
    console.error('Ошибка генерации PDF превью:', error)
    return null
  }
}

/**
 * Проверяет, поддерживается ли генерация превью в текущем окружении
 */
export function isPDFPreviewSupported(): boolean {
  return typeof window !== 'undefined' && 'canvas' in document.createElement('canvas')
}

/**
 * Получает fallback превью для PDF (иконка + градиент)
 */
export function getPDFFallbackPreview(): {
  icon: string
  gradient: string
  typeLabel: string
} {
  return {
    icon: '📄',
    gradient: 'from-red-600 to-orange-600',
    typeLabel: 'PDF документ'
  }
}
