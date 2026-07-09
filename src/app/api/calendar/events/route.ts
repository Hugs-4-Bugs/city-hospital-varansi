// ═══════════════════════════════════════════════════════════════════
// AcquisitionOS — Google Calendar Events
// GET /api/calendar/events — List upcoming calendar events
// POST /api/calendar/events — Create a new calendar event
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { withApiLogging } from '@/lib/observability/api-logger';
import { db } from '@/lib/db';
import { getValidCalendarAccessToken } from '@/lib/google-oauth';

// ── GET: List upcoming calendar events ────────────────────────────

export const GET = withApiLogging(async (request: NextRequest) => {
  return withAuth(request, async (user) => {
    try {
      // Get valid Calendar access token (refreshes if expired)
      const { accessToken, calendarToken } = await getValidCalendarAccessToken(user.id);

      const timeMin = new Date().toISOString();

      // Fetch upcoming events from Google Calendar API
      const eventsResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=25&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(timeMin)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!eventsResponse.ok) {
        const errorText = await eventsResponse.text();
        console.error('[Calendar Events] Failed to fetch events:', errorText);

        if (eventsResponse.status === 401) {
          await db.googleCalendarToken.update({
            where: { id: calendarToken.id },
            data: { status: 'expired' },
          });
          return NextResponse.json(
            { error: 'Calendar token expired. Please reconnect your Google Calendar.' },
            { status: 401 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to fetch calendar events' },
          { status: 502 }
        );
      }

      const eventsData = await eventsResponse.json();

      // Update sync timestamp
      await db.googleCalendarToken.update({
        where: { id: calendarToken.id },
        data: { updatedAt: new Date() },
      });

      return NextResponse.json({
        events: eventsData.items || [],
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('No active Google Calendar')) {
        return NextResponse.json(
          { error: 'No active Google Calendar connection found. Please connect your Google Calendar first.' },
          { status: 404 }
        );
      }

      if (errorMessage.includes('Token refresh failed')) {
        return NextResponse.json(
          { error: 'Calendar token expired and refresh failed. Please reconnect your Google Calendar.' },
          { status: 401 }
        );
      }

      console.error('[Calendar Events] GET Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: 500 }
      );
    }
  });
}, 'calendar/events');

// ── POST: Create a new calendar event ─────────────────────────────

interface CreateEventBody {
  summary: string;
  description?: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  attendees?: Array<{ email: string }>;
}

export const POST = withApiLogging(async (request: NextRequest) => {
  return withAuth(request, async (user) => {
    try {
      const body: CreateEventBody = await request.json();
      const { summary, description, startDateTime, endDateTime, attendees } = body;

      // Validate required fields
      if (!summary || !startDateTime || !endDateTime) {
        return NextResponse.json(
          { error: 'Missing required fields: summary, startDateTime, endDateTime' },
          { status: 400 }
        );
      }

      // Validate date formats
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format. Use ISO 8601 format.' },
          { status: 400 }
        );
      }

      if (startDate >= endDate) {
        return NextResponse.json(
          { error: 'End date must be after start date.' },
          { status: 400 }
        );
      }

      // Get valid Calendar access token (refreshes if expired)
      const { accessToken, calendarToken } = await getValidCalendarAccessToken(user.id);

      // Build event payload
      const eventPayload: Record<string, unknown> = {
        summary,
        description: description || '',
        start: {
          dateTime: startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        },
        end: {
          dateTime: endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        },
      };

      if (attendees && attendees.length > 0) {
        eventPayload.attendees = attendees.map((a) => ({ email: a.email }));
      }

      // Create event via Google Calendar API
      const createResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventPayload),
        }
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('[Calendar Events] Failed to create event:', errorText);

        if (createResponse.status === 401) {
          await db.googleCalendarToken.update({
            where: { id: calendarToken.id },
            data: { status: 'expired' },
          });
          return NextResponse.json(
            { error: 'Calendar token expired. Please reconnect your Google Calendar.' },
            { status: 401 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to create calendar event' },
          { status: 502 }
        );
      }

      const event = await createResponse.json();

      // Create audit log
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'calendar_event_created',
          details: `Created calendar event: "${summary}"`,
          resource: 'calendar',
          resourceId: event.id,
        },
      });

      console.log('[Calendar Events] Event created:', event.id, 'summary:', summary);

      return NextResponse.json({
        success: true,
        event,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('No active Google Calendar')) {
        return NextResponse.json(
          { error: 'No active Google Calendar connection found. Please connect your Google Calendar first.' },
          { status: 404 }
        );
      }

      if (errorMessage.includes('Token refresh failed')) {
        return NextResponse.json(
          { error: 'Calendar token expired and refresh failed. Please reconnect your Google Calendar.' },
          { status: 401 }
        );
      }

      console.error('[Calendar Events] POST Error:', error);
      return NextResponse.json(
        { error: 'Failed to create calendar event' },
        { status: 500 }
      );
    }
  });
}, 'calendar/events');
