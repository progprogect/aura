// Тестирование нормализации телефонов
import { normalizePhone } from './src/lib/auth/utils';
import { normalizePhoneNumber } from './src/lib/phone/country-codes';

const testPhones = [
  '+7 (999) 123-45-67',
  '79991234567',
  '8 999 123 45 67',
  '9991234567',
  '+79991234567'
];

console.log('🔍 ТЕСТИРОВАНИЕ НОРМАЛИЗАЦИИ ТЕЛЕФОНОВ\n');

testPhones.forEach(phone => {
  const oldNormalized = normalizePhone(phone);
  const newNormalized = normalizePhoneNumber(phone);
  
  console.log(`Телефон: ${phone}`);
  console.log(`  Старая функция: ${oldNormalized}`);
  console.log(`  Новая функция:  ${newNormalized}`);
  console.log(`  Совпадают: ${oldNormalized === newNormalized ? '✅' : '❌'}`);
  console.log('');
});
