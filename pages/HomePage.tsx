import { ArrowRight, Cloud, Palette, Route as RouteIcon, Sparkles } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const HomePage: React.FC = () => {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/60 md:p-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-700 dark:bg-accent/10 dark:text-accent">
            <Sparkles size={14} />
            Ready-to-code boilerplate
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 md:text-4xl">
            A modern frontend starter with a great vibe
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
            Routing, light/dark theme, Tailwind, TypeScript, ESLint, Prettier, and a Cloudflare
            Worker API — already wired up.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/components"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Browse components <ArrowRight size={16} />
            </Link>
            <Link
              to="/api-demo"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-elevated dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Try the API demo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/60">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <RouteIcon size={18} />
          </div>
          <div className="font-medium text-slate-900 dark:text-zinc-100">Routing</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            React Router is set up with SPA fallback.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/60">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <Palette size={18} />
          </div>
          <div className="font-medium text-slate-900 dark:text-zinc-100">Theme</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            Light/dark theme toggle with persistence.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/60">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-white">
            <Cloud size={18} />
          </div>
          <div className="font-medium text-slate-900 dark:text-zinc-100">Worker API</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            Cloudflare Worker routes under <code className="font-mono">/api</code>.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/60">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-dark-elevated dark:text-zinc-200">
            <span className="font-serif text-lg font-bold">Aa</span>
          </div>
          <div className="font-medium text-slate-900 dark:text-zinc-100">Typography</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            Inter + Merriweather, pre-wired.
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
