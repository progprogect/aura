/**
 * API для AI-чата
 * Поддерживает streaming responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { openai, MODELS, CHAT_CONFIG } from '@/lib/ai/openai'
import { getSystemPrompt, getExtractionPrompt } from '@/lib/ai/prompts'
import { searchSpecialistsBySemantic, searchSpecialistsByKeyword } from '@/lib/ai/semantic-search'
import { generatePersonalQuestions } from '@/lib/ai/personal-questions-generator'
import { analyzePersonalContext } from '@/lib/ai/contextual-analyzer'
import { rankSpecialistsByPersonalization, generatePersonalizedSearchExplanation, analyzePersonalizationQuality } from '@/lib/ai/personalized-search'
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
      
      // Трекинг ответов на личные вопросы
      if (extractedParams.personalProfile && Object.keys(extractedParams.personalProfile).length > 0) {
        await trackChatEvent(ChatEvent.PERSONAL_QUESTIONS_ANSWERED, sessionId, {
          personalProfile: extractedParams.personalProfile,
          messageCount: messages.length
        })
      }
    }

    // Проверяем специальные запросы
    const showPreviousKeywords = ['ранее найденных', 'предыдущих', 'прошлых', 'тех же']
    const isShowPreviousRequest = messages.length >= 4 && 
      showPreviousKeywords.some(kw => lastUserMessage.content?.toLowerCase().includes(kw))
    
    const expandCriteriaKeywords = ['расширить критерии', 'расширить', 'убрать фильтр', 'меньше фильтров', 'больше вариантов']
    const isExpandCriteriaRequest = messages.length >= 4 &&
      expandCriteriaKeywords.some(kw => lastUserMessage.content?.toLowerCase().includes(kw))
    
    // Извлекаем параметры поиска из диалога (включая личный профиль)
    const extractedParams = await extractSearchParams(messages, lastUserMessage.content)

    console.log('═══════════════════════════════════════════')
    console.log('[Chat API] 📥 Incoming messages:', messages.length)
    console.log('[Chat API] 💬 Last user message:', lastUserMessage.content)
    console.log('[Chat API] 🔍 Extracted params:', JSON.stringify(extractedParams, null, 2))
    console.log('[Chat API] 🔁 Show previous request:', isShowPreviousRequest)
    console.log('[Chat API] 🔄 Expand criteria request:', isExpandCriteriaRequest)
    
    // Определяем shouldSearch ЗДЕСЬ (с доступом ко ВСЕМ переменным!)
    
    // НОВАЯ ЛОГИКА: КРИТИЧЕСКИЕ ШАГИ (MUST HAVE для поиска):
    const hasCategory = !!extractedParams.category
    const hasFormat = extractedParams.workFormats && extractedParams.workFormats.length > 0
    const hasProblem = extractedParams.problem && extractedParams.problem.length > 3
    const hasPersonalProfile = !!extractedParams.personalProfile?.gender && !!extractedParams.personalProfile?.age
    const hasBudget = !!extractedParams.maxPrice // НЕ ОБЯЗАТЕЛЬНО!
    
    // Базовые параметры (минимум для поиска): личные данные + проблема + формат
    const hasBasics = hasPersonalProfile && hasCategory && hasFormat && hasProblem
    
    // Все критические шаги завершены (бюджет опционален)
    const allCriticalStepsComplete = hasBasics
    
    console.log('[Chat API] 📊 Dialog progress:', {
      hasCategory,
      hasFormat,
      hasProblem,
      hasBudget,
      hasBasics,
      allCriticalStepsComplete,
      messageCount: messages.length
    })
    
    // СТРОГИЕ keywords - всегда триггерят поиск (явное подтверждение)
    const strictKeywords = [
      '🔍',
      'найти специалистов',
      'начать поиск',
      'начни поиск',
      'начинаем поиск',
      'давай искать',
      'давай подберем',
    ]
    
    // МЯГКИЕ keywords - триггерят ТОЛЬКО если уже есть базовые параметры
    const looseKeywords = [
      'найди',
      'подбери',
      'подобрать',
      'искать',
      'хватит',
      'достаточно',
    ]
    
    const strictMatch = strictKeywords.some(kw => 
      lastUserMessage.content?.toLowerCase().includes(kw.toLowerCase())
    )
    
    const looseMatch = looseKeywords.some(kw => 
      lastUserMessage.content?.toLowerCase().includes(kw.toLowerCase())
    )
    
    // НОВАЯ ЛОГИКА НА ОСНОВЕ ШАГОВ:
    // User requested search если:
    // 1. СТРОГИЙ keyword (🔍, "найти специалистов") - всегда работает
    // 2. ИЛИ МЯГКИЙ keyword + ВСЕ КРИТИЧЕСКИЕ ШАГИ ПРОЙДЕНЫ
    const userRequestedSearch = strictMatch || (looseMatch && allCriticalStepsComplete)
    
    if (userRequestedSearch) {
      console.log('[Chat API] 🎯 User requested search!', {
        strictMatch,
        looseMatch,
        allCriticalStepsComplete,
        message: lastUserMessage.content
      })
    } else if (looseMatch && !allCriticalStepsComplete) {
      console.log('[Chat API] ⏸️  Loose keyword found but critical steps incomplete:', {
        looseMatch,
        hasCategory,
        hasFormat,
        hasProblem,
        hasBudget,
        missingSteps: [
          !hasCategory && 'category',
          !hasFormat && 'format',
          !hasProblem && 'problem',
          !hasBudget && 'budget'
        ].filter(Boolean)
      })
    }
    
    const followUpKeywords = ['ещё', 'другие', 'других', 'показать', 'больше', 'дополнительные', 'еще']
    const isFollowUpRequest = messages.length >= 4 && 
      followUpKeywords.some(kw => lastUserMessage.content?.toLowerCase().includes(kw))
    
    const shouldSearch = 
      userRequestedSearch ||
      isFollowUpRequest ||
      isShowPreviousRequest ||
      isExpandCriteriaRequest
    
    console.log('[Chat API] 🎯 Should search:', shouldSearch, {
      userRequested: userRequestedSearch,
      followUp: isFollowUpRequest,
      showPrevious: isShowPreviousRequest,
      expandCriteria: isExpandCriteriaRequest,
    })
    console.log('═══════════════════════════════════════════')

    // Если нужен поиск специалистов
    let specialists: any[] = []
    let noNewSpecialists = false
    let isLowQualityMatch = false
    let avgSimilarityScore = 0
    
    if (shouldSearch) {
      // Если пользователь хочет расширить критерии - ищем с урезанными фильтрами
      if (isExpandCriteriaRequest) {
        console.log('[Chat API] 🔄 Expanding search criteria (removing strict filters)...')
        
        // Убираем самые строгие фильтры: опыт и цену
        // Оставляем: категорию, формат, город
        try {
          specialists = await searchSpecialistsBySemantic({
            query: extractedParams.query,
            filters: {
              category: extractedParams.category,
              workFormats: extractedParams.workFormats,
              city: extractedParams.city,
              // НЕ передаём maxPrice и minExperience
            },
            limit: 10,
            excludeIds: session.recommendedIds,
          })
          
          console.log('[Chat API] ✅ Found with expanded criteria:', specialists.length)
        } catch (error) {
          console.error('[Chat API] Expanded search failed:', error)
        }
      }
      // Если пользователь хочет увидеть ранее показанных - загружаем их из БД
      else if (isShowPreviousRequest && session.recommendedIds.length > 0) {
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
        console.log('[Chat API] 🔎 Starting search with query:', extractedParams.query)
        console.log('[Chat API] 🚫 Excluding already shown IDs:', session.recommendedIds.length, 'specialists')
        
        try {
          specialists = await searchSpecialistsBySemantic({
            query: extractedParams.query,
            filters: {
              category: extractedParams.category,
              workFormats: extractedParams.workFormats,
              city: extractedParams.city,
              maxPrice: extractedParams.maxPrice,
              minExperience: extractedParams.minExperience,
            },
            limit: 10,
            excludeIds: session.recommendedIds,
          })
        } catch (embeddingError) {
          console.warn('[Chat API] Embedding search failed, using keyword fallback:', embeddingError)
          // Fallback на keyword search
          specialists = await searchSpecialistsByKeyword({
            query: extractedParams.query,
            filters: {
              category: extractedParams.category,
              workFormats: extractedParams.workFormats,
              city: extractedParams.city,
              maxPrice: extractedParams.maxPrice,
              minExperience: extractedParams.minExperience,
            },
            limit: 10,
            excludeIds: session.recommendedIds,
          })
        }

        console.log('[Chat API] ✅ Found specialists:', specialists.length)
        
        // Если новых не нашли - сохраняем эту информацию для GPT
        noNewSpecialists = specialists.length === 0 && session.recommendedIds.length > 0
        
        // НОВАЯ ЛОГИКА: Персонализированное ранжирование
        if (specialists.length > 0 && extractedParams.personalProfile && extractedParams.category) {
          console.log('[Chat API] 🎯 Applying personalization ranking...')
          
          // Ранжируем с учётом личного профиля
          const rankedSpecialists = rankSpecialistsByPersonalization(
            specialists,
            extractedParams.personalProfile,
            extractedParams.category,
            extractedParams
          )
          
          specialists = rankedSpecialists
          
          // Трекинг применения персонализации
          await trackChatEvent(ChatEvent.PERSONALIZATION_APPLIED, sessionId, {
            personalProfile: extractedParams.personalProfile,
            category: extractedParams.category,
            specialistsCount: specialists.length
          })
          
          // Вычисляем средний персональный score для оценки качества подбора
          const personalizationScores = specialists
            .slice(0, 5)
            .map(s => s.personalizationScore)
          
          const avgPersonalization = personalizationScores.reduce((a, b) => a + b, 0) / personalizationScores.length
          avgSimilarityScore = Math.round(avgPersonalization)
          
          console.log('[Chat API] 📊 Personalization stats:', {
            avg: avgSimilarityScore,
            min: Math.round(Math.min(...personalizationScores)),
            max: Math.round(Math.max(...personalizationScores)),
            count: specialists.length,
          })
          
          // Флаг низкого качества подбора (< 70%)
          if (avgPersonalization < 70) {
            isLowQualityMatch = true
            console.log('[Chat API] ⚠️ Low personalization quality detected:', avgSimilarityScore, '% avg personalization')
          }
        } else {
          // Fallback: старый способ оценки (если нет личного профиля)
          if (specialists.length > 0) {
            const similarities = specialists
              .slice(0, 5)
              .map(s => s.distance !== undefined ? (1 - s.distance) * 100 : 50)
            
            const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length
            avgSimilarityScore = Math.round(avgSimilarity)
            
            if (avgSimilarity < 70) {
              isLowQualityMatch = true
              console.log('[Chat API] ⚠️ Low similarity quality detected:', avgSimilarityScore, '% avg similarity')
            }
          }
        }
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
            extractedFilters: extractedParams as any,
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
      if (isExpandCriteriaRequest) {
        // РАСШИРЕННЫЙ ПОИСК - показываем что убрали фильтры
        contextMessage = `\n\n✅ ВАЖНО: Система РАСШИРИЛА критерии поиска и нашла ${specialists.length} специалистов.

Убранные фильтры для лучшего подбора:
${extractedParams.maxPrice ? `- Бюджет (было: до ${extractedParams.maxPrice}₽)` : ''}
${extractedParams.minExperience ? `- Опыт (было: от ${extractedParams.minExperience} лет)` : ''}

Вот найденные специалисты:
${JSON.stringify(
          specialists.slice(0, 5).map((s) => ({
            name: `${s.firstName} ${s.lastName}`,
            specializations: s.specializations,
            experience: s.yearsOfPractice,
            price: s.priceFrom ? `от ${Math.floor(s.priceFrom / 100)}₽` : 'по запросу',
          })),
          null,
          2
        )}

СКАЖИ ПОЛЬЗОВАТЕЛЮ:
"Расширил критерии - теперь показываю специалистов с разным опытом и ценой.
 Среди них есть подходящие варианты! Посмотрите на карточки выше."

Добавь кнопки: ["Подходят", "Вернуть строгие критерии", "Показать ещё"]

Карточки УЖЕ ПОКАЗАНЫ (не перечисляй их).`
      } else if (isLowQualityMatch) {
        // НИЗКОЕ КАЧЕСТВО ПОДБОРА - предлагаем расширить критерии
        contextMessage = `\n\n⚠️ ВАЖНО: Система нашла ${specialists.length} специалистов, но СОВПАДЕНИЕ НИЗКОЕ (средний ${avgSimilarityScore}%).

Текущие фильтры:
- Категория: ${extractedParams.category || 'не указана'}
- Формат: ${extractedParams.workFormats?.join(', ') || 'не указан'}
- Бюджет: ${extractedParams.maxPrice ? `до ${extractedParams.maxPrice}₽` : 'не указан'}
- Опыт: ${extractedParams.minExperience ? `от ${extractedParams.minExperience} лет` : 'не указан'}
- Методы: ${extractedParams.preferences?.methods?.join(', ') || 'не указаны'}

Вот найденные специалисты:
${JSON.stringify(
          specialists.slice(0, 5).map((s) => ({
            name: `${s.firstName} ${s.lastName}`,
            specializations: s.specializations,
          })),
          null,
          2
        )}

ПРЕДЛОЖИ ПОЛЬЗОВАТЕЛЮ:
"Нашёл ${specialists.length} специалиста, но совпадение с вашим запросом не идеальное (${avgSimilarityScore}%).
 Могу расширить критерии поиска - убрать некоторые фильтры (опыт, цену) для лучшего подбора?"

Добавь кнопки: ["Показать найденных", "Расширить критерии", "Изменить запрос"]

Карточки УЖЕ ПОКАЗАНЫ (не перечисляй их текстом).`
      } else {
        // НОРМАЛЬНОЕ КАЧЕСТВО - персонализированный флоу
        const personalizedExplanation = specialists.length > 0 && extractedParams.personalProfile 
          ? generatePersonalizedSearchExplanation(specialists, extractedParams.personalProfile, extractedParams.category)
          : 'Система нашла специалистов.'
        
        contextMessage = `\n\n🎯 ВАЖНО: Система нашла и ПОКАЗАЛА пользователю ${specialists.length} специалистов в виде карточек.
${personalizedExplanation}

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
            personalizationScore: s.personalizationScore,
            matchReasons: s.matchReasons,
            personalizedExplanation: s.personalizedExplanation
          })),
          null,
          2
        )}

НЕ ПЕРЕЧИСЛЯЙ их текстом - они УЖЕ ПОКАЗАНЫ! Прокомментируй персонализацию и предложи дальнейшие действия.`
      }
    } else if (noNewSpecialists) {
      // Новых не нашли, но уже были показаны ранее
      contextMessage = `\n\n⚠️ ВАЖНО: Новых специалистов по текущим критериям НЕ НАЙДЕНО.
Ранее уже было показано ${session.recommendedIds.length} специалистов.

ПРЕДЛОЖИ ПОЛЬЗОВАТЕЛЮ ВАРИАНТЫ:
1. "Показать ранее найденных специалистов ещё раз?"
2. "Изменить критерии поиска?" (опыт, цена, город, методы)
3. "Посмотреть специалистов из других категорий?" (например, если искали психолога - предложи коучинга)
4. "Перейти в каталог для самостоятельного выбора?" (дай ссылку: /catalog)

Добавь кнопки: ["Показать ранее найденных", "Изменить критерии", "Перейти в каталог"]`
    } else if (shouldSearch && specialists.length === 0) {
      // ПЕРВЫЙ ПОИСК - НИЧЕГО НЕ НАЙДЕНО!
      contextMessage = `\n\n❌ КРИТИЧНО: По заданным критериям специалистов НЕ НАЙДЕНО!

Критерии поиска:
- Категория: ${extractedParams.category || 'не указана'}
- Формат: ${extractedParams.workFormats?.join(', ') || 'не указан'}
- Бюджет: ${extractedParams.maxPrice ? `до ${extractedParams.maxPrice}₽` : 'не указан'}
- Опыт: ${extractedParams.minExperience ? `от ${extractedParams.minExperience} лет` : 'не указан'}
${extractedParams.preferences?.methods ? `- Методы: ${extractedParams.preferences.methods.join(', ')}` : ''}

СКАЖИ ПОЛЬЗОВАТЕЛЮ ЧЕСТНО:
"К сожалению, по вашим критериям специалистов не найдено 😔"

ПРЕДЛОЖИ ВАРИАНТЫ:
1. Расширить критерии (убрать опыт/цену)
2. Изменить параметры (другой формат, бюджет)
3. Посмотреть каталог вручную (/catalog)

Добавь кнопки: ["Расширить критерии", "Изменить параметры", "Смотреть каталог"]

ВАЖНО: НЕ говори что нашёл специалистов! Их НЕТ!`
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
              if (extractedParams.category) {
                matchReasons.push(`Категория: ${getCategoryName(extractedParams.category)}`)
              }
              if (s.specializations && s.specializations.length > 0) {
                matchReasons.push(`Специализации: ${s.specializations.slice(0, 3).join(', ')}`)
              }
              if (extractedParams.workFormats && extractedParams.workFormats.length > 0) {
                const formats = extractedParams.workFormats.map(f => f === 'online' ? 'Онлайн' : 'Оффлайн').join(', ')
                matchReasons.push(`Формат: ${formats}`)
              }
              if (s.city && extractedParams.city) {
                matchReasons.push(`Город: ${s.city}`)
              }
              if (s.yearsOfPractice && extractedParams.minExperience) {
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
            console.log('[Chat API] 📦 Payload length:', specialistsPayload.length, 'chars')
            console.log('[Chat API] 📦 First specialist:', specialistsData[0]?.firstName, specialistsData[0]?.lastName)
            console.log('[Chat API] 📦 Payload preview:', specialistsPayload.substring(0, 300))
            
            controller.enqueue(encoder.encode(specialistsPayload))
            console.log('[Chat API] ✅ Specialists payload enqueued')
          }

          // Извлекаем кнопки из ответа GPT (поддерживаем оба формата)
          const buttonsMatch = fullResponse.match(/(?:Добавь кнопки:\s*|_BUTTONS___)\[(.*?)\]/)
          let hasButtons = false
          
          if (buttonsMatch) {
            try {
              const buttons = JSON.parse(`[${buttonsMatch[1]}]`)
              controller.enqueue(encoder.encode(`\n\n__BUTTONS__${JSON.stringify(buttons)}`))
              hasButtons = true
              console.log('[Chat API] ✅ Buttons extracted and sent:', buttons)
            } catch (e) {
              console.error('[Chat API] Failed to parse buttons:', e)
            }
          }
          
          // Дополнительная проверка: если GPT написал _BUTTONS___ в тексте, убираем это из контента
          if (fullResponse.includes('_BUTTONS___')) {
            console.log('[Chat API] 🔧 Removing _BUTTONS___ from content')
            fullResponse = fullResponse.replace(/_BUTTONS___\[.*?\]/g, '')
          }
          
          // FALLBACK: Если GPT предлагает начать поиск, но НЕ добавил кнопки → добавляем автоматически!
          if (!hasButtons && specialists.length === 0) {
            const searchSuggestionKeywords = [
              'начать поиск',
              'достаточно информации',
              'хотите уточнить',
              'начинаем поиск',
              'готов искать',
              'готов подобрать'
            ]
            
            const gptSuggestsSearch = searchSuggestionKeywords.some(kw => 
              fullResponse.toLowerCase().includes(kw)
            )
            
            if (gptSuggestsSearch && messages.length >= 5) {
              console.log('[Chat API] 🔧 Auto-injecting search buttons (GPT forgot them)')
              const autoButtons = ["🔍 Найти специалистов", "Уточнить опыт работы", "Уточнить ещё"]
              controller.enqueue(encoder.encode(`\n\n__BUTTONS__${JSON.stringify(autoButtons)}`))
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
  query: string
  problem?: string
  category?: string
  workFormats?: string[]
  city?: string
  minExperience?: number
  maxPrice?: number
  personalProfile?: {
    gender?: 'male' | 'female'
    age?: 'young' | 'middle' | 'mature'
    experience?: 'none' | 'little' | 'regular'
    physical_condition?: 'beginner' | 'intermediate' | 'advanced'
    lifestyle?: 'active' | 'moderate' | 'sedentary'
    communication_style?: 'formal' | 'casual' | 'supportive'
  }
  preferences?: {
    methods?: string[]
    specialistGender?: string
    specialistAge?: string
  }
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

    // Формируем текст запроса для semantic search
    const queryParts = [
      extracted.category && getCategoryName(extracted.category),
      extracted.problem,
    ]
    
    // Добавляем методы/подходы если указаны
    if (extracted.preferences?.methods) {
      queryParts.push(extracted.preferences.methods.join(' '))
    }
    
    const query = queryParts.filter(Boolean).join(' ')

    return {
      query,
      problem: extracted.problem,
      category: extracted.category,
      workFormats: extracted.workFormats?.filter(Boolean),
      city: extracted.city,
      minExperience: extracted.minExperience,
      maxPrice: extracted.maxPrice,
      personalProfile: extracted.personalProfile,
      preferences: extracted.preferences,
    }
  } catch (error) {
    console.error('[Chat API] Extraction error:', error)
    return {
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

