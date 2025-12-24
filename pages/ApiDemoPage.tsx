import React, { useCallback, useState } from 'react'
import { apiGet } from '../services/api'
import type { ApiHealthResponse } from '../types'

const ApiDemoPage: React.FC = () => {
  const [result, setResult] = useState<ApiHealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const run = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiGet<ApiHealthResponse>('/api/health')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-zinc-100">
          API Demo
        </h1>
        <p className="mt-2 text-slate-600 dark:text-zinc-400">
          Frontend calls <code className="font-mono">/api</code>, Vite proxies to the local Worker.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/60">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-slate-900 dark:text-zinc-100">
            GET <code className="font-mono">/api/health</code>
          </div>
          <button
            onClick={run}
            disabled={isLoading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {isLoading ? 'Loading...' : 'Run'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {result && (
          <pre className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 dark:border-dark-border dark:bg-dark-elevated dark:text-zinc-100">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

export default ApiDemoPage
