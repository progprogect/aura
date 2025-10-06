/**
 * API для AI-чата
 * Поддерживает streaming responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { openai, MODELS, CHAT_CONFIG } from '@/lib/ai/openai'
import { getSystemPrompt, getExtractionPrompt } from '@/lib/ai/prompts'
import { searchSpecialistsBySemantic, searchSpecialistsByKeyword } from '@/lib/ai/semantic-search'
import { prisma } from '@/lib/db'
import { trackChatEvent, ChatEvent } from '@/lib/analytics/chat-analytics'

export const runtime = 'nodejs' // Нужен для streaming

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, sessionId } = body

    // Валидация входных данных
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    if (messages.length > 100) {
      return NextResponse.json({ error: 'Too many messages' }, { status: 400 })
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return NextResponse.json({ error: 'Invalid message format' }, { status: 400 })
      }
      if (msg.content.length > 10000) {
        return NextResponse.json({ error: 'Message too long' }, { status: 400 })
      }
    }

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 100) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }

    // Получаем или создаём сессию
    let session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      // Создаём новую сессию
      session = await prisma.chatSession.create({
        data: {
          id: sessionId,
          messages: [],
          recommendedIds: [],
          status: 'active',
          source: 'chat_page',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
        },
      })

      await trackChatEvent(ChatEvent.SESSION_STARTED, sessionId)
    }

    // Последнее сообщение пользователя
    const lastUserMessage = messages[messages.length - 1]

    if (lastUserMessage.role === 'user') {
      await trackChatEvent(ChatEvent.MESSAGE_SENT, sessionId)
    }

    // Извлекаем параметры поиска из диалога
    const searchParams = await extractSearchParams(messages, lastUserMessage.content)

    console.log('═══════════════════════════════════════════')
    console.log('[Chat API] 📥 Incoming messages:', messages.length)
    console.log('[Chat API] 💬 Last user message:', lastUserMessage.content)
    console.log('[Chat API] 🔍 Extracted params:', JSON.stringify(searchParams, null, 2))
    console.log('═══════════════════════════════════════════')

    // Если нужен поиск специалистов
    let specialists: any[] = []
    if (searchParams.shouldSearch) {
      console.log('[Chat API] 🔎 Starting search with query:', searchParams.query)
      
      try {
        specialists = await searchSpecialistsBySemantic({
          query: searchParams.query,
          filters: {
            category: searchParams.category,
            workFormats: searchParams.workFormats,
            city: searchParams.city,
            maxPrice: searchParams.maxPrice,
            minExperience: searchParams.minExperience,
          },
          limit: 10,
          excludeIds: session.recommendedIds,
        })
      } catch (embeddingError) {
        console.warn('[Chat API] Embedding search failed, using keyword fallback:', embeddingError)
        // Fallback на keyword search
        specialists = await searchSpecialistsByKeyword({
          query: searchParams.query,
          filters: {
            category: searchParams.category,
            workFormats: searchParams.workFormats,
            city: searchParams.city,
            maxPrice: searchParams.maxPrice,
            minExperience: searchParams.minExperience,
          },
          limit: 10,
          excludeIds: session.recommendedIds,
        })
      }

      console.log('[Chat API] ✅ Found specialists:', specialists.length)

      // Обновляем сессию
      if (specialists.length > 0) {
        console.log('[Chat API] 💾 Updating session with', specialists.slice(0, 5).length, 'specialist IDs')
        
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: {
            recommendedIds: {
              push: specialists.slice(0, 5).map((s) => s.id),
            },
            specialistsShown: {
              increment: specialists.slice(0, 5).length,
            },
            extractedFilters: searchParams as any,
          },
        })

        await trackChatEvent(ChatEvent.RECOMMENDATIONS_SHOWN, sessionId, {
          count: specialists.length,
        })
      }
    }

    // Формируем контекст для GPT
    const systemMessage = getSystemPrompt()
    const contextMessage =
      specialists.length > 0
        ? `\n\n🎯 ВАЖНО: Система нашла и ПОКАЗАЛА пользователю ${specialists.length} специалистов в виде карточек.
Вот их данные:\n${JSON.stringify(
            specialists.slice(0, 5).map((s) => ({
              id: s.id,
              name: `${s.firstName} ${s.lastName}`,
              category: s.category,
              specializations: s.specializations,
              tagline: s.tagline,
              experience: s.yearsOfPractice,
              formats: s.workFormats,
              city: s.city,
              price: s.priceFrom ? `от ${Math.floor(s.priceFrom / 100)} ₽` : null,
            })),
            null,
            2
          )}

НЕ ПЕРЕЧИСЛЯЙ их текстом - они УЖЕ ПОКАЗАНЫ! Прокомментируй и предложи дальнейшие действия.`
        : ''

    console.log('[Chat API] 📝 System message length:', systemMessage.length)
    console.log('[Chat API] 📝 Context message:', contextMessage ? `Added (${contextMessage.length} chars)` : 'None')
    console.log('[Chat API] 💬 Total messages to GPT:', messages.length + 1)

    // Создаём streaming response
    const stream = await openai.chat.completions.create({
      model: MODELS.CHAT,
      messages: [
        { role: 'system', content: systemMessage + contextMessage },
        ...messages,
      ],
      temperature: CHAT_CONFIG.temperature,
      max_tokens: CHAT_CONFIG.maxTokens,
      stream: true,
    })

    // Создаём ReadableStream для ответа
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = ''

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            fullResponse += content

            // Отправляем chunk клиенту
            controller.enqueue(encoder.encode(content))
          }

          console.log('[Chat API] ✅ GPT response complete:', fullResponse.substring(0, 100) + '...')
          console.log('[Chat API] 📊 Response length:', fullResponse.length, 'chars')

          // В конце отправляем специалистов, если есть
          if (specialists.length > 0) {
            const specialistsData = specialists.slice(0, 5).map((s) => ({
              id: s.id,
              firstName: s.firstName,
              lastName: s.lastName,
              avatar: s.avatar,
              slug: s.slug,
              category: s.category,
              specializations: s.specializations,
              tagline: s.tagline,
              yearsOfPractice: s.yearsOfPractice,
              workFormats: s.workFormats,
              city: s.city,
              priceFrom: s.priceFrom,
              priceTo: s.priceTo,
              verified: s.verified,
            }))

            const specialistsPayload = `\n\n__SPECIALISTS__${JSON.stringify(specialistsData)}`
            console.log('[Chat API] 📤 Sending specialists:', specialistsData.length, 'items')
            console.log('[Chat API] 📦 Payload preview:', specialistsPayload.substring(0, 200) + '...')
            
            controller.enqueue(encoder.encode(specialistsPayload))
          }

          // Извлекаем кнопки из ответа GPT
          const buttonsMatch = fullResponse.match(/__BUTTONS__\[(.*?)\]/)
          if (buttonsMatch) {
            try {
              const buttons = JSON.parse(`[${buttonsMatch[1]}]`)
              controller.enqueue(encoder.encode(`\n\n__BUTTONS__${JSON.stringify(buttons)}`))
            } catch (e) {
              console.error('[Chat API] Failed to parse buttons:', e)
            }
          }

          // Обновляем счётчик сообщений в сессии
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: {
              messageCount: { increment: 1 },
              updatedAt: new Date(),
            },
          })

          controller.close()
        } catch (error) {
          console.error('[Chat API] Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[Chat API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Извлекает параметры поиска из диалога
 */
async function extractSearchParams(
  messages: any[], 
  lastUserMessageContent: string
): Promise<{
  shouldSearch: boolean
  query: string
  category?: string
  workFormats?: string[]
  city?: string
  minExperience?: number
  maxPrice?: number
}> {
  try {
    // Формируем контекст диалога
    const dialogContext = messages
      .map((m) => `${m.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${m.content}`)
      .join('\n')

    const response = await openai.chat.completions.create({
      model: MODELS.CHAT,
      messages: [
        { role: 'system', content: getExtractionPrompt() },
        { role: 'user', content: dialogContext },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    })

    const extracted = JSON.parse(response.choices[0].message.content || '{}')

    console.log('[Chat API] 🤖 GPT extraction result:', JSON.stringify(extracted, null, 2))

    // Определяем, нужен ли поиск
    // СТРОГИЕ ПРАВИЛА: Ищем ТОЛЬКО когда собрана ВСЯ информация
    // Минимум: категория + формат работы + проблема (все 3!)
    const hasCategory = !!extracted.category
    const hasFormat = extracted.workFormats && extracted.workFormats.length > 0
    const hasProblem = extracted.problem && extracted.problem.length > 3
    
    // Поиск ТОЛЬКО если:
    // 1. Есть ВСЕ: категория + формат + проблема
    // 2. ИЛИ это 3+ сообщение (GPT уже задал вопросы) + есть категория + проблема
    const hasAllInfo = hasCategory && hasFormat && hasProblem
    const isReadyToSearch = messages.length >= 3 && hasCategory && hasProblem
    
    const hasEnoughInfo = hasAllInfo || isReadyToSearch
    
    console.log('[Chat API] 🧩 Search criteria:', {
      messageCount: messages.length,
      hasCategory,
      hasFormat,
      hasProblem,
      hasAllInfo,
      isReadyToSearch,
      category: extracted.category,
      problem: extracted.problem,
      workFormats: extracted.workFormats
    })
    
    // Или если это явный запрос на дополнительные результаты
    const isFollowUpRequest = messages.length >= 5 && (
      extracted.problem?.toLowerCase().includes('ещё') ||
      extracted.problem?.toLowerCase().includes('другие') ||
      extracted.problem?.toLowerCase().includes('показать') ||
      lastUserMessageContent?.toLowerCase().includes('ещё') ||
      lastUserMessageContent?.toLowerCase().includes('другие')
    )

    const shouldSearch = hasEnoughInfo || isFollowUpRequest

    console.log('[Chat API] 🎯 Should search:', shouldSearch, '(hasEnoughInfo:', hasEnoughInfo, ', isFollowUp:', isFollowUpRequest, ')')

    // Формируем текст запроса
    const query = [
      extracted.category && getCategoryName(extracted.category),
      extracted.problem,
      extracted.preferences,
    ]
      .filter(Boolean)
      .join(' ')

    return {
      shouldSearch,
      query,
      category: extracted.category,
      workFormats: extracted.workFormats?.filter(Boolean),
      city: extracted.city,
      minExperience: extracted.minExperience,
      maxPrice: extracted.maxPrice,
    }
  } catch (error) {
    console.error('[Chat API] Extraction error:', error)
    return {
      shouldSearch: false,
      query: '',
    }
  }
}

function getCategoryName(key: string): string {
  const categories: Record<string, string> = {
    psychology: 'психология терапия тревожность депрессия',
    fitness: 'фитнес тренировки спорт',
    nutrition: 'питание диетология похудение',
    massage: 'массаж телесные практики',
    coaching: 'коучинг развитие мотивация',
    medicine: 'медицина врач здоровье',
  }
  return categories[key] || key
}

