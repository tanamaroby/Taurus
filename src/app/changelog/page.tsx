import type { Metadata } from "next";
import Link from "next/link";

import { changelogEntries } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Taurus changelog",
  description: "Release notes and work-in-progress updates for Taurus.",
};

export default function ChangelogPage() {
  return (
    <main className="overflow-hidden bg-slate-950 text-white">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.2),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_42%,#020617_100%)]">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-4xl border border-white/10 bg-white/8 p-5 shadow-2xl shadow-black/25 backdrop-blur sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-teal-200">
                  Release notes
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Taurus changelog
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                  The newest release is shown as WIP until it is finalized.
                  After that, the version history below records the shipped
                  milestones in order.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-teal-300/30 hover:bg-teal-300/10"
                >
                  Back to planner
                </Link>
              </div>
            </div>
          </header>

          <section className="space-y-4">
            {changelogEntries.map((entry) => (
              <article
                key={entry.version}
                className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 shadow-xl shadow-black/20 backdrop-blur sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold tracking-tight text-white">
                        v{entry.version}
                      </h2>
                      <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-100">
                        {entry.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      {entry.dateLabel}
                    </p>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                      {entry.summary}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                    {entry.status === "WIP"
                      ? "Current work-in-progress"
                      : "Released milestone"}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {entry.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-slate-200"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}
