# Copilot Instructions for Taurus

## Project Purpose

Taurus is a mobile-first Next.js application for creating and sharing WhatsApp-friendly blocked date schedules.

## Stack

- Next.js 16 (App Router)
- TypeScript
- React 19
- Neon PostgreSQL (`@neondatabase/serverless`)
- PWA assets and service worker in `public/`

## Mandatory Rule: Keep Project Context Documentation Current

`docs/PROJECT_CONTEXT.md` is the source of truth for current project context.

This is a hard requirement:

- After every code or config change, update `docs/PROJECT_CONTEXT.md` in the same task.
- Do not finish a task without updating that file when behavior, architecture, routes, API shape, caching, environment requirements, or UX changed.
- Keep updates concise but complete.
- Append an entry to the Change Log section with date, changed files, and a short impact summary.

If there was no behavioral or architecture change, add a brief note in the Change Log stating that only internal refactors occurred.

## Documentation Update Checklist

After each change, verify `docs/PROJECT_CONTEXT.md` includes:

1. Current behavior and feature notes.
2. Any new or changed routes/endpoints.
3. Any new environment variables or operational requirements.
4. Any caching/service worker logic changes.
5. Change Log entry with date and touched files.

## Coding Expectations

- Preserve TypeScript strictness and existing coding style.
- Prefer minimal, focused changes.
- Avoid unrelated refactors.
- Keep user-facing behavior consistent unless the task requests change.
- Validate with lint/build checks when practical.

## PWA-Specific Notes

- `public/sw.js` is versioned (`SW_VERSION`) and controls offline/caching behavior.
- `next.config.ts` sets no-cache headers for `/sw.js` and should stay aligned with service worker update strategy.
- Service worker registration lives in `src/components/service-worker-register.tsx` and is production-only.
