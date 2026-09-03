# ShortLink - Modern Link Management & URL Shortener Platform

A production-ready URL Shortener and Link Management Platform built with **Next.js (App Router, Server Actions, Route Handlers)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, RLS)**, engineered for deployment on **Vercel Serverless**.

---

## Architecture Overview

ShortLink is designed with a high-performance, serverless-first architecture:
- **No external persistent backend server**: Zero Express, NestJS, or Django daemons. Everything runs through Next.js App Router Route Handlers and Server Actions within Vercel's serverless infrastructure.
- **Microsecond-Optimized Redirect Engine (`src/app/[slug]/route.ts`)**:
  - Direct database index lookup on `links.slug`.
  - Minimal SQL projection (`id, destination_url, is_active, expires_at, max_clicks, click_count, redirect_type, password_hash`).
  - No client-side UI rendering before redirect.
  - Non-blocking asynchronous click event logging and atomic counter increments via Next.js `after()` API, returning the HTTP `307/301/302` response without waiting for analytics persistence.
- **Race-Condition-Free Click Counters**: Utilizes a PostgreSQL RPC function (`increment_link_clicks`) executed inside the database engine to guarantee atomic updates without read-modify-write race conditions.
- **Database & Auth with Supabase**:
  - Fully normalized PostgreSQL tables with foreign keys and cascade rules.
  - Strict Row Level Security (RLS) ensuring tenants cannot access or tamper with links belonging to other accounts.
  - Cookie-based session handling via `@supabase/ssr`.
  - Service Role Key isolation: strictly server-side, never exposed to client browsers.

---

## Features Implemented

1. **Core URL Shortener**:
   - Cryptographically random slug generator (unambiguous Base62 characters).
   - Custom alias support with collision detection.
   - Link attributes: Title, description, expiration timestamp, max click limits, active status, redirect HTTP status (301, 302, 307).
   - Link operations: Create, edit destination, edit slug, enable/disable toggle, delete, duplicate, copy, search & filter.
2. **Anonymous Shortening**:
   - Instant shortening on homepage hero without prior registration.
   - IP-based sliding window rate limiting.
   - Comprehensive SSRF and malicious protocol validation.
   - Immediate short link, 1-click copy, and built-in QR Code preview.
3. **High-Performance Redirect Engine (`/[slug]`)**:
   - Evaluates link existence, active status, expiration timestamp, click quota, and password requirement.
   - Non-blocking click events ingestion via Next.js `after()`.
   - Friendly status pages for 404, expired, disabled, and limit-reached links (`/error`).
4. **Reserved Slugs Protection**:
   - Centralized blocklist preventing collision with system routes (`admin`, `api`, `dashboard`, `tools`, `report`, `robots.txt`, etc.).
5. **QR Code Generator & Studio**:
   - Automatically generated QR code for every short link (encodes short link so destination updates keep the QR valid).
   - Standalone QR Studio (`/tools/qr-code-generator`) with color palettes, error correction levels (L, M, Q, H), and instant PNG and SVG downloads.
6. **Privacy-First Analytics**:
   - Total clicks, clicks today, last 7 days, last 30 days, interactive SVG timeline chart.
   - Attributions: Top referrers, top countries, device type (Desktop, Mobile, Tablet), browser, and operating system.
   - Strict privacy: No raw IP addresses permanently persisted.
7. **Abuse & Security Reporting (`/report`)**:
   - Community abuse reporting form with categorization (Spam, Phishing, Malware, Scam, Illegal content) and rate-limited API.
8. **UTM Campaign Builder (`/tools/utm-builder`)**:
   - Standard Google Analytics UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`).
   - Live URL preview, 1-click copy, and direct 1-click "Shorten this UTM Link" workflow.
9. **Modern Dashboard UI**:
   - Clean, modern SaaS aesthetic with Tailwind CSS.
   - Overview metrics, quick link creator, recent links table, and deep single-link analytics view.
   - Links table with search, status filtering (All, Active, Disabled, Expired), and sorting.
10. **Automated Testing Suite**:
    - Vitest unit tests verifying SSRF prevention, private IP blocking, slug generation, reserved slug collisions, and password hashing.

---

## Features Planned for Future Scope (Non-MVP)

- Custom Branded Domains (Vercel Wildcard DNS + CNAME verification).
- Team Workspaces & Multi-tenant RBAC.
- Developer REST API Keys & Rate-Tier Quotas.
- Link-in-bio landing page builder.
- Smart Geographic & Device-based dynamic routing.
- Stripe / LemonSqueezy subscription billing.

---

## Local Development Setup

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- A free [Supabase](https://supabase.com) account

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/short-link.git
cd short-link
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Supabase Database & Run Migrations
1. Create a new project in your Supabase dashboard.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in this repository.
4. Copy and paste the entire SQL contents into the Supabase SQL Editor and click **Run**.
5. This creates the `profiles`, `links`, `click_events`, `reports`, `blocked_domains` tables, indexes, RPC increment function, and all Row Level Security (RLS) policies.

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your project credentials from **Supabase Dashboard > Project Settings > API**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 5: Run Automated Tests
```bash
npm test
```

### Step 6: Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Deployment to Vercel

1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import your repository.
3. Configure the **Environment Variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://jgtesumifnovjxckbgge.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_IxUTmIbcQo7mDrGE410MbA_yaUfsw7u`
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `NEXT_PUBLIC_SITE_URL`: `https://ndllink.vercel.app`
4. Click **Deploy**.
5. In Supabase Dashboard under **Authentication > URL Configuration**:
   - Set **Site URL**: `https://ndllink.vercel.app`
   - In **Redirect URLs**, add:
     - `https://ndllink.vercel.app/**`
     - `https://ndllink.vercel.app/auth/callback`
     - `http://localhost:3000/**`
     - `http://localhost:3001/**`

---

## Security Considerations

- **Server-Side Request Forgery (SSRF) Guard**: All destination URLs are validated before shortening. Loopback (`127.0.0.1`), local hostnames (`localhost`), private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`), and dangerous protocols (`javascript:`, `data:`, `file:`, `blob:`) are strictly prohibited.
- **Salted Password Hashing**: Passwords for protected links are hashed with PBKDF2-HMAC-SHA256 with 100,000 iterations and cryptographically unique salts. Comparison uses constant-time byte buffers (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
- **Service Role Key Isolation**: The Supabase Service Role Key is used exclusively in server-only modules (`src/lib/supabase/admin.ts`, Route Handlers) and is never bundled to client-facing code.
- **Rate Limiting**: Sliding window rate limiting guards anonymous shortening, login attempts, password verifications, and abuse report submissions.
- **Abuse Reporting**: Built-in `/report` flow allows visitors to flag phishing, malware, or spam URLs, persisting submissions to the `reports` review table.

---

## Performance Considerations

- **Redirect Latency**: The redirect route handler does not render React components or load dashboard layouts. It queries only the indexed `slug` column and minimal fields, returning an immediate HTTP redirect.
- **Non-blocking Analytics**: Next.js `after()` schedules analytics logging (header parsing, database insertion, click increment) to execute in the background after the redirect response has flushed to the client.
- **Atomic Click Counting**: Click increments use `increment_link_clicks()` PostgreSQL RPC function, ensuring sub-millisecond execution without locking or concurrency anomalies.
- **Compound Database Indexes**: `click_events(link_id, created_at DESC)` ensures analytics queries over 24h, 7d, and 30d time ranges run with index range scans rather than full table scans.
