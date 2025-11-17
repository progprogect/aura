/**
 * Unit тесты для CommissionService
 */

import { CommissionService } from '../commission-service'
import { Decimal } from 'decimal.js'

describe('CommissionService', () => {
  describe('calculate', () => {
    it('должен правильно рассчитать комиссию для суммы 100 баллов', () => {
      const amount = new Decimal(100)
      const breakdown = CommissionService.calculate(amount)

      expect(breakdown.commission.toNumber()).toBe(5) // 5% от 100
      expect(breakdown.cashback.toNumber()).toBe(2.5) // 50% от комиссии
      expect(breakdown.specialistAmount.toNumber()).toBe(95) // 100 - 5
      expect(breakdown.netRevenue.toNumber()).toBe(2.5) // 5 - 2.5
    })

    it('должен правильно рассчитать комиссию для суммы 50 баллов', () => {
      const amount = new Decimal(50)
      const breakdown = CommissionService.calculate(amount)

      expect(breakdown.commission.toNumber()).toBe(2.5) // 5% от 50
      expect(breakdown.cashback.toNumber()).toBe(1.25) // 50% от комиссии
      expect(breakdown.specialistAmount.toNumber()).toBe(47.5) // 50 - 2.5
      expect(breakdown.netRevenue.toNumber()).toBe(1.25) // 2.5 - 1.25
    })

    it('должен округлять до 2 знаков после запятой', () => {
      const amount = new Decimal(33.33)
      const breakdown = CommissionService.calculate(amount)

      expect(breakdown.commission.toFixed(2)).toBe('1.67')
      expect(breakdown.cashback.toFixed(2)).toBe('0.83')
    })

    it('должен гарантировать минимальную комиссию 0.01', () => {
      const amount = new Decimal(0.1)
      const breakdown = CommissionService.calculate(amount)

      expect(breakdown.commission.toNumber()).toBeGreaterThanOrEqual(0.01)
    })

    it('должен валидировать баланс: specialistAmount + commission = amount', () => {
      const amount = new Decimal(100)
      const breakdown = CommissionService.calculate(amount)

      const total = breakdown.specialistAmount.add(breakdown.commission)
      expect(total.eq(amount)).toBe(true)
    })

    it('должен валидировать баланс: commission - cashback = netRevenue', () => {
      const amount = new Decimal(100)
      const breakdown = CommissionService.calculate(amount)

      const calculatedNetRevenue = breakdown.commission.sub(breakdown.cashback)
      expect(calculatedNetRevenue.eq(breakdown.netRevenue)).toBe(true)
    })
  })

  describe('validateBalance', () => {
    it('должен вернуть true для правильного баланса', async () => {
      const clientSpent = new Decimal(100)
      const specialistReceived = new Decimal(95)
      const platformCommission = new Decimal(5)
      const cashbackPaid = new Decimal(2.5)

      const isValid = await CommissionService.validateBalance(
        clientSpent,
        specialistReceived,
        platformCommission,
        cashbackPaid
      )

      expect(isValid).toBe(true)
    })

    it('должен вернуть false для неправильного баланса', async () => {
      const clientSpent = new Decimal(100)
      const specialistReceived = new Decimal(96) // Неправильно
      const platformCommission = new Decimal(5)
      const cashbackPaid = new Decimal(2.5)

      const isValid = await CommissionService.validateBalance(
        clientSpent,
        specialistReceived,
        platformCommission,
        cashbackPaid
      )

      expect(isValid).toBe(false)
    })
  })
})

