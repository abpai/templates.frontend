import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-10 text-center shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/60">
      <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-zinc-100">
        Page not found
      </h1>
      <p className="mt-2 text-slate-600 dark:text-zinc-400">That route doesn't exist.</p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
