import type { Env } from '../types'
import { errorResponse, jsonResponse } from '../utils/response'

interface TodoRow {
  id: string
  text: string
  done: number
  created_at: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function handleTodos(request: Request, env: Env, url: URL): Promise<Response> {
  if (!env.DB) {
    return errorResponse('D1 is not configured for this Worker', 501)
  }

  if (url.pathname === '/api/todos' && request.method === 'GET') {
    const result = await env.DB.prepare(
      'SELECT id, text, done, created_at FROM todos ORDER BY created_at DESC LIMIT 50'
    ).all<TodoRow>()

    const todos = result.results.map((row) => ({
      id: row.id,
      text: row.text,
      done: row.done === 1,
      createdAt: row.created_at,
    }))

    return jsonResponse({ todos })
  }

  if (url.pathname === '/api/todos' && request.method === 'POST') {
    const body = (await request.json().catch(() => null)) as unknown
    if (!isRecord(body) || typeof body.text !== 'string' || !body.text.trim()) {
      return errorResponse('Expected JSON body: { text: string }', 400)
    }

    const id = crypto.randomUUID()
    const createdAt = Date.now()
    const text = body.text.trim()

    await env.DB.prepare('INSERT INTO todos (id, text, done, created_at) VALUES (?1, ?2, 0, ?3)')
      .bind(id, text, createdAt)
      .run()

    return jsonResponse({
      todo: {
        id,
        text,
        done: false,
        createdAt,
      },
    })
  }

  return errorResponse('Not found', 404)
}
