import type { Env } from './types'
import { corsHeaders, errorResponse } from './utils/response'
import { handleEcho } from './routes/echo'
import { handleHealth } from './routes/health'
import { handleTodos } from './routes/todos'

async function handleApiRequest(request: Request, env: Env, url: URL): Promise<Response> {
  const { pathname } = url

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (pathname === '/api/health' && request.method === 'GET') {
    return handleHealth()
  }

  if (pathname === '/api/echo' && request.method === 'POST') {
    return handleEcho(request)
  }

  if (pathname.startsWith('/api/todos')) {
    return handleTodos(request, env, url)
  }

  return errorResponse('Not found', 404)
}

const ONE_DAY = 60 * 60 * 24

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, url)
    }

    const res = await env.ASSETS.fetch(request)

    if (res.status === 200 && res.headers.get('content-type')?.startsWith('text/')) {
      const headers = new Headers(res.headers)
      headers.set('Cache-Control', `public, max-age=${ONE_DAY}`)
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      })
    }

    return res
  },
}
