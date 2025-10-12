import { NextRequest, NextResponse } from 'next/server';
import { PointsService } from '@/lib/points/points-service';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

/**
 * GET /api/user/transactions
 * Получить историю транзакций текущего пользователя
 * Query params: ?limit=50&offset=0
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

    // Получить параметры пагинации
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Получить транзакции
    const [transactions, total] = await Promise.all([
      PointsService.getTransactionHistory(session.userId, limit, offset),
      PointsService.getTransactionCount(session.userId),
    ]);

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount.toString(),
        balanceType: t.balanceType,
        balanceBefore: t.balanceBefore.toString(),
        balanceAfter: t.balanceAfter.toString(),
        description: t.description,
        metadata: t.metadata,
        createdAt: t.createdAt.toISOString(),
      })),
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('[API] Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

