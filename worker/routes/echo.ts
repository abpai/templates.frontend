import { errorResponse, jsonResponse } from '../utils/response'

export async function handleEcho(request: Request): Promise<Response> {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return errorResponse('Expected application/json', 415)
  }

  const body = (await request.json().catch(() => null)) as unknown
  if (body === null) {
    return errorResponse('Invalid JSON', 400)
  }

  return jsonResponse({ ok: true, echo: body })
}
