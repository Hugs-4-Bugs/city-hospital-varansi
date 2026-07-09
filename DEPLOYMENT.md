# 🚀 Vantage — Vercel Deployment Guide

Complete step-by-step guide to deploy Vantage on Vercel with Supabase PostgreSQL.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase Database Setup](#2-supabase-database-setup)
3. [ZAI API Key Setup](#3-zai-api-key-setup)
4. [Vercel Project Setup](#4-vercel-project-setup)
5. [Environment Variables on Vercel](#5-environment-variables-on-vercel)
6. [Database Migration](#6-database-migration)
7. [Deploy to Vercel](#7-deploy-to-vercel)
8. [Post-Deployment Verification](#8-post-deployment-verification)
9. [Custom Domain Setup](#9-custom-domain-setup)
10. [Troubleshooting](#10-troubleshooting)
11. [Architecture on Vercel](#11-architecture-on-vercel)
12. [Cost Estimate](#12-cost-estimate)

---

## 1. Prerequisites

Before you begin, make sure you have:

| Requirement | How to Get It |
|---|---|
| **GitHub Account** | [github.com/signup](https://github.com/signup) |
| **Vercel Account** | [vercel.com/signup](https://vercel.com/signup) (free tier works) |
| **Supabase Account** | [supabase.com](https://supabase.com/) (free tier works) |
| **ZAI API Key** | From your z-ai-web-dev-sdk dashboard |
| **Git** | [git-scm.com](https://git-scm.com/) |
| **Node.js ≥ 18** | [nodejs.org](https://nodejs.org/) |
| **Bun ≥ 1.0** | [bun.sh](https://bun.sh/) |

---

## 2. Supabase Database Setup

Vercel's serverless functions have an **ephemeral filesystem** — you cannot use SQLite. You need a cloud database. **Supabase** (PostgreSQL) is the recommended option.

### Step 2.1: Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `vantage-production` (or your preferred name)
   - **Database Password**: Generate a strong password and **save it** — you'll need it
   - **Region**: Choose the closest region to your target users
   - **Plan**: Free tier is sufficient for starting
4. Click **"Create new project"** and wait for it to provision (~2 minutes)

### Step 2.2: Get Your Connection Strings

1. In your Supabase project dashboard, go to **Settings → Database**
2. Scroll down to **"Connection string"** section
3. You'll need **two** connection strings:

#### Transaction Pooler URL (for `DATABASE_URL`)
- Mode: **"Transaction"** (port 6543)
- This uses PgBouncer for connection pooling — **required for serverless**
- Format:
  ```
  postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```

#### Direct Connection URL (for `DIRECT_URL`)
- Mode: **"Session"** (port 5432)
- Used for Prisma migrations (bypasses PgBouncer)
- Format:
  ```
  postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
  ```

> ⚠️ **Important**: Replace `[password]` with the database password you set in Step 2.1. URL-encode any special characters in the password (e.g., `#` → `%23`, `@` → `%40`).

### Step 2.3: Verify Connection

You can verify the connection works using `psql` or any PostgreSQL client:

```bash
psql "postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

---

## 3. ZAI API Key Setup

The `z-ai-web-dev-sdk` powers all AI features in Vantage:

| Feature | SDK Capability Used |
|---|---|
| Business Discovery | `zai.functions.invoke('web_search')` + `zai.chat.completions.create()` |
| Lead Scoring | `zai.chat.completions.create()` |
| AI Outreach | `zai.chat.completions.create()` |
| Sales Assistant | `zai.chat.completions.create()` |
| Website Analysis | `zai.chat.completions.create()` |
| Proposal Generation | `zai.chat.completions.create()` |
| Score Explanation | `zai.chat.completions.create()` |

### Getting the API Key

1. Access your z-ai-web-dev-sdk dashboard
2. Generate or copy your API key
3. The SDK automatically reads `ZAI_API_KEY` from environment variables when using `ZAI.create()`

> **Note**: Without `ZAI_API_KEY`, AI features will fail with errors. The app does NOT have a fallback mode for missing API keys in production — all AI features require a valid key.

---

## 4. Vercel Project Setup

### Step 4.1: Push Code to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create a GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/vantage.git
git branch -M main
git push -u origin main
```

### Step 4.2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `vantage` repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave default (Vercel auto-detects `next build`)
   - **Output Directory**: Leave default
5. **Do NOT click "Deploy" yet** — we need to set environment variables first
6. Click **"Environment Variables"** to expand that section

---

## 5. Environment Variables on Vercel

Add ALL of the following environment variables in the Vercel project settings:

### Required Variables

| Variable | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase Transaction Pooler URL |
| `DIRECT_URL` | `postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres` | Supabase Direct Connection URL |
| `ZAI_API_KEY` | Your ZAI API key | Powers all AI features |

### Optional Variables

| Variable | Value | Description |
|---|---|---|
| `NEXTAUTH_SECRET` | Random 32-byte string | Required if using authentication |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Required if using authentication |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Public URL of your app |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disables Next.js telemetry |

### How to Set Environment Variables on Vercel

**Option A: During project import**
- In the "Environment Variables" section, add each key-value pair

**Option B: After deployment**
1. Go to your project dashboard on Vercel
2. **Settings → Environment Variables**
3. Add each variable with the appropriate environment: **Production**, **Preview**, and **Development**

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 6. Database Migration

Before deploying, you need to push the Prisma schema to your Supabase database.

### Step 6.1: Switch to Production Schema

The project includes two Prisma schemas:
- `prisma/schema.prisma` — SQLite (for local development)
- `prisma/schema.production.prisma` — PostgreSQL (for Vercel/Supabase)

**For deployment, you'll use the production schema.**

### Step 6.2: Push Schema to Supabase

Run this locally with your Supabase connection string:

```bash
# Set the production DATABASE_URL temporarily
export DATABASE_URL="postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres"
export DIRECT_URL="postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Push the production schema to Supabase
npx prisma db push --schema=prisma/schema.production.prisma

# Generate the Prisma client for PostgreSQL
npx prisma generate --schema=prisma/schema.production.prisma
```

> ⚠️ **Important**: Use the **Direct URL** (port 5432) for migrations, not the pooler URL. PgBouncer doesn't support DDL operations.

### Step 6.3: Verify Tables Were Created

1. Go to your Supabase dashboard
2. Click **"Table Editor"**
3. You should see these tables:
   - `Lead`
   - `Communication`
   - `Deal`
   - `LeadActivity`
   - `FollowUpReminder`
   - `Insight`

---

## 7. Deploy to Vercel

### Step 7.1: Configure Build Settings

The `vercel.json` file in the project root handles most configuration. Here's what it does:

```json
{
  "framework": "nextjs",
  "buildCommand": "bun run db:generate && next build",
  "installCommand": "bun install",
  "regions": ["sin1"],
  "headers": [
    // Security headers for API routes
    // Cache control, XSS protection, frame options
  ]
}
```

**Key points:**
- `buildCommand` runs `prisma generate` before `next build` to ensure the Prisma client is built
- `regions` is set to Singapore (`sin1`) — change this to your preferred region
- Security headers are applied to API routes

### Step 7.2: Update Prisma Schema Reference for Vercel

Before deploying, you need to temporarily switch the active schema to PostgreSQL. Update `prisma/schema.prisma`:

**Option A: Swap the schema file (Recommended for production)**

```bash
# Backup local schema
cp prisma/schema.prisma prisma/schema.local.prisma

# Copy production schema as the active schema
cp prisma/schema.production.prisma prisma/schema.prisma

# Commit and push
git add .
git commit -m "Switch to PostgreSQL schema for Vercel deployment"
git push
```

**Option B: Use environment-based schema (Advanced)**

Add this to your `package.json` scripts:
```json
{
  "scripts": {
    "vercel-build": "cp prisma/schema.production.prisma prisma/schema.prisma && prisma generate && next build"
  }
}
```

Then update `vercel.json`:
```json
{
  "buildCommand": "bun run vercel-build"
}
```

### Step 7.3: Deploy

1. Go to [vercel.com/new](https://vercel.com/new) if you haven't imported yet
2. Or push to your `main` branch — Vercel auto-deploys on push
3. Watch the build logs for any errors

### Step 7.4: First Deployment Checklist

- [ ] Build succeeds without errors
- [ ] Environment variables are set
- [ ] Database tables exist in Supabase
- [ ] Homepage loads at `https://your-project.vercel.app`
- [ ] API routes respond (test `/api/leads`)
- [ ] AI features work (test Discover tab with ZAI_API_KEY)

---

## 8. Post-Deployment Verification

### Test All Features

| Feature | How to Test | Expected Result |
|---|---|---|
| **Homepage** | Visit your Vercel URL | Dashboard loads with overview stats |
| **Discover** | Select niche + country, click Discover | AI finds and creates leads |
| **Leads** | View leads table | Shows discovered leads with scores |
| **Pipeline** | View pipeline stages | Kanban cards with stage management |
| **Outreach** | Select a lead, generate message | AI generates personalized outreach |
| **Assistant** | Chat with AI assistant | Gets contextual sales advice |
| **Insights** | View analytics tab | Charts, funnel, score distribution |
| **Deals** | Create and manage deals | Deal flow with proposal generation |
| **Dark/Light Mode** | Toggle theme | Smooth theme transition |
| **Mobile** | Test on phone/emulator | Bottom nav, responsive layout |

### Check API Health

```bash
# Test the leads API
curl https://your-project.vercel.app/api/leads

# Test the insights API
curl https://your-project.vercel.app/api/insights
```

---

## 9. Custom Domain Setup

1. Go to your Vercel project **Settings → Domains**
2. Add your custom domain (e.g., `vantage.yourcompany.com`)
3. Add the DNS records as instructed (typically a CNAME record)
4. Wait for SSL certificate to provision (usually instant)
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to use the custom domain

---

## 10. Troubleshooting

### Build Errors

| Error | Cause | Fix |
|---|---|---|
| `Prisma Client could not be generated` | Missing schema or DATABASE_URL | Ensure `DATABASE_URL` is set in Vercel env vars |
| `Can't reach database server` | Wrong connection string | Verify Supabase URL and password |
| `P1001: Can't reach database server at ...:5432` | Using direct URL for pooler | Use port 6543 with `?pgbouncer=true` for `DATABASE_URL` |
| `relation "Lead" does not exist` | Schema not pushed | Run `prisma db push` with the production schema |
| `@prisma/client did not initialize yet` | Client not generated | Ensure build command includes `prisma generate` |
| `ZAI_API_KEY is not defined` | Missing env var | Add `ZAI_API_KEY` in Vercel settings |
| `Function timeout` | Serverless function exceeded 10s | Optimize queries or upgrade Vercel plan |

### Database Connection Issues

If you see connection errors from Supabase:

1. **Check IP restrictions**: Supabase free tier may restrict connections. Go to **Settings → Database → Connection Pooling** and ensure it's enabled.

2. **Use the pooler URL**: Always use the Transaction Pooler URL (port 6543) for `DATABASE_URL`, not the direct connection.

3. **Check password encoding**: Special characters in your password must be URL-encoded:
   - `#` → `%23`
   - `@` → `%40`
   - `%` → `%25`
   - `&` → `%26`
   - `?` → `%3F`

4. **Test connection locally**:
   ```bash
   DATABASE_URL="your_supabase_url" npx prisma db pull --schema=prisma/schema.production.prisma
   ```

### AI Features Not Working

1. Verify `ZAI_API_KEY` is set in Vercel environment variables
2. Check the Vercel function logs for API errors
3. Test the key locally first:
   ```bash
   ZAI_API_KEY=your_key bun run dev
   ```

### SQLite vs PostgreSQL Differences

The local development uses SQLite; production uses PostgreSQL. Key differences:

| Feature | SQLite | PostgreSQL |
|---|---|---|
| Provider | `sqlite` | `postgresql` |
| URL format | `file:./db/custom.db` | `postgresql://user:pass@host:port/db` |
| Direct URL | Not needed | Required for migrations |
| Connection pooling | Not needed | PgBouncer required for serverless |
| JSON in String fields | Stored as text | Stored as text (same approach) |
| Float precision | Different | More precise in PostgreSQL |

---

## 11. Architecture on Vercel

```
┌──────────────────────────────────────────────────────────────────┐
│                        VERCEL DEPLOYMENT                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐     ┌──────────────────────────────┐  │
│  │   Vercel Edge CDN    │────▶│   Next.js Serverless         │  │
│  │   (Static Assets)    │     │   Functions (API Routes)     │  │
│  └──────────────────────┘     └──────────┬───────────────────┘  │
│                                          │                      │
│                         ┌────────────────┼────────────────┐     │
│                         ▼                ▼                ▼     │
│               ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│               │   Supabase   │  │   ZAI SDK    │  │  Vercel  │ │
│               │  PostgreSQL  │  │  AI Engine   │  │  Blob    │ │
│               │  Database    │  │  (LLM/VLM)   │  │ (Assets) │ │
│               └──────────────┘  └──────────────┘  └──────────┘ │
│                                                                  │
│  Environment:                                                    │
│  • DATABASE_URL   → Supabase Transaction Pooler (port 6543)     │
│  • DIRECT_URL     → Supabase Direct Connection (port 5432)     │
│  • ZAI_API_KEY    → z-ai-web-dev-sdk authentication            │
│  • NEXTAUTH_*     → Authentication (optional)                   │
│                                                                  │
│  Build Pipeline:                                                 │
│  1. bun install                                                  │
│  2. prisma generate                                              │
│  3. next build                                                   │
│  4. Deploy serverless functions + static assets                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Vercel Serverless Function Limits

| Plan | Execution Timeout | Memory | Bandwidth |
|---|---|---|---|
| **Hobby (Free)** | 10 seconds | 1024 MB | 100 GB/month |
| **Pro** | 60 seconds | 3008 MB | 1 TB/month |
| **Enterprise** | 900 seconds | 3008 MB | Custom |

> ⚠️ The AI features (discovery, analysis, proposal generation) may take longer than 10 seconds. If you hit timeouts on the free plan, consider upgrading to **Pro** or implementing background job processing.

---

## 12. Cost Estimate

### Free Tier (Hobby)

| Service | Free Tier | Notes |
|---|---|---|
| **Vercel** | 100 GB bandwidth, unlimited deployments | Sufficient for low traffic |
| **Supabase** | 500 MB database, 5 GB bandwidth | Good for starting out |
| **ZAI SDK** | Varies by plan | Check your z-ai-web-dev-sdk pricing |

### Pro Tier (Recommended for Production)

| Service | Cost | Benefits |
|---|---|---|
| **Vercel Pro** | $20/month | 60s function timeout, analytics, more bandwidth |
| **Supabase Pro** | $25/month | 8 GB database, 250 GB bandwidth, daily backups |
| **ZAI SDK** | Varies | Based on API usage |

---

## Quick Reference: Complete Environment Variables

```env
# ═══════════════════════════════════════════════════════════
# REQUIRED — Database (Supabase PostgreSQL)
# ═══════════════════════════════════════════════════════════
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# ═══════════════════════════════════════════════════════════
# REQUIRED — AI Engine (z-ai-web-dev-sdk)
# ═══════════════════════════════════════════════════════════
ZAI_API_KEY="your_zai_api_key_here"

# ═══════════════════════════════════════════════════════════
# OPTIONAL — Authentication (NextAuth.js)
# ═══════════════════════════════════════════════════════════
# NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
# NEXTAUTH_URL="https://your-project.vercel.app"

# ═══════════════════════════════════════════════════════════
# OPTIONAL — App Configuration
# ═══════════════════════════════════════════════════════════
# NEXT_PUBLIC_APP_URL="https://your-project.vercel.app"
# NEXT_TELEMETRY_DISABLED="1"
```

---

## Deployment Checklist (Copy & Paste)

```markdown
## Vantage Vercel Deployment Checklist

### Supabase Setup
- [ ] Created Supabase project
- [ ] Saved database password securely
- [ ] Copied Transaction Pooler URL (DATABASE_URL)
- [ ] Copied Direct Connection URL (DIRECT_URL)
- [ ] Tested database connection

### ZAI SDK Setup
- [ ] Obtained ZAI_API_KEY
- [ ] Tested key locally

### GitHub Setup
- [ ] Pushed code to GitHub repository
- [ ] Repository is accessible by Vercel

### Vercel Setup
- [ ] Imported repository on Vercel
- [ ] Set DATABASE_URL environment variable
- [ ] Set DIRECT_URL environment variable
- [ ] Set ZAI_API_KEY environment variable
- [ ] Set NEXTAUTH_SECRET (if using auth)
- [ ] Set NEXTAUTH_URL (if using auth)

### Schema Migration
- [ ] Switched to production schema (PostgreSQL)
- [ ] Ran prisma db push on Supabase
- [ ] Verified tables exist in Supabase Table Editor

### Deployment
- [ ] First build succeeds
- [ ] Homepage loads correctly
- [ ] API routes respond
- [ ] AI features work (Discover, Outreach, Assistant)
- [ ] Database CRUD operations work
- [ ] Mobile responsive layout works
- [ ] Dark/Light mode toggle works

### Post-Deployment
- [ ] Custom domain configured (optional)
- [ ] Environment variables set for Production + Preview
- [ ] Monitoring / alerts configured (optional)
```

---

**That's it! Your Vantage instance is now live on Vercel.** 🎉

For questions or issues, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Next.js on Vercel](https://nextjs.org/docs/app/building-your-application/deploying)
