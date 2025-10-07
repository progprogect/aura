import { NextRequest, NextResponse } from 'next/server'
import { generateQuestions } from '@/lib/ai/question-generator'
import { analyzeDataSufficiency } from '@/lib/ai/context-analyzer'
import { smartSearch } from '@/lib/ai/smart-search'

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    switch (action) {
      case 'generateQuestions':
        const questionsResult = await generateQuestions(data)
        return NextResponse.json(questionsResult)

      case 'analyzeDataSufficiency':
        const sufficiencyResult = await analyzeDataSufficiency(data)
        return NextResponse.json(sufficiencyResult)

      case 'smartSearch':
        const searchResult = await smartSearch(data)
        return NextResponse.json(searchResult)

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[AI API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
