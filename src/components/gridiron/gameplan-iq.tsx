'use client'

/**
 * GamePlanIQ™ — AI-assisted weekly game-planning module.
 *
 * Two tabs:
 *   1. Opening Script Builder — generates a 15-play opener for a selected
 *      opponent via POST /api/gameplan (mode: 'opening_script').
 *   2. Situation Rec — pick a down/distance/hash/yard-line/quarter/score
 *      situation, get the AI's top 3 play recommendations via the same
 *      endpoint (mode: 'situation_recommendation').
 *
 * Self-contained: ships its own React Query client so it can fetch the
 * shared opponent list without requiring a global provider. Reads the
 * shared `selectedOpponentId` from Zustand (defaults to the first
 * opponent + persists the default back, matching the ScoutIQ pattern).
 *
 * Persistence:
 *   - localStorage key per mode per opponent:
 *     `gridironiq:gameplan:opening_script:<opponentId>`
 *     `gridironiq:gameplan:situation_recommendation:<opponentId>`
 *   - On mount + on opponent change, the stored result (if any) is
 *     hydrated into state so refresh keeps the last script / recs.
 *
 * Natural page scroll — no nested ScrollArea inside the module.
 */

import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ClipboardList,
  Crosshair,
  ListOrdered,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from 'lucide-react'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  OpeningScriptView,
  type OpeningScript,
} from './opening-script-view'
import {
  SituationBuilder,
  type GenerateSituationParams,
  type OpponentOption,
} from './situation-builder'
import {
  RecommendationCard,
  type Recommendation,
} from './recommendation-card'

// ----------------------------------------------------------------------------
//  Constants
// ----------------------------------------------------------------------------

type GamePlanMode = 'opening_script' | 'situation_recommendation'

const STORAGE_PREFIX = 'gridironiq:gameplan'

function storageKey(mode: GamePlanMode, opponentId: string | null): string {
  return `${STORAGE_PREFIX}:${mode}:${opponentId ?? 'default'}`
}

// ----------------------------------------------------------------------------
//  Types — the /api/gameplan response (subset we consume).
// ----------------------------------------------------------------------------

interface GamePlanResponse {
  result: unknown
  opponent: string | null
  generatedAt: string
  error?: string
}

interface GridironListResponse {
  opponents: OpponentOption[]
}

// ----------------------------------------------------------------------------
//  Main module — owns its own React Query client.
// ----------------------------------------------------------------------------

export default function GamePlanIQ() {
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
      <GamePlanIQBody />
    </QueryClientProvider>
  )
}

// ----------------------------------------------------------------------------
//  Body — wrapped by the QueryClientProvider above.
// ----------------------------------------------------------------------------

function GamePlanIQBody() {
  const [tab, setTab] = useState<GamePlanMode>('opening_script')

  return (
    <div className="flex flex-col gap-4 p-3 lg:p-4">
      {/* ============================================================
          Header — title + tab switcher
         ============================================================ */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            GridironIQ™
          </div>
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <ClipboardList className="size-4 text-primary" />
            GamePlanIQ
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              &trade;
            </span>
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            AI opening script + situation play recommendations
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as GamePlanMode)}
        >
          <TabsList>
            <TabsTrigger value="opening_script" className="gap-1.5">
              <ListOrdered className="size-3.5" />
              Opening Script
            </TabsTrigger>
            <TabsTrigger value="situation_recommendation" className="gap-1.5">
              <Crosshair className="size-3.5" />
              Situation Rec
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* ============================================================
          Tab body — framer-motion fade between tabs.
         ============================================================ */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {tab === 'opening_script' ? (
            <OpeningScriptTab />
          ) : (
            <SituationRecTab />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
//  Opening Script tab
// ============================================================================

function OpeningScriptTab() {
  const { data } = useGridironList()
  const opponents = data?.opponents ?? []

  const selectedOpponentId = useAppStore((s) => s.selectedOpponentId)
  const setSelectedOpponentId = useAppStore((s) => s.setSelectedOpponentId)

  // Derive the effective opponent id — fall back to the first opponent.
  const currentOpponentId =
    selectedOpponentId ?? opponents[0]?.id ?? null

  // Persist the derived default back to the store so other modules see it.
  useEffect(() => {
    if (currentOpponentId && currentOpponentId !== selectedOpponentId) {
      setSelectedOpponentId(currentOpponentId)
    }
  }, [currentOpponentId, selectedOpponentId, setSelectedOpponentId])

  const currentOpponent = useMemo(
    () => opponents.find((o) => o.id === currentOpponentId) ?? null,
    [opponents, currentOpponentId],
  )

  // State --------------------------------------------------------------
  const [script, setScript] = useState<OpeningScript | null>(null)
  const [scriptOpponentName, setScriptOpponentName] = useState<string | null>(
    null,
  )
  const [scriptGeneratedAt, setScriptGeneratedAt] = useState<string | null>(
    null,
  )
  const [scriptPending, setScriptPending] = useState(false)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on opponent change.
  useEffect(() => {
    if (!currentOpponentId) {
      setScript(null)
      setScriptOpponentName(null)
      setScriptGeneratedAt(null)
      setScriptError(null)
      setHydrated(true)
      return
    }
    try {
      const raw = localStorage.getItem(
        storageKey('opening_script', currentOpponentId),
      )
      if (raw) {
        const parsed = JSON.parse(raw) as {
          result?: OpeningScript
          opponent?: string | null
          generatedAt?: string | null
        }
        setScript(validateOpeningScript(parsed.result) ?? null)
        setScriptOpponentName(parsed.opponent ?? null)
        setScriptGeneratedAt(parsed.generatedAt ?? null)
      } else {
        setScript(null)
        setScriptOpponentName(null)
        setScriptGeneratedAt(null)
      }
    } catch {
      setScript(null)
      setScriptOpponentName(null)
      setScriptGeneratedAt(null)
    } finally {
      setScriptError(null)
      setHydrated(true)
    }
  }, [currentOpponentId])

  // generate ----------------------------------------------------------
  const generate = useCallback(async () => {
    if (!currentOpponentId || scriptPending) return
    setScriptPending(true)
    setScriptError(null)
    try {
      const r = await fetch('/api/gameplan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode: 'opening_script',
          opponentId: currentOpponentId,
        }),
      })
      const json = (await r.json().catch(() => ({}))) as GamePlanResponse
      if (!r.ok || json.error) {
        throw new Error(json.error || `HTTP ${r.status}`)
      }
      const validated = validateOpeningScript(json.result)
      if (!validated) {
        throw new Error('GamePlanIQ returned malformed JSON.')
      }
      setScript(validated)
      setScriptOpponentName(json.opponent ?? currentOpponent?.name ?? null)
      setScriptGeneratedAt(json.generatedAt ?? new Date().toISOString())
      try {
        localStorage.setItem(
          storageKey('opening_script', currentOpponentId),
          JSON.stringify({
            result: validated,
            opponent: json.opponent,
            generatedAt: json.generatedAt,
          }),
        )
      } catch {
        // localStorage unavailable — ignore.
      }
    } catch (e) {
      setScriptError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setScriptPending(false)
    }
  }, [currentOpponentId, currentOpponent, scriptPending])

  return (
    <div className="flex flex-col gap-4">
      {/* Control bar: opponent selector + Generate button */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Opponent
          </span>
          <Select
            value={currentOpponentId ?? undefined}
            onValueChange={(v) => setSelectedOpponentId(v)}
          >
            <SelectTrigger className="w-[240px]" aria-label="Select opponent">
              <SelectValue placeholder="Select opponent…" />
            </SelectTrigger>
            <SelectContent>
              {opponents.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                  {o.mascot ? ` ${o.mascot}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => void generate()}
          disabled={scriptPending || !currentOpponentId}
        >
          {scriptPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {scriptPending ? 'Generating…' : 'Generate Opening Script'}
        </Button>
      </div>

      {/* Body */}
      {scriptError ? (
        <ErrorState
          message={scriptError}
          onRetry={() => void generate()}
          retryLabel="Retry generation"
          pending={scriptPending}
        />
      ) : (
        <OpeningScriptView
          script={script}
          opponentName={scriptOpponentName ?? currentOpponent?.name ?? null}
          generatedAt={scriptGeneratedAt}
          isLoading={scriptPending && !script}
        />
      )}
    </div>
  )
}

// ============================================================================
//  Situation Rec tab
// ============================================================================

function SituationRecTab() {
  const { data } = useGridironList()
  const opponents = data?.opponents ?? []

  const selectedOpponentId = useAppStore((s) => s.selectedOpponentId)
  const setSelectedOpponentId = useAppStore((s) => s.setSelectedOpponentId)

  const currentOpponentId =
    selectedOpponentId ?? opponents[0]?.id ?? null

  useEffect(() => {
    if (currentOpponentId && currentOpponentId !== selectedOpponentId) {
      setSelectedOpponentId(currentOpponentId)
    }
  }, [currentOpponentId, selectedOpponentId, setSelectedOpponentId])

  // State --------------------------------------------------------------
  const [recs, setRecs] = useState<Recommendation[] | null>(null)
  const [recsOpponentName, setRecsOpponentName] = useState<string | null>(null)
  const [recsGeneratedAt, setRecsGeneratedAt] = useState<string | null>(null)
  const [recsPending, setRecsPending] = useState(false)
  const [recsError, setRecsError] = useState<string | null>(null)

  // Refs ---------------------------------------------------------------
  // Last params used to fire the situation API — powers Retry.
  const lastSituationParamsRef = useRef<GenerateSituationParams | null>(null)

  // Hydrate from localStorage on opponent change.
  useEffect(() => {
    if (!currentOpponentId) {
      setRecs(null)
      setRecsOpponentName(null)
      setRecsGeneratedAt(null)
      setRecsError(null)
      return
    }
    try {
      const raw = localStorage.getItem(
        storageKey('situation_recommendation', currentOpponentId),
      )
      if (raw) {
        const parsed = JSON.parse(raw) as {
          result?: { recommendations?: Recommendation[] }
          opponent?: string | null
          generatedAt?: string | null
        }
        const list = validateRecommendations(parsed.result)
        setRecs(list)
        setRecsOpponentName(parsed.opponent ?? null)
        setRecsGeneratedAt(parsed.generatedAt ?? null)
      } else {
        setRecs(null)
        setRecsOpponentName(null)
        setRecsGeneratedAt(null)
      }
    } catch {
      setRecs(null)
      setRecsOpponentName(null)
      setRecsGeneratedAt(null)
    } finally {
      setRecsError(null)
    }
  }, [currentOpponentId])

  // generate ----------------------------------------------------------
  const generate = useCallback(
    async (params: GenerateSituationParams) => {
      if (recsPending) return
      lastSituationParamsRef.current = params
      setRecsPending(true)
      setRecsError(null)
      try {
        const r = await fetch('/api/gameplan', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            mode: 'situation_recommendation',
            opponentId: params.opponentId,
            situation: params.situation,
            personnelNotes: params.personnelNotes,
            coachingGoal: params.coachingGoal,
          }),
        })
        const json = (await r.json().catch(() => ({}))) as GamePlanResponse
        if (!r.ok || json.error) {
          throw new Error(json.error || `HTTP ${r.status}`)
        }
        const list = validateRecommendations(json.result)
        if (list === null) {
          throw new Error('GamePlanIQ returned malformed JSON.')
        }
        setRecs(list)
        setRecsOpponentName(json.opponent ?? null)
        setRecsGeneratedAt(json.generatedAt ?? new Date().toISOString())
        try {
          localStorage.setItem(
            storageKey('situation_recommendation', params.opponentId),
            JSON.stringify({
              result: { recommendations: list },
              opponent: json.opponent,
              generatedAt: json.generatedAt,
            }),
          )
        } catch {
          // ignore
        }
      } catch (e) {
        setRecsError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setRecsPending(false)
      }
    },
    [recsPending],
  )

  // Retry handler — uses last params if present, else no-op.
  const retry = useCallback(() => {
    const last = lastSituationParamsRef.current
    if (!last) return
    void generate(last)
  }, [generate])

  const currentSituation = useAppStore((s) => s.situation)

  return (
    <div className="flex flex-col gap-4">
      <SituationBuilder
        opponentId={currentOpponentId}
        opponents={opponents}
        isPending={recsPending}
        onGenerate={(p) => void generate(p)}
      />

      {/* Header for the recommendations section */}
      <div className="flex items-center gap-2">
        <Crosshair className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Top 3 Play Recommendations
        </span>
        {recsGeneratedAt && (
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            for {recsOpponentName ?? 'opponent'} · {formatDownDistance(currentSituation.down, currentSituation.distance)} · Q{currentSituation.quarter} ·{' '}
            {formatTimestamp(recsGeneratedAt)}
          </span>
        )}
      </div>

      {/* Body */}
      {recsError ? (
        <ErrorState
          message={recsError}
          onRetry={retry}
          retryLabel="Retry recommendations"
          pending={recsPending}
        />
      ) : recsPending && !recs ? (
        <RecsSkeleton />
      ) : recs && recs.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {[...recs]
            .sort((a, b) => a.rank - b.rank)
            .slice(0, 3)
            .map((r) => (
              <RecommendationCard
                key={`${r.playId}-${r.rank}`}
                recommendation={r}
              />
            ))}
        </div>
      ) : (
        <EmptyRecsState />
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Shared: data fetching
// ----------------------------------------------------------------------------

function useGridironList() {
  return useQuery<GridironListResponse>({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed to load gridiron data')
      return (await r.json()) as GridironListResponse
    },
  })
}

// ----------------------------------------------------------------------------
//  Shared: error state
// ----------------------------------------------------------------------------

function ErrorState({
  message,
  onRetry,
  retryLabel,
  pending,
}: {
  message: string
  onRetry: () => void
  retryLabel: string
  pending: boolean
}) {
  return (
    <Card className="flex flex-col items-start gap-3 border-destructive/40 bg-destructive/5 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="size-4 shrink-0 mt-0.5 text-destructive" />
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-destructive">
            GamePlanIQ Error
          </div>
          <p className="mt-1 text-sm text-foreground/90">{message}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} disabled={pending}>
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <RefreshCw className="size-3.5" />
        )}
        {retryLabel}
      </Button>
    </Card>
  )
}

// ----------------------------------------------------------------------------
//  Shared: skeleton + empty state for situation rec
// ----------------------------------------------------------------------------

function RecsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20 mt-1" />
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="mt-3 h-12 w-full rounded-md" />
        </div>
      ))}
    </div>
  )
}

function EmptyRecsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
      <Crosshair className="size-10 opacity-40" />
      <p className="text-sm font-medium">No recommendations yet.</p>
      <p className="max-w-md text-center text-xs">
        Configure the situation above and click{' '}
        <span className="inline-flex items-center gap-1 font-medium text-foreground">
          <Send className="size-3" />
          Get Recommendations
        </span>{' '}
        to surface the top 3 installed plays for this scenario.
      </p>
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Validators — coerce untyped LLM JSON into typed shapes; reject malformed
//  payloads so the UI can render a clean error state.
// ----------------------------------------------------------------------------

function isString(v: unknown): v is string {
  return typeof v === 'string'
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function validateScriptPlay(v: unknown): unknown {
  // Loose validation — we just need the object to have the expected keys.
  // The renderer itself guards each field with `|| '—'` so a missing
  // string field won't crash.
  if (typeof v !== 'object' || v === null) return null
  return v
}

function validateOpeningScript(v: unknown): OpeningScript | null {
  if (typeof v !== 'object' || v === null) return null
  const o = v as Record<string, unknown>
  const playsRaw = Array.isArray(o.plays) ? o.plays : []
  const plays = playsRaw
    .map(validateScriptPlay)
    .filter((p): p is Record<string, unknown> => p !== null)
  // Don't fail if plays is empty — render the empty-state row instead.
  return {
    title: isString(o.title) ? o.title : '',
    rationale: isString(o.rationale) ? o.rationale : '',
    plays: plays as unknown as OpeningScript['plays'],
    complementaryPlan: Array.isArray(o.complementaryPlan)
      ? (o.complementaryPlan as unknown[]).filter(isString)
      : [],
    selfScoutWarning: isString(o.selfScoutWarning) ? o.selfScoutWarning : '',
  }
}

function validateRecommendations(
  v: unknown,
): Recommendation[] | null {
  if (typeof v !== 'object' || v === null) return null
  const o = v as Record<string, unknown>
  const arr = Array.isArray(o.recommendations) ? o.recommendations : null
  if (!arr) return null
  const out: Recommendation[] = []
  for (const item of arr) {
    if (typeof item !== 'object' || item === null) continue
    const r = item as Record<string, unknown>
    out.push({
      rank: isNumber(r.rank) ? r.rank : out.length + 1,
      playId: isString(r.playId) ? r.playId : '',
      name: isString(r.name) ? r.name : '',
      concept: isString(r.concept) ? r.concept : '',
      rationale: isString(r.rationale) ? r.rationale : '',
      expectedDefensiveReaction: isString(r.expectedDefensiveReaction)
        ? r.expectedDefensiveReaction
        : '',
      complementaryPlay: isString(r.complementaryPlay)
        ? r.complementaryPlay
        : '',
      explanation: isString(r.explanation) ? r.explanation : '',
    })
  }
  return out
}

// ----------------------------------------------------------------------------
//  Formatting helpers
// ----------------------------------------------------------------------------

function formatDownDistance(down: number, distance: number): string {
  const suffix = (n: number): string => {
    if (n === 1) return 'st'
    if (n === 2) return 'nd'
    if (n === 3) return 'rd'
    return 'th'
  }
  return `${down}${suffix(down)} & ${distance}`
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
