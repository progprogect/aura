#!/usr/bin/env tsx
/**
 * Интерактивный чат в терминале
 * Для быстрого тестирования без браузера
 * 
 * Запуск: npm run chat
 * Или: npx tsx scripts/interactive-chat.ts
 */

import * as readline from 'readline'
import { config } from 'dotenv'
config({ path: '.env.local' })

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
}

const API_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const messages: Message[] = []

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log(`${COLORS.cyan}${COLORS.bold}
╔═══════════════════════════════════════════════╗
║   💬 ИНТЕРАКТИВНЫЙ AI ЧАТ                     ║
║   Тестирование в терминале                    ║
╚═══════════════════════════════════════════════╝
${COLORS.reset}`)

console.log(`${COLORS.gray}API: ${API_URL}${COLORS.reset}`)
console.log(`${COLORS.gray}Команды: /reset - очистить историю, /exit - выход${COLORS.reset}\n`)

async function sendMessage(userInput: string) {
  messages.push({ role: 'user', content: userInput })

  console.log(`${COLORS.blue}🤖 Ассистент:${COLORS.reset} `, { end: '' })

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      console.log(`${COLORS.gray}[Ошибка API: ${response.status}]${COLORS.reset}\n`)
      messages.pop() // Удаляем последнее сообщение
      return
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let assistantMessage = ''
    let specialists: any[] = []
    let buttons: string[] = []

    if (!reader) throw new Error('No reader')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)

      // Извлекаем текст
      const textOnly = chunk
        .replace(/__SPECIALISTS__.*/, '')
        .replace(/__BUTTONS__.*/, '')
      
      if (textOnly) {
        process.stdout.write(textOnly)
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

    console.log('') // Новая строка

    messages.push({ role: 'assistant', content: assistantMessage.trim() })

    // Показываем специалистов
    if (specialists.length > 0) {
      console.log(`\n${COLORS.green}👥 Найдено специалистов: ${specialists.length}${COLORS.reset}`)
      specialists.forEach((s: any, i: number) => {
        console.log(`   ${COLORS.cyan}${i + 1}.${COLORS.reset} ${s.firstName} ${s.lastName}`)
        console.log(`      ${COLORS.gray}${s.category} • ${s.city || 'онлайн'}${COLORS.reset}`)
        if (s.matchReasons && s.matchReasons.length > 0) {
          console.log(`      ${COLORS.yellow}${s.matchReasons[0]}${COLORS.reset}`)
        }
      })
      console.log('')
    }

    // Показываем кнопки
    if (buttons.length > 0) {
      console.log(`${COLORS.yellow}🔘 Быстрые ответы:${COLORS.reset}`)
      buttons.forEach((btn: string, i: number) => {
        console.log(`   ${COLORS.gray}${i + 1}.${COLORS.reset} ${btn}`)
      })
      console.log('')
    }

  } catch (error) {
    console.log(`${COLORS.gray}[Ошибка: ${error}]${COLORS.reset}\n`)
    messages.pop()
  }
}

function prompt() {
  rl.question(`${COLORS.green}👤 Вы:${COLORS.reset} `, async (input) => {
    const trimmed = input.trim()

    if (!trimmed) {
      prompt()
      return
    }

    if (trimmed === '/exit') {
      console.log(`${COLORS.cyan}Пока! 👋${COLORS.reset}\n`)
      rl.close()
      process.exit(0)
    }

    if (trimmed === '/reset') {
      messages.length = 0
      console.log(`${COLORS.cyan}История очищена ✓${COLORS.reset}\n`)
      prompt()
      return
    }

    await sendMessage(trimmed)
    prompt()
  })
}

// Начинаем диалог
prompt()

