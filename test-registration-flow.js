/**
 * Тестирование полного flow регистрации
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function testRegistrationFlow() {
  console.log('🧪 ТЕСТИРОВАНИЕ FLOW РЕГИСТРАЦИИ\n')
  
  const testPhone = `+7${Math.floor(Math.random() * 9000000000 + 1000000000)}`
  console.log(`📱 Тестовый телефон: ${testPhone}`)
  
  try {
    // ШАГ 1: Отправка SMS
    console.log('\n1️⃣ ОТПРАВКА SMS...')
    const smsResponse = await fetch(`${BASE_URL}/api/auth/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, purpose: 'registration' })
    })
    
    const smsData = await smsResponse.json()
    console.log('Ответ:', JSON.stringify(smsData, null, 2))
    
    if (!smsData.success) {
      console.error('❌ ОШИБКА при отправке SMS:', smsData.error)
      process.exit(1)
    }
    
    const code = smsData.code
    console.log(`✅ SMS отправлено, код: ${code}`)
    
    // ШАГ 2: Регистрация
    console.log('\n2️⃣ РЕГИСТРАЦИЯ...')
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        provider: 'phone', 
        phone: testPhone, 
        code: code 
      })
    })
    
    const registerData = await registerResponse.json()
    console.log('Ответ:', JSON.stringify(registerData, null, 2))
    
    if (!registerData.success) {
      console.error('❌ ОШИБКА при регистрации:', registerData.error)
      process.exit(1)
    }
    
    console.log(`✅ Регистрация успешна`)
    console.log(`   Session Token: ${registerData.sessionToken?.substring(0, 20)}...`)
    console.log(`   Specialist ID: ${registerData.specialist?.id}`)
    console.log(`   Is New User: ${registerData.isNewUser}`)
    console.log(`   Requires Profile Completion: ${registerData.requiresProfileCompletion}`)
    
    // ШАГ 3: Проверка профиля через API
    console.log('\n3️⃣ ПРОВЕРКА ПРОФИЛЯ...')
    const cookies = registerResponse.headers.get('set-cookie')
    console.log('Cookies from response:', cookies)
    
    // Извлекаем session_token из Set-Cookie header
    let sessionToken = registerData.sessionToken
    if (cookies) {
      const match = cookies.match(/session_token=([^;]+)/)
      if (match) {
        sessionToken = match[1]
        console.log('Extracted session_token from cookie:', sessionToken.substring(0, 20) + '...')
      }
    }
    
    const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: { 
        'Cookie': `session_token=${sessionToken}`
      }
    })
    
    const profileData = await profileResponse.json()
    console.log('Профиль:', JSON.stringify(profileData, null, 2))
    
    if (!profileData.success) {
      console.error('❌ ОШИБКА при получении профиля:', profileData.error)
      process.exit(1)
    }
    
    console.log(`✅ Профиль получен`)
    console.log(`   firstName: ${profileData.profile?.firstName || 'null'}`)
    console.log(`   lastName: ${profileData.profile?.lastName || 'null'}`)
    console.log(`   about: ${profileData.profile?.about || 'пусто'}`)
    console.log(`   slug: ${profileData.profile?.slug}`)
    
    // АНАЛИЗ
    console.log('\n📊 АНАЛИЗ FLOW:')
    
    const shouldGoToOnboarding = !profileData.profile?.firstName || 
                                  !profileData.profile?.lastName || 
                                  !profileData.profile?.about || 
                                  profileData.profile?.about.trim() === ''
    
    console.log(`   Должен идти на онбординг: ${shouldGoToOnboarding}`)
    console.log(`   Причина: ${!profileData.profile?.firstName ? 'нет firstName' : ''}${!profileData.profile?.lastName ? ' нет lastName' : ''}${!profileData.profile?.about || profileData.profile?.about.trim() === '' ? ' нет about' : ''}`)
    
    if (shouldGoToOnboarding) {
      console.log('   ✅ Правильно - будет редирект на /specialist/onboarding')
    } else {
      console.log('   ⚠️  ПРОБЛЕМА - будет редирект на /specialist/dashboard, но профиль не заполнен!')
    }
    
    console.log('\n✅ ТЕСТ ЗАВЕРШЁН УСПЕШНО')
    
  } catch (error) {
    console.error('\n❌ КРИТИЧЕСКАЯ ОШИБКА:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

testRegistrationFlow()
