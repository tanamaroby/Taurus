import { NextResponse } from "next/server";

import { type ScheduleSharePayload } from "@/lib/schedule";
import { createSharedSchedule } from "@/lib/share-store";

export const runtime = "nodejs";

function isScheduleSharePayload(value: unknown): value is ScheduleSharePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<ScheduleSharePayload>;

  if (typeof payload.t !== "string" || !Array.isArray(payload.r)) {
    return false;
  }

  return payload.r.every(
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { payload?: unknown };
    if (!isScheduleSharePayload(body.payload)) {
      return NextResponse.json(
        { error: "Invalid share payload." },
        { status: 400 },
      );
    }

    const slug = await createSharedSchedule(body.payload);
    return NextResponse.json({ slug }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create share link right now.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
