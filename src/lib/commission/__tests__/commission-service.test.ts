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

    it('должен рассчитывать точные значения без округления', () => {
      const amount = new Decimal(33.33)
      const breakdown = CommissionService.calculate(amount)

      // Точные расчеты без округления
      const expectedCommission = amount.mul(0.05) // 1.6665
      const expectedCashback = expectedCommission.mul(0.5) // 0.83325
      
      expect(breakdown.commission.eq(expectedCommission)).toBe(true)
      expect(breakdown.cashback.eq(expectedCashback)).toBe(true)
      
      // Проверка, что значения точные (не округлены)
      expect(breakdown.commission.toString()).toBe('1.6665')
      expect(breakdown.cashback.toString()).toBe('0.83325')
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

