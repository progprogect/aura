import { NextRequest, NextResponse } from 'next/server';
import { PointsService } from '@/lib/points/points-service';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

/**
 * GET /api/user/balance
 * Получить баланс текущего пользователя
 */
export async function GET(request: NextRequest) {
  try {
    // Получить userId из сессии
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Найти пользователя по сессии
    const session = await prisma.authSession.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Получить баланс
    const balance = await PointsService.getBalance(session.userId);

    return NextResponse.json({
      balance: balance.balance.toString(),
      bonusBalance: balance.bonusBalance.toString(),
      bonusExpiresAt: balance.bonusExpiresAt?.toISOString() || null,
      total: balance.total.toString(),
    });
  } catch (error) {
    console.error('[API] Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

