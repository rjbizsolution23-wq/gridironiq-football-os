/**
 * AI Provider Client for GridironIQ™
 * Routes all AI completions through Rick Jefferson's Sovereign Cloudflare Free Models Router.
 * Automatically utilizes verified 100% free models with dynamic fallback.
 */

export const SOVEREIGN_ROUTER_URL =
  process.env.OPENROUTER_ROUTER_URL ||
  'https://openrouter-free-router.rickjefferson.workers.dev'

export const OPENROUTER_DIRECT_KEY =
  process.env.OPENROUTER_API_KEY || ''

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

export interface ChatCompletionOptions {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  max_tokens?: number
  response_format?: { type: 'json_object' }
}

export interface FreeModelInfo {
  id: string
  name: string
  contextLength: number
  description?: string
}

/**
 * Fetch the live list of currently active 100% free models from the Cloudflare router
 */
export async function getActiveFreeModels(): Promise<FreeModelInfo[]> {
  try {
    const res = await fetch(`${SOVEREIGN_ROUTER_URL}/models`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }, // cache 1 hour in Next.js
    })
    if (!res.ok) throw new Error(`Status ${res.status}`)
    const json = await res.json()
    return json.data || []
  } catch (err) {
    console.warn('[ai-client] Failed to fetch active models from Cloudflare router, returning fallback defaults:', err)
    return [
      { id: 'openrouter/free', name: 'OpenRouter Free Dynamic Router', contextLength: 200000 },
      { id: 'google/gemma-4-31b-it:free', name: 'Google: Gemma 4 31B (free)', contextLength: 262144 },
      { id: 'poolside/laguna-s-2.1:free', name: 'Poolside: Laguna S 2.1 (free)', contextLength: 262144 },
      { id: 'nvidia/nemotron-3.5-super-vl:free', name: 'NVIDIA: Nemotron 3.5 Super VL (free)', contextLength: 1000000 },
    ]
  }
}

/**
 * Executes a chat completion via the Cloudflare Free Models Router,
 * falling back to direct OpenRouter API if needed.
 */
export async function createChatCompletion(options: ChatCompletionOptions): Promise<string> {
  const targetModel = options.model || 'openrouter/free'

  // Attempt 1: Call Cloudflare Sovereign Free Router
  try {
    const res = await fetch(`${SOVEREIGN_ROUTER_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: options.messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens,
        response_format: options.response_format,
      }),
      signal: AbortSignal.timeout(45000),
    })

    if (res.ok) {
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content
      if (text) return text
    }
    console.warn(`[ai-client] Cloudflare router returned ${res.status}, falling back to direct OpenRouter API`)
  } catch (err) {
    console.warn('[ai-client] Cloudflare router unreachable or timed out, trying direct OpenRouter API:', err)
  }

  // Attempt 2: Direct OpenRouter fallback
  try {
    const directRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_DIRECT_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://football.empirecontentstudios.com',
        'X-Title': 'GridironIQ Football Intelligence OS',
      },
      body: JSON.stringify({
        model: targetModel,
        models: [targetModel, 'openrouter/free', 'google/gemma-4-31b-it:free'].slice(0, 3),
        messages: options.messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens,
      }),
      signal: AbortSignal.timeout(45000),
    })

    if (!directRes.ok) {
      const errText = await directRes.text()
      throw new Error(`OpenRouter returned ${directRes.status}: ${errText}`)
    }

    const directData = await directRes.json()
    const content = directData.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('Empty response content received from OpenRouter')
    }
    return content
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ai-client] All AI providers failed:', message)
    throw new Error(`AI inference error: ${message}`)
  }
}
