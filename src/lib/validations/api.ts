import { z } from 'zod'

// Схемы валидации для API специалистов
export const GetSpecialistsQuerySchema = z.object({
  category: z.string().optional(),
  experience: z.enum(['0-2', '2-5', '5+', 'any']).optional(),
  format: z.string().optional(), // Будет парситься как массив
  verified: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['relevance', 'rating', 'experience', 'price']).optional(),
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

// Типы для использования в коде
export type GetSpecialistsQuery = z.infer<typeof GetSpecialistsQuerySchema>
export type ConsultationRequest = z.infer<typeof ConsultationRequestSchema>
export type AnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>
