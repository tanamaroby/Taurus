# Changelog

## 0.5.0 - WIP

- Fixed calendar rendering/styling on shared view links so blocked dates are visible again.
- Added multiple schedule views for the planner and shared viewer.
- Added local draft persistence so schedules survive reloads and offline use.
- Added a dedicated changelog page and linked it from the app.
- Replaced Taurus branding assets with a new premium icon system for PWA install surfaces.
- Added dedicated maskable and monochrome icon variants for launcher compatibility.
- Updated app metadata and cached shell assets so icon updates roll out reliably.

## 0.4.0

- Added the service worker, cache update flow, and offline fallback.
- Added update prompts for new service worker versions.
- Kept navigations and shared content working with a network-first strategy.

## 0.3.0

- Added Neon-backed short-link sharing for schedules.
- Added the shared viewer route and OG previews.
- Stored share payloads in PostgreSQL instead of encoding them into the URL.

## 0.2.0

- Added WhatsApp text import and parser support.
- Improved blocked date formatting and output readability.
- Tightened the planner flow for faster mobile entry.

## 0.1.0

- Launched the initial Taurus PWA.
- Built the base planner and share-ready blocked date export flow.
- Established the core scheduling UI and visual direction.