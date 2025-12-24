import React from 'react'

const ComponentsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-zinc-100">
          Components
        </h1>
        <p className="mt-2 text-slate-600 dark:text-zinc-400">
          A small set of copy-friendly styles to start building.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/60">
          <div className="text-sm font-medium text-slate-900 dark:text-zinc-100">Buttons</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
              Primary
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-dark-border dark:bg-dark-elevated dark:text-zinc-200 dark:hover:bg-zinc-700">
              Secondary
            </button>
            <button
              disabled
              className="rounded-xl bg-slate-900/40 px-4 py-2 text-sm font-medium text-white"
            >
              Disabled
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/60">
          <div className="text-sm font-medium text-slate-900 dark:text-zinc-100">Inputs</div>
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-dark-border dark:bg-dark-elevated dark:text-zinc-100 dark:focus:border-accent dark:focus:ring-accent/20"
              placeholder="Email"
            />
            <textarea
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-dark-border dark:bg-dark-elevated dark:text-zinc-100 dark:focus:border-accent dark:focus:ring-accent/20"
              placeholder="Message"
              rows={3}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default ComponentsPage
