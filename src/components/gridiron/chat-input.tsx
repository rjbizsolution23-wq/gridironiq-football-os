'use client'

/**
 * ChatInput — the message composer bar for the Coach AI conversation.
 *
 * Behavior:
 *   - Auto-resizing textarea (rows=1, capped at ~6 lines).
 *   - Send button: bg-primary text-primary-foreground with the Send icon.
 *   - Character counter: `n / MAX`, turns destructive when low.
 *   - Keyboard: Enter to send, Shift+Enter inserts a newline.
 *   - While `isPending` is true: the Send button shows a Loader2 spinner and
 *     the textarea is disabled — this is the "typing indicator while waiting"
 *     affordance on the composer itself.
 */

import * as React from 'react'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MAX_CHARS = 2000
const MAX_HEIGHT_PX = 160

export interface ChatInputProps {
  onSend: (text: string) => void
  isPending?: boolean
  placeholder?: string
  autoFocus?: boolean
}

export function ChatInput({
  onSend,
  isPending = false,
  placeholder = 'Ask Coach AI about your playbook, opponent, or game plan…',
  autoFocus = true,
}: ChatInputProps) {
  const [value, setValue] = React.useState('')
  const taRef = React.useRef<HTMLTextAreaElement | null>(null)

  // Auto-resize the textarea up to MAX_HEIGHT_PX.
  React.useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, MAX_HEIGHT_PX) + 'px'
  }, [value])

  // Focus on mount.
  React.useEffect(() => {
    if (autoFocus) taRef.current?.focus()
  }, [autoFocus])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || isPending) return
    onSend(trimmed)
    setValue('')
    // Reset height after the value is cleared.
    requestAnimationFrame(() => {
      if (taRef.current) taRef.current.style.height = 'auto'
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter inserts a newline. Ignore IME composition.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const remaining = MAX_CHARS - value.length
  const overLimit = value.length >= MAX_CHARS

  return (
    <div className="border-t border-border bg-card/60 p-3 backdrop-blur-sm">
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isPending}
            aria-label="Message Coach AI"
            className={cn(
              'scrollbar-thin w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 pr-20 text-sm leading-relaxed shadow-sm',
              'placeholder:text-muted-foreground',
              'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          />
          <span
            className={cn(
              'pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] uppercase tracking-wider',
              overLimit
                ? 'text-destructive'
                : remaining < 200
                  ? 'text-accent'
                  : 'text-muted-foreground',
            )}
          >
            {value.length} / {MAX_CHARS}
          </span>
        </div>

        <Button
          type="button"
          size="icon"
          onClick={handleSubmit}
          disabled={isPending || value.trim().length === 0}
          aria-label="Send message"
          className="size-10 rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-1">
        <span className="text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for newline
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Coach AI&trade;
        </span>
      </div>
    </div>
  )
}

export default ChatInput
