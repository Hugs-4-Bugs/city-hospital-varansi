// ═══════════════════════════════════════════════════════════════════
// AcquisitionOS — POST /api/reply-intelligence/classify
// Lightweight intent classification: just intent + sentiment
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { replyIntelligenceService } from '@/lib/reply-intelligence';

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { messageContent } = body as {
        messageContent?: string;
      };

      if (!messageContent || typeof messageContent !== 'string') {
        return NextResponse.json(
          { error: 'messageContent is required' },
          { status: 400 }
        );
      }

      if (messageContent.trim().length === 0) {
        return NextResponse.json(
          { error: 'messageContent cannot be empty' },
          { status: 400 }
        );
      }

      const classification = await replyIntelligenceService.classifyIntent(
        messageContent
      );

      return NextResponse.json({
        success: true,
        data: classification,
      });
    } catch (error) {
      console.error('[ReplyIntelligence] Classify endpoint error:', error);
      return NextResponse.json(
        { error: 'Failed to classify intent' },
        { status: 500 }
      );
    }
  });
}
