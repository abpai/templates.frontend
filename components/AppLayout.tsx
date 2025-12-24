import { PenTool } from 'lucide-react'
import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

function navLinkClassName(isActive: boolean) {
  return [
    'rounded-full px-3 py-1.5 text-sm transition-colors',
    isActive
      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-dark-elevated',
  ].join(' ')
}

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white dark:from-dark-surface dark:to-dark-base">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-dark-border/70 dark:bg-dark-surface/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-sm">
              <PenTool size={18} className="text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-base font-semibold text-slate-900 dark:text-zinc-100">
                Frontend Starter
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-500">
                Vite + React + TS + Tailwind + Workers
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/" className={({ isActive }) => navLinkClassName(isActive)} end>
              Home
            </NavLink>
            <NavLink to="/components" className={({ isActive }) => navLinkClassName(isActive)} end>
              Components
            </NavLink>
            <NavLink to="/api-demo" className={({ isActive }) => navLinkClassName(isActive)} end>
              API demo
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
