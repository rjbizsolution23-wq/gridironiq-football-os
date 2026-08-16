'use client'

/**
 * QuickPrompts — the Coach AI right rail.
 *
 * Three stacked cards:
 *   1. Active Context  — team name, plays available (count), opponents (top 3).
 *                        Fetched from /api/gridiron (deduped by React Query).
 *   2. Quick Prompts   — 8 single-click suggestion chips.
 *   3. Recent Topics   — last 4 user messages, clickable to re-send.
 */

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, Clock, Layers, ListChecks, Users } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// ----------------------------------------------------------------------------
//  Constants — 8 quick-prompt suggestions (spec, task 2-d).
// ----------------------------------------------------------------------------

const QUICK_PROMPTS: readonly string[] = [
  'What are our best 3 plays against Cover 1?',
  'Build me a 10-play opening script vs an over-front 4-2-5.',
  "What's our weak link on 3rd & long?",
  'Show me our most explosive concepts.',
  'How do we attack a Cover 3 match defense?',
  'Give me 3 answers for boundary pressure.',
  'What tendency should I self-scout this week?',
  'Red-zone: 2 calls from the 5-yard line.',
] as const

// ----------------------------------------------------------------------------
//  Types — only the fields we read from /api/gridiron.
// ----------------------------------------------------------------------------

interface GridironContext {
  team: { name: string; philosophy?: string | null } | null
  plays: unknown[]
  opponents: Array<{ id: string; name: string; mascot?: string | null }>
}

// ----------------------------------------------------------------------------
//  Component
// ----------------------------------------------------------------------------

export interface QuickPromptsProps {
  onPick: (text: string) => void
  recentTopics: string[]
}

export function QuickPrompts({ onPick, recentTopics }: QuickPromptsProps) {
  const { data, isLoading, isError } = useQuery<GridironContext>({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed to load gridiron data')
      return (await r.json()) as GridironContext
    },
    staleTime: 60_000,
  })

  const teamName = data?.team?.name ?? null
  const playsCount = data?.plays?.length ?? 0
  const opponents = (data?.opponents ?? []).slice(0, 3)

  return (
    <aside className="col-span-12 flex flex-col gap-3 lg:col-span-4 xl:col-span-3">
      {/* =========================================================== Active Context */}
      <Card className="gap-3 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="size-4 text-primary" />
            Active Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 px-4 text-sm">
          <ContextRow
            icon={<Users className="size-3.5" />}
            label="Team"
            value={
              isLoading
                ? 'Loading…'
                : isError || !teamName
                  ? 'Unavailable'
                  : teamName
            }
          />
          <ContextRow
            icon={<Layers className="size-3.5" />}
            label="Plays"
            value={isLoading ? '—' : `${playsCount} installed`}
          />
          <ContextRow
            icon={<Users className="size-3.5" />}
            label="Opponents"
            value={
              isLoading
                ? '—'
                : opponents.length === 0
                  ? isError
                    ? 'Unavailable'
                    : 'None'
                  : opponents.map((o) => o.name).join(' · ')
            }
          />
        </CardContent>
      </Card>

      {/* =========================================================== Quick Prompts */}
      <Card className="gap-3 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ListChecks className="size-4 text-primary" />
            Quick Prompts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 px-4">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPick(p)}
              className="block w-full rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
            >
              {p}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* =========================================================== Recent Topics */}
      <Card className="gap-3 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-primary" />
            Recent Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 px-4">
          {recentTopics.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Your recent questions will appear here — click any to re-ask.
            </p>
          ) : (
            recentTopics.map((t, i) => (
              <button
                key={`${i}-${t.slice(0, 16)}`}
                type="button"
                onClick={() => onPick(t)}
                className="block w-full rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
              >
                <span className="line-clamp-2">{t}</span>
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </aside>
  )
}

// ----------------------------------------------------------------------------
//  Small presentational helpers
// ----------------------------------------------------------------------------

function ContextRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span
        className="max-w-[60%] truncate text-right font-medium text-foreground"
        title={value}
      >
        {value}
      </span>
    </div>
  )
}

export default QuickPrompts
