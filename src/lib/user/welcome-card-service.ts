/**
 * Сервис для определения, нужно ли показывать Welcome Card
 */

import { prisma } from '@/lib/db'

export interface UserActions {
  // Для обычных пользователей
  createdRequest: boolean
  createdOrder: boolean
  viewedLeadMagnet: boolean
  
  // Для специалистов
  profileFilled: boolean
  addedService: boolean
  createdLeadMagnet: boolean
  enabledProfile: boolean
}

export interface WelcomeCardData {
  shouldShow: boolean
  userActions: UserActions
  isNewUser: boolean
  daysSinceRegistration: number
}

interface SpecialistProfileData {
  about: string
  specializations: string[]
  tagline: string | null
  city: string | null
  priceFromInPoints: number | null
  priceToInPoints: number | null
  yearsOfPractice: number | null
  videoUrl: string | null
  acceptingClients: boolean
  profileType: 'specialist' | 'company'
  companyName: string | null
  address: string | null
  taxId: string | null
  website: string | null
  education: Array<{ id: string }>
  certificates: Array<{ id: string }>
  gallery: Array<{ id: string }>
  faqs: Array<{ id: string }>
  leadMagnets: Array<{ id: string }>
}

interface UserData {
  firstName: string
  lastName: string
  avatar: string | null
  email: string | null
}

/**
 * Проверяет, нужно ли показывать Welcome Card пользователю
 */
export async function shouldShowWelcomeCard(
  userId: string,
  hasSpecialistProfile: boolean,
  createdAt: Date,
  userPhone?: string,
  specialistProfileData?: SpecialistProfileData,
  userData?: UserData,
  servicesCount?: number
): Promise<WelcomeCardData> {
  const now = new Date()
  const daysSinceRegistration = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )
  const isNewUser = daysSinceRegistration < 7

  // Получаем данные о действиях пользователя
  const userActions = await getUserActions(
    userId,
    hasSpecialistProfile,
    userPhone,
    specialistProfileData,
    userData,
    servicesCount
  )

  // Определяем, выполнено ли хотя бы одно основное действие
  const hasCompletedAction = hasSpecialistProfile
    ? userActions.profileFilled ||
      userActions.addedService ||
      userActions.createdLeadMagnet ||
      userActions.enabledProfile
    : userActions.createdRequest ||
      userActions.createdOrder ||
      userActions.viewedLeadMagnet

  // Показываем карточку если:
  // 1. Пользователь зарегистрирован менее 7 дней назад ИЛИ
  // 2. Не выполнил ни одного основного действия
  const shouldShow = isNewUser || !hasCompletedAction

  return {
    shouldShow,
    userActions,
    isNewUser,
    daysSinceRegistration,
  }
}

/**
 * Получает информацию о выполненных действиях пользователя
 * Принимает уже загруженные данные для оптимизации запросов
 */
async function getUserActions(
  userId: string,
  hasSpecialistProfile: boolean,
  userPhone?: string,
  specialistProfileData?: SpecialistProfileData,
  userData?: UserData,
  servicesCount?: number
): Promise<UserActions> {
  if (hasSpecialistProfile && specialistProfileData && userData) {
    // Для специалистов - используем уже загруженные данные
    const isCompany = specialistProfileData.profileType === 'company'
    
    const completionFields = isCompany
      ? {
          companyName: specialistProfileData.companyName ? 1 : 0,
          firstName: userData.firstName ? 1 : 0,
          lastName: userData.lastName ? 1 : 0,
          about: specialistProfileData.about ? 1 : 0,
          specializations: specialistProfileData.specializations.length > 0 ? 1 : 0,
          avatar: userData.avatar ? 15 : 0,
          tagline: specialistProfileData.tagline ? 5 : 0,
          address: specialistProfileData.address ? 5 : 0,
          taxId: specialistProfileData.taxId ? 5 : 0,
          email: userData.email ? 5 : 0,
          website: specialistProfileData.website ? 5 : 0,
          gallery: specialistProfileData.gallery.length > 0 ? 10 : 0,
          faqs: specialistProfileData.faqs.length > 0 ? 5 : 0,
          video: specialistProfileData.videoUrl ? 10 : 0,
          leadMagnets: specialistProfileData.leadMagnets.length > 0 ? 10 : 0,
        }
      : {
          firstName: userData.firstName ? 1 : 0,
          lastName: userData.lastName ? 1 : 0,
          about: specialistProfileData.about ? 1 : 0,
          specializations: specialistProfileData.specializations.length > 0 ? 1 : 0,
          avatar: userData.avatar ? 15 : 0,
          tagline: specialistProfileData.tagline ? 5 : 0,
          city: specialistProfileData.city ? 5 : 0,
          email: userData.email ? 5 : 0,
          prices: specialistProfileData.priceFromInPoints || specialistProfileData.priceToInPoints ? 10 : 0,
          yearsOfPractice: specialistProfileData.yearsOfPractice ? 5 : 0,
          education: specialistProfileData.education.length > 0 ? 15 : 0,
          certificates: specialistProfileData.certificates.length > 0 ? 20 : 0,
          gallery: specialistProfileData.gallery.length > 0 ? 10 : 0,
          faqs: specialistProfileData.faqs.length > 0 ? 5 : 0,
          video: specialistProfileData.videoUrl ? 10 : 0,
          leadMagnets: specialistProfileData.leadMagnets.length > 0 ? 10 : 0,
        }

    const baseCompletion = 20
    const additionalCompletion =
      Object.values(completionFields).reduce((sum, val) => sum + val, 0) -
      (isCompany ? 2 : 4)
    const completionPercentage = Math.min(100, baseCompletion + additionalCompletion)

    return {
      profileFilled: completionPercentage > 50,
      addedService: (servicesCount ?? 0) > 0,
      createdLeadMagnet: specialistProfileData.leadMagnets.length > 0,
      enabledProfile: specialistProfileData.acceptingClients,
      // Для совместимости с типом
      createdRequest: false,
      createdOrder: false,
      viewedLeadMagnet: false,
    }
  } else {
    // Для обычных пользователей
    // Используем переданный телефон или делаем запрос если не передан
    let phone = userPhone
    if (!phone) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      })
      phone = user?.phone
    }

    const [requestsCount, ordersCount, leadMagnetPurchasesCount] = await Promise.all([
      prisma.userRequest.count({
        where: { userId },
      }),
      prisma.order.count({
        where: {
          OR: [
            { clientUserId: userId },
            ...(phone ? [{ clientContact: phone }] : []),
          ],
        },
      }),
      prisma.leadMagnetPurchase.count({
        where: { userId },
      }),
    ])

    return {
      createdRequest: requestsCount > 0,
      createdOrder: ordersCount > 0,
      viewedLeadMagnet: leadMagnetPurchasesCount > 0,
      // Для совместимости с типом
      profileFilled: false,
      addedService: false,
      createdLeadMagnet: false,
      enabledProfile: false,
    }
  }
}

