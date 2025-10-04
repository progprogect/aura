import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Очищаем существующие данные
  await prisma.consultationRequest.deleteMany()
  await prisma.fAQ.deleteMany()
  await prisma.galleryItem.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.education.deleteMany()
  await prisma.specialist.deleteMany()

  // ========================================
  // ПСИХОЛОГ
  // ========================================
  const psychologist = await prisma.specialist.create({
    data: {
      firstName: 'Анна',
      lastName: 'Иванова',
      slug: 'anna-ivanova-psiholog',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      category: 'psychology',
      specializations: ['Психолог', 'КПТ-терапевт', 'Клинический психолог'],
      tagline: 'Помогаю справиться с тревогой и обрести внутренний покой',
      about: `Более 8 лет я работаю с людьми, которые сталкиваются с тревогой, паническими атаками, депрессией и другими эмоциональными трудностями.

В своей работе использую научно обоснованные методы когнитивно-поведенческой терапии (КПТ), которые доказали свою эффективность в лечении тревожных расстройств и депрессии.

Моя цель — не просто снять симптомы, а помочь вам разобраться в причинах ваших переживаний и научиться справляться с ними самостоятельно.`,
      city: 'Москва',
      country: 'Россия',
      workFormats: ['online', 'offline'],
      yearsOfPractice: 8,
      phone: '+7 (999) 123-45-67',
      email: 'anna.ivanova@example.com',
      telegram: '@anna_ivanova_psy',
      whatsapp: '+79991234567',
      instagram: '@anna.ivanova.psy',
      website: 'https://anna-ivanova.ru',
      priceFrom: 300000, // 3000 рублей в копейках
      priceTo: 500000, // 5000 рублей
      currency: 'RUB',
      priceDescription: 'за сессию 60 минут',
      customFields: {
        methods: ['КПТ', 'Майндфулнесс', 'ACT', 'Схема-терапия'],
        worksWith: [
          'Тревога и панические атаки',
          'Депрессивные состояния',
          'ОКР',
          'Низкая самооценка',
          'Стресс и выгорание',
          'Отношения',
        ],
        sessionFormats: ['individual', 'couples'],
        sessionDuration: 60,
        targetGroups: ['Взрослые (18+)', 'Пары'],
        languages: ['Русский', 'English'],
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      verified: true,
      verifiedAt: new Date(),
      acceptingClients: true,
      profileViews: 1247,
      contactViews: 89,
      education: {
        create: [
          {
            institution: 'МГУ им. М.В. Ломоносова',
            degree: 'Психология, магистратура',
            year: 2015,
            description: 'Клиническая психология',
            order: 1,
          },
          {
            institution: 'Институт когнитивно-поведенческой психотерапии',
            degree: 'КПТ-терапевт',
            year: 2016,
            description: 'Сертифицированная программа обучения КПТ',
            order: 2,
          },
        ],
      },
      certificates: {
        create: [
          {
            title: 'Сертификат КПТ-терапевта',
            organization: 'Институт когнитивно-поведенческой психотерапии',
            year: 2016,
            order: 1,
          },
          {
            title: 'Майндфулнесс в работе с тревогой',
            organization: 'Mindfulness Center',
            year: 2018,
            order: 2,
          },
        ],
      },
      gallery: {
        create: [
          {
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
            caption: 'Кабинет для консультаций',
            order: 1,
          },
          {
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=800',
            caption: 'Комфортная атмосфера',
            order: 2,
          },
          {
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800',
            caption: 'Онлайн консультации',
            order: 3,
          },
        ],
      },
      faqs: {
        create: [
          {
            question: 'Как проходит первая встреча?',
            answer:
              'На первой встрече мы познакомимся, я расскажу о своем подходе и методах работы. Вы сможете рассказать о том, что вас беспокоит, и мы вместе определим цели терапии.',
            order: 1,
          },
          {
            question: 'Сколько длится терапия?',
            answer:
              'Это зависит от вашего запроса. КПТ — это краткосрочная терапия, обычно 10-20 сессий. Но все индивидуально.',
            order: 2,
          },
          {
            question: 'Можно ли отменить или перенести сессию?',
            answer:
              'Да, вы можете отменить или перенести встречу не позднее чем за 24 часа. При отмене менее чем за 24 часа сессия оплачивается.',
            order: 3,
          },
        ],
      },
    },
  })

  // ========================================
  // ФИТНЕС-ТРЕНЕР
  // ========================================
  const fitnessTrainer = await prisma.specialist.create({
    data: {
      firstName: 'Дмитрий',
      lastName: 'Петров',
      slug: 'dmitriy-petrov-trener',
      avatar: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
      category: 'fitness',
      specializations: ['Персональный тренер', 'Силовые тренировки', 'Кроссфит'],
      tagline: 'Помогу достичь ваших фитнес-целей безопасно и эффективно',
      about: `Более 6 лет я помогаю людям трансформировать их тела и улучшать здоровье через силовые тренировки и правильное питание.

Работаю как с новичками, так и с опытными спортсменами. Мой подход основан на научных исследованиях и практическом опыте.

Специализируюсь на наборе мышечной массы, снижении веса и улучшении функциональной подготовки.`,
      city: 'Санкт-Петербург',
      country: 'Россия',
      workFormats: ['offline', 'online'],
      yearsOfPractice: 6,
      phone: '+7 (999) 765-43-21',
      telegram: '@dmitry_fitness',
      whatsapp: '+79997654321',
      instagram: '@dmitry.fitness.coach',
      priceFrom: 250000, // 2500 рублей
      priceTo: 400000, // 4000 рублей
      currency: 'RUB',
      priceDescription: 'за персональную тренировку 90 минут',
      customFields: {
        trainingTypes: ['Силовые тренировки', 'Кроссфит', 'Функциональный тренинг', 'ОФП'],
        sessionFormats: ['personal', 'group'],
        gymLocation: 'FitnessPark, Васильевский остров',
        achievements: ['КМС по пауэрлифтингу', 'Certified CrossFit Trainer Level 2'],
        equipment: ['Свободные веса', 'Тренажеры', 'Функциональное оборудование'],
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      verified: true,
      verifiedAt: new Date(),
      acceptingClients: true,
      profileViews: 892,
      contactViews: 54,
      education: {
        create: [
          {
            institution: 'Университет физической культуры и спорта',
            degree: 'Тренер по физической культуре и спорту',
            year: 2017,
            order: 1,
          },
        ],
      },
      certificates: {
        create: [
          {
            title: 'CrossFit Level 2 Trainer',
            organization: 'CrossFit Inc.',
            year: 2019,
            order: 1,
          },
          {
            title: 'Спортивная нутрициология',
            organization: 'Школа фитнеса',
            year: 2020,
            order: 2,
          },
        ],
      },
      gallery: {
        create: [
          {
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
            caption: 'Зал для тренировок',
            order: 1,
          },
          {
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
            caption: 'Функциональная зона',
            order: 2,
          },
        ],
      },
      faqs: {
        create: [
          {
            question: 'Нужен ли опыт тренировок?',
            answer:
              'Нет, я работаю как с новичками, так и с опытными спортсменами. Программа подбирается индивидуально.',
            order: 1,
          },
          {
            question: 'Сколько раз в неделю нужно тренироваться?',
            answer:
              'Оптимально 3-4 раза в неделю, но это зависит от ваших целей и возможностей.',
            order: 2,
          },
        ],
      },
    },
  })

  // ========================================
  // НУТРИЦИОЛОГ
  // ========================================
  const nutritionist = await prisma.specialist.create({
    data: {
      firstName: 'Елена',
      lastName: 'Смирнова',
      slug: 'elena-smirnova-nutriciolog',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
      category: 'nutrition',
      specializations: ['Нутрициолог', 'Диетолог', 'Специалист по ЗОЖ'],
      tagline: 'Помогаю выстроить здоровые отношения с едой без диет и ограничений',
      about: `Я — нутрициолог с медицинским образованием и 5-летним опытом работы.

Помогаю людям наладить питание без строгих диет, научиться слушать свое тело и достичь комфортного веса.

В своей работе опираюсь на принципы доказательной медицины и индивидуальный подход к каждому клиенту.`,
      city: 'Москва',
      country: 'Россия',
      workFormats: ['online'],
      yearsOfPractice: 5,
      email: 'elena.smirnova@example.com',
      telegram: '@elena_nutrition',
      whatsapp: '+79998887766',
      instagram: '@elena.nutrition',
      priceFrom: 350000, // 3500 рублей
      priceTo: 700000, // 7000 рублей
      currency: 'RUB',
      priceDescription: 'за консультацию и составление рациона',
      customFields: {
        approaches: [
          'КБЖУ и сбалансированное питание',
          'Интуитивное питание',
          'Питание для спортсменов',
        ],
        specializations: [
          'Снижение веса',
          'Набор мышечной массы',
          'ЗОЖ и правильные привычки',
          'Пищевые непереносимости',
        ],
        programDuration: '1-3 месяца сопровождения',
        consultationFormats: ['Разовая консультация', 'Месячное сопровождение', 'Программа 3 месяца'],
      },
      verified: true,
      verifiedAt: new Date(),
      acceptingClients: true,
      profileViews: 1056,
      contactViews: 72,
      education: {
        create: [
          {
            institution: 'Первый МГМУ им. И.М. Сеченова',
            degree: 'Лечебное дело',
            year: 2018,
            order: 1,
          },
          {
            institution: 'Институт нутрициологии',
            degree: 'Нутрициолог-диетолог',
            year: 2019,
            order: 2,
          },
        ],
      },
      certificates: {
        create: [
          {
            title: 'Нутрициолог-диетолог',
            organization: 'Институт нутрициологии',
            year: 2019,
            order: 1,
          },
        ],
      },
      gallery: {
        create: [
          {
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
            caption: 'Здоровое питание',
            order: 1,
          },
        ],
      },
      faqs: {
        create: [
          {
            question: 'Придется ли сидеть на строгой диете?',
            answer:
              'Нет! Я не сторонник строгих диет. Мы будем работать над формированием здоровых привычек питания.',
            order: 1,
          },
          {
            question: 'Как проходят консультации?',
            answer:
              'Консультации проходят онлайн. После анализа вашего рациона я составляю индивидуальный план питания и даю рекомендации.',
            order: 2,
          },
        ],
      },
    },
  })

  console.log('✅ База данных заполнена успешно!')
  console.log(`\n📊 Создано специалистов:`)
  console.log(`   - Психолог: ${psychologist.slug}`)
  console.log(`   - Фитнес-тренер: ${fitnessTrainer.slug}`)
  console.log(`   - Нутрициолог: ${nutritionist.slug}`)
}

main()
  .catch(e => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



