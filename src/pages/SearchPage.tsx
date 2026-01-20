import React, { useEffect, useMemo, useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { Badge, Button } from '@screenpipe/ui'
import { PipeEmbed } from '../components/PipeEmbed'
import { useSearch } from '../hooks/useSearch'
import { useDeveloperMode } from '../hooks/useDeveloperMode'
import type { ContentItem, ContentType } from '@screenpipe/services'

const CONTENT_TYPES: Array<{ label: string; value: ContentType }> = [
  { label: 'All', value: 'all' },
  { label: 'OCR', value: 'ocr' },
  { label: 'Audio', value: 'audio' },
  { label: 'UI', value: 'ui' },
]

function getItemText(item: ContentItem): string {
  if (item.type === 'OCR') return item.content.text
  if (item.type === 'Audio') return item.content.transcription
  return item.content.text
}

function getItemMeta(item: ContentItem): string {
  if (item.type === 'Audio') {
    const speaker = item.content.speaker?.name ? ` • ${item.content.speaker?.name}` : ''
    return `${item.content.deviceName}${speaker}`
  }
  return item.content.appName
}

function getItemTimestamp(item: ContentItem): string {
  const timestamp = item.content.timestamp
  return timestamp ? new Date(timestamp).toLocaleString() : 'Unknown time'
}

const SearchPage: React.FC = () => {
  const { results, summary, loading, error, run } = useSearch()
  const [query, setQuery] = useState('')
  const [contentType, setContentType] = useState<ContentType>('all')
  const [limit, setLimit] = useState(50)
  const [useAI, setUseAI] = useState(true)
  const [dedup, setDedup] = useState(true)
  const [useLegacy, setUseLegacy] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const { enabled: developerMode } = useDeveloperMode()

  const canSearch = query.trim().length > 0

  const handleSearch = () => {
    if (!canSearch) return
    run({
      text: query.trim(),
      contentType,
      limit,
      useAI,
      dedup,
    })
  }

  const legacySrc = useMemo(() => 'http://localhost:3001', [])

  useEffect(() => {
    if (!developerMode && useLegacy) {
      setUseLegacy(false)
    }
  }, [developerMode, useLegacy])

  const toggleExpanded = (index: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const getPreviewText = (text: string, isExpanded: boolean) => {
    if (isExpanded || text.length <= 240) return text
    return `${text.slice(0, 240)}…`
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-dark-border bg-dark-surface px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Search</h1>
            <p className="text-sm text-zinc-500">Find moments across your recordings.</p>
          </div>
          {developerMode && (
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-dark-border bg-dark-elevated"
                checked={useLegacy}
                onChange={(event) => setUseLegacy(event.target.checked)}
              />
              Use legacy pipe
            </label>
          )}
        </div>
      </div>

      {useLegacy && developerMode ? (
        <div className="flex-1 overflow-hidden">
          <PipeEmbed
            src={legacySrc}
            title="Search Pipe"
            onError={(err) => console.error('Legacy search pipe error:', err)}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-2xl border border-dark-border bg-dark-surface p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-xl bg-dark-elevated px-3 py-2">
                <Search size={16} className="text-zinc-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSearch()
                  }}
                  placeholder="Search your timeline..."
                  className="w-full bg-transparent text-sm text-zinc-100 outline-none"
                />
              </div>
              <select
                value={contentType}
                onChange={(event) => setContentType(event.target.value as ContentType)}
                className="rounded-xl border border-dark-border bg-dark-elevated px-3 py-2 text-sm text-zinc-200"
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={200}
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value) || 1)}
                className="w-20 rounded-xl border border-dark-border bg-dark-elevated px-3 py-2 text-sm text-zinc-200"
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleSearch}
                disabled={!canSearch || loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-dark-border bg-dark-elevated"
                  checked={useAI}
                  onChange={(event) => setUseAI(event.target.checked)}
                />
                AI summary
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-dark-border bg-dark-elevated"
                  checked={dedup}
                  onChange={(event) => setDedup(event.target.checked)}
                />
                Deduplicate results
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-status-error/40 bg-status-error/10 p-3 text-sm text-status-error">
              {error}
            </div>
          )}

          {summary && (
            <div className="mt-6 rounded-2xl border border-dark-border bg-dark-surface p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Sparkles size={16} className="text-accent" />
                AI Summary
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{summary}</p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {results.length === 0 && !loading ? (
              <div className="rounded-2xl border border-dark-border bg-dark-surface p-6 text-center text-sm text-zinc-500">
                No results yet. Try a query to search your history.
              </div>
            ) : (
              results.map((item, index) => {
                const text = getItemText(item)
                const isExpanded = expandedItems.has(index)
                const showToggle = text.length > 240
                return (
                <div
                  key={`${item.type}-${index}`}
                  role={showToggle ? 'button' : undefined}
                  tabIndex={showToggle ? 0 : undefined}
                  onClick={showToggle ? () => toggleExpanded(index) : undefined}
                  onKeyDown={(event) => {
                    if (!showToggle) return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      toggleExpanded(index)
                    }
                  }}
                  className={`rounded-2xl border border-dark-border bg-dark-surface p-4 transition-colors ${
                    showToggle ? 'cursor-pointer hover:border-accent/40' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="muted">{item.type}</Badge>
                    <span className="text-xs text-zinc-500">{getItemTimestamp(item)}</span>
                    <span className="text-xs text-zinc-500">{getItemMeta(item)}</span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-200 whitespace-pre-wrap">
                    {getPreviewText(text, isExpanded)}
                  </p>
                  {showToggle && (
                    <div className="mt-2 text-xs text-accent">
                      {isExpanded ? 'Show less' : 'Click to expand'}
                    </div>
                  )}
                </div>
              })}
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPage
