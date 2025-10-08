const BASE_URL = 'http://localhost:3000'

async function test() {
  const phone = `+7${Math.floor(Math.random() * 9000000000 + 1000000000)}`
  console.log(`📱 Phone: ${phone}`)
  
  // SMS
  const smsRes = await fetch(`${BASE_URL}/api/auth/send-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, purpose: 'registration' })
  })
  const smsData = await smsRes.json()
  console.log('SMS Response:', smsData)
  
  if (!smsData.success) {
    console.error('SMS failed')
    return
  }
  
  // Registration
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'phone', phone, code: smsData.code })
  })
  
  console.log('Status:', regRes.status)
  console.log('Headers:', Array.from(regRes.headers.entries()))
  
  const regData = await regRes.json()
  console.log('Registration Response:', regData)
  
  if (!regData.success) {
    console.error('❌ Registration failed:', regData.error)
  } else {
    console.log('✅ Success!')
  }
}

test().catch(console.error)
