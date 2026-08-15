'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  ChevronRight,
  Crosshair,
  Filter,
  Gauge,
  Heart,
  HeartCrack,
  HeartPulse,
  Layers,
  Ruler,
  Search,
  Shield,
  TrendingUp,
  Users,
  Weight,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface Player {
  id: string
  jersey: number
  name: string
  position: string
  group: string
  height: string | null
  weight: number | null
  speedGrade: string | null
  quizScore: number | null
  notes: string | null
}

interface DepthData {
  team: { name: string; philosophy: string; players: Player[] } | null
}

// Availability state stored in localStorage (shared with PersonnelIQ)
type Availability = 'available' | 'questionable' | 'out'

const AVAIL_META: Record<Availability, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  available: { label: 'Available', icon: <HeartPulse className="size-3" />, color: 'text-primary', bg: 'bg-primary/15 border-primary/30' },
  questionable: { label: 'Q', icon: <Heart className="size-3" />, color: 'text-chart-3', bg: 'bg-chart-3/15 border-chart-3/30' },
  out: { label: 'OUT', icon: <HeartCrack className="size-3" />, color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30' },
}

// Offensive positions in formation order (left to right across the field)
const OFFENSIVE_FORMATION_ORDER = [
  { pos: 'X', label: 'X Receiver', alignment: 'Wide left', formationIdx: 0 },
  { pos: 'LT', label: 'Left Tackle', alignment: 'LOS', formationIdx: 1 },
  { pos: 'LG', label: 'Left Guard', alignment: 'LOS', formationIdx: 2 },
  { pos: 'C', label: 'Center', alignment: 'LOS', formationIdx: 3 },
  { pos: 'RG', label: 'Right Guard', alignment: 'LOS', formationIdx: 4 },
  { pos: 'RT', label: 'Right Tackle', alignment: 'LOS', formationIdx: 5 },
  { pos: 'QB', label: 'Quarterback', alignment: 'Gun 5y', formationIdx: 3 },
  { pos: 'RB', label: 'Running Back', alignment: 'Gun 7y', formationIdx: 4 },
  { pos: 'TE', label: 'Tight End', alignment: 'Right', formationIdx: 6 },
  { pos: 'WR', label: 'Slot/WR', alignment: 'Right wide', formationIdx: 7 },
  { pos: 'Z', label: 'Z Receiver', alignment: 'Wide right', formationIdx: 8 },
]

// Defensive positions in formation order (4-2-5 base)
const DEFENSIVE_FORMATION_ORDER = [
  { pos: 'CB', label: 'Boundary CB', alignment: 'Wide left', formationIdx: 0 },
  { pos: 'DE', label: 'Boundary DE', alignment: 'LOS 5-tech', formationIdx: 1 },
  { pos: 'DT', label: 'Boundary DT', alignment: 'LOS 3-tech', formationIdx: 2 },
  { pos: 'NT', label: 'Nose Tackle', alignment: 'LOS 1-tech', formationIdx: 3 },
  { pos: 'DT', label: 'Field DT', alignment: 'LOS 3-tech', formationIdx: 4 },
  { pos: 'DE', label: 'Field DE', alignment: 'LOS 5-tech', formationIdx: 5 },
  { pos: 'CB', label: 'Field CB', alignment: 'Wide right', formationIdx: 6 },
  { pos: 'LB', label: 'Mike LB', alignment: 'Stack', formationIdx: 3 },
  { pos: 'LB', label: 'Will LB', alignment: 'Stack', formationIdx: 4 },
  { pos: 'S', label: 'Strong Safety', alignment: 'Deep', formationIdx: 6 },
  { pos: 'S', label: 'Free Safety', alignment: 'Deep', formationIdx: 7 },
]

function positionToRoom(position: string): string {
  const p = position.toUpperCase()
  if (p === 'QB') return 'QB'
  if (['RB', 'FB', 'HB'].includes(p)) return 'RB'
  if (['WR', 'X', 'Z', 'H', 'F'].includes(p)) return 'WR'
  if (['TE', 'Y'].includes(p)) return 'TE'
  if (['LT', 'LG', 'C', 'RG', 'RT', 'OL'].includes(p)) return 'OL'
  if (['DE', 'DT', 'NT', 'DL'].includes(p)) return 'DL'
  if (['MIKE', 'WILL', 'SAM', 'LB'].includes(p)) return 'LB'
  if (['CB', 'S', 'FS', 'SS', 'DB'].includes(p)) return 'DB'
  return p
}

function speedGradeColor(grade?: string | null) {
  if (!grade) return 'text-muted-foreground'
  if (grade.startsWith('A+')) return 'text-primary'
  if (grade.startsWith('A')) return 'text-chart-3'
  if (grade.startsWith('B+')) return 'text-accent'
  return 'text-muted-foreground'
}

function masteryColor(score: number | null) {
  if (score == null) return 'text-muted-foreground'
  if (score >= 0.9) return 'text-primary'
  if (score >= 0.8) return 'text-chart-3'
  if (score >= 0.7) return 'text-accent'
  return 'text-destructive'
}

function PlayerToken({
  player,
  rank,
  availability,
  size = 'md',
}: {
  player: Player
  rank: number
  availability: Availability
  size?: 'sm' | 'md' | 'lg'
}) {
  const isOut = availability === 'out'
  const isQ = availability === 'questionable'
  const sizeClass = size === 'sm' ? 'size-8 text-[10px]' : size === 'lg' ? 'size-12 text-sm' : 'size-10 text-xs'
  const isStarter = rank === 1
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'relative rounded-full flex items-center justify-center font-bold font-mono border-2 shrink-0',
        sizeClass,
        isOut
          ? 'bg-muted text-muted-foreground border-muted'
          : 'helmet-gradient text-primary-foreground border-transparent',
        isQ && 'ring-2 ring-chart-3/50 ring-offset-1 ring-offset-background'
      )}
      title={`${player.name} (#${player.jersey}) — ${AVAIL_META[availability].label}`}
    >
      {player.jersey}
      {isStarter && !isOut && (
        <div className="absolute -top-1 -right-1 size-3.5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[8px] font-bold border border-card">
          ★
        </div>
      )}
      {isOut && (
        <div className="absolute -top-1 -right-1 size-3.5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[8px] font-bold border border-card">
          ×
        </div>
      )}
    </motion.div>
  )
}

function PositionSlot({
  position,
  players,
  availabilityMap,
  side,
}: {
  position: { pos: string; label: string; alignment: string; formationIdx: number }
  players: Player[]
  availabilityMap: Map<string, Availability>
  side: 'offense' | 'defense'
}) {
  if (players.length === 0) return null

  // Sort: available first, then by mastery
  const sorted = [...players].sort((a, b) => {
    const aAvail = availabilityMap.get(a.id) ?? 'available'
    const bAvail = availabilityMap.get(b.id) ?? 'available'
    const order: Availability[] = ['available', 'questionable', 'out']
    const aIdx = order.indexOf(aAvail)
    const bIdx = order.indexOf(bAvail)
    if (aIdx !== bIdx) return aIdx - bIdx
    return (b.quizScore ?? 0) - (a.quizScore ?? 0)
  })

  const starter = sorted[0]
  const starterAvail = availabilityMap.get(starter.id) ?? 'available'
  const starterOut = starterAvail === 'out'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'rounded-lg border bg-card p-2 transition-all hover:shadow-md',
        starterOut
          ? 'border-destructive/40 bg-destructive/5'
          : side === 'offense'
          ? 'border-primary/30 hover:border-primary/50'
          : 'border-chart-5/30 hover:border-chart-5/50'
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          {position.label}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/70">
          {position.alignment}
        </span>
      </div>

      {/* Player tokens stacked */}
      <div className="flex items-center gap-1 flex-wrap">
        {sorted.slice(0, 3).map((p, i) => (
          <div key={p.id} className="flex items-center">
            <PlayerToken
              player={p}
              rank={i + 1}
              availability={availabilityMap.get(p.id) ?? 'available'}
              size={i === 0 ? 'md' : 'sm'}
            />
            {i === 0 && sorted.length > 1 && (
              <ChevronRight className="size-3 text-muted-foreground mx-0.5" />
            )}
          </div>
        ))}
      </div>

      {/* Starter name + key info */}
      <div className="mt-1.5 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold truncate">{starter.name}</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            #{starter.jersey}
          </span>
          {starterOut && (
            <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 text-[9px] px-1 py-0 h-3.5">
              OUT
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-mono">
          {starter.height && (
            <span className="flex items-center gap-0.5">
              <Ruler className="size-2.5" />
              {starter.height}
            </span>
          )}
          {starter.weight && (
            <span className="flex items-center gap-0.5">
              <Weight className="size-2.5" />
              {starter.weight}
            </span>
          )}
          {starter.speedGrade && (
            <span className={cn('flex items-center gap-0.5 font-bold', speedGradeColor(starter.speedGrade))}>
              <Gauge className="size-2.5" />
              {starter.speedGrade}
            </span>
          )}
        </div>
        {starter.quizScore != null && (
          <div className="mt-1">
            <div className="flex items-center justify-between text-[9px] mb-0.5">
              <span className="text-muted-foreground font-mono uppercase tracking-wider">Mastery</span>
              <span className={cn('font-mono font-bold', masteryColor(starter.quizScore))}>
                {Math.round(starter.quizScore * 100)}%
              </span>
            </div>
            <Progress value={starter.quizScore * 100} className="h-0.5" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

function FormationAlignment({
  side,
  players,
  availabilityMap,
}: {
  side: 'offense' | 'defense'
  players: Player[]
  availabilityMap: Map<string, Availability>
}) {
  const formationOrder = side === 'offense' ? OFFENSIVE_FORMATION_ORDER : DEFENSIVE_FORMATION_ORDER

  // Group players by their position match against formation order
  const slots = formationOrder.map((slot) => {
    const slotPlayers = players.filter((p) => {
      const pUpper = p.position.toUpperCase()
      const room = positionToRoom(p.position)
      // Match by position or room
      return pUpper === slot.pos || room === slot.pos
    })
    return { ...slot, players: slotPlayers }
  })

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Field header */}
      <div className={cn(
        'px-3 py-2 border-b border-border flex items-center justify-between',
        side === 'offense' ? 'bg-primary/10' : 'bg-chart-5/10'
      )}>
        <div className="flex items-center gap-2">
          {side === 'offense' ? (
            <TrendingUp className="size-4 text-primary" />
          ) : (
            <Shield className="size-4 text-chart-5" />
          )}
          <span className="text-xs uppercase tracking-widest font-mono font-semibold">
            {side === 'offense' ? 'Offensive Formation' : 'Defensive Formation'}
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          {slots.filter((s) => s.players.length > 0).length} / {formationOrder.length} positions
        </Badge>
      </div>

      {/* Field visualization */}
      <div className="relative p-4 turf-texture">
        {/* Line of scrimmage marker */}
        <div className="absolute top-1/2 left-3 right-3 h-px yard-marker opacity-60" />
        <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 text-[9px] font-mono text-muted-foreground/70 flex items-center justify-between">
          <span>LOS</span>
          <span>→</span>
          <span>LOS</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {slots.map((slot, i) => (
            <PositionSlot
              key={`${slot.pos}-${i}`}
              position={slot}
              players={slot.players}
              availabilityMap={availabilityMap}
              side={side}
            />
          ))}
        </div>

        {/* Empty state */}
        {slots.every((s) => s.players.length === 0) && (
          <div className="py-10 text-center">
            <Users className="size-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No {side === 'offense' ? 'offensive' : 'defensive'} players in roster.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DepthChartMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<DepthData>
    },
    staleTime: 60_000,
  })

  const team = data?.team
  const players = team?.players ?? []
  const [sideFilter, setSideFilter] = React.useState<'offense' | 'defense'>('offense')
  const [search, setSearch] = React.useState('')
  const [availabilityMap, setAvailabilityMap] = React.useState<Map<string, Availability>>(new Map())

  // Load shared availability state from localStorage (shared with PersonnelIQ)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('gridironiq:personnel:availability')
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, Availability>
        setAvailabilityMap(new Map(Object.entries(obj)))
      }
    } catch {
      // ignore
    }
  }, [])

  const offensePlayers = players.filter((p) => p.group === 'offensive')
  const defensePlayers = players.filter((p) => p.group === 'defensive')

  const filteredPlayers = React.useMemo(() => {
    const pool = sideFilter === 'offense' ? offensePlayers : defensePlayers
    if (!search) return pool
    const s = search.toLowerCase()
    return pool.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.position.toLowerCase().includes(s) ||
        String(p.jersey).includes(s)
    )
  }, [sideFilter, offensePlayers, defensePlayers, search])

  // Stats
  const stats = React.useMemo(() => {
    const total = players.length
    const offense = offensePlayers.length
    const defense = defensePlayers.length
    const available = players.filter((p) => (availabilityMap.get(p.id) ?? 'available') === 'available').length
    const questionable = players.filter((p) => availabilityMap.get(p.id) === 'questionable').length
    const out = players.filter((p) => availabilityMap.get(p.id) === 'out').length
    const avgMastery =
      players.filter((p) => p.quizScore != null).length > 0
        ? Math.round(
            (players.filter((p) => p.quizScore != null).reduce((a, p) => a + (p.quizScore ?? 0), 0) /
              players.filter((p) => p.quizScore != null).length) *
              100
          )
        : 0
    return { total, offense, defense, available, questionable, out, avgMastery }
  }, [players, offensePlayers, defensePlayers, availabilityMap])

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-lg border border-border bg-card animate-pulse-soft" />
        <div className="h-64 rounded-lg border border-border bg-card animate-pulse-soft" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Layers className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              DepthChartIQ™ · Visual Depth Chart & Formation Alignment
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Depth Chart
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} players · {stats.offense} offense · {stats.defense} defense ·{' '}
              <span className="text-primary font-mono">{stats.available} available</span>
              {stats.questionable > 0 && (
                <>
                  {' · '}
                  <span className="text-chart-3 font-mono">{stats.questionable} Q</span>
                </>
              )}
              {stats.out > 0 && (
                <>
                  {' · '}
                  <span className="text-destructive font-mono">{stats.out} OUT</span>
                </>
              )}
              {' · avg '}
              <span className="text-accent font-mono">{stats.avgMastery}%</span> mastery
            </p>
          </div>
        </div>
      </div>

      {/* Side filter + search */}
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={sideFilter} onValueChange={(v) => setSideFilter(v as 'offense' | 'defense')}>
          <TabsList>
            <TabsTrigger value="offense" className="text-xs">
              <TrendingUp className="size-3 mr-1" />
              Offense
            </TabsTrigger>
            <TabsTrigger value="defense" className="text-xs">
              <Shield className="size-3 mr-1" />
              Defense
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, position, or jersey…"
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          <Filter className="size-3 mr-1" />
          {filteredPlayers.length} in chart
        </Badge>
      </div>

      {/* Availability legend */}
      <Card className="p-3">
        <div className="flex items-center gap-4 flex-wrap text-[11px]">
          <span className="text-muted-foreground font-mono uppercase tracking-widest">
            Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded-full helmet-gradient flex items-center justify-center text-[8px] font-bold text-primary-foreground border border-accent">
              ★
            </div>
            <span className="font-mono">Starter</span>
          </div>
          <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded border', AVAIL_META.available.bg, AVAIL_META.available.color)}>
            {AVAIL_META.available.icon}
            <span className="font-mono uppercase tracking-wider">Available</span>
          </div>
          <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded border', AVAIL_META.questionable.bg, AVAIL_META.questionable.color)}>
            {AVAIL_META.questionable.icon}
            <span className="font-mono uppercase tracking-wider">Questionable</span>
          </div>
          <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded border', AVAIL_META.out.bg, AVAIL_META.out.color)}>
            {AVAIL_META.out.icon}
            <span className="font-mono uppercase tracking-wider">Out</span>
          </div>
          <span className="text-muted-foreground/70 ml-auto text-[10px]">
            Availability shared with PersonnelIQ — change there to update.
          </span>
        </div>
      </Card>

      {/* Formation alignment */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sideFilter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <FormationAlignment
            side={sideFilter}
            players={filteredPlayers}
            availabilityMap={availabilityMap}
          />
        </motion.div>
      </AnimatePresence>

      {/* Coaching notes */}
      {filteredPlayers.length > 0 && (
        <Card className="p-4 border-l-4 border-l-primary bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Crosshair className="size-4 text-primary" />
            <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
              Depth Chart Notes
            </h3>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono text-[10px] mt-0.5">•</span>
              <span>
                Starters (★) are determined by availability (available first) then by mastery score.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono text-[10px] mt-0.5">•</span>
              <span>
                If a starter is OUT, the backup is promoted. Toggle availability in PersonnelIQ.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono text-[10px] mt-0.5">•</span>
              <span>
                Tokens show up to 3 deep (starter → backup → 3rd string) per position.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono text-[10px] mt-0.5">•</span>
              <span>
                Formation alignment is positional (X/LT/LG/C/RG/RT/TE/WR/Z for offense; CB/DE/DT/NT/DT/DE/CB for defense) — actual alignment varies by formation call.
              </span>
            </li>
          </ul>
        </Card>
      )}
    </div>
  )
}

export default function DepthChartIQ() {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>
      <DepthChartMain />
    </QueryClientProvider>
  )
}
