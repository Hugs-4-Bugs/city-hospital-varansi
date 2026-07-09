import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { db } from '@/lib/db';

// GET /api/chat-sessions — List chat sessions from AiChatSession table
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const sessions = await db.aiChatSession.findMany({
        where: { userId: user.id },
        include: {
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const formattedSessions = sessions.map((s) => ({
        id: s.id,
        title: s.title || 'New Conversation',
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        messageCount: s._count.messages,
        leadContext: s.leadContext || undefined,
        mode: s.salesCoachMode ? 'sales_coach' as const : 'default' as const,
      }));

      return NextResponse.json({
        sessions: formattedSessions,
        total: formattedSessions.length,
      });
    } catch (error) {
      console.error('[API] Error fetching chat sessions:', error);
      return NextResponse.json({
        sessions: [],
        total: 0,
        error: 'Failed to fetch chat sessions',
      }, { status: 500 });
    }
  });
}

// POST /api/chat-sessions — Create a new chat session
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { title, leadId, leadName, mode } = body;

      const newSession = await db.aiChatSession.create({
        data: {
          userId: user.id,
          title: title || 'New Conversation',
          salesCoachMode: mode === 'sales_coach',
          leadContext: leadId || leadName || null,
          isActive: true,
        },
      });

      return NextResponse.json({
        id: newSession.id,
        title: newSession.title,
        createdAt: newSession.createdAt.toISOString(),
        updatedAt: newSession.updatedAt.toISOString(),
        messageCount: 0,
        mode: newSession.salesCoachMode ? 'sales_coach' as const : 'default' as const,
      }, { status: 201 });
    } catch (error) {
      console.error('[API] Error creating chat session:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 400 }
      );
    }
  });
}
