const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSMS() {
  try {
    console.log('🔍 Проверяю SMS коды для номера +79999999996...');
    
    const codes = await prisma.sMSVerification.findMany({
      where: {
        phone: '+79999999996'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log('📱 Найденные коды:');
    codes.forEach((code, i) => {
      console.log(`${i+1}. Код: ${code.code}, Цель: ${code.purpose}, Использован: ${code.isUsed}, Попытки: ${code.attempts}, Создан: ${code.createdAt.toISOString()}, Истекает: ${code.expiresAt.toISOString()}`);
    });
    
    // Проверяем пользователя
    const user = await prisma.user.findUnique({
      where: { phone: '+79999999996' },
      include: { specialistProfile: true }
    });
    
    console.log('\n👤 Пользователь:');
    if (user) {
      console.log(`ID: ${user.id}, Имя: ${user.firstName} ${user.lastName}, Специалист: ${!!user.specialistProfile}`);
    } else {
      console.log('❌ Пользователь не найден!');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSMS();
