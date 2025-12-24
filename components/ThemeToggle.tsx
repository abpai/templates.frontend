import { Laptop, Moon, Sun } from 'lucide-react'
import React from 'react'
import { useTheme } from '../hooks/useTheme'

const ThemeToggle: React.FC = () => {
  const { preference, resolvedTheme, cyclePreference } = useTheme()

  const Icon = preference === 'system' ? Laptop : resolvedTheme === 'dark' ? Moon : Sun
  const label = preference === 'system' ? 'System' : resolvedTheme === 'dark' ? 'Dark' : 'Light'

  return (
    <button
      type="button"
      onClick={cyclePreference}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-elevated dark:text-zinc-200 dark:hover:bg-zinc-700"
      title={`Theme: ${label}`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

export default ThemeToggle
