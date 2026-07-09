// ═══════════════════════════════════════════════════════════════════
// AcquisitionOS — Detailed Health Check Endpoint
// Phase 10: DevOps + Deployment — Enhanced
// GET /api/health/detailed — Returns component-level health status
// No authentication required.
// Checks: database, memory, process, disk, env vars, provider config
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { metricsCollector } from '@/lib/observability/metrics-collector';
import { isEmailServiceConfigured } from '@/lib/email';
import { accessSync, statSync, constants } from 'fs';
import { join, dirname } from 'path';

export const dynamic = 'force-dynamic';

// ===== TYPES =====

type ComponentStatus = 'healthy' | 'degraded' | 'unhealthy';

interface ComponentHealth {
  status: ComponentStatus;
  latencyMs?: number;
  details?: string;
  error?: string;
}

interface DetailedHealthResponse {
  status: ComponentStatus;
  version: string;
  environment: string;
  uptime: number;
  timestamp: string;
  components: {
    database: ComponentHealth;
    memory: ComponentHealth;
    disk: ComponentHealth;
    process: ComponentHealth;
    envVars: ComponentHealth;
    providers: ComponentHealth;
  };
  metrics: {
    activeUsers: number;
    totalLeads: number;
    queueDepth: number;
  };
}

// ===== HEALTH CHECK FUNCTIONS =====

async function checkDatabase(): Promise<ComponentHealth> {
  const start = performance.now();
  try {
    // Test DB connectivity and measure latency
    await db.user.count({ take: 1 });
    const latencyMs = performance.now() - start;

    let status: ComponentStatus = 'healthy';
    let details = 'Database connection is active';

    if (latencyMs > 1000) {
      status = 'unhealthy';
      details = `Database latency critically high: ${latencyMs.toFixed(0)}ms`;
    } else if (latencyMs > 200) {
      status = 'degraded';
      details = `Database latency elevated: ${latencyMs.toFixed(0)}ms`;
    }

    // Record the query duration
    metricsCollector.observeHistogram('db_query_duration_seconds', { operation: 'health_check' }, latencyMs / 1000);

    return { status, latencyMs: Math.round(latencyMs * 100) / 100, details };
  } catch (error) {
    return {
      status: 'unhealthy',
      latencyMs: performance.now() - start,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

function checkMemory(): ComponentHealth {
  const mem = process.memoryUsage();
  const heapUsedMB = mem.heapUsed / (1024 * 1024);
  const heapTotalMB = mem.heapTotal / (1024 * 1024);
  const rssMB = mem.rss / (1024 * 1024);
  const heapUsageRatio = mem.heapUsed / mem.heapTotal;

  let status: ComponentStatus = 'healthy';
  let details: string;

  if (heapUsageRatio > 0.95) {
    status = 'unhealthy';
    details = `Heap usage critical: ${(heapUsageRatio * 100).toFixed(1)}% (${heapUsedMB.toFixed(0)}MB / ${heapTotalMB.toFixed(0)}MB)`;
  } else if (heapUsageRatio > 0.85) {
    status = 'degraded';
    details = `Heap usage elevated: ${(heapUsageRatio * 100).toFixed(1)}% (${heapUsedMB.toFixed(0)}MB / ${heapTotalMB.toFixed(0)}MB)`;
  } else {
    details = `Heap usage normal: ${(heapUsageRatio * 100).toFixed(1)}% (${heapUsedMB.toFixed(0)}MB / ${heapTotalMB.toFixed(0)}MB)`;
  }

  return {
    status,
    details,
    latencyMs: Math.round(rssMB * 100) / 100,
  };
}

function checkDisk(): ComponentHealth {
  try {
    // Try to get stats on the data directory
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || join(process.cwd(), 'db');
    const dataDir = dirname(dbPath.replace(/^\/\//, '/'));

    // Check that the data directory is writable
    try {
      accessSync(dataDir, constants.W_OK);
    } catch {
      // If the data dir doesn't exist or isn't writable, check cwd
      try {
        accessSync(process.cwd(), constants.W_OK);
      } catch {
        return {
          status: 'unhealthy',
          error: 'Working directory is not writable',
        };
      }
    }

    // For SQLite databases, check file size as a proxy for disk usage
    if (dbPath && dbPath !== ':memory:') {
      try {
        const realPath = dbPath.startsWith('//') ? dbPath.slice(1) : dbPath;
        const stats = statSync(realPath);
        const sizeMB = stats.size / (1024 * 1024);
        const maxSizeMB = 1024; // 1GB warning threshold for SQLite

        if (sizeMB > maxSizeMB) {
          return {
            status: 'degraded',
            details: `SQLite database size ${sizeMB.toFixed(0)}MB exceeds ${maxSizeMB}MB threshold. Consider migrating to PostgreSQL.`,
          };
        }

        return {
          status: 'healthy',
          details: `Database file: ${sizeMB.toFixed(1)}MB, data directory writable`,
        };
      } catch {
        // DB file might not exist yet (first run)
        return {
          status: 'healthy',
          details: 'Data directory accessible (database file not yet created or using remote DB)',
        };
      }
    }

    return {
      status: 'healthy',
      details: 'Disk access verified',
    };
  } catch (err) {
    return {
      status: 'degraded',
      error: err instanceof Error ? err.message : 'Could not check disk status',
    };
  }
}

function checkProcess(): ComponentHealth {
  const uptimeSeconds = process.uptime();
  const cpuUsage = process.cpuUsage();

  return {
    status: 'healthy',
    details: `Process running for ${formatUptime(uptimeSeconds)}. CPU: user=${(cpuUsage.user / 1000).toFixed(0)}ms, system=${(cpuUsage.system / 1000).toFixed(0)}ms`,
    latencyMs: Math.round(uptimeSeconds * 1000) / 1000,
  };
}

function checkEnvVars(): ComponentHealth {
  const critical: string[] = [];
  const recommended: string[] = [];

  // Critical: app cannot function without these
  if (!process.env.DATABASE_URL) critical.push('DATABASE_URL');

  // Recommended: features will be degraded without these
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') recommended.push('JWT_SECRET');
  if (!process.env.SMTP_HOST) recommended.push('SMTP_HOST');
  if (!process.env.SMTP_USER) recommended.push('SMTP_USER');
  if (!process.env.SMTP_PASSWORD) recommended.push('SMTP_PASSWORD');

  if (critical.length > 0) {
    return {
      status: 'unhealthy',
      error: `Missing critical env vars: ${critical.join(', ')}`,
      details: recommended.length > 0 ? `Also missing recommended: ${recommended.join(', ')}` : undefined,
    };
  }

  if (recommended.length > 0) {
    return {
      status: 'degraded',
      details: `Missing recommended env vars: ${recommended.join(', ')}. Some features may be unavailable.`,
    };
  }

  return {
    status: 'healthy',
    details: 'All critical and recommended environment variables are set',
  };
}

function checkProviders(): ComponentHealth {
  const providers: string[] = [];
  const missing: string[] = [];

  // Check email service
  const emailConfigured = isEmailServiceConfigured();
  if (emailConfigured) {
    providers.push('email');
  } else {
    missing.push('email (SMTP/Resend)');
  }

  // Check Google OAuth
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push('google-oauth');
  } else {
    missing.push('google-oauth');
  }

  // Check Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    providers.push('stripe');
  } else {
    missing.push('stripe');
  }

  // Check Razorpay
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    providers.push('razorpay');
  }

  if (providers.length === 0) {
    return {
      status: 'unhealthy',
      error: 'No external providers configured',
      details: 'At least email or OAuth should be configured for the app to function',
    };
  }

  if (missing.length > 0) {
    return {
      status: 'degraded',
      details: `Configured: ${providers.join(', ')}. Missing: ${missing.join(', ')}`,
    };
  }

  return {
    status: 'healthy',
    details: `All providers configured: ${providers.join(', ')}`,
  };
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

function determineOverallStatus(components: DetailedHealthResponse['components']): ComponentStatus {
  const statuses = Object.values(components).map(c => c.status);

  if (statuses.includes('unhealthy')) return 'unhealthy';
  if (statuses.includes('degraded')) return 'degraded';
  return 'healthy';
}

// ===== ENDPOINT HANDLER =====

export async function GET(): Promise<NextResponse> {
  const startTime = performance.now();

  // Run all health checks in parallel
  const [database, memory, disk, processCheck, envVars, providers] = await Promise.all([
    checkDatabase(),
    checkMemory(),
    Promise.resolve(checkDisk()),
    Promise.resolve(checkProcess()),
    Promise.resolve(checkEnvVars()),
    Promise.resolve(checkProviders()),
  ]);

  const components = {
    database,
    memory,
    disk,
    process: processCheck,
    envVars,
    providers,
  };

  // Gather quick metrics
  let activeUsers = 0;
  let totalLeads = 0;
  let queueDepth = 0;

  try {
    [activeUsers, totalLeads, queueDepth] = await Promise.all([
      db.user.count({ where: { isActive: true, deletedAt: null } }),
      db.lead.count({ where: { isActive: true } }),
      db.workflowExecution.count({ where: { status: 'running' } }),
    ]);
  } catch {
    // Metrics are best-effort, don't fail health check
  }

  const response: DetailedHealthResponse = {
    status: determineOverallStatus(components),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    components,
    metrics: { activeUsers, totalLeads, queueDepth },
  };

  // Observe the total health check duration
  const totalDuration = (performance.now() - startTime) / 1000;
  metricsCollector.observeHistogram('api_request_duration_seconds', { route: '/api/health/detailed' }, totalDuration);

  const statusCode = response.status === 'healthy' ? 200
    : response.status === 'degraded' ? 200
    : 503;

  return NextResponse.json(response, { status: statusCode });
}
