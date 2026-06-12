import { ImageResponse } from "next/og";

import {
  countInclusiveDays,
  describeScheduleShare,
  formatCompactRange,
} from "@/lib/schedule";
import { getSharedScheduleBySlug } from "@/lib/share-store";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shareSlug = searchParams.get("slug")?.trim();
  const schedule = shareSlug ? await getSharedScheduleBySlug(shareSlug) : null;

  const summary = schedule
    ? describeScheduleShare(schedule)
    : {
        title: "Taurus — WhatsApp Schedule Blocker",
        description:
          "Create clear plain-text blocked date summaries to copy into WhatsApp.",
      };

  const ranges = schedule?.ranges ?? [];
  const highlightedRanges = ranges.slice(0, 3);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 42%, #134e4a 100%)",
        color: "#f8fafc",
        padding: 56,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 15% 20%, rgba(45, 212, 191, 0.28), transparent 28%), radial-gradient(circle at 82% 18%, rgba(96, 165, 250, 0.26), transparent 24%), radial-gradient(circle at 78% 82%, rgba(20, 184, 166, 0.18), transparent 26%)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          border: "1px solid rgba(148, 163, 184, 0.22)",
          borderRadius: 40,
          background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.78), rgba(2, 6, 23, 0.92))",
          boxShadow: "0 40px 120px rgba(15, 23, 42, 0.45)",
          overflow: "hidden",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 24 }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              maxWidth: 720,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                width: "fit-content",
                gap: 12,
                padding: "12px 18px",
                borderRadius: 999,
                background: "rgba(20, 184, 166, 0.14)",
                border: "1px solid rgba(45, 212, 191, 0.26)",
                color: "#99f6e4",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Taurus
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  fontSize: 68,
                  fontWeight: 800,
                  lineHeight: 1.02,
                  letterSpacing: -2,
                }}
              >
                {summary.title}
              </div>
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.35,
                  color: "rgba(226, 232, 240, 0.9)",
                  maxWidth: 760,
                }}
              >
                {summary.description}
              </div>
            </div>
          </div>

          <div
            style={{
              minWidth: 320,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: 24,
              borderRadius: 28,
              background: "rgba(15, 23, 42, 0.72)",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              alignSelf: "flex-start",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: "#cbd5e1" }}>
              Shared schedule
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                lineHeight: 1,
                color: "#f8fafc",
              }}
            >
              {ranges.length}
            </div>
            <div style={{ fontSize: 22, color: "#94a3b8" }}>
              {ranges.length === 1 ? "blocked range" : "blocked ranges"}
            </div>
            <div style={{ fontSize: 20, color: "#5eead4" }}>
              {ranges.reduce(
                (total, range) =>
                  total + countInclusiveDays(range.from, range.to),
                0,
              )}{" "}
              {ranges.reduce(
                (total, range) =>
                  total + countInclusiveDays(range.from, range.to),
                0,
              ) === 1
                ? "day"
                : "days"}{" "}
              blocked
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 28,
          }}
        >
          {highlightedRanges.length > 0 ? (
            highlightedRanges.map((range) => (
              <div
                key={range.id}
                style={{
                  minWidth: 280,
                  flex: "1 1 280px",
                  padding: 20,
                  borderRadius: 24,
                  background: "rgba(248, 250, 252, 0.08)",
                  border: "1px solid rgba(148, 163, 184, 0.18)",
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
                  {range.label}
                </div>
                <div
                  style={{ fontSize: 18, color: "#bae6fd", marginBottom: 10 }}
                >
                  {formatCompactRange(range)}
                </div>
                {range.subSections.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {range.subSections.slice(0, 3).map((item) => (
                      <span
                        key={`${range.id}-${item}`}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 999,
                          background: "rgba(45, 212, 191, 0.12)",
                          color: "#a7f3d0",
                          fontSize: 16,
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: 24,
                borderRadius: 24,
                background: "rgba(248, 250, 252, 0.08)",
                border: "1px dashed rgba(148, 163, 184, 0.22)",
                fontSize: 24,
                color: "#cbd5e1",
              }}
            >
              Open Taurus and add blocked dates to generate a share preview.
            </div>
          )}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
