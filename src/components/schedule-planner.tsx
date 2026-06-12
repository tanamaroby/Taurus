"use client";

import { addMonths } from "date-fns";
import {
  CalendarDays,
  Check,
  Clipboard,
  Loader2,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";

import {
  countInclusiveDays,
  createScheduleSharePayload,
  formatCompactRange,
  formatWhatsAppText,
  normalizeRange,
  parseWhatsAppText,
  type BlockedRange,
  type ImportedSchedule,
} from "@/lib/schedule";

const quickLabels = [
  "In Indonesia",
  "Meeting unavailable",
  "Travel",
  "Family time",
];

type SchedulePlannerProps = {
  initialSchedule?: ImportedSchedule;
};

export function SchedulePlanner({ initialSchedule }: SchedulePlannerProps) {
  const [isDark, setIsDark] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();
  const [messageTitle, setMessageTitle] = useState(
    initialSchedule?.messageTitle ?? "SCHEDULES",
  );
  const [label, setLabel] = useState(
    initialSchedule?.ranges[0]?.label ?? "In Indonesia",
  );
  const [subSection, setSubSection] = useState("");
  const [subSections, setSubSections] = useState<string[]>([]);
  const [ranges, setRanges] = useState<BlockedRange[]>(
    initialSchedule?.ranges ?? [],
  );
  const [copied, setCopied] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const output = useMemo(
    () => formatWhatsAppText(ranges, messageTitle),
    [ranges, messageTitle],
  );
  const selectedDays = useMemo(
    () =>
      ranges.reduce(
        (total, range) => total + countInclusiveDays(range.from, range.to),
        0,
      ),
    [ranges],
  );

  function toggleTheme() {
    setIsDark((current) => !current);
  }

  function addRange() {
    if (!draftRange?.from) {
      return;
    }

    const normalized = normalizeRange(
      draftRange.from,
      draftRange.to ?? draftRange.from,
    );
    const trimmedLabel = label.trim() || "Blocked dates";
    const trimmedSubSections = subSections
      .map((item) => item.trim())
      .filter(Boolean);

    setRanges((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        label: trimmedLabel,
        subSections: trimmedSubSections,
        from: normalized.from,
        to: normalized.to,
      },
    ]);
    setDraftRange(undefined);
    setSubSections([]);
    setSubSection("");
    setCopied(false);
  }

  function addSubSection() {
    const trimmedSubSection = subSection.trim();
    if (!trimmedSubSection) {
      return;
    }

    setSubSections((current) => [...current, trimmedSubSection]);
    setSubSection("");
  }

  function removeSubSection(indexToRemove: number) {
    setSubSections((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  }

  function removeRange(id: string) {
    setRanges((current) => current.filter((range) => range.id !== id));
    setCopied(false);
  }

  function clearPlanner() {
    setRanges([]);
    setDraftRange(undefined);
    setSubSections([]);
    setSubSection("");
    setCopied(false);
  }

  function importSchedule() {
    try {
      const imported = parseWhatsAppText(importText);
      setMessageTitle(imported.messageTitle);
      setRanges(imported.ranges);
      setDraftRange(undefined);
      setSubSections([]);
      setSubSection("");
      setLabel(imported.ranges[0]?.label ?? "In Indonesia");
      setCopied(false);
      setImportError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to import that text.";
      setImportError(message);
    }
  }

  async function pasteImportText() {
    try {
      const text = await navigator.clipboard.readText();
      setImportText(text);
      setImportError(null);
    } catch {
      setImportError(
        "Clipboard access was blocked. Paste the text manually instead.",
      );
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  async function copyShareLink() {
    if (ranges.length === 0) {
      setLinkError("Add at least one blocked range before sharing.");
      return;
    }
    setLinkLoading(true);
    setLinkError(null);

    try {
      const payload = createScheduleSharePayload(ranges, messageTitle);
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload }),
      });

      const responseBody = (await response
        .json()
        .catch(() => ({}))) as Partial<{
        slug: string;
        error: string;
      }>;

      if (!response.ok || !responseBody.slug) {
        throw new Error(
          responseBody.error ?? "Unable to create share link right now.",
        );
      }

      const shareUrl = new URL(window.location.origin);
      shareUrl.pathname = `/view/${responseBody.slug}`;

      await navigator.clipboard.writeText(shareUrl.toString());
      setLinkCopied(true);
      setLinkError(null);
      window.setTimeout(() => setLinkCopied(false), 2200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to copy the link right now.";
      setLinkError(message);
    } finally {
      setLinkLoading(false);
    }
  }

  return (
    <main className={isDark ? "dark" : ""}>
      <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.20),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.88))] dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.14),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.96))]" />

        <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className="flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur dark:border-white/10 dark:bg-white/7 dark:shadow-black/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-lg shadow-teal-500/25">
                <CalendarDays aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700 dark:text-teal-300">
                  Taurus
                </p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  WhatsApp schedule blocker
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-200"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun size={18} aria-hidden="true" />
              ) : (
                <Moon size={18} aria-hidden="true" />
              )}
              {isDark ? "Light mode" : "Dark mode"}
            </button>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-200/70 backdrop-blur dark:border-white/10 dark:bg-slate-900/88 dark:shadow-black/30 sm:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
                      <Sparkles size={14} aria-hidden="true" /> Select ranges
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Block unavailable dates
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Pick a start and end date, add a clear label, then copy a
                      WhatsApp-friendly plain text summary.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    <strong className="block text-2xl text-slate-950 dark:text-white">
                      {selectedDays}
                    </strong>
                    blocked {selectedDays === 1 ? "day" : "days"}
                  </div>
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Top message
                  </span>
                  <input
                    value={messageTitle}
                    onChange={(event) => {
                      setMessageTitle(event.target.value);
                      setCopied(false);
                    }}
                    placeholder="SCHEDULES"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none ring-teal-500/20 transition focus:border-teal-500 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  />
                  <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">
                    This appears above the blocked date list.
                  </span>
                </label>

                <div className="planner-calendar rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-2 dark:border-white/10 dark:from-slate-950 dark:to-slate-900 sm:p-4">
                  <DayPicker
                    mode="range"
                    selected={draftRange}
                    onSelect={setDraftRange}
                    numberOfMonths={1}
                    defaultMonth={new Date()}
                    endMonth={addMonths(new Date(), 18)}
                    disabled={{
                      before: new Date(new Date().setHours(0, 0, 0, 0)),
                    }}
                    modifiers={{
                      blocked: ranges.map((range) => ({
                        from: range.from,
                        to: range.to,
                      })),
                    }}
                    modifiersClassNames={{ blocked: "rdp-blocked" }}
                    className="mx-auto"
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Range label
                    </span>
                    <input
                      value={label}
                      onChange={(event) => setLabel(event.target.value)}
                      placeholder="e.g. In Indonesia"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none ring-teal-500/20 transition focus:border-teal-500 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={addRange}
                    disabled={!draftRange?.from}
                    className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 dark:bg-teal-400 dark:text-slate-950 dark:shadow-none dark:hover:bg-teal-300"
                  >
                    <Plus size={18} aria-hidden="true" /> Add range
                  </button>
                </div>

                <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Optional sub-sections
                    </span>
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        value={subSection}
                        onChange={(event) => setSubSection(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addSubSection();
                          }
                        }}
                        placeholder="e.g. Team A, Location, morning shift"
                        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none ring-teal-500/20 transition focus:border-teal-500 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={addSubSection}
                        disabled={!subSection.trim()}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-200"
                      >
                        <Plus size={16} aria-hidden="true" /> Add sub-section
                      </button>
                    </div>
                  </label>
                  {subSections.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {subSections.map((item, index) => (
                        <button
                          type="button"
                          key={`${item}-${index}`}
                          onClick={() => removeSubSection(index)}
                          className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-100 dark:hover:border-rose-300/20 dark:hover:bg-rose-400/10 dark:hover:text-rose-200"
                        >
                          {item}
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Leave blank if this label does not need sub-sections.
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {quickLabels.map((quickLabel) => (
                    <button
                      type="button"
                      key={quickLabel}
                      onClick={() => setLabel(quickLabel)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-teal-200"
                    >
                      {quickLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/30 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Selected blocked ranges
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Temporary only. Nothing is saved.
                    </p>
                  </div>
                  {ranges.length > 0 ? (
                    <button
                      type="button"
                      onClick={clearPlanner}
                      className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-400/10 dark:hover:text-rose-200"
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>

                {ranges.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    Add your first date range to see it here.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ranges.map((range) => (
                      <article
                        key={range.id}
                        className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <h3 className="font-semibold text-slate-950 dark:text-white">
                            {range.label}
                          </h3>
                          {range.subSections.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {range.subSections.map((item, index) => (
                                <span
                                  key={`${range.id}-${item}-${index}`}
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {formatCompactRange(range)} ·{" "}
                            {countInclusiveDays(range.from, range.to)}{" "}
                            {countInclusiveDays(range.from, range.to) === 1
                              ? "day"
                              : "days"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRange(range.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:hover:border-rose-300/20 dark:hover:bg-rose-400/10 dark:hover:text-rose-200"
                        >
                          <Trash2 size={16} aria-hidden="true" /> Remove
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 text-slate-950 shadow-2xl shadow-slate-200/80 backdrop-blur dark:border-white/10 dark:bg-white/8 dark:text-white dark:shadow-black/30 sm:p-6 lg:sticky lg:top-8 lg:self-start">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
                    Plain text output
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Ready for WhatsApp
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Uses simple separators and labels instead of Markdown so it
                    stays readable in chat.
                  </p>
                </div>
              </div>

              <pre className="min-h-80 whitespace-pre-wrap rounded-3xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 shadow-inner shadow-slate-200/70 dark:border-white/10 dark:bg-black/30 dark:text-slate-100 dark:shadow-black/30">
                {output}
              </pre>

              <button
                type="button"
                onClick={copyOutput}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-300 px-5 py-4 font-semibold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 hover:bg-teal-200"
              >
                {copied ? (
                  <Check size={20} aria-hidden="true" />
                ) : (
                  <Clipboard size={20} aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy text"}
              </button>

              <button
                type="button"
                onClick={copyShareLink}
                disabled={linkLoading}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-200"
              >
                {linkLoading ? (
                  <Loader2
                    size={20}
                    aria-hidden="true"
                    className="animate-spin"
                  />
                ) : linkCopied ? (
                  <Check size={20} aria-hidden="true" />
                ) : (
                  <Sparkles size={20} aria-hidden="true" />
                )}
                {linkLoading
                  ? "Saving to database..."
                  : linkCopied
                    ? "Link copied"
                    : "Copy share link"}
              </button>

              {linkError ? (
                <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">
                  {linkError}
                </p>
              ) : null}

              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold">
                      Import copied text
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Paste a previously copied Taurus export to refill the
                      planner.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={pasteImportText}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:text-teal-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-200"
                  >
                    Paste
                  </button>
                </div>

                <textarea
                  value={importText}
                  onChange={(event) => {
                    setImportText(event.target.value);
                    if (importError) {
                      setImportError(null);
                    }
                  }}
                  placeholder="Paste previously copied Taurus text here"
                  className="mt-3 min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-teal-500/20 transition focus:border-teal-500 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />

                {importError ? (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">
                    {importError}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={importSchedule}
                    disabled={!importText.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
                  >
                    Import and replace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImportText("");
                      setImportError(null);
                    }}
                    disabled={!importText && !importError}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
                  >
                    Clear import box
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/8">
                  <span className="block text-2xl font-semibold">
                    {ranges.length}
                  </span>
                  ranges
                </div>
                <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/8">
                  <span className="block text-2xl font-semibold">
                    {selectedDays}
                  </span>
                  blocked days
                </div>
              </div>
            </aside>
          </section>

          <footer className="pb-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Built for temporary planning: no account, with short-link sharing.
          </footer>
        </section>
      </div>
    </main>
  );
}
