/**
 * Контекстный анализатор диалога для умного AI-чата
 * Анализирует текущее состояние диалога и предлагает логичные следующие шаги
 */

export interface DialogStage {
  currentStage: 'personal_data' | 'details_clarification' | 'search_ready'
  suggestedQuestions: string[]
  logicReasoning: string
  missingInfo: string[]
  nextAction: 'continue_questions' | 'start_search' | 'need_more_info'
}

export interface DialogContext {
  messages: any[]
  extractedParams: any
  userType?: 'rookie' | 'experienced' | 'rushing' | 'detailed'
  complexity?: 'simple' | 'medium' | 'complex'
}

/**
 * Анализирует контекст диалога и определяет следующие шаги
 */
export function analyzeDialogContext(
  messages: any[],
  extractedParams: any
): DialogStage {
  console.log('[DialogAnalyzer] Analyzing dialog context...')
  console.log('[DialogAnalyzer] Messages count:', messages.length)
  console.log('[DialogAnalyzer] Extracted params:', JSON.stringify(extractedParams, null, 2))

  // Анализируем текущий этап диалога
  const hasPersonalData = extractedParams.personalProfile?.gender && extractedParams.personalProfile?.age
  const hasProblem = extractedParams.problem && extractedParams.problem.length > 3
  const hasCategory = extractedParams.category
  const hasWorkFormat = extractedParams.workFormats && extractedParams.workFormats.length > 0

  console.log('[DialogAnalyzer] Has personal data:', hasPersonalData)
  console.log('[DialogAnalyzer] Has problem:', hasProblem)
  console.log('[DialogAnalyzer] Has category:', hasCategory)
  console.log('[DialogAnalyzer] Has work format:', hasWorkFormat)

  // Этап 1: Сбор личных данных
  if (!hasPersonalData) {
    return {
      currentStage: 'personal_data',
      suggestedQuestions: ['Ваш пол?', 'Ваш возраст?', 'Есть ли опыт работы со специалистами?'],
      logicReasoning: 'Нужно собрать базовые личные данные для персонализации',
      missingInfo: ['gender', 'age', 'experience'],
      nextAction: 'continue_questions'
    }
  }

  // Этап 2: Понимание проблемы
  if (hasPersonalData && !hasProblem) {
    return {
      currentStage: 'details_clarification',
      suggestedQuestions: ['Расскажите подробнее о вашей проблеме или цели?', 'Что именно вас беспокоит?'],
      logicReasoning: 'Нужно понять суть проблемы для определения категории специалиста',
      missingInfo: ['problem', 'category'],
      nextAction: 'continue_questions'
    }
  }

  // Этап 3: Уточнение деталей для подбора
  if (hasPersonalData && hasProblem && hasCategory) {
    const suggestions: string[] = []
    const missingInfo: string[] = []

    // Анализируем, что ещё логично спросить
    if (hasWorkFormat) {
      // Если формат работы определён, анализируем что ещё нужно
      
      if (extractedParams.workFormats.includes('offline') && !extractedParams.city) {
        suggestions.push('В каком городе планируете заниматься?')
        missingInfo.push('city')
      }
      
      if (extractedParams.workFormats.includes('online') && !extractedParams.timezone) {
        suggestions.push('В каком часовом поясе находитесь?')
        missingInfo.push('timezone')
      }
    } else {
      // Если формат не определён, спрашиваем
      suggestions.push('Какой формат работы удобнее?')
      missingInfo.push('work_format')
    }

    // Дополнительные вопросы в зависимости от категории и профиля
    const category = extractedParams.category
    const profile = extractedParams.personalProfile

    if (category === 'psychology') {
      if (!extractedParams.preferences?.methods) {
        suggestions.push('Есть ли предпочтения по методам работы? Например, КПТ, гештальт, психоанализ?')
        missingInfo.push('therapy_methods')
      }
      
      if (profile?.experience === 'none' && !extractedParams.preferences?.specialistGender) {
        suggestions.push('Есть ли предпочтения по полу специалиста?')
        missingInfo.push('specialist_gender')
      }
    }

    if (category === 'fitness') {
      if (!extractedParams.goals) {
        suggestions.push('Какая у вас цель? Похудение, набор массы, общая физическая форма?')
        missingInfo.push('fitness_goals')
      }
      
      if (profile?.experience === 'none' && !extractedParams.preferences?.trainingType) {
        suggestions.push('Какой тип тренировок предпочитаете? Силовые, кардио, функциональные?')
        missingInfo.push('training_type')
      }
    }

    if (category === 'nutrition') {
      if (!extractedParams.goals) {
        suggestions.push('Какая у вас цель? Похудение, набор массы, здоровое питание?')
        missingInfo.push('nutrition_goals')
      }
      
      if (!extractedParams.healthConditions) {
        suggestions.push('Есть ли особенности здоровья, которые нужно учесть?')
        missingInfo.push('health_conditions')
      }
    }

    if (category === 'massage') {
      if (!extractedParams.problemType) {
        suggestions.push('Что именно беспокоит? Боль в спине, напряжение, общее расслабление?')
        missingInfo.push('massage_type')
      }
    }

    // Проверяем, готовы ли к поиску
    if (suggestions.length === 0) {
      return {
        currentStage: 'search_ready',
        suggestedQuestions: [],
        logicReasoning: 'Достаточно информации для поиска специалистов',
        missingInfo: [],
        nextAction: 'start_search'
      }
    }

    return {
      currentStage: 'details_clarification',
      suggestedQuestions: suggestions,
      logicReasoning: `Нужны дополнительные уточнения: ${missingInfo.join(', ')}`,
      missingInfo,
      nextAction: 'continue_questions'
    }
  }

  // Fallback: продолжаем уточнять детали
  return {
    currentStage: 'details_clarification',
    suggestedQuestions: ['Расскажите подробнее о вашей проблеме или цели?'],
    logicReasoning: 'Нужно больше информации для точного подбора',
    missingInfo: ['more_details'],
    nextAction: 'continue_questions'
  }
}

/**
 * Определяет тип пользователя на основе диалога
 */
export function analyzeUserType(messages: any[], extractedParams: any): 'rookie' | 'experienced' | 'rushing' | 'detailed' {
  const messageCount = messages.length
  const hasLongMessages = messages.some(m => m.content && m.content.length > 100)
  const hasRushingKeywords = messages.some(m => 
    m.content && (
      m.content.toLowerCase().includes('быстро') ||
      m.content.toLowerCase().includes('срочно') ||
      m.content.toLowerCase().includes('скорее') ||
      m.content.toLowerCase().includes('поскорее')
    )
  )
  const experience = extractedParams.personalProfile?.experience

  if (hasRushingKeywords) return 'rushing'
  if (experience === 'none') return 'rookie'
  if (messageCount > 15 || hasLongMessages) return 'detailed'
  return 'experienced'
}

/**
 * Определяет сложность запроса
 */
export function analyzeComplexity(messages: any[], extractedParams: any): 'simple' | 'medium' | 'complex' {
  const problemLength = extractedParams.problem?.length || 0
  const messageCount = messages.length
  const hasMultipleIssues = extractedParams.problem && (
    extractedParams.problem.includes('и') ||
    extractedParams.problem.includes(',') ||
    extractedParams.problem.includes('плюс')
  )

  if (problemLength > 100 || messageCount > 12 || hasMultipleIssues) return 'complex'
  if (problemLength > 50 || messageCount > 8) return 'medium'
  return 'simple'
}

/**
 * Генерирует контекстные подсказки на основе анализа
 */
export function generateContextualHints(
  extractedParams: any,
  userType: string,
  complexity: string
): string[] {
  const hints: string[] = []
  const profile = extractedParams.personalProfile
  const category = extractedParams.category

  // Подсказки по полу и категории
  if (profile?.gender === 'female' && category === 'psychology') {
    hints.push('👩 Женщинам часто комфортнее с женщинами-психологами')
  }

  if (profile?.gender === 'male' && category === 'fitness') {
    hints.push('💪 Мужчинам обычно больше подходят силовые тренировки')
  }

  // Подсказки по возрасту
  if (profile?.age === 'young') {
    hints.push('🥗 Молодым людям подходят современные подходы')
  }

  // Подсказки по опыту
  if (profile?.experience === 'none') {
    hints.push('🌱 Новичкам важны терпеливые специалисты')
  } else if (profile?.experience === 'regular') {
    hints.push('🧘 Опытным пользователям нужны специфические методы')
  }

  // Подсказки по сложности
  if (complexity === 'complex') {
    hints.push('📋 Для сложных случаев рекомендую опытных специалистов')
  }

  return hints
}

/**
 * Проверяет, готов ли диалог к поиску специалистов
 */
export function isReadyForSearch(extractedParams: any): boolean {
  const hasPersonalData = extractedParams.personalProfile?.gender && extractedParams.personalProfile?.age
  const hasProblem = extractedParams.problem && extractedParams.problem.length > 3
  const hasCategory = extractedParams.category
  const hasWorkFormat = extractedParams.workFormats && extractedParams.workFormats.length > 0

  // Более гибкая логика: достаточно базовых данных + категории
  // ИЛИ если пользователь явно запросил поиск
  return (hasPersonalData && hasProblem && hasCategory) || 
         (hasCategory && hasProblem) // Минимальные требования
}
