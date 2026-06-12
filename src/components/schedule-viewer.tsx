"use client";

import { addMonths, format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  List,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";

import {
  countInclusiveDays,
  formatCompactRange,
  type ImportedSchedule,
} from "@/lib/schedule";

type ScheduleViewerProps = {
  schedule: ImportedSchedule;
};

type ViewerViewMode = "calendar" | "list" | "summary";

export function ScheduleViewer({ schedule }: ScheduleViewerProps) {
  const [viewMode, setViewMode] = useState<ViewerViewMode>("calendar");
  const sortedRanges = useMemo(
    () =>
      [...schedule.ranges].sort((a, b) => a.from.getTime() - b.from.getTime()),
    [schedule.ranges],
  );
  const selectedDays = useMemo(
    () =>
      sortedRanges.reduce(
        (total, range) => total + countInclusiveDays(range.from, range.to),
        0,
      ),
    [sortedRanges],
  );
  const firstRange = sortedRanges[0];
  const lastRange = sortedRanges.at(-1);

  function renderViewContent() {
    if (viewMode === "list") {
      return sortedRanges.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-6 text-slate-300">
          No blocked dates are included in this shared view.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRanges.map((range, index) => (
            <article
              key={range.id}
              className="rounded-3xl border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {range.label}
                  </h4>
                  <p className="mt-1 text-sm text-teal-200">
                    {formatCompactRange(range)}
                  </p>
                </div>
                <div className="rounded-full border border-teal-300/15 bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">
                  #{index + 1}
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                    From
                  </span>
                  <span className="mt-1 block font-medium text-white">
                    {format(range.from, "EEE, d MMM yyyy")}
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                    To
                  </span>
                  <span className="mt-1 block font-medium text-white">
                    {format(range.to, "EEE, d MMM yyyy")}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-300">
                <span>
                  {countInclusiveDays(range.from, range.to)}{" "}
                  {countInclusiveDays(range.from, range.to) === 1
                    ? "day"
                    : "days"}
                </span>
                {range.subSections.length > 0 ? (
                  <span className="text-slate-400">
                    {range.subSections.length} sub-section
                    {range.subSections.length === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>

              {range.subSections.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {range.subSections.map((item) => (
                    <span
                      key={`${range.id}-${item}`}
                      className="rounded-full border border-teal-300/15 bg-teal-300/10 px-3 py-1 text-xs font-medium text-teal-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      );
    }

    if (viewMode === "summary") {
      return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
            <span className="block text-3xl font-semibold text-white">
              {sortedRanges.length}
            </span>
            <span className="mt-2 block text-sm text-slate-400">
              blocked ranges
            </span>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
            <span className="block text-3xl font-semibold text-white">
              {selectedDays}
            </span>
            <span className="mt-2 block text-sm text-slate-400">
              blocked days
            </span>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
            <span className="block text-lg font-semibold text-white">
              Read-only summary
            </span>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This view is optimized for a quick scan before you open the full
              list or calendar.
            </p>
          </div>

          {firstRange && lastRange ? (
            <div className="grid gap-3 sm:col-span-2 xl:col-span-3 lg:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                  First range
                </span>
                <h4 className="mt-2 text-xl font-semibold text-white">
                  {firstRange.label}
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {formatCompactRange(firstRange)}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                  Last range
                </span>
                <h4 className="mt-2 text-xl font-semibold text-white">
                  {lastRange.label}
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {formatCompactRange(lastRange)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-3 shadow-inner shadow-black/20 sm:p-4">
        {sortedRanges.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-6 text-slate-300">
            No blocked dates are included in this shared view.
          </div>
        ) : (
          <DayPicker
            mode="multiple"
            defaultMonth={firstRange?.from ?? new Date()}
            numberOfMonths={1}
            endMonth={addMonths(new Date(), 18)}
            modifiers={{
              blocked: sortedRanges.map((range) => ({
                from: range.from,
                to: range.to,
              })),
            }}
            modifiersClassNames={{ blocked: "rdp-blocked" }}
            className="mx-auto"
          />
        )}
      </div>
    );
  }

  return (
    <main className="overflow-hidden bg-slate-950 text-white">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#020617_100%)]">
        <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className="flex flex-col gap-4 rounded-4xl border border-white/10 bg-white/8 p-5 shadow-2xl shadow-black/25 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-teal-400 to-sky-500 text-slate-950 shadow-lg shadow-teal-500/20">
                <CalendarDays aria-hidden="true" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
                  <Sparkles size={12} aria-hidden="true" /> Read-only view
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {schedule.messageTitle}
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Shared calendar preview with multiple ways to inspect the
                  blocked dates.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-teal-300/30 hover:bg-teal-300/10 hover:text-white"
              >
                <ArrowLeft size={16} aria-hidden="true" /> Open planner
              </Link>
              <Link
                href="/changelog"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-teal-300/30 hover:bg-teal-300/10 hover:text-white"
              >
                <FileText size={16} aria-hidden="true" /> Changelog
              </Link>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <article className="rounded-4xl border border-white/10 bg-white/8 p-5 shadow-2xl shadow-black/25 backdrop-blur sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <p className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-teal-200">
                    Taurus shared calendar
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {schedule.messageTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                    This page is intentionally read-only. Switch between the
                    calendar, list, and summary views to inspect the schedule
                    from different angles.
                  </p>
                </div>

                <div className="grid min-w-60 grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <span className="block text-3xl font-semibold text-white">
                      {sortedRanges.length}
                    </span>
                    <span className="mt-1 block text-sm text-slate-400">
                      ranges
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <span className="block text-3xl font-semibold text-white">
                      {selectedDays}
                    </span>
                    <span className="mt-1 block text-sm text-slate-400">
                      blocked days
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 inline-flex flex-wrap rounded-full border border-white/10 bg-slate-950/40 p-1 text-sm font-semibold text-slate-300">
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${viewMode === "calendar" ? "bg-teal-400 text-slate-950 shadow-sm" : "hover:text-white"}`}
                  aria-pressed={viewMode === "calendar"}
                >
                  <CalendarDays size={16} aria-hidden="true" /> Calendar
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${viewMode === "list" ? "bg-teal-400 text-slate-950 shadow-sm" : "hover:text-white"}`}
                  aria-pressed={viewMode === "list"}
                >
                  <List size={16} aria-hidden="true" /> List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("summary")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${viewMode === "summary" ? "bg-teal-400 text-slate-950 shadow-sm" : "hover:text-white"}`}
                  aria-pressed={viewMode === "summary"}
                >
                  <Sparkles size={16} aria-hidden="true" /> Summary
                </button>
              </div>

              <div className="mt-6">{renderViewContent()}</div>

              {firstRange ? (
                <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    First range starts {format(firstRange.from, "d MMM yyyy")}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    Last range ends{" "}
                    {format(sortedRanges.at(-1)!.to, "d MMM yyyy")}
                  </span>
                </div>
              ) : null}

              <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-300">
                Use the view switcher above to inspect the same schedule as a
                calendar, a range list, or a quick summary.
              </div>
            </article>

            <aside className="rounded-4xl border border-white/10 bg-white/8 p-5 shadow-2xl shadow-black/25 backdrop-blur sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
                    Formatted dates
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    Blocked ranges
                  </h3>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-300">
                Use the switcher above to keep the right-hand summary in sync
                with the selected preview mode.
              </div>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}
