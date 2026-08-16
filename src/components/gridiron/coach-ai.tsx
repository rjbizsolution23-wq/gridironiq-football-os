'use client'

/**
 * Coach AI™ — chat interface to the LLM-powered football intelligence
 * assistant (backend at /api/coach-ai).
 *
 * Layout (responsive):
 *   ┌────────────────────────────────────────────────────────────────────┐
 *   │  Header (avatar · title · status · Clear)                          │
 *   ├──────────────────────────────────────────┬──────────────────────────┤
 *   │  Chat container (overflow-y-auto)       │  Context sidebar         │
 *   │  ├─ messages / typing indicator         │  ├─ Active Context       │
 *   │  └─ bottom sentinel (scroll-to)         │  ├─ Quick Prompts (8)    │
 *   │  ┌──────────────────────────┐ [→]       │  └─ Recent Topics        │
 *   │  │ ChatInput                 │           │                          │
 *   │  └──────────────────────────┘           │                          │
 *   └──────────────────────────────────────────┴──────────────────────────┘
 *
 * State & behavior:
 *   - messages: ChatMessageShape[] — owned locally, persisted to localStorage.
 *   - Sends only the last ~6 turns as `history` to the API (avoid token bloat).
 *   - Typing indicator (3 pulsing dots) appears while awaiting response.
 *   - Error bubbles render with a Retry button that re-sends the last user msg.
 *   - Auto-scrolls to the bottom on new message / pending change.
 *   - Self-contained: ships its own React Query provider so the sidebar's
 *     /api/gridiron fetch is deduped without requiring a global provider.
 */

import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Bot, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import {
  ChatMessage as ChatMessageBubble,
  EmptyState,
  TypingIndicator,
  type ChatMessageShape,
} from './chat-message'
import { ChatInput } from './chat-input'
import { QuickPrompts } from './quick-prompts'

// ----------------------------------------------------------------------------
//  Constants
// ----------------------------------------------------------------------------

const STORAGE_KEY = 'gridironiq:coach-ai:history'
/** Max user+assistant pairs to send as `history` to the API. */
const MAX_HISTORY_TURNS = 6

// ----------------------------------------------------------------------------
//  Main module — sets up its own React Query client (self-contained).
// ----------------------------------------------------------------------------

export default function CoachAI() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <CoachAIInner />
    </QueryClientProvider>
  )
}

// ----------------------------------------------------------------------------
//  Types — the /api/coach-ai response shape (subset we read).
// ----------------------------------------------------------------------------

interface ApiResponseBody {
  response?: string
  error?: string
  context?: {
    team?: string | null
    playsAvailable?: number
    opponents?: string[]
  }
  createdAt?: string
}

// ----------------------------------------------------------------------------
//  Inner component — wrapped by the QueryClientProvider above.
// ----------------------------------------------------------------------------

function CoachAIInner() {
  const [messages, setMessages] = useState<ChatMessageShape[]>([])
  const [isPending, setIsPending] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const lastUserTextRef = useRef<string>('') // powers Retry

  // --------------------------------------------------------------------------
  //  Load history from localStorage on mount (client-only — avoids hydration
  //  mismatch because the server always renders messages=[]).
  // --------------------------------------------------------------------------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(isChatMessageShape)
          if (valid.length > 0) setMessages(valid)
        }
      }
    } catch {
      // Corrupt JSON — start fresh.
    } finally {
      setHydrated(true)
    }
  }, [])

  // --------------------------------------------------------------------------
  //  Persist messages to localStorage after hydration.
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // Storage full / unavailable — silently ignore.
    }
  }, [messages, hydrated])

  // --------------------------------------------------------------------------
  //  Auto-scroll to the latest message / typing indicator.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isPending])

  // --------------------------------------------------------------------------
  //  Send a message — appends the user bubble, calls /api/coach-ai, then
  //  appends the assistant reply (or an error bubble on failure).
  // --------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isPending) return

      const userMsg: ChatMessageShape = {
        id: genId(),
        role: 'user',
        content: trimmed,
        ts: Date.now(),
      }
      lastUserTextRef.current = trimmed

      // Build the `history` payload from prior messages (exclude the new
      // user message — the API adds it separately as `message`).
      // Send the last ~MAX_HISTORY_TURNS pairs (≈12 messages) to give the LLM
      // conversational context without bloating tokens. The API further slices.
      const history = messages
        .slice(-(MAX_HISTORY_TURNS * 2))
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.content }))

      setMessages((prev) => [...prev, userMsg])
      setIsPending(true)

      try {
        const r = await fetch('/api/coach-ai', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history }),
        })

        const data = (await r.json().catch(() => ({}))) as ApiResponseBody
        const replyText =
          data.response ??
          'Coach AI is offline. Try again in a moment — the football intelligence service may be warming up.'
        const isError = !r.ok || Boolean(data.error)

        setMessages((prev) => [
          ...prev,
          {
            id: genId(),
            role: 'assistant',
            content: replyText,
            ts: Date.now(),
            error: isError,
          },
        ])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: genId(),
            role: 'assistant',
            content:
              'Network error — Coach AI is unreachable. Check your connection and retry.',
            ts: Date.now(),
            error: true,
          },
        ])
      } finally {
        setIsPending(false)
      }
    },
    [isPending, messages],
  )

  // --------------------------------------------------------------------------
  //  Retry — re-send the last user message. The error bubble stays in
  //  history until a successful reply replaces the conversation tail.
  // --------------------------------------------------------------------------
  const retryLast = useCallback(() => {
    if (!lastUserTextRef.current || isPending) return
    void sendMessage(lastUserTextRef.current)
  }, [isPending, sendMessage])

  // --------------------------------------------------------------------------
  //  Clear — wipe history + localStorage.
  // --------------------------------------------------------------------------
  const clearHistory = useCallback(() => {
    setMessages([])
    lastUserTextRef.current = ''
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  // --------------------------------------------------------------------------
  //  Recent topics — last 4 user messages, in chronological order.
  // --------------------------------------------------------------------------
  const recentTopics = useMemo(
    () =>
      messages
        .filter((m) => m.role === 'user')
        .slice(-4)
        .map((m) => m.content),
    [messages],
  )

  const hasMessages = messages.length > 0

  return (
    <div className="grid h-full grid-cols-12 gap-3 p-3 lg:p-4">
      {/* ============================================================
          Chat column
         ============================================================ */}
      <section className="col-span-12 flex flex-col gap-3 lg:col-span-8 xl:col-span-9">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="helmet-gradient flex size-10 items-center justify-center rounded-full shadow-md">
              <Bot className="size-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold tracking-tight">
                  Coach AI
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  &trade;
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Coordinator-level football intelligence
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 animate-pulse-soft rounded-full bg-primary" />
              Online
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              disabled={!hasMessages || isPending}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          </div>
        </header>

        {/* Chat container — natural page scroll, no nested ScrollArea */}
        <Card className="flex flex-1 flex-col gap-0 overflow-hidden py-0">
          <div
            ref={scrollRef}
            className={cn(
              'scrollbar-thin flex-1 overflow-y-auto px-4 py-4',
            )}
            style={{ maxHeight: 'calc(100vh - 12rem)' }}
          >
            {!hasMessages ? (
              <EmptyState onPick={(t) => void sendMessage(t)} />
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((m) => (
                  <ChatMessageBubble
                    key={m.id}
                    message={m}
                    onRetry={m.error ? retryLast : undefined}
                  />
                ))}
                {isPending && <TypingIndicator />}
              </div>
            )}
          </div>

          <ChatInput
            onSend={(t) => void sendMessage(t)}
            isPending={isPending}
          />
        </Card>
      </section>

      {/* ============================================================
          Right rail — context sidebar (collapses below on mobile)
         ============================================================ */}
      <QuickPrompts
        onPick={(t) => void sendMessage(t)}
        recentTopics={recentTopics}
      />
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Helpers
// ----------------------------------------------------------------------------

function genId(): string {
  // Sufficient for client-side message keys; not a security primitive.
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function isChatMessageShape(value: unknown): value is ChatMessageShape {
  if (typeof value !== 'object' || value === null) return false
  const m = value as Record<string, unknown>
  return (
    typeof m.id === 'string' &&
    (m.role === 'user' || m.role === 'assistant') &&
    typeof m.content === 'string' &&
    typeof m.ts === 'number'
  )
}
