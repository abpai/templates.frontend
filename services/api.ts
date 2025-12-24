export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...options.headers,
    },
  })

  const data = await parseJsonSafe(response)

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `Request failed (${response.status})`

    throw new ApiError(message, response.status)
  }

  return data as T
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' })
}
