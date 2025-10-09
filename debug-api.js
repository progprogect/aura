// Тестируем API endpoint напрямую
const testData = {
  phone: '+79999999996',
  code: '4063'
};

console.log('🧪 Тестирую API endpoint /api/auth/unified-login');
console.log('📤 Отправляю данные:', testData);

fetch('http://localhost:3000/api/auth/unified-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('📥 Ответ от API:', data);
})
.catch(error => {
  console.error('❌ Ошибка:', error.message);
});
