#!/usr/bin/env tsx
/**
 * Автоматический тест AI чата
 * Проверяет различные UX-сценарии и логику работы
 * 
 * Запуск: npm run test:chat
 * Или: npx tsx scripts/test-chat.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

const API_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface TestScenario {
  name: string
  description: string
  messages: string[]
  expectations: {
    shouldSearch?: boolean
    shouldHaveButtons?: boolean
    shouldHaveSpecialists?: boolean
    minMessages?: number
  }
}

/**
 * Тестовые сценарии
 */
const SCENARIOS: TestScenario[] = [
  {
    name: 'Полный цикл подбора психолога',
    description: 'User отвечает на все вопросы → GPT предлагает кнопку → User нажимает → Получает специалистов',
    messages: [
      'Помоги найти психолога',
      'онлайн',
      'тревожность и стресс',
      'до 3000 рублей',
      'когнитивно-поведенческая терапия',
      '🔍 Найти специалистов'
    ],
    expectations: {
      shouldSearch: true,
      shouldHaveSpecialists: true,
      shouldHaveButtons: false,
    }
  },
  {
    name: 'Быстрый поиск фитнес-тренера',
    description: 'User сразу указывает все параметры',
    messages: [
      'Найди фитнес тренера онлайн для похудения до 4000 рублей',
      '🔍 Найти специалистов'
    ],
    expectations: {
      shouldSearch: true,
      shouldHaveSpecialists: true,
    }
  },
  {
    name: 'Уточнение после первой выдачи',
    description: 'User получает специалистов → Просит еще',
    messages: [
      'Нужен нутрициолог онлайн',
      'похудение',
      'до 5000',
      '🔍 Найти специалистов',
      'Покажи еще варианты'
    ],
    expectations: {
      shouldSearch: true,
      shouldHaveSpecialists: true,
      minMessages: 10, // 5 user + 5 assistant
    }
  },
  {
    name: 'Расширение критериев при плохих результатах',
    description: 'Если найдено мало → GPT предлагает расширить',
    messages: [
      'Нужен массажист в Минске офлайн с опытом 10 лет до 1000 рублей',
      '🔍 Найти специалистов',
      'Расширить критерии'
    ],
    expectations: {
      shouldSearch: true,
      shouldHaveButtons: true, // GPT должен предложить действия
    }
  },
  {
    name: 'Диалог без кнопки поиска',
    description: 'GPT задает вопросы, но User НЕ нажимает кнопку',
    messages: [
      'Помоги с выбором коуча',
      'онлайн',
      'карьерный рост',
      'до 6000'
    ],
    expectations: {
      shouldSearch: false, // Поиск НЕ должен запуститься!
      shouldHaveButtons: true, // Должна быть кнопка "🔍 Найти"
      shouldHaveSpecialists: false,
    }
  },
]

/**
 * Отправка сообщения в чат API
 */
async function sendMessage(messages: Message[]): Promise<{
  response: string
  specialists: any[]
  buttons: string[]
  fullStream: string
}> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let fullStream = ''
  let assistantMessage = ''
  let specialists: any[] = []
  let buttons: string[] = []

  if (!reader) throw new Error('No reader')

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    fullStream += chunk

    // Извлекаем текст (без __SPECIALISTS__ и __BUTTONS__)
    const textOnly = chunk
      .replace(/__SPECIALISTS__.*/, '')
      .replace(/__BUTTONS__.*/, '')
    
    if (textOnly) {
      assistantMessage += textOnly
    }

    // Извлекаем специалистов
    const specialistsMatch = chunk.match(/__SPECIALISTS__(.*)/)
    if (specialistsMatch) {
      try {
        specialists = JSON.parse(specialistsMatch[1])
      } catch (e) {}
    }

    // Извлекаем кнопки
    const buttonsMatch = chunk.match(/__BUTTONS__(.*)/)
    if (buttonsMatch) {
      try {
        buttons = JSON.parse(buttonsMatch[1])
      } catch (e) {}
    }
  }

  return {
    response: assistantMessage.trim(),
    specialists,
    buttons,
    fullStream,
  }
}

/**
 * Запуск одного сценария
 */
async function runScenario(scenario: TestScenario): Promise<boolean> {
  console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`)
  console.log(`${COLORS.blue}📋 Сценарий:${COLORS.reset} ${scenario.name}`)
  console.log(`${COLORS.gray}${scenario.description}${COLORS.reset}`)
  console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`)

  const messages: Message[] = []
  let lastResponse = ''
  let lastSpecialists: any[] = []
  let lastButtons: string[] = []

  try {
    for (let i = 0; i < scenario.messages.length; i++) {
      const userMessage = scenario.messages[i]
      
      console.log(`${COLORS.green}👤 User:${COLORS.reset} ${userMessage}`)
      
      messages.push({ role: 'user', content: userMessage })
      
      const result = await sendMessage(messages)
      lastResponse = result.response
      lastSpecialists = result.specialists
      lastButtons = result.buttons

      messages.push({ role: 'assistant', content: result.response })

      console.log(`${COLORS.blue}🤖 Assistant:${COLORS.reset} ${result.response}`)
      
      if (result.buttons.length > 0) {
        console.log(`${COLORS.yellow}🔘 Buttons:${COLORS.reset} ${result.buttons.join(', ')}`)
      }
      
      if (result.specialists.length > 0) {
        console.log(`${COLORS.green}👥 Specialists:${COLORS.reset} ${result.specialists.length} найдено`)
        result.specialists.slice(0, 2).forEach((s: any) => {
          console.log(`   ${COLORS.gray}• ${s.firstName} ${s.lastName} (${s.category})${COLORS.reset}`)
        })
      }
      
      console.log('')
    }

    // Проверка expectations
    console.log(`${COLORS.cyan}🧪 Проверка результатов:${COLORS.reset}`)
    let passed = true

    if (scenario.expectations.shouldSearch !== undefined) {
      const hasSpecialists = lastSpecialists.length > 0
      const expected = scenario.expectations.shouldSearch
      const check = hasSpecialists === expected
      
      console.log(
        check ? `${COLORS.green}✓${COLORS.reset}` : `${COLORS.red}✗${COLORS.reset}`,
        `shouldSearch: ${expected ? 'да' : 'нет'}`,
        `(факт: ${hasSpecialists ? 'да' : 'нет'})`
      )
      
      if (!check) passed = false
    }

    if (scenario.expectations.shouldHaveButtons !== undefined) {
      const hasButtons = lastButtons.length > 0
      const expected = scenario.expectations.shouldHaveButtons
      const check = hasButtons === expected
      
      console.log(
        check ? `${COLORS.green}✓${COLORS.reset}` : `${COLORS.red}✗${COLORS.reset}`,
        `shouldHaveButtons: ${expected ? 'да' : 'нет'}`,
        `(факт: ${hasButtons ? 'да' : 'нет'})`
      )
      
      if (!check) passed = false
    }

    if (scenario.expectations.shouldHaveSpecialists !== undefined) {
      const hasSpecialists = lastSpecialists.length > 0
      const expected = scenario.expectations.shouldHaveSpecialists
      const check = hasSpecialists === expected
      
      console.log(
        check ? `${COLORS.green}✓${COLORS.reset}` : `${COLORS.red}✗${COLORS.reset}`,
        `shouldHaveSpecialists: ${expected ? 'да' : 'нет'}`,
        `(факт: ${hasSpecialists ? 'да' : 'нет'}, найдено: ${lastSpecialists.length})`
      )
      
      if (!check) passed = false
    }

    if (scenario.expectations.minMessages !== undefined) {
      const messageCount = messages.length
      const expected = scenario.expectations.minMessages
      const check = messageCount >= expected
      
      console.log(
        check ? `${COLORS.green}✓${COLORS.reset}` : `${COLORS.red}✗${COLORS.reset}`,
        `minMessages: >= ${expected}`,
        `(факт: ${messageCount})`
      )
      
      if (!check) passed = false
    }

    console.log(
      `\n${passed ? COLORS.green : COLORS.red}${passed ? '✅ PASSED' : '❌ FAILED'}${COLORS.reset}`
    )

    return passed

  } catch (error) {
    console.error(`${COLORS.red}❌ Ошибка:${COLORS.reset}`, error)
    return false
  }
}

/**
 * Главная функция
 */
async function main() {
  console.log(`${COLORS.cyan}
╔═══════════════════════════════════════════════╗
║   🧪 АВТОМАТИЧЕСКИЙ ТЕСТ AI ЧАТА              ║
║   Проверка UX-сценариев и логики работы       ║
╚═══════════════════════════════════════════════╝
${COLORS.reset}`)

  console.log(`${COLORS.gray}API URL: ${API_URL}${COLORS.reset}`)
  console.log(`${COLORS.gray}Сценариев: ${SCENARIOS.length}${COLORS.reset}\n`)

  const results: boolean[] = []

  for (const scenario of SCENARIOS) {
    const passed = await runScenario(scenario)
    results.push(passed)
    
    // Пауза между сценариями
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Итоговый отчет
  console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`)
  console.log(`${COLORS.cyan}📊 ИТОГОВЫЙ ОТЧЕТ${COLORS.reset}\n`)

  const passed = results.filter(r => r).length
  const failed = results.filter(r => !r).length
  const total = results.length

  console.log(`${COLORS.green}✅ Passed: ${passed}/${total}${COLORS.reset}`)
  console.log(`${COLORS.red}❌ Failed: ${failed}/${total}${COLORS.reset}`)

  const percentage = Math.round((passed / total) * 100)
  console.log(`\n${COLORS.cyan}Успешность: ${percentage}%${COLORS.reset}`)

  if (failed === 0) {
    console.log(`\n${COLORS.green}🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!${COLORS.reset}\n`)
    process.exit(0)
  } else {
    console.log(`\n${COLORS.red}⚠️  ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ!${COLORS.reset}\n`)
    process.exit(1)
  }
}

main().catch(console.error)

