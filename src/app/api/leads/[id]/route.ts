// ═══════════════════════════════════════════════════════════════════
// AcquisitionOS — GET/PUT/DELETE /api/leads/[id]
// Phase 7: Full lead details, update, soft delete
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { logAuditEvent } from '@/lib/lead-audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      const lead = await db.lead.findFirst({
        where: { id, isActive: true },
        include: {
          leadNotes: {
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          leadAnalysis: true,
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 30,
          },
          leadScores: {
            orderBy: { scoredAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      // Check authorization
      if (lead.userId && lead.userId !== user.id && lead.orgId !== user.orgId) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      return NextResponse.json({ lead });
    } catch (error) {
      console.error('[API /leads/[id]] GET Error:', error);
      return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      // Fetch existing lead
      const existing = await db.lead.findFirst({ where: { id, isActive: true } });
      if (!existing) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      // Check authorization
      if (existing.userId && existing.userId !== user.id && existing.orgId !== user.orgId) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      const body = await request.json();

      // Build update data with validation
      const updateData: Record<string, unknown> = {};

      const allowedFields = [
        'businessName', 'ownerName', 'website', 'email', 'phone', 'whatsapp',
        'linkedin', 'instagram', 'facebook', 'googleMapsListing', 'reviews',
        'city', 'country', 'niche', 'notes', 'stage', 'emailStatus',
        'estimatedQuality', 'estimatedRevenue', 'bestContactPerson',
        'bestChannel', 'bestTiming', 'outreachStyle', 'opportunityNotes',
        'digitalWeaknesses', 'followUpAt', 'websiteQuality',
      ];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          const value = body[field];
          // Sanitize string values
          if (typeof value === 'string') {
            updateData[field] = value.trim().substring(0, 2000);
          } else if (value === null) {
            updateData[field] = null;
          } else {
            updateData[field] = value;
          }
        }
      }

      // Handle rating separately (numeric)
      if (body.rating !== undefined) {
        updateData.rating = typeof body.rating === 'number' ? Math.min(5, Math.max(0, body.rating)) : null;
      }

      // Handle tags (JSON array)
      if (body.tags !== undefined) {
        if (Array.isArray(body.tags)) {
          updateData.tags = JSON.stringify(body.tags.filter((t: unknown) => typeof t === 'string'));
        }
      }

      // Handle hasWebsite
      if (body.website !== undefined) {
        updateData.hasWebsite = !!body.website;
      }

      // Update lead
      const updated = await db.lead.update({
        where: { id },
        data: updateData,
      });

      // Audit log
      await logAuditEvent(user.id, 'lead_updated', {
        leadId: id,
        updatedFields: Object.keys(updateData),
        businessName: existing.businessName,
      });

      return NextResponse.json({ lead: updated });
    } catch (error) {
      console.error('[API /leads/[id]] PUT Error:', error);
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      const lead = await db.lead.findFirst({ where: { id, isActive: true } });
      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      // Check authorization
      if (lead.userId && lead.userId !== user.id && lead.orgId !== user.orgId) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      // Soft delete
      await db.lead.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });

      // Audit log
      await logAuditEvent(user.id, 'lead_deleted', {
        leadId: id,
        businessName: lead.businessName,
        softDelete: true,
      });

      return NextResponse.json({ success: true, message: 'Lead deleted' });
    } catch (error) {
      console.error('[API /leads/[id]] DELETE Error:', error);
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
  });
}
