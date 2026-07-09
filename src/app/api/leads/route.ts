import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withDualAuthPermission } from '@/lib/auth-middleware';
import { checkPlanEntitlement, getFeatureUsage } from '@/lib/entitlement-middleware';
import { withMonitoring } from '@/lib/observability/middleware';

// GET /api/leads - List all leads with filtering, sorting, and pagination
export const GET = withMonitoring(async (request: NextRequest) => {
  return withDualAuthPermission(request, 'leads:read', async (user, apiKeyInfo) => {
    try {
      const { searchParams } = new URL(request.url);

      const stage = searchParams.get('stage');
      const niche = searchParams.get('niche');
      const country = searchParams.get('country');
      const search = searchParams.get('search');
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};
      if (apiKeyInfo?.orgId) {
        where.orgId = apiKeyInfo.orgId;
      }
      if (stage) where.stage = stage;
      if (niche) where.niche = { contains: niche };
      if (country) where.country = { contains: country };
      if (search) {
        where.OR = [
          { businessName: { contains: search } },
          { ownerName: { contains: search } },
          { email: { contains: search } },
          { city: { contains: search } },
          { niche: { contains: search } },
        ];
      }

      const validSortFields = ['createdAt', 'updatedAt', 'businessName', 'stage', 'replyScore', 'conversionScore', 'urgencyScore', 'revenuePotentialScore', 'rating'];
      const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const orderBy = { [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc' };

      const [leads, total] = await Promise.all([
        db.lead.findMany({ where, orderBy, skip, take: limit }),
        db.lead.count({ where }),
      ]);

      return NextResponse.json({ leads, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
  });
}, '/api/leads');

// POST /api/leads - Create a new lead
export const POST = withMonitoring(async (request: NextRequest) => {
  return withDualAuthPermission(request, 'leads:write', async (user, apiKeyInfo) => {
    try {
      // Entitlement check: lead_discovery feature
      const currentUsage = await getFeatureUsage(user.id, 'lead_discovery');
      const entitlementCheck = await checkPlanEntitlement(user.id, user.plan, 'lead_discovery', currentUsage);
      if (!entitlementCheck.allowed) return entitlementCheck.response!;

      const body = await request.json();
      if (!body.businessName || typeof body.businessName !== 'string' || !body.businessName.trim()) {
        return NextResponse.json({ error: 'businessName is required' }, { status: 400 });
      }

      const leadData: Record<string, unknown> = {
        businessName: body.businessName.trim(),
        ownerName: body.ownerName?.trim() || null,
        website: body.website?.trim() || null,
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        whatsapp: body.whatsapp?.trim() || null,
        linkedin: body.linkedin?.trim() || null,
        instagram: body.instagram?.trim() || null,
        facebook: body.facebook?.trim() || null,
        googleMapsListing: body.googleMapsListing?.trim() || null,
        reviews: body.reviews || null,
        rating: body.rating ?? null,
        estimatedQuality: body.estimatedQuality || 'medium',
        estimatedRevenue: body.estimatedRevenue || 'medium',
        city: body.city?.trim() || null,
        country: body.country?.trim() || null,
        niche: body.niche?.trim() || null,
        stage: body.stage || 'discovered',
        hasWebsite: body.hasWebsite ?? !!body.website,
        websiteQuality: body.websiteQuality || 'none',
        digitalWeaknesses: body.digitalWeaknesses ? (typeof body.digitalWeaknesses === 'string' ? body.digitalWeaknesses : JSON.stringify(body.digitalWeaknesses)) : null,
        opportunityNotes: body.opportunityNotes ? (typeof body.opportunityNotes === 'string' ? body.opportunityNotes : JSON.stringify(body.opportunityNotes)) : null,
        bestContactPerson: body.bestContactPerson?.trim() || null,
        bestChannel: body.bestChannel?.trim() || null,
        bestTiming: body.bestTiming?.trim() || null,
        outreachStyle: body.outreachStyle?.trim() || null,
        source: body.source?.trim() || null,
        notes: body.notes?.trim() || null,
        tags: body.tags ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : null,
        replyScore: body.replyScore ?? 0,
        conversionScore: body.conversionScore ?? 0,
        urgencyScore: body.urgencyScore ?? 0,
        revenuePotentialScore: body.revenuePotentialScore ?? 0,
      };

      // Org isolation: assign orgId when authenticated via API key
      if (apiKeyInfo?.orgId) {
        leadData.orgId = apiKeyInfo.orgId;
      }

      const lead = await db.lead.create({ data: leadData as never });
      return NextResponse.json(lead, { status: 201 });
    } catch (error) {
      console.error('Error creating lead:', error);
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
  });
}, '/api/leads');
