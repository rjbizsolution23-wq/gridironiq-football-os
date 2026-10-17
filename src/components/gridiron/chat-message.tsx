'use client'

/**
 * ChatMessage — renders a single message bubble inside the Coach AI conversation.
 *
 * Visual rules (see worklog task 2-d):
 *   - User messages: right-aligned, accent (end-zone orange) bubble, max-w-[75%].
 *   - AI messages: left-aligned, muted bubble, max-w-[85%].
 *   - Error bubbles: AI-style with destructive accent + a Retry button.
 *   - Inline `code` spans render in font-mono primary.
 *   - The whole bubble uses `whitespace-pre-wrap` so newlines + bullets flow
 *     naturally — we do NOT pull in react-markdown.
 *
 * Also exports:
 *   - TypingIndicator — 3 pulsing dots in a Coach AI bubble.
 *   - EmptyState — friendly welcome card with featured quick-prompt chips.
 */

import * as React from 'react'
import { motion } from 'framer-motion'
import { Bot, RotateCcw, Sparkles, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessageShape {
  id: string
  role: ChatRole
  content: string
  ts: number
  error?: boolean
  modelUsed?: string
}

// ----------------------------------------------------------------------------
//  Inline formatting — render `code` spans as font-mono primary chips.
//  Everything else passes through; whitespace-pre-wrap handles newlines.
// ----------------------------------------------------------------------------

const CODE_SPAN_RE = /(`[^`]+`)/g

function renderInline(text: string): React.ReactNode[] {
  return text.split(CODE_SPAN_RE).map((part, i) => {
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={`code-${i}`}
          className="rounded bg-background/70 px-1 py-0.5 font-mono text-[0.85em] text-primary"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <React.Fragment key={`txt-${i}`}>{part}</React.Fragment>
  })
}

// ----------------------------------------------------------------------------
//  Avatars
// ----------------------------------------------------------------------------

function CoachAvatar() {
  return (
    <div className="helmet-gradient flex size-8 shrink-0 items-center justify-center rounded-full shadow-sm">
      <Bot className="size-4 text-primary-foreground" />
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <User className="size-4" />
    </div>
  )
}

// ----------------------------------------------------------------------------
//  ChatMessage bubble
// ----------------------------------------------------------------------------

export interface ChatMessageProps {
  message: ChatMessageShape
  onRetry?: () => void
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isError = message.error === true

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn(
        'flex w-full gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {isUser ? <UserAvatar /> : <CoachAvatar />}

      <div
        className={cn(
          'flex flex-col gap-1.5',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'max-w-[75%] rounded-tr-sm bg-accent text-accent-foreground'
              : isError
                ? 'max-w-[85%] rounded-tl-sm border border-destructive/40 bg-destructive/15 text-foreground'
                : 'max-w-[85%] rounded-tl-sm bg-muted text-foreground',
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {renderInline(message.content)}
          </div>
        </div>

        {isError && onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="h-7 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="size-3.5" />
            Retry
          </Button>
        )}

        <div className="flex items-center gap-2 px-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {isUser ? 'You' : 'Coach AI'} · {formatTs(message.ts)}
          </span>
          {message.modelUsed && !isUser && (
            <span className="rounded bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] text-primary">
              {message.modelUsed.replace(':free', '')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ----------------------------------------------------------------------------
//  Typing indicator — 3 pulsing dots in a Coach AI bubble.
//  Staggered via animationDelay so the dots ripple.
// ----------------------------------------------------------------------------

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex w-full gap-2.5"
    >
      <CoachAvatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3 shadow-sm">
        <span
          className="size-1.5 animate-pulse-soft rounded-full bg-primary"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="size-1.5 animate-pulse-soft rounded-full bg-primary"
          style={{ animationDelay: '240ms' }}
        />
        <span
          className="size-1.5 animate-pulse-soft rounded-full bg-primary"
          style={{ animationDelay: '480ms' }}
        />
      </div>
    </motion.div>
  )
}

// ----------------------------------------------------------------------------
//  Empty state — featured quick-prompt chips, centered welcome.
// ----------------------------------------------------------------------------

const FEATURED_PROMPTS = [
  'What are our best 3 plays against Cover 1?',
  'Build me a 10-play opening script vs an over-front 4-2-5.',
  "What's our weak link on 3rd & long?",
  'How do we attack a Cover 3 match defense?',
]

export interface EmptyStateProps {
  onPick: (text: string) => void
}

export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="helmet-gradient flex size-14 items-center justify-center rounded-full shadow-md"
      >
        <Sparkles className="size-6 text-primary-foreground" />
      </motion.div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight">
          Ask Coach AI&trade; anything
        </h3>
        <p className="text-sm text-muted-foreground">
          Ask me about your playbook, opponent tendencies, or game plan — I have
          your live install + scouting data as ground truth.
        </p>
      </div>

      <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {FEATURED_PROMPTS.map((p, i) => (
          <motion.button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 * i, ease: 'easeOut' }}
            className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
          >
            {p}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Helpers
// ----------------------------------------------------------------------------

function formatTs(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default ChatMessage
