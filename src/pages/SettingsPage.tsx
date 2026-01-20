import React, { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  Monitor,
  HardDrive,
  Brain,
  Code,
  Check,
  RefreshCw,
  Palette,
  Server,
} from 'lucide-react'
import {
  loadConfig,
  testAIProviderConnection,
  testBackendConnection,
  validateConfig,
  writeConfig,
  type AIProvider,
  type AIProviderConfig,
  type AIProviderSettings,
  type ScreenpipeConfig,
  type ValidationIssue,
} from '@screenpipe/services'
import { SmartAudio } from '../components/SmartAudio'
import { DEFAULT_TRIGGER_APPS, type TriggerApp } from '../hooks/useAppMonitor'
import { useDeveloperMode } from '../hooks/useDeveloperMode'
import { useTheme } from '../hooks/useTheme'

const PROVIDERS: Array<{
  id: AIProvider
  label: string
  description: string
  placeholder: string
  requiresKey?: boolean
}> = [
  {
    id: 'ollama',
    label: 'Ollama (Local)',
    description: 'Runs fully local models with zero cloud dependency.',
    placeholder: 'http://localhost:11434',
  },
  {
    id: 'vllm',
    label: 'vLLM (Network)',
    description: 'OpenAI-compatible endpoint for LAN or remote servers.',
    placeholder: 'http://localhost:8000/v1',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'Cloud models with API key authentication.',
    placeholder: 'https://api.openai.com/v1',
    requiresKey: true,
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    description: 'Claude models with API key authentication.',
    placeholder: 'https://api.anthropic.com/v1',
    requiresKey: true,
  },
]

const FEATURE_OVERRIDES = [
  { id: 'search', label: 'Search' },
  { id: 'memories', label: 'Memories' },
  { id: 'meetings', label: 'Meetings' },
]

const DEFAULT_CONFIG: ScreenpipeConfig = {
  backendUrl: 'http://localhost:3030',
  ai: {
    default: {
      provider: 'ollama',
      model: 'llama3.2',
      baseUrl: 'http://localhost:11434',
    },
    providers: {
      vllm: { baseUrl: 'http://localhost:8000/v1' },
      openai: { baseUrl: 'https://api.openai.com/v1' },
      anthropic: { baseUrl: 'https://api.anthropic.com/v1' },
    },
    features: {},
  },
  recording: {
    smartAudio: {
      enabled: true,
      triggerApps: DEFAULT_TRIGGER_APPS.filter((app) => app.enabled).map((app) => app.name),
      disableDelay: '30s',
    },
  },
  storage: {
    autoCleanup: {
      enabled: true,
      retentionDays: 30,
    },
  },
  appearance: {
    theme: 'system',
  },
}

type Section = 'recording' | 'storage' | 'ai' | 'appearance' | 'developer'
type ThemeOption = 'system' | 'light' | 'dark'
const SMART_AUDIO_STORAGE_KEY = 'screenpipe-smart-audio'

type ConnectionState = 'idle' | 'testing' | 'success' | 'error'

interface ProviderStatus {
  state: ConnectionState
  message?: string
  models: string[]
}

function mergeConfig(base: ScreenpipeConfig, override: ScreenpipeConfig): ScreenpipeConfig {
  return {
    ...base,
    ...override,
    ai: {
      ...base.ai,
      ...override.ai,
      default: {
        ...base.ai?.default,
        ...override.ai?.default,
      },
      providers: {
        ...base.ai?.providers,
        ...override.ai?.providers,
      },
      features: {
        ...base.ai?.features,
        ...override.ai?.features,
      },
    },
    recording: {
      ...base.recording,
      ...override.recording,
      smartAudio: {
        ...base.recording?.smartAudio,
        ...override.recording?.smartAudio,
      },
    },
    storage: {
      ...base.storage,
      ...override.storage,
      autoCleanup: {
        ...base.storage?.autoCleanup,
        ...override.storage?.autoCleanup,
      },
    },
    appearance: {
      ...base.appearance,
      ...override.appearance,
    },
    cli: {
      ...base.cli,
      ...override.cli,
    },
  }
}

function mapTriggerApps(selectedApps: string[]): TriggerApp[] {
  const selectedSet = new Set(selectedApps)
  const defaults = DEFAULT_TRIGGER_APPS.map((app) => ({
    ...app,
    enabled: selectedSet.has(app.name),
  }))
  const customApps = selectedApps
    .filter((name) => !DEFAULT_TRIGGER_APPS.some((app) => app.name === name))
    .map((name) => ({
      id: `custom-${name.toLowerCase().replace(/\\s+/g, '-')}`,
      name,
      bundleId: name.toLowerCase().replace(/\\s+/g, '.'),
      enabled: true,
    }))

  return [...defaults, ...customApps]
}

interface AccordionSectionProps {
  title: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function AccordionSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: AccordionSectionProps) {
  return (
    <div className="border-b border-dark-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4
          text-left hover:bg-dark-elevated transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-dark-elevated flex items-center justify-center">
            {icon}
          </div>
          <span className="font-medium text-zinc-100">{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-2 space-y-4">{children}</div>
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-zinc-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[200px] px-3 py-1.5 rounded-lg border border-dark-border
          bg-dark-elevated text-zinc-100
          text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
  type = 'text',
  helper,
}: {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  type?: 'text' | 'number' | 'password'
  helper?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label className="text-sm text-zinc-400 whitespace-nowrap">{label}</label>
        {helper && <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">{helper}</p>}
      </div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 max-w-[260px] px-3 py-1.5 rounded-lg
          border border-dark-border
          bg-dark-elevated text-zinc-100
          text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-zinc-300">{label}</p>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-dark-border'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

const SettingsPage: React.FC = () => {
  const [openSection, setOpenSection] = useState<Section | null>('recording')
  const [config, setConfig] = useState<ScreenpipeConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [saveState, setSaveState] = useState<ConnectionState>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [backendStatus, setBackendStatus] = useState<ConnectionState>('idle')
  const [providerStatus, setProviderStatus] = useState<Record<AIProvider, ProviderStatus>>(() => {
    return PROVIDERS.reduce((acc, provider) => {
      acc[provider.id] = { state: 'idle', models: [] }
      return acc
    }, {} as Record<AIProvider, ProviderStatus>)
  })
  const [smartAudioApps, setSmartAudioApps] = useState<TriggerApp[]>(DEFAULT_TRIGGER_APPS)

  const { preference, setPreference } = useTheme()
  const { enabled: developerMode, setEnabled: setDeveloperMode } = useDeveloperMode()

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const loaded = await loadConfig()
        if (!active) return
        const merged = mergeConfig(DEFAULT_CONFIG, loaded)
        setConfig(merged)
        setSmartAudioApps(
          mapTriggerApps(merged.recording?.smartAudio?.triggerApps ?? DEFAULT_CONFIG.recording!.smartAudio!.triggerApps)
        )
        if (merged.appearance?.theme) {
          setPreference(merged.appearance.theme)
        }
    } catch {
      if (!active) return
      setConfig(DEFAULT_CONFIG)
      setSmartAudioApps(mapTriggerApps(DEFAULT_CONFIG.recording!.smartAudio!.triggerApps))
    } finally {
        if (active) setIsLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [setPreference])

  const defaultProvider = config.ai?.default?.provider ?? 'ollama'

  const providerConfigs = useMemo(() => {
    const providers = config.ai?.providers ?? {}
    return PROVIDERS.reduce((acc, provider) => {
      const isDefault = provider.id === defaultProvider
      const defaultConfig = config.ai?.default
      const settings: AIProviderSettings = isDefault
        ? {
            model: defaultConfig?.model,
            apiKey: defaultConfig?.apiKey,
            baseUrl: defaultConfig?.baseUrl,
          }
        : providers[provider.id] ?? {}
      acc[provider.id] = settings
      return acc
    }, {} as Record<AIProvider, AIProviderSettings>)
  }, [config.ai?.default, config.ai?.providers, defaultProvider])

  const toggleSection = (section: Section) => {
    setOpenSection(openSection === section ? null : section)
  }

  const updateConfig = (update: (prev: ScreenpipeConfig) => ScreenpipeConfig) => {
    setConfig((prev) => update(prev))
    setSaveState('idle')
    setSaveMessage(null)
    setValidationIssues([])
  }

  const updateDefaultProvider = (provider: AIProvider) => {
    updateConfig((prev) => {
      const prevDefault = prev.ai?.default
      const providers = { ...(prev.ai?.providers ?? {}) }

      if (prevDefault?.provider && prevDefault.provider !== provider) {
        providers[prevDefault.provider] = {
          model: prevDefault.model,
          apiKey: prevDefault.apiKey,
          baseUrl: prevDefault.baseUrl,
        }
      }

      const nextSettings = providers[provider] ?? {}

      return {
        ...prev,
        ai: {
          ...prev.ai,
          default: {
            provider,
            model: nextSettings.model,
            apiKey: nextSettings.apiKey,
            baseUrl: nextSettings.baseUrl,
          },
          providers,
        },
      }
    })
  }

  const updateProvider = (provider: AIProvider, changes: AIProviderSettings) => {
    updateConfig((prev) => {
      const isDefault = prev.ai?.default?.provider === provider
      if (isDefault) {
        return {
          ...prev,
          ai: {
            ...prev.ai,
            default: {
              provider,
              model: changes.model ?? prev.ai?.default?.model,
              apiKey: changes.apiKey ?? prev.ai?.default?.apiKey,
              baseUrl: changes.baseUrl ?? prev.ai?.default?.baseUrl,
            },
          },
        }
      }

      return {
        ...prev,
        ai: {
          ...prev.ai,
          providers: {
            ...prev.ai?.providers,
            [provider]: {
              ...prev.ai?.providers?.[provider],
              ...changes,
            },
          },
        },
      }
    })
  }

  const updateFeatureOverride = (featureId: string, provider?: string, model?: string) => {
    updateConfig((prev) => {
      const nextFeatures = { ...(prev.ai?.features ?? {}) }

      if (!provider) {
        delete nextFeatures[featureId]
      } else {
        nextFeatures[featureId] = {
          provider: provider as AIProvider,
          model: model || undefined,
        }
      }

      return {
        ...prev,
        ai: {
          ...prev.ai,
          features: nextFeatures,
        },
      }
    })
  }

  const smartAudio = config.recording?.smartAudio ?? DEFAULT_CONFIG.recording!.smartAudio!

  const updateSmartAudio = (changes: Partial<ScreenpipeConfig['recording']>) => {
    updateConfig((prev) => ({
      ...prev,
      recording: {
        ...prev.recording,
        ...changes,
        smartAudio: {
          ...prev.recording?.smartAudio,
          ...changes.smartAudio,
        },
      },
    }))
  }

  const handleSmartAudioAppsChange = (apps: TriggerApp[]) => {
    setSmartAudioApps(apps)
    const enabledNames = apps.filter((app) => app.enabled).map((app) => app.name)
    updateSmartAudio({
      smartAudio: {
        ...smartAudio,
        triggerApps: enabledNames,
      },
    })
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const enabledNames = smartAudioApps.filter((app) => app.enabled).map((app) => app.name)
    const payload = {
      enabled: smartAudio.enabled,
      triggerApps: enabledNames,
      disableDelay: smartAudio.disableDelay,
    }
    localStorage.setItem(SMART_AUDIO_STORAGE_KEY, JSON.stringify(payload))
  }, [smartAudio.enabled, smartAudio.disableDelay, smartAudioApps])

  const storageConfig = config.storage?.autoCleanup ?? DEFAULT_CONFIG.storage!.autoCleanup!

  const updateStorage = (changes: Partial<ScreenpipeConfig['storage']>) => {
    updateConfig((prev) => ({
      ...prev,
      storage: {
        ...prev.storage,
        ...changes,
        autoCleanup: {
          ...prev.storage?.autoCleanup,
          ...changes.autoCleanup,
        },
      },
    }))
  }

  const updateAppearance = (theme: ThemeOption) => {
    setPreference(theme)
    updateConfig((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme,
      },
    }))
  }

  const handleTestProvider = async (provider: AIProvider) => {
    const settings = providerConfigs[provider] ?? {}
    const payload: AIProviderConfig = {
      provider,
      model: settings.model,
      apiKey: settings.apiKey,
      baseUrl: settings.baseUrl,
    }

    setProviderStatus((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], state: 'testing', message: undefined },
    }))

    const result = await testAIProviderConnection(payload)

    setProviderStatus((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        state: result.ok ? 'success' : 'error',
        message: result.ok ? undefined : result.error ?? 'Connection failed',
        models: result.models ?? prev[provider].models,
      },
    }))

    if (result.ok && result.models && result.models.length > 0 && !settings.model) {
      updateProvider(provider, { model: result.models[0] })
    }
  }

  const handleTestBackend = async () => {
    const backendUrl = config.backendUrl ?? DEFAULT_CONFIG.backendUrl!
    setBackendStatus('testing')
    const result = await testBackendConnection(backendUrl)
    setBackendStatus(result.ok ? 'success' : 'error')
  }

  const handleSave = async () => {
    setSaveState('testing')
    setSaveMessage(null)

    const issues = validateConfig(config)
    setValidationIssues(issues)

    if (issues.some((issue) => issue.level === 'error')) {
      setSaveState('error')
      setSaveMessage('Fix validation errors before saving.')
      return
    }

    const backendUrl = config.backendUrl ?? DEFAULT_CONFIG.backendUrl!
    const backendResult = await testBackendConnection(backendUrl)
    if (!backendResult.ok) {
      setSaveState('error')
      setSaveMessage('Backend connection failed. Check the server URL.')
      setBackendStatus('error')
      return
    }
    setBackendStatus('success')

    const providersToTest = new Set<AIProvider>()
    providersToTest.add(defaultProvider)

    for (const override of Object.values(config.ai?.features ?? {})) {
      if (override.provider) {
        providersToTest.add(override.provider)
      }
    }

    for (const provider of providersToTest) {
      const settings = providerConfigs[provider]
      const payload: AIProviderConfig = {
        provider,
        model: settings.model,
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
      }
      const result = await testAIProviderConnection(payload)
      setProviderStatus((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          state: result.ok ? 'success' : 'error',
          message: result.ok ? undefined : result.error ?? 'Connection failed',
          models: result.models ?? prev[provider].models,
        },
      }))

      if (!result.ok) {
        setSaveState('error')
        setSaveMessage(`AI provider ${provider} is not reachable.`)
        return
      }
    }

    try {
      await writeConfig(config)
      setSaveState('success')
      setSaveMessage('Settings saved to ~/.screenpipe/config.json')
    } catch (error) {
      setSaveState('error')
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save config')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-zinc-100 mb-6">Settings</h1>

      <div className="rounded-2xl bg-dark-surface border border-dark-border overflow-hidden">
        <AccordionSection
          title="Recording"
          icon={<Monitor className="w-4 h-4 text-zinc-400" />}
          isOpen={openSection === 'recording'}
          onToggle={() => toggleSection('recording')}
        >
          <ToggleField
            label="Smart Audio"
            description="Auto-enable audio for Zoom, Meet, Slack, and more."
            checked={smartAudio.enabled}
            onChange={(value) =>
              updateSmartAudio({
                smartAudio: {
                  ...smartAudio,
                  enabled: value,
                },
              })
            }
          />
          <SelectField
            label="Disable delay"
            value={smartAudio.disableDelay}
            options={[
              { value: '30s', label: '30 seconds' },
              { value: '1m', label: '1 minute' },
              { value: '5m', label: '5 minutes' },
              { value: 'never', label: 'Never' },
            ]}
            onChange={(value) =>
              updateSmartAudio({
                smartAudio: {
                  ...smartAudio,
                  disableDelay: value as '30s' | '1m' | '5m' | 'never',
                },
              })
            }
          />
          <SmartAudio
            apps={smartAudioApps}
            onAppsChange={handleSmartAudioAppsChange}
          />
        </AccordionSection>

        <AccordionSection
          title="Storage"
          icon={<HardDrive className="w-4 h-4 text-zinc-400" />}
          isOpen={openSection === 'storage'}
          onToggle={() => toggleSection('storage')}
        >
          <ToggleField
            label="Auto cleanup"
            description="Automatically delete old data based on retention policy."
            checked={storageConfig.enabled}
            onChange={(value) =>
              updateStorage({
                autoCleanup: {
                  ...storageConfig,
                  enabled: value,
                },
              })
            }
          />
          <SelectField
            label="Retention period"
            value={String(storageConfig.retentionDays)}
            options={[
              { value: '7', label: '7 days' },
              { value: '14', label: '14 days' },
              { value: '30', label: '30 days' },
              { value: '90', label: '90 days' },
              { value: '365', label: '1 year' },
            ]}
            onChange={(value) =>
              updateStorage({
                autoCleanup: {
                  ...storageConfig,
                  retentionDays: Number(value),
                },
              })
            }
          />
        </AccordionSection>

        <AccordionSection
          title="AI"
          icon={<Brain className="w-4 h-4 text-zinc-400" />}
          isOpen={openSection === 'ai'}
          onToggle={() => toggleSection('ai')}
        >
          <SelectField
            label="Default provider"
            value={defaultProvider}
            options={PROVIDERS.map((provider) => ({
              value: provider.id,
              label: provider.label,
            }))}
            onChange={(value) => updateDefaultProvider(value as AIProvider)}
          />

          <div className="space-y-4">
            {PROVIDERS.map((provider) => {
              const settings = providerConfigs[provider.id]
              const status = providerStatus[provider.id]
              const isDefault = provider.id === defaultProvider
              const models = status.models

              return (
                <div
                  key={provider.id}
                  className="rounded-xl border border-dark-border bg-dark-elevated/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-100">
                          {provider.label}
                        </h3>
                        {isDefault && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{provider.description}</p>
                    </div>
                    <button
                      onClick={() => handleTestProvider(provider.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                        bg-dark-surface hover:bg-dark-border text-xs text-zinc-300 transition-colors"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${status.state === 'testing' ? 'animate-spin' : ''}`}
                      />
                      Test
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <TextField
                      label="Endpoint"
                      value={settings.baseUrl ?? ''}
                      placeholder={provider.placeholder}
                      onChange={(value) => updateProvider(provider.id, { baseUrl: value })}
                    />

                    {models.length > 0 ? (
                      <SelectField
                        label="Model"
                        value={settings.model ?? models[0] ?? ''}
                        options={models.map((model) => ({ value: model, label: model }))}
                        onChange={(value) => updateProvider(provider.id, { model: value })}
                      />
                    ) : (
                      <TextField
                        label="Model"
                        value={settings.model ?? ''}
                        placeholder="llama3.2"
                        onChange={(value) => updateProvider(provider.id, { model: value })}
                      />
                    )}

                    {provider.requiresKey && (
                      <TextField
                        label="API Key"
                        value={settings.apiKey ?? ''}
                        placeholder="sk-..."
                        type="password"
                        onChange={(value) => updateProvider(provider.id, { apiKey: value })}
                      />
                    )}

                    {status.state !== 'idle' && (
                      <div className="flex items-center gap-2 text-xs">
                        {status.state === 'success' ? (
                          <span className="text-status-ok flex items-center gap-1">
                            <Check className="w-3 h-3" /> Connected
                          </span>
                        ) : status.state === 'error' ? (
                          <span className="text-status-error">{status.message}</span>
                        ) : (
                          <span className="text-zinc-400">Testing...</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-4 border-t border-dark-border">
            <h4 className="text-sm font-medium text-zinc-200 mb-3">Per-feature overrides</h4>
            <div className="space-y-3">
              {FEATURE_OVERRIDES.map((feature) => {
                const override = config.ai?.features?.[feature.id]
                return (
                  <div
                    key={feature.id}
                    className="flex flex-wrap items-center justify-between gap-4"
                  >
                    <span className="text-sm text-zinc-300">{feature.label}</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={override?.provider ?? ''}
                        onChange={(event) =>
                          updateFeatureOverride(feature.id, event.target.value || undefined, override?.model)
                        }
                        className="rounded-lg border border-dark-border bg-dark-elevated px-3 py-1.5 text-sm text-zinc-100"
                      >
                        <option value="">Use default</option>
                        {PROVIDERS.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={override?.model ?? ''}
                        placeholder="Optional model"
                        onChange={(event) =>
                          updateFeatureOverride(feature.id, override?.provider, event.target.value)
                        }
                        className="w-[180px] rounded-lg border border-dark-border bg-dark-elevated px-3 py-1.5 text-sm text-zinc-100"
                        disabled={!override?.provider}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Appearance"
          icon={<Palette className="w-4 h-4 text-zinc-400" />}
          isOpen={openSection === 'appearance'}
          onToggle={() => toggleSection('appearance')}
        >
          <SelectField
            label="Theme"
            value={config.appearance?.theme ?? preference}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            onChange={(value) => updateAppearance(value as ThemeOption)}
          />
        </AccordionSection>

        <AccordionSection
          title="Developer"
          icon={<Code className="w-4 h-4 text-zinc-400" />}
          isOpen={openSection === 'developer'}
          onToggle={() => toggleSection('developer')}
        >
          <ToggleField
            label="Developer mode"
            description="Show legacy pipes and advanced options."
            checked={developerMode}
            onChange={(value) => setDeveloperMode(value)}
          />
          <TextField
            label="Backend URL"
            value={config.backendUrl ?? ''}
            placeholder="http://localhost:3030"
            onChange={(value) => updateConfig((prev) => ({ ...prev, backendUrl: value }))}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestBackend}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                bg-dark-elevated hover:bg-dark-border
                text-sm font-medium text-zinc-300
                transition-colors"
            >
              <Server className="w-4 h-4" />
              Test backend
            </button>
            {backendStatus === 'success' && (
              <span className="flex items-center gap-1 text-sm text-status-ok">
                <Check className="w-4 h-4" /> Connected
              </span>
            )}
            {backendStatus === 'error' && (
              <span className="text-sm text-status-error">Connection failed</span>
            )}
          </div>
        </AccordionSection>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-zinc-500">
          {validationIssues.length > 0 && (
            <div className="space-y-1">
              {validationIssues.map((issue, index) => (
                <div key={`${issue.path}-${index}`} className={issue.level === 'error' ? 'text-status-error' : 'text-zinc-400'}>
                  {issue.path}: {issue.message}
                </div>
              ))}
            </div>
          )}
          {!validationIssues.length && saveMessage && (
            <span className={saveState === 'error' ? 'text-status-error' : 'text-status-ok'}>
              {saveMessage}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saveState === 'testing'}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg
            bg-accent text-zinc-900 text-sm font-semibold
            hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saveState === 'testing' ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Save changes
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
