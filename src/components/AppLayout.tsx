import { Activity, Settings, Search, Rewind, Calendar, Brain, Database } from 'lucide-react'
import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useHealth } from '@screenpipe/hooks'
import { StatusIndicator } from '@screenpipe/ui'
import BackendErrorState from './BackendErrorState'
import ThemeToggle from './ThemeToggle'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useDeveloperMode } from '../hooks/useDeveloperMode'

const PIPE_NAV_ITEMS = [
  { id: 'timeline', name: 'Timeline', path: '/pipes/timeline', icon: Rewind },
  { id: 'meetings', name: 'Meetings', path: '/pipes/meetings', icon: Calendar },
  { id: 'memories', name: 'Memories', path: '/pipes/memories', icon: Brain },
  { id: 'data', name: 'Data', path: '/pipes/data', icon: Database },
]

function navLinkClass(isActive: boolean): string {
  return [
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-dark-elevated text-zinc-100'
      : 'text-zinc-400 hover:text-zinc-100 hover:bg-dark-surface',
  ].join(' ')
}

const AppLayout: React.FC = () => {
  const { health, isLoading, isServerDown } = useHealth()
  const location = useLocation()
  const { enabled: developerMode } = useDeveloperMode()

  useKeyboardShortcuts()

  const overallStatus = isLoading
    ? 'disabled'
    : health?.frame_status === 'ok' && health?.audio_status === 'ok'
      ? 'ok'
      : 'error'

  if (isServerDown) {
    return <BackendErrorState />
  }

  return (
    <div className="flex h-screen bg-dark-base">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-dark-border bg-dark-surface">
        <div className="flex items-center gap-3 px-4 py-5 border-b border-dark-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan-600">
            <Activity size={18} className="text-zinc-900" />
          </div>
          <div>
            <div className="font-semibold text-zinc-100">Screenpipe</div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <StatusIndicator status={overallStatus} pulse={overallStatus === 'error'} />
              {isLoading ? 'Connecting...' : overallStatus === 'ok' ? 'Recording' : 'Issues'}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLink to="/" className={({ isActive }) => navLinkClass(isActive)} end>
            <Activity size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => navLinkClass(isActive)}>
            <Search size={18} />
            Search
          </NavLink>

          {developerMode && (
            <div className="pt-4">
              <p className="px-3 pb-2 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                Pipes
              </p>
              {PIPE_NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={navLinkClass(isActive)}
                  >
                    <Icon size={18} />
                    {item.name}
                  </NavLink>
                )
              })}
            </div>
          )}

          {/* Settings at bottom of nav */}
          <div className="pt-4">
            <NavLink to="/settings" className={({ isActive }) => navLinkClass(isActive)}>
              <Settings size={18} />
              Settings
            </NavLink>
          </div>
        </nav>

        <div className="p-3 border-t border-dark-border">
          <ThemeToggle />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
