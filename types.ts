export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export interface ApiHealthResponse {
  ok: true
  now: string
}
