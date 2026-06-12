import { neon } from "@neondatabase/serverless";

import {
  scheduleSharePayloadToImported,
  type ImportedSchedule,
  type ScheduleSharePayload,
} from "@/lib/schedule";

const SLUG_SUFFIX_LENGTH = 6;

let ensuredTablePromise: Promise<void> | null = null;

function getSqlClient() {
  const databaseUrl =
    process.env.NEON_DATABASE_URL?.trim() ?? process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "Missing NEON_DATABASE_URL (or DATABASE_URL) environment variable.",
    );
  }

  return neon(databaseUrl);
}

async function ensureSharesTable() {
  if (!ensuredTablePromise) {
    const sql = getSqlClient();
    ensuredTablePromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS taurus_shared_schedules (
          slug TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
    })();
  }

  await ensuredTablePromise;
}

function toSlugBase(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return slug || "schedule";
}

function createRandomSuffix(length = SLUG_SUFFIX_LENGTH) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  let output = "";

  for (const value of randomValues) {
    output += alphabet[value % alphabet.length];
  }

  return output;
}

function isValidSharePayload(
  payload: unknown,
): payload is ScheduleSharePayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<ScheduleSharePayload>;
  if (typeof candidate.t !== "string" || !Array.isArray(candidate.r)) {
    return false;
  }

  return candidate.r.every(
    (range) =>
      range &&
      typeof range === "object" &&
      typeof range.l === "string" &&
      Array.isArray(range.s) &&
      range.s.every((item) => typeof item === "string") &&
      typeof range.f === "string" &&
      typeof range.o === "string",
  );
}

export async function createSharedSchedule(
  payload: ScheduleSharePayload,
): Promise<string> {
  if (!isValidSharePayload(payload)) {
    throw new Error("Invalid share payload.");
  }

  await ensureSharesTable();

  const sql = getSqlClient();
  const slugBase = toSlugBase(payload.t);
  const payloadJson = JSON.stringify(payload);

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const slug = `${slugBase}-${createRandomSuffix()}`;
    const insertedRows = (await sql`
      INSERT INTO taurus_shared_schedules (slug, payload)
      VALUES (${slug}, ${payloadJson}::jsonb)
      ON CONFLICT (slug) DO NOTHING
      RETURNING slug;
    `) as Array<{ slug: string }>;

    if (insertedRows.length > 0) {
      return insertedRows[0].slug;
    }
  }

  throw new Error("Unable to create share link right now. Please try again.");
}

export async function getSharedScheduleBySlug(
  slug: string,
): Promise<ImportedSchedule | null> {
  if (!slug.trim()) {
    return null;
  }

  await ensureSharesTable();

  const sql = getSqlClient();
  const rows = (await sql`
    SELECT payload
    FROM taurus_shared_schedules
    WHERE slug = ${slug}
    LIMIT 1;
  `) as Array<{ payload: unknown }>;

  if (rows.length === 0) {
    return null;
  }

  try {
    return scheduleSharePayloadToImported(
      rows[0].payload as ScheduleSharePayload,
    );
  } catch {
    return null;
  }
}
