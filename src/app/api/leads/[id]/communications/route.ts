import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/leads/[id]/communications - Get communications for a lead
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const communications = await db.communication.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(communications);
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}

// POST /api/leads/[id]/communications - Add communication record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, stage: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Create communication record
    const communication = await db.communication.create({
      data: {
        leadId: id,
        channel: body.channel || 'email',
        direction: body.direction || 'outbound',
        content: body.content.trim(),
        messageGeneratedByAI: body.messageGeneratedByAI || false,
        responseSummary: body.responseSummary?.trim() || null,
        intent: body.intent?.trim() || null,
        buyingSignals: body.buyingSignals
          ? (typeof body.buyingSignals === 'string'
            ? body.buyingSignals
            : JSON.stringify(body.buyingSignals))
          : null,
        hesitationReasons: body.hesitationReasons
          ? (typeof body.hesitationReasons === 'string'
            ? body.hesitationReasons
            : JSON.stringify(body.hesitationReasons))
          : null,
      },
    });

    // Auto-update lead stage based on communication
    let stageUpdate: string | null = null;
    const currentStage = lead.stage;

    if (body.direction === 'outbound' && currentStage === 'discovered') {
      // First outbound contact moves to "contacted"
      stageUpdate = 'contacted';
    }

    if (body.direction === 'inbound') {
      // Inbound response from the lead
      if (currentStage === 'discovered' || currentStage === 'contacted') {
        if (body.intent === 'interested') {
          stageUpdate = 'interested';
        } else {
          stageUpdate = 'replied';
        }
      }
      if (currentStage === 'replied' && body.intent === 'interested') {
        stageUpdate = 'interested';
      }
    }

    if (stageUpdate && stageUpdate !== currentStage) {
      await db.lead.update({
        where: { id },
        data: { stage: stageUpdate },
      });
    }

    return NextResponse.json({
      communication,
      stageUpdated: stageUpdate
        ? { from: currentStage, to: stageUpdate }
        : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating communication:', error);
    return NextResponse.json(
      { error: 'Failed to create communication' },
      { status: 500 }
    );
  }
}
