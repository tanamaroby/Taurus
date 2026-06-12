# Taurus

Taurus is a mobile-friendly Next.js PWA for preparing WhatsApp-friendly blocked-date schedules. Select multiple temporary date ranges, label each range, and copy a plain-text summary that stays readable in WhatsApp.

The app now creates short share links by storing schedule payloads in Neon PostgreSQL.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Environment

Create a local environment file:

```bash
cp .env.example .env.local
```

Required variable:

```bash
NEON_DATABASE_URL="postgresql://..."
```

`DATABASE_URL` is also supported as a fallback, but `NEON_DATABASE_URL` is preferred.

## Database

No manual migration is required. On first share creation/read, Taurus automatically creates this table if it does not exist:

```sql
CREATE TABLE IF NOT EXISTS taurus_shared_schedules (
	slug TEXT PRIMARY KEY,
	payload JSONB NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Deployment (Vercel)

1. Add `NEON_DATABASE_URL` in Vercel Project Settings -> Environment Variables for `Production` (and `Preview` if needed).
2. Redeploy after saving the variable.
3. Validate by opening the app, creating a schedule, using `Copy share link`, and loading the generated `/view/<slug>` URL.
