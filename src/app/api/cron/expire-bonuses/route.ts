import { NextRequest, NextResponse } from 'next/server';
import { PointsService } from '@/lib/points/points-service';

/**
 * GET /api/cron/expire-bonuses
 * Cron job для аннулирования просроченных бонусов
 * 
 * Запускается ежедневно через Railway Cron
 * Требует CRON_SECRET в env для безопасности
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации через секретный токен
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Выполнить аннулирование просроченных бонусов
    const result = await PointsService.expireOldBonuses();

    return NextResponse.json({
      success: true,
      expiredCount: result.expiredCount,
      totalAmount: result.totalAmount.toString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error expiring bonuses:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Разрешить вызов без кеширования
export const dynamic = 'force-dynamic';
export const revalidate = 0;

