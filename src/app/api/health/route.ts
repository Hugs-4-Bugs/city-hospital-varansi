// ═══════════════════════════════════════════════════════════════════
// AcquisitionOS — GET /api/health
// Fast health check for load balancers and monitoring.
// Checks: database connectivity, critical env vars, memory.
// No authentication required.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = performance.now();
  const checks: { name: string; ok: boolean; latencyMs?: number; error?: string }[] = [];

  // ── Database connectivity check ─────────────────────────────────
  try {
    const dbStart = performance.now();
    await db.user.count({ take: 1 });
    const dbLatency = performance.now() - dbStart;
    checks.push({
      name: 'database',
      ok: true,
      latencyMs: Math.round(dbLatency * 100) / 100,
    });
  } catch (err) {
    checks.push({
      name: 'database',
      ok: false,
      error: err instanceof Error ? err.message : 'Database connection failed',
    });
  }

  // ── Memory check ────────────────────────────────────────────────
  const mem = process.memoryUsage();
  const heapUsageRatio = mem.heapUsed / mem.heapTotal;
  const memoryOk = heapUsageRatio < 0.95;
  checks.push({
    name: 'memory',
    ok: memoryOk,
    latencyMs: Math.round((mem.rss / (1024 * 1024)) * 100) / 100,
    ...(memoryOk ? {} : { error: `Heap usage critical: ${(heapUsageRatio * 100).toFixed(1)}%` }),
  });

  // ── Critical environment variables check ────────────────────────
  const criticalEnvVars = ['DATABASE_URL'];
  const missingEnvVars = criticalEnvVars.filter(v => !process.env[v]);
  checks.push({
    name: 'env_vars',
    ok: missingEnvVars.length === 0,
    ...(missingEnvVars.length > 0 ? { error: `Missing: ${missingEnvVars.join(', ')}` } : {}),
  });

  // ── Determine overall status ────────────────────────────────────
  const allOk = checks.every(c => c.ok);
  const status = allOk ? 'healthy' : 'unhealthy';
  const totalLatency = Math.round((performance.now() - startTime) * 100) / 100;

  const statusCode = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status,
      service: 'acquisitionos',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      latencyMs: totalLatency,
      checks,
    },
    { status: statusCode }
  );
}
