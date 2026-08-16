'use client'

/**
 * PlaybookIQ™ — Playbook browser module.
 *
 * Three-column coach's view of the installed playbook:
 *   1. Left filter sidebar — side toggle (OFFENSE / DEFENSE), philosophy,
 *      personnel chips, concept chips, and search.
 *   2. Center play list — scrollable, color-coded cards.
 *   3. Right Play DNA™ panel — full structured DNA + assignments + routes +
 *      coaching points + complementary plays.
 *
 * Self-contained: ships its own React Query client. Selecting a play writes
 * `selectedPlayId` into the shared Zustand store so other modules can react.
 */

import * as React from 'react'
import { useMemo, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import {
  Filter,
  Goal,
  Loader2,
  Search,
  Shield,
  Swords,
  X,
} from 'lucide-react'

import { useAppStore } from '@/lib/store'
import { PHILOSOPHIES } from '@/lib/football/knowledge'
import type { SerializedPlay } from '@/lib/data'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import {
  classifyConcept,
  CONCEPT_BADGE_CLASS,
  CONCEPT_LABEL,
  type ConceptKind,
  PlayCard,
} from './play-card'
import { PlayDnaPanel } from './play-dna-panel'

// ----------------------------------------------------------------------------
//  Constants
// ----------------------------------------------------------------------------

const PERSONNEL_OPTIONS = ['10', '11', '12', '21', '22', '23'] as const

const OFFENSE_CONCEPT_FILTERS: ConceptKind[] = [
  'run',
  'pass',
  'rpo',
  'play_action',
  'boot',
  'screen',
  'shot',
]
const DEFENSE_CONCEPT_FILTERS: ConceptKind[] = ['defense']

/**
 * Coarse mapping from philosophy id → concept kinds that philosophy leans on.
 * Used by the philosophy dropdown to pre-filter concepts.
 */
const PHILOSOPHY_TO_KINDS: Record<string, ConceptKind[]> = {
  spread: ['run', 'pass', 'rpo', 'play_action'],
  air_raid: ['pass', 'shot'],
  west_coast: ['pass', 'play_action'],
  pro_style: ['run', 'pass', 'play_action', 'boot'],
  pistol: ['run'],
  wing_t: ['run', 'play_action'],
  flexbone: ['run'],
  rpo_heavy: ['rpo', 'run', 'pass'],
  power_gap: ['run', 'play_action'],
  zone_based: ['run'],
  multiple: [],
}

// ----------------------------------------------------------------------------
//  Data fetching
// ----------------------------------------------------------------------------

interface GridironApiResponse {
  plays: SerializedPlay[]
}

function useGridironPlays() {
  return useQuery<GridironApiResponse>({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed to load gridiron data')
      return (await r.json()) as GridironApiResponse
    },
  })
}

// ----------------------------------------------------------------------------
//  Main module
// ----------------------------------------------------------------------------

export default function PlaybookIQ() {
  // Each instance gets its own React Query client. This keeps the module
  // self-contained — the integrator does not need to wire a provider.
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
      <PlaybookIQBody />
    </QueryClientProvider>
  )
}

function PlaybookIQBody() {
  const { data, isLoading, isError } = useGridironPlays()

  const selectedPlayId = useAppStore((s) => s.selectedPlayId)
  const setSelectedPlayId = useAppStore((s) => s.setSelectedPlayId)

  // Filters
  const [side, setSide] = useState<'offense' | 'defense'>('offense')
  const [philosophy, setPhilosophy] = useState<string>('all')
  const [personnel, setPersonnel] = useState<Set<string>>(() => new Set())
  const [concepts, setConcepts] = useState<Set<ConceptKind>>(() => new Set())
  const [search, setSearch] = useState('')

  const plays: SerializedPlay[] = data?.plays ?? []

  const filtered = useMemo(() => {
    const philKinds =
      philosophy !== 'all' ? (PHILOSOPHY_TO_KINDS[philosophy] ?? []) : null
    const q = search.trim().toLowerCase()

    return plays.filter((p) => {
      if (p.side !== side) return false

      if (concepts.size > 0) {
        const k = classifyConcept(p.concept, p.side)
        if (!concepts.has(k)) return false
      }

      if (personnel.size > 0) {
        if (!p.personnel || !personnel.has(p.personnel)) return false
      }

      if (philKinds && philKinds.length > 0) {
        const k = classifyConcept(p.concept, p.side)
        if (!philKinds.includes(k)) return false
      }

      if (q) {
        const hay =
          `${p.playId} ${p.name} ${p.concept} ${p.family?.name ?? ''} ${p.formation?.name ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [plays, side, personnel, concepts, philosophy, search])

  const selectedPlay =
    plays.find((p) => p.id === selectedPlayId) ?? null

  const togglePersonnel = (p: string) => {
    setPersonnel((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })
  }

  const toggleConcept = (c: ConceptKind) => {
    setConcepts((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  }

  const handleSideChange = (v: string) => {
    const next = v as 'offense' | 'defense'
    setSide(next)
    // The available concept set differs between offense and defense, so
    // clear any stale concept filters when switching sides.
    setConcepts(new Set())
  }

  const clearFilters = () => {
    setPersonnel(new Set())
    setConcepts(new Set())
    setPhilosophy('all')
    setSearch('')
  }

  const hasActiveFilters =
    personnel.size > 0 ||
    concepts.size > 0 ||
    philosophy !== 'all' ||
    search.trim() !== ''

  const conceptOptions =
    side === 'defense' ? DEFENSE_CONCEPT_FILTERS : OFFENSE_CONCEPT_FILTERS

  return (
    <div className="grid h-full grid-cols-12 gap-3 p-3 lg:p-4">
      {/* ===========================================================
          LEFT — Filter sidebar
         =========================================================== */}
      <aside className="col-span-12 flex flex-col gap-4 lg:col-span-3">
        {/* Lockup */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              GridironIQ™
            </div>
            <h2 className="mt-0.5 text-base font-semibold tracking-tight">
              PlaybookIQ
            </h2>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {filtered.length} / {plays.length}
          </Badge>
        </div>

        {/* Side toggle */}
        <div>
          <FilterLabel>Side</FilterLabel>
          <Tabs
            value={side}
            onValueChange={handleSideChange}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="offense" className="gap-1.5">
                <Swords className="size-3.5" />
                Offense
              </TabsTrigger>
              <TabsTrigger value="defense" className="gap-1.5">
                <Shield className="size-3.5" />
                Defense
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Philosophy */}
        <div>
          <FilterLabel>Philosophy</FilterLabel>
          <Select value={philosophy} onValueChange={setPhilosophy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All philosophies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All philosophies</SelectItem>
              {PHILOSOPHIES.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Personnel chips */}
        <div>
          <FilterLabel>Personnel</FilterLabel>
          <div className="flex flex-wrap gap-1.5">
            {PERSONNEL_OPTIONS.map((p) => {
              const active = personnel.has(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePersonnel(p)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-md border px-2.5 py-1 font-mono text-xs transition-colors',
                    active
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : 'border-transparent bg-muted/40 text-muted-foreground hover:border-primary/40 hover:bg-muted/60',
                  )}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        {/* Concept type chips */}
        <div>
          <FilterLabel>Concept Type</FilterLabel>
          <div className="flex flex-wrap gap-1.5">
            {conceptOptions.map((c) => {
              const active = concepts.has(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleConcept(c)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs transition-colors',
                    active
                      ? CONCEPT_BADGE_CLASS[c]
                      : 'border-transparent bg-muted/40 text-muted-foreground hover:border-primary/40 hover:bg-muted/60',
                  )}
                >
                  {CONCEPT_LABEL[c]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Search */}
        <div>
          <FilterLabel>Search</FilterLabel>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or play code…"
              className="pl-8"
              aria-label="Search plays"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Clear filters
          </Button>
        )}
      </aside>

      {/* ===========================================================
          CENTER — Play list
         =========================================================== */}
      <main className="col-span-12 lg:col-span-6">
        <div className="mb-2 flex items-center gap-2 px-1">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {side === 'offense' ? 'Offensive' : 'Defensive'} playbook
          </span>
          <span className="text-sm text-muted-foreground">
            · {filtered.length} play{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        <ScrollArea className="h-[60vh] scrollbar-thin lg:h-[calc(100vh-8rem)]">
          <div className="pr-3">
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
                <span className="text-sm">Loading playbook…</span>
              </div>
            ) : isError ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-destructive">
                <Goal className="size-10 opacity-60" />
                <span className="text-sm">Failed to load plays.</span>
                <span className="text-xs text-muted-foreground">
                  Check that the API is reachable.
                </span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
                <Goal className="size-12 opacity-50" />
                <div className="text-base font-medium">
                  No plays match — adjust your filters
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((p) => (
                  <PlayCard
                    key={p.id}
                    play={p}
                    selected={p.id === selectedPlayId}
                    onSelect={setSelectedPlayId}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* ===========================================================
          RIGHT — Play DNA™ panel
         =========================================================== */}
      <aside
        className={cn(
          'col-span-12 lg:col-span-3',
          !selectedPlay && 'hidden lg:block',
        )}
      >
        <div className="mb-2 px-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Play DNA™
          </span>
        </div>
        {selectedPlay ? (
          <ScrollArea className="h-[60vh] scrollbar-thin lg:h-[calc(100vh-8rem)]">
            <div className="pr-3">
              <PlayDnaPanel
                play={selectedPlay}
                allPlays={plays}
                onSelectComplementary={setSelectedPlayId}
              />
            </div>
          </ScrollArea>
        ) : (
          <Card className="flex h-64 items-center justify-center gap-2 py-6">
            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
              <Goal className="size-10 opacity-30" />
              <span className="text-sm">Select a play to view its DNA</span>
            </div>
          </Card>
        )}
      </aside>
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Small presentational helpers
// ----------------------------------------------------------------------------

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  )
}
