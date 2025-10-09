/**
 * Seed script для Unified Auth системы
 * Минимальная версия для тестирования
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Очищаем существующие данные
  await prisma.consultationRequest.deleteMany()
  await prisma.leadMagnet.deleteMany()
  await prisma.fAQ.deleteMany()
  await prisma.galleryItem.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.education.deleteMany()
  await prisma.specialistProfile.deleteMany()
  await prisma.authSession.deleteMany()
  await prisma.socialAccount.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ База данных очищена')

  // Создаём тестового специалиста
  const testUser = await prisma.user.create({
    data: {
      firstName: 'Анна',
      lastName: 'Иванова',
      phone: '+79991234567',
      email: 'anna@example.com',
      avatar: '/avatars/анна-иванова-psychology.png',
    }
  })

  const testSpecialist = await prisma.specialistProfile.create({
    data: {
      userId: testUser.id,
      slug: 'anna-ivanova-psiholog',
      category: 'psychology',
      specializations: ['Психолог', 'КПТ-терапевт'],
      tagline: 'Помогаю справиться с тревогой и обрести внутренний покой',
      about: 'Более 8 лет я работаю с людьми, которые сталкиваются с тревогой, паническими атаками, депрессией и другими эмоциональными трудностями.',
      city: 'Москва',
      country: 'Россия',
      workFormats: ['online', 'offline'],
      yearsOfPractice: 8,
      telegram: '@anna_ivanova_psy',
      whatsapp: '+79991234567',
      priceFrom: 300000,
      priceTo: 500000,
      currency: 'RUB',
      priceDescription: 'за сессию 60 минут',
      customFields: {
        methods: ['КПТ', 'Майндфулнесс'],
        worksWith: ['Тревога', 'Депрессия', 'ОКР'],
        sessionFormats: ['individual'],
        sessionDuration: 60,
      },
      verified: true,
      verifiedAt: new Date(),
      acceptingClients: true,
      profileViews: 100,
      contactViews: 10,
    }
  })

  console.log(`✅ Создан специалист: ${testUser.firstName} ${testUser.lastName}`)

  // Добавляем образование
  await prisma.education.create({
    data: {
      specialistProfileId: testSpecialist.id,
      institution: 'МГУ им. М.В. Ломоносова',
      degree: 'Психология, магистратура',
      year: 2015,
      order: 1,
    }
  })

  // Добавляем сертификат
  await prisma.certificate.create({
    data: {
      specialistProfileId: testSpecialist.id,
      title: 'Сертификат КПТ-терапевта',
      organization: 'Институт когнитивно-поведенческой психотерапии',
      year: 2016,
      order: 1,
    }
  })

  console.log('✅ Seed выполнен успешно!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
