'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Award,
  ChevronRight,
  Filter,
  Gauge,
  Heart,
  HeartCrack,
  HeartPulse,
  Ruler,
  Search,
  Shield,
  Sparkles,
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

interface PersonnelData {
  team: { name: string; philosophy: string; players: Player[] } | null
}

type Availability = 'available' | 'questionable' | 'out'
type SideFilter = 'all' | 'offensive' | 'defensive'

const AVAILABILITY_META: Record<
  Availability,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  available: {
    label: 'Available',
    icon: <HeartPulse className="size-3" />,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/30',
  },
  questionable: {
    label: 'Questionable',
    icon: <Heart className="size-3" />,
    color: 'text-chart-3',
    bg: 'bg-chart-3/10 border-chart-3/30',
  },
  out: {
    label: 'Out',
    icon: <HeartCrack className="size-3" />,
    color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/30',
  },
}

// Position grouping for depth chart
const OFFENSIVE_DEPTH: Array<{ pos: string; label: string }> = [
  { pos: 'QB', label: 'Quarterback' },
  { pos: 'RB', label: 'Running Back' },
  { pos: 'WR', label: 'Wide Receiver' },
  { pos: 'TE', label: 'Tight End' },
  { pos: 'OL', label: 'Offensive Line' },
]

const DEFENSIVE_DEPTH: Array<{ pos: string; label: string }> = [
  { pos: 'LB', label: 'Linebacker' },
  { pos: 'DL', label: 'Defensive Line' },
  { pos: 'DB', label: 'Defensive Back' },
]

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

interface PlayerCardProps {
  player: Player
  availability: Availability
  onCycleAvailability: (id: string) => void
  depthRank?: number
}

function PlayerCard({
  player,
  availability,
  onCycleAvailability,
  depthRank,
}: PlayerCardProps) {
  const avail = AVAILABILITY_META[availability]
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'rounded-lg border bg-card p-3 transition-all hover:shadow-md',
        availability === 'out'
          ? 'border-destructive/30 opacity-75'
          : availability === 'questionable'
          ? 'border-chart-3/30'
          : 'border-border hover:border-primary/30'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Jersey circle */}
        <div className="relative shrink-0">
          <div
            className={cn(
              'size-11 rounded-full flex items-center justify-center font-bold font-mono text-sm border-2',
              availability === 'out'
                ? 'bg-muted text-muted-foreground border-muted'
                : 'helmet-gradient text-primary-foreground border-transparent'
            )}
          >
            {player.jersey}
          </div>
          {depthRank === 1 && (
            <div className="absolute -top-1 -right-1 size-4 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[9px] font-bold border border-card">
              1
            </div>
          )}
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm truncate">{player.name}</span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono px-1 py-0 h-4 bg-muted/30"
                >
                  {player.position}
                </Badge>
                {depthRank && depthRank > 1 && (
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono px-1 py-0 h-4 text-muted-foreground"
                  >
                    {depthRank}
                  </Badge>
                )}
              </div>
              {player.notes && (
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                  {player.notes}
                </p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            {player.height && (
              <span className="flex items-center gap-1">
                <Ruler className="size-3" />
                {player.height}
              </span>
            )}
            {player.weight && (
              <span className="flex items-center gap-1">
                <Weight className="size-3" />
                {player.weight}
              </span>
            )}
            {player.speedGrade && (
              <span className={cn('flex items-center gap-1 font-mono font-bold', speedGradeColor(player.speedGrade))}>
                <Gauge className="size-3" />
                {player.speedGrade}
              </span>
            )}
          </div>

          {/* Mastery bar */}
          {player.quizScore != null && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="text-muted-foreground font-mono uppercase tracking-wider">
                  Mastery
                </span>
                <span className={cn('font-mono font-bold', masteryColor(player.quizScore))}>
                  {Math.round(player.quizScore * 100)}%
                </span>
              </div>
              <Progress value={player.quizScore * 100} className="h-1" />
            </div>
          )}
        </div>
      </div>

      {/* Availability toggle */}
      <button
        onClick={() => onCycleAvailability(player.id)}
        className={cn(
          'mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-mono uppercase tracking-wider transition-all hover:scale-[1.01]',
          avail.bg,
          avail.color
        )}
      >
        {avail.icon}
        {avail.label}
        <span className="opacity-50">· click to cycle</span>
      </button>
    </motion.div>
  )
}

function DepthChartRow({
  label,
  players,
  availabilityMap,
  onCycle,
}: {
  label: string
  players: Player[]
  availabilityMap: Map<string, Availability>
  onCycle: (id: string) => void
}) {
  if (players.length === 0) return null

  // Sort by availability (available first) then by quiz score
  const sorted = [...players].sort((a, b) => {
    const aAvail = availabilityMap.get(a.id) ?? 'available'
    const bAvail = availabilityMap.get(b.id) ?? 'available'
    const order: Availability[] = ['available', 'questionable', 'out']
    const aIdx = order.indexOf(aAvail)
    const bIdx = order.indexOf(bAvail)
    if (aIdx !== bIdx) return aIdx - bIdx
    return (b.quizScore ?? 0) - (a.quizScore ?? 0)
  })

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="bg-muted/40 px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-mono text-foreground font-semibold">
            {label}
          </span>
          <Badge variant="outline" className="text-[10px] font-mono">
            {players.length}
          </Badge>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {sorted.filter((p) => (availabilityMap.get(p.id) ?? 'available') === 'available').length}{' '}
          available
        </span>
      </div>
      <div className="p-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {sorted.map((p, i) => (
          <PlayerCard
            key={p.id}
            player={p}
            availability={availabilityMap.get(p.id) ?? 'available'}
            onCycleAvailability={onCycle}
            depthRank={i + 1}
          />
        ))}
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  icon,
  color = 'text-foreground',
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: string
}) {
  return (
    <Card className="p-3 slide-up-fade hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          {label}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className={cn('text-xl font-bold font-mono mt-1', color)}>{value}</div>
    </Card>
  )
}

function PersonnelMain() {
  const { data, isLoading } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<PersonnelData>
    },
    staleTime: 60_000,
  })

  const team = data?.team
  const players = team?.players ?? []

  // Availability stored in localStorage (overlay — doesn't modify DB)
  const [availabilityMap, setAvailabilityMap] = React.useState<Map<string, Availability>>(
    new Map()
  )
  const [sideFilter, setSideFilter] = React.useState<SideFilter>('all')
  const [search, setSearch] = React.useState('')

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

  function cycleAvailability(playerId: string) {
    setAvailabilityMap((prev) => {
      const next = new Map(prev)
      const current = next.get(playerId) ?? 'available'
      const order: Availability[] = ['available', 'questionable', 'out']
      const nextAvail = order[(order.indexOf(current) + 1) % order.length]
      next.set(playerId, nextAvail)
      try {
        const obj = Object.fromEntries(next.entries())
        localStorage.setItem('gridironiq:personnel:availability', JSON.stringify(obj))
      } catch {
        // ignore
      }
      return next
    })
  }

  const filtered = React.useMemo(() => {
    return players.filter((p) => {
      if (sideFilter !== 'all' && p.group !== sideFilter) return false
      if (search) {
        const s = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(s) ||
          p.position.toLowerCase().includes(s) ||
          String(p.jersey).includes(s)
        )
      }
      return true
    })
  }, [players, sideFilter, search])

  const offensePlayers = filtered.filter((p) => p.group === 'offensive')
  const defensePlayers = filtered.filter((p) => p.group === 'defensive')

  // Group by position for depth chart
  const offenseDepth = OFFENSIVE_DEPTH.map((d) => ({
    ...d,
    players: offensePlayers.filter((p) => p.position === d.pos),
  })).filter((d) => d.players.length > 0)

  const defenseDepth = DEFENSIVE_DEPTH.map((d) => ({
    ...d,
    players: defensePlayers.filter((p) => p.position === d.pos),
  })).filter((d) => d.players.length > 0)

  // Summary stats
  const totalPlayers = players.length
  const offenseCount = players.filter((p) => p.group === 'offensive').length
  const defenseCount = players.filter((p) => p.group === 'defensive').length
  const availableCount = players.filter(
    (p) => (availabilityMap.get(p.id) ?? 'available') === 'available'
  ).length
  const questionableCount = players.filter(
    (p) => availabilityMap.get(p.id) === 'questionable'
  ).length
  const outCount = players.filter((p) => availabilityMap.get(p.id) === 'out').length
  const avgMastery =
    totalPlayers > 0
      ? Math.round(
          (players.reduce((a, p) => a + (p.quizScore ?? 0), 0) /
            players.filter((p) => p.quizScore != null).length || 1) *
            100
        )
      : 0

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-lg border border-border bg-card animate-pulse-soft" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg border border-border bg-card animate-pulse-soft"
            />
          ))}
        </div>
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
            <Users className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              PersonnelIQ™ · Roster Management
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              {team?.name ?? 'Your Team'} Roster
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {totalPlayers} players · {offenseCount} offense · {defenseCount} defense ·{' '}
              <span className="text-primary font-mono">{availableCount} available</span>
              {questionableCount > 0 && (
                <>
                  {' · '}
                  <span className="text-chart-3 font-mono">{questionableCount} Q</span>
                </>
              )}
              {outCount > 0 && (
                <>
                  {' · '}
                  <span className="text-destructive font-mono">{outCount} OUT</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <StatTile
          label="Total Roster"
          value={totalPlayers}
          icon={<Users className="size-3.5" />}
        />
        <StatTile
          label="Offense"
          value={offenseCount}
          icon={<TrendingUp className="size-3.5" />}
          color="text-primary"
        />
        <StatTile
          label="Defense"
          value={defenseCount}
          icon={<Shield className="size-3.5" />}
          color="text-chart-5"
        />
        <StatTile
          label="Available"
          value={availableCount}
          icon={<HeartPulse className="size-3.5" />}
          color="text-primary"
        />
        <StatTile
          label="Questionable"
          value={questionableCount}
          icon={<Heart className="size-3.5" />}
          color="text-chart-3"
        />
        <StatTile
          label="Avg Mastery"
          value={`${avgMastery}%`}
          icon={<Award className="size-3.5" />}
          color="text-accent"
        />
      </div>

      {/* Availability legend */}
      <Card className="p-3">
        <div className="flex items-center gap-4 flex-wrap text-[11px]">
          <span className="text-muted-foreground font-mono uppercase tracking-widest">
            Availability:
          </span>
          {(['available', 'questionable', 'out'] as Availability[]).map((a) => {
            const meta = AVAILABILITY_META[a]
            return (
              <div key={a} className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md border', meta.bg, meta.color)}>
                {meta.icon}
                <span className="font-mono uppercase tracking-wider">{meta.label}</span>
                <span className="opacity-60 ml-1">
                  (
                  {a === 'available'
                    ? availableCount
                    : a === 'questionable'
                    ? questionableCount
                    : outCount}
                  )
                </span>
              </div>
            )
          })}
          <span className="text-muted-foreground/70 ml-auto">
            Click any player&apos;s availability badge to cycle status.
          </span>
        </div>
      </Card>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={sideFilter} onValueChange={(v) => setSideFilter(v as SideFilter)}>
          <TabsList>
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="offensive" className="text-xs">
              Offense
            </TabsTrigger>
            <TabsTrigger value="defensive" className="text-xs">
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
        <Badge variant="outline" className="ml-auto font-mono text-xs">
          <Filter className="size-3 mr-1" />
          {filtered.length} of {totalPlayers}
        </Badge>
      </div>

      {/* Depth charts */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sideFilter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {(sideFilter === 'all' || sideFilter === 'offensive') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
                  Offensive Depth Chart
                </h3>
                <Separator className="flex-1" />
                <span className="text-[10px] text-muted-foreground font-mono">
                  {offensePlayers.length} players
                </span>
              </div>
              {offenseDepth.length > 0 ? (
                offenseDepth.map((row) => (
                  <DepthChartRow
                    key={row.pos}
                    label={row.label}
                    players={row.players}
                    availabilityMap={availabilityMap}
                    onCycle={cycleAvailability}
                  />
                ))
              ) : (
                <Card className="p-8 text-center text-sm text-muted-foreground">
                  No offensive players match the current filter.
                </Card>
              )}
            </div>
          )}

          {(sideFilter === 'all' || sideFilter === 'defensive') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-chart-5" />
                <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
                  Defensive Depth Chart
                </h3>
                <Separator className="flex-1" />
                <span className="text-[10px] text-muted-foreground font-mono">
                  {defensePlayers.length} players
                </span>
              </div>
              {defenseDepth.length > 0 ? (
                defenseDepth.map((row) => (
                  <DepthChartRow
                    key={row.pos}
                    label={row.label}
                    players={row.players}
                    availabilityMap={availabilityMap}
                    onCycle={cycleAvailability}
                  />
                ))
              ) : (
                <Card className="p-8 text-center text-sm text-muted-foreground">
                  No defensive players match the current filter.
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function PersonnelIQ() {
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
      <PersonnelMain />
    </QueryClientProvider>
  )
}
