import { NextResponse } from 'next/server'
import { categoryConfigService } from '@/lib/category-config'

// API routes должны быть динамическими
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await categoryConfigService.getCategories()
    
    return NextResponse.json({
      categories: categories.map(category => ({
        key: category.key,
        name: category.name,
        emoji: category.emoji,
        isActive: true, // Все категории из конфига активны
        order: 0, // Порядок можно настроить позже
      }))
    })
    
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
