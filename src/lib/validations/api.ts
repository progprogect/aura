import { z } from 'zod'

// Схемы валидации для API специалистов
export const GetSpecialistsQuerySchema = z.object({
  category: z.string().optional(),
  experience: z.enum(['0-2', '2-5', '5+', 'any']).optional(),
  format: z.string().optional(), // Будет парситься как массив
  verified: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['relevance', 'rating', 'experience', 'price', 'newest', 'oldest']).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().min(1).max(100).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
})

export const ConsultationRequestSchema = z.object({
  specialistId: z.string().cuid(),
  name: z.string().min(2).max(100),
  contact: z.string().min(5).max(100), // Email или телефон
  message: z.string().max(1000).optional(),
})

export const AnalyticsRequestSchema = z.object({
  specialistId: z.string().cuid(),
  contactType: z.string().optional(), // Для contact-view
})

// Схемы для системы услуг и заказов
export const CreateServiceSchema = z.object({
  title: z.string().min(5, 'Минимум 5 символов').max(100, 'Максимум 100 символов'),
  description: z.string().min(20, 'Минимум 20 символов').max(1000, 'Максимум 1000 символов'),
  highlights: z.array(z.string()).min(1, 'Добавьте хотя бы один пункт').max(5, 'Максимум 5 пунктов'),
  price: z.number().min(1, 'Минимум 1').max(999999, 'Максимум 999999'),
  deliveryDays: z.number().min(1).max(90).optional().nullable(),
  emoji: z.string().default('💼'),
})

export const UpdateServiceSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(1000).optional(),
  highlights: z.array(z.string()).min(1).max(5).optional(),
  price: z.number().min(1).max(999999).optional(),
  deliveryDays: z.number().min(1).max(90).optional().nullable(),
  emoji: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const CreateOrderSchema = z.object({
  serviceId: z.string().cuid('Некорректный ID услуги'),
  clientName: z.string().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символов'),
  clientContact: z.string().min(5, 'Минимум 5 символов').max(100, 'Максимум 100 символов'),
  clientMessage: z.string().max(500, 'Максимум 500 символов').optional().nullable(),
  pointsUsed: z.number().int().min(1, 'Минимум 1 балл').max(999999, 'Максимум 999999 баллов'),
})

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'in_progress', 'completed', 'cancelled', 'disputed']),
  disputeReason: z.string().optional().nullable(),
})

// Схемы для системы заявок (User Requests)
export const CreateRequestSchema = z.object({
  title: z.string().min(5, 'Минимум 5 символов').max(100, 'Максимум 100 символов'),
  description: z.string().min(50, 'Минимум 50 символов').max(2000, 'Максимум 2000 символов'),
  category: z.string().min(1, 'Выберите категорию'),
  budget: z.number().int().min(50, 'Минимум 50 баллов').max(2000, 'Максимум 2000 баллов').optional().nullable(),
})

export const CreateProposalSchema = z.object({
  message: z.string().min(50, 'Минимум 50 символов').max(1000, 'Максимум 1000 символов'),
  proposedPrice: z.number().int().min(50, 'Минимум 50 баллов').max(2000, 'Максимум 2000 баллов'),
})

export const AcceptProposalSchema = z.object({
  proposalId: z.string().cuid('Некорректный ID отклика'),
})

export const CreateReviewSchema = z.object({
  orderId: z.string().cuid('Некорректный ID заказа'),
  rating: z.number().int().min(0, 'Рейтинг от 0').max(5, 'Рейтинг до 5'),
  comment: z.string().max(1000, 'Максимум 1000 символов').optional().nullable(),
})

// Типы для использования в коде
export type GetSpecialistsQuery = z.infer<typeof GetSpecialistsQuerySchema>
export type ConsultationRequest = z.infer<typeof ConsultationRequestSchema>
export type AnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>
export type CreateRequestInput = z.infer<typeof CreateRequestSchema>
export type CreateProposalInput = z.infer<typeof CreateProposalSchema>
export type AcceptProposalInput = z.infer<typeof AcceptProposalSchema>
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>
