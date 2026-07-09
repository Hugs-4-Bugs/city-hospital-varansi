import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, logAuthEvent, getClientIp, getUserAgent } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { currentRefreshToken } = body;

    if (!currentRefreshToken) {
      return NextResponse.json(
        { error: 'Current refresh token is required' },
        { status: 400 }
      );
    }

    // Revoke all sessions except the current one
    const result = await db.userSession.updateMany({
      where: {
        userId: authUser.id,
        isRevoked: false,
        refreshToken: { not: currentRefreshToken },
      },
      data: { isRevoked: true },
    });

    // Log the event
    await logAuthEvent({
      userId: authUser.id,
      action: 'session_revoked',
      details: `Revoked ${result.count} session(s)`,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      message: `Revoked ${result.count} session(s)`,
      revokedCount: result.count,
    });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
}
