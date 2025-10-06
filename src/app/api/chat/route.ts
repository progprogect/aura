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

    // Проверяем, хочет ли пользователь увидеть ранее показанных
    const showPreviousKeywords = ['ранее найденных', 'предыдущих', 'прошлых', 'тех же']
    const isShowPreviousRequest = messages.length >= 4 && 
      showPreviousKeywords.some(kw => lastUserMessage.content?.toLowerCase().includes(kw))
    
    // Извлекаем параметры поиска из диалога
    const searchParams = await extractSearchParams(messages, lastUserMessage.content, isShowPreviousRequest)

    console.log('═══════════════════════════════════════════')
    console.log('[Chat API] 📥 Incoming messages:', messages.length)
    console.log('[Chat API] 💬 Last user message:', lastUserMessage.content)
    console.log('[Chat API] 🔍 Extracted params:', JSON.stringify(searchParams, null, 2))
    console.log('[Chat API] 🔁 Show previous request:', isShowPreviousRequest)
    console.log('═══════════════════════════════════════════')

    // Если нужен поиск специалистов
    let specialists: any[] = []
    let noNewSpecialists = false
    
    if (searchParams.shouldSearch) {
      // Если пользователь хочет увидеть ранее показанных - загружаем их из БД
      if (isShowPreviousRequest && session.recommendedIds.length > 0) {
        console.log('[Chat API] 🔄 Loading previously shown specialists:', session.recommendedIds.length)
        
        specialists = await prisma.specialist.findMany({
          where: {
            id: { in: session.recommendedIds },
            acceptingClients: true,
          },
          take: 10,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            slug: true,
            category: true,
            specializations: true,
            tagline: true,
            about: true,
            city: true,
            country: true,
            workFormats: true,
            yearsOfPractice: true,
            priceFrom: true,
            priceTo: true,
            currency: true,
            priceDescription: true,
            verified: true,
            customFields: true,
          },
        })
        
        console.log('[Chat API] ✅ Loaded previous specialists:', specialists.length)
      } else {
        // Обычный поиск новых специалистов
        console.log('[Chat API] 🔎 Starting search with query:', searchParams.query)
        console.log('[Chat API] 🚫 Excluding already shown IDs:', session.recommendedIds.length, 'specialists')
        
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
        
        // Если новых не нашли - сохраняем эту информацию для GPT
        noNewSpecialists = specialists.length === 0 && session.recommendedIds.length > 0
      }

      // Обновляем сессию (только если это НЕ показ ранее найденных)
      if (specialists.length > 0 && !isShowPreviousRequest) {
        // Добавляем только новых специалистов (которых ещё нет в recommendedIds)
        const newIds = specialists
          .slice(0, 5)
          .map((s) => s.id)
          .filter((id) => !session.recommendedIds.includes(id))
        
        console.log('[Chat API] 💾 Updating session:', {
          totalShown: specialists.slice(0, 5).length,
          newIds: newIds.length,
          alreadyShown: specialists.slice(0, 5).length - newIds.length,
        })
        
        if (newIds.length > 0) {
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: {
              recommendedIds: {
                push: newIds,
              },
              specialistsShown: {
                increment: newIds.length,
              },
              extractedFilters: searchParams as any,
            },
          })
        }
      }
      
      // Трекаем показ (для всех случаев)
      if (specialists.length > 0) {
        await trackChatEvent(ChatEvent.RECOMMENDATIONS_SHOWN, sessionId, {
          count: specialists.length,
        })
      }
    }

    // Формируем контекст для GPT
    const systemMessage = getSystemPrompt()
    let contextMessage = ''
    
    if (specialists.length > 0) {
      // Нашли специалистов - показываем
      contextMessage = `\n\n🎯 ВАЖНО: Система нашла и ПОКАЗАЛА пользователю ${specialists.length} специалистов в виде карточек.
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
    } else if (noNewSpecialists) {
      // Новых не нашли, но уже были показаны ранее
      contextMessage = `\n\n⚠️ ВАЖНО: Новых специалистов по текущим критериям НЕ НАЙДЕНО.
Ранее уже было показано ${session.recommendedIds.length} специалистов.

ПРЕДЛОЖИ ПОЛЬЗОВАТЕЛЮ ВАРИАНТЫ:
1. "Показать ранее найденных специалистов ещё раз?"
2. "Изменить критерии поиска?" (опыт, цена, город, методы)
3. "Посмотреть специалистов из других категорий?" (например, если искали психолога - предложи коучинга)
4. "Перейти в каталог для самостоятельного выбора?" (дай ссылку: /catalog)

Добавь кнопки:
__BUTTONS__["Показать ранее найденных", "Изменить критерии", "Перейти в каталог"]`
    }

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
            const specialistsData = specialists.slice(0, 5).map((s) => {
              // Вычисляем similarity (0-100%)
              const similarity = s.distance !== undefined ? Math.round((1 - s.distance) * 100) : null
              
              // Формируем объяснение почему подобрали
              const matchReasons: string[] = []
              if (searchParams.category) {
                matchReasons.push(`Категория: ${getCategoryName(searchParams.category)}`)
              }
              if (s.specializations && s.specializations.length > 0) {
                matchReasons.push(`Специализации: ${s.specializations.slice(0, 3).join(', ')}`)
              }
              if (searchParams.workFormats && searchParams.workFormats.length > 0) {
                const formats = searchParams.workFormats.map(f => f === 'online' ? 'Онлайн' : 'Оффлайн').join(', ')
                matchReasons.push(`Формат: ${formats}`)
              }
              if (s.city && searchParams.city) {
                matchReasons.push(`Город: ${s.city}`)
              }
              if (s.yearsOfPractice && searchParams.minExperience) {
                matchReasons.push(`Опыт: ${s.yearsOfPractice} лет`)
              }
              
              return {
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
                similarity,
                matchReasons,
              }
            })

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
  lastUserMessageContent: string,
  isShowPreviousRequest: boolean = false
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
    const followUpKeywords = ['ещё', 'другие', 'других', 'показать', 'больше', 'дополнительные', 'еще']
    const isFollowUpRequest = messages.length >= 4 && ( // Снижаем порог с 5 до 4
      followUpKeywords.some(kw => extracted.problem?.toLowerCase().includes(kw)) ||
      followUpKeywords.some(kw => lastUserMessageContent?.toLowerCase().includes(kw))
    )
    
    console.log('[Chat API] 🔁 Follow-up check:', {
      messagesCount: messages.length,
      isFollowUp: isFollowUpRequest,
      isShowPrevious: isShowPreviousRequest,
      lastMessage: lastUserMessageContent?.substring(0, 50),
    })

    const shouldSearch = hasEnoughInfo || isFollowUpRequest || isShowPreviousRequest

    console.log('[Chat API] 🎯 Should search:', shouldSearch, '(hasEnoughInfo:', hasEnoughInfo, ', isFollowUp:', isFollowUpRequest, ', showPrevious:', isShowPreviousRequest, ')')

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

