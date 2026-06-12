# Taurus Project Context

Last Updated: 2026-06-12

## Maintenance Policy
This document must be updated after every project change that affects behavior, architecture, routes, API contracts, environment setup, caching, or operational workflow. Treat this as a required step in every implementation task.

## Overview
Taurus is a mobile-friendly scheduling tool that lets users build blocked date ranges and export them to a WhatsApp-readable plain text format. It also supports sharing schedules through short links backed by Neon PostgreSQL.

The app also exposes multiple schedule views on the planner and shared pages, plus a dedicated in-app changelog page that mirrors the release notes in `CHANGELOG.md`.

## Tech Stack
- Framework: Next.js 16 (App Router)
- Language: TypeScript
- UI: React 19
- Date utilities: `date-fns`
- Database: Neon PostgreSQL via `@neondatabase/serverless`
- Runtime styles: app-level CSS in `src/app/globals.css`

## Core App Structure
- Main page: `src/app/page.tsx`
- Changelog page: `src/app/changelog/page.tsx`
- Root layout and metadata: `src/app/layout.tsx`
- Share API route: `src/app/api/share/route.ts`
- Shared schedule page: `src/app/view/[share]/page.tsx`
- OG image route: `src/app/og/route.tsx`
- Changelog data source: `src/lib/changelog.ts`
- Schedule model/format utils: `src/lib/schedule.ts`
- Share persistence: `src/lib/share-store.ts`
- Planner UI: `src/components/schedule-planner.tsx`
- Viewer UI: `src/components/schedule-viewer.tsx`

## Share Flow
1. Client creates a compact payload from schedule ranges.
2. `POST /api/share` validates payload and stores it in `taurus_shared_schedules`.
3. API returns a generated slug (`<slug-base>-<random-suffix>`).
4. Shared URL `/view/[share]` loads and renders schedule data from DB.

## View Modes and Offline Drafts
- Planner and shared-view pages can switch between calendar, list, and summary/text-style previews.
- Planner drafts persist locally in `localStorage` so the current work survives reloads and offline sessions on the same device.
- The changelog is linked from both the planner and shared view pages.

## Database Behavior
On first share create/read, app ensures table exists:

```sql
CREATE TABLE IF NOT EXISTS taurus_shared_schedules (
  slug TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Environment variables:
- Preferred: `NEON_DATABASE_URL`
- Fallback: `DATABASE_URL`

## PWA and Service Worker
Service worker file: `public/sw.js`

Current behavior:
- Versioned cache names (`SW_VERSION = "taurus-v3"`).
- Pre-caches app shell assets and `offline.html`.
- Pre-caches the changelog page so it remains available after the first visit.
- Activates immediately (`skipWaiting` + `clients.claim`).
- Deletes old cache versions on activation.
- Navigation requests: network-first with offline fallback (`public/offline.html`).
- `/api/share` and `/og`: network-first dynamic caching.
- Static assets (style/script/image/font): stale-while-revalidate.
- Offline fallback now points users back to the planner and changelog when the network is unavailable.

Registration UI:
- `src/components/service-worker-register.tsx`
- Registers service worker in production only.
- Shows in-app update notice when a new SW is available.
- Notice supports:
  - `Refresh` (reload page)
  - `Dismiss` (hide notice for session)
  - Detection timestamp display.

## Config Notes
`next.config.ts` sets no-cache headers for `/sw.js`:
- `Cache-Control: no-cache, no-store, must-revalidate`

This ensures browsers re-check worker updates reliably.

## Commands
- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Start: `npm run start`

## Change Log
### 2026-06-12
- Added the changelog page and linked it from the app surfaces.
- Added planner and shared-view mode toggles for calendar, list, and summary/text previews.
- Added local draft persistence and refreshed offline messaging/caching.
- Touched files: `CHANGELOG.md`, `src/app/changelog/page.tsx`, `src/lib/changelog.ts`, `src/components/schedule-planner.tsx`, `src/components/schedule-viewer.tsx`, `public/sw.js`, `public/offline.html`, `.github/copilot-instructions.md`.
- Impact: new in-app release notes, more flexible schedule inspection, and stronger offline behavior.
### 2026-06-12
- Added repository instruction policy in `.github/copilot-instructions.md`.
- Added this context file as living project documentation.
- Captured current share flow, DB behavior, and PWA/service worker strategy.
