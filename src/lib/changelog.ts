export type ChangelogEntry = {
  version: string;
  status: "WIP" | "Released";
  dateLabel: string;
  summary: string;
  highlights: string[];
};

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "0.5.0",
    status: "WIP",
    dateLabel: "Working draft",
    summary:
      "Adds multiple schedule views, offline draft persistence, and a dedicated changelog surface.",
    highlights: [
      "Toggle between calendar, list, and summary views on the planner and shared viewer.",
      "Persist planner drafts locally so in-progress schedules survive reloads and offline use.",
      "Publish a mobile-friendly changelog page and link it from the main app screens.",
    ],
  },
  {
    version: "0.4.0",
    status: "Released",
    dateLabel: "2026-06-12",
    summary:
      "Strengthened the offline experience with a service worker, cache updates, and update notices.",
    highlights: [
      "Pre-cached the app shell and offline fallback for disconnected use.",
      "Added network-first handling for navigations and shared content routes.",
      "Surfaced in-app service worker update prompts with refresh and dismiss actions.",
    ],
  },
  {
    version: "0.3.0",
    status: "Released",
    dateLabel: "2026-06-12",
    summary:
      "Introduced DB-backed short links for shared schedules with Neon PostgreSQL.",
    highlights: [
      "Created POST /api/share to store compact payloads and return generated slugs.",
      "Added the shared schedule view at /view/[share].",
      "Enabled metadata and OG previews for shared schedules.",
    ],
  },
  {
    version: "0.2.0",
    status: "Released",
    dateLabel: "2026-06-12",
    summary:
      "Expanded schedule editing with importer support and clearer range formatting.",
    highlights: [
      "Added WhatsApp text import and parsing to refill the planner.",
      "Improved blocked date formatting and date summary output.",
      "Kept the planner focused on fast mobile input and copyable text output.",
    ],
  },
  {
    version: "0.1.0",
    status: "Released",
    dateLabel: "2026-06-11",
    summary: "Initial Taurus PWA release with the core blocked-date workflow.",
    highlights: [
      "Built the mobile-first Taurus scheduling app shell.",
      "Launched the base planner and blocked-range export flow.",
      "Established the design language for the app's visual system.",
    ],
  },
];
