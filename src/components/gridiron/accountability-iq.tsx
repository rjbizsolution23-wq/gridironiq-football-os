'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  Bell,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crosshair,
  Eye,
  Flame,
  GraduationCap,
  Lightbulb,
  Mail,
  Search,
  Shield,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface AccPlayer {
  id: string
  jersey: number
  name: string
  position: string
  group: string
  quizScore: number | null
  speedGrade: string | null
  height: string | null
  weight: number | null
  notes: string | null
}

interface AccData {
  team: {
    name: string
    philosophy: string
    players: AccPlayer[]
  } | null
  plays: Array<{ id: string; playId: string; name: string; concept: string; side: string }>
}

// Simulated learning data per player (deterministic based on player ID hash)
function generateLearningData(player: AccPlayer) {
  const hash = player.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const seed = (n: number) => {
    const x = Math.sin(hash + n) * 10000
    return x - Math.floor(x)
  }

  const assigned = 18
  const completionRate = 0.5 + seed(1) * 0.5
  const completed = Math.round(assigned * completionRate)
  const overdue = Math.round((assigned - completed) * seed(2) * 0.8)
  const mastery = (player.quizScore ?? 0.7) * 100
  const studyMinutes = Math.round(seed(3) * 120 + 15)
  const streakDays = Math.round(seed(4) * 7)
  const lastActiveHours = Math.round(seed(5) * 96)

  const formationMastery = Math.round(seed(10) * 30 + 70)
  const alignmentMastery = Math.round(seed(11) * 35 + 65)
  const assignmentMastery = Math.round(seed(12) * 40 + 60)
  const recognitionMastery = Math.round(seed(13) * 35 + 65)
  const adjustmentMastery = Math.round(seed(14) * 40 + 55)
  const recallMastery = Math.round(seed(15) * 35 + 60)

  const status = mastery >= 90 ? 'ready' : mastery >= 75 ? 'review' : 'not_ready'

  return {
    assigned,
    completed,
    overdue,
    mastery: Math.round(mastery),
    studyMinutes,
    streakDays,
    lastActiveHours,
    formationMastery,
    alignmentMastery,
    assignmentMastery,
    recognitionMastery,
    adjustmentMastery,
    recallMastery,
    status,
  }
}

function masteryColor(score: number) {
  if (score >= 90) return 'text-primary'
  if (score >= 75) return 'text-chart-3'
  if (score >= 60) return 'text-accent'
  return 'text-destructive'
}

function statusBadge(status: string) {
  switch (status) {
    case 'ready':
      return (
        <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 text-[10px] font-mono uppercase tracking-wider">
          <CheckCircle2 className="size-2.5 mr-1" />
          Ready
        </Badge>
      )
    case 'review':
      return (
        <Badge variant="outline" className="bg-chart-3/15 text-chart-3 border-chart-3/30 text-[10px] font-mono uppercase tracking-wider">
          <Eye className="size-2.5 mr-1" />
          Review
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] font-mono uppercase tracking-wider">
          <AlertTriangle className="size-2.5 mr-1" />
          Not Ready
        </Badge>
      )
  }
}

function formatLastActive(hours: number) {
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return `${Math.floor(days / 7)}w ago`
}

function StatTile({
  label,
  value,
  icon,
  color = 'text-foreground',
  subtitle,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: string
  subtitle?: string
}) {
  return (
    <Card className="p-3 slide-up-fade hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className={cn('text-2xl font-bold font-mono mt-1', color)}>{value}</div>
      {subtitle && <div className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</div>}
    </Card>
  )
}

function PlayerRow({
  player,
  learningData,
  onClick,
}: {
  player: AccPlayer
  learningData: ReturnType<typeof generateLearningData>
  onClick: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-md border border-border bg-background/40 hover:bg-muted/20 hover:border-primary/30 transition-all text-left"
    >
      {/* Jersey + name */}
      <div className="col-span-3 flex items-center gap-2 min-w-0">
        <div className="size-7 rounded-full helmet-gradient flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
          {player.jersey}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{player.name}</div>
          <div className="text-[10px] text-muted-foreground font-mono">{player.position}</div>
        </div>
      </div>
      {/* Assigned */}
      <div className="col-span-1 text-center">
        <span className="text-xs font-mono text-muted-foreground">{learningData.assigned}</span>
      </div>
      {/* Completed */}
      <div className="col-span-1 text-center">
        <span className="text-xs font-mono text-primary">{learningData.completed}</span>
      </div>
      {/* Overdue */}
      <div className="col-span-1 text-center">
        <span className={cn('text-xs font-mono', learningData.overdue > 0 ? 'text-destructive' : 'text-muted-foreground')}>
          {learningData.overdue}
        </span>
      </div>
      {/* Mastery */}
      <div className="col-span-2">
        <div className="flex items-center gap-2">
          <Progress value={learningData.mastery} className="h-1.5 flex-1" />
          <span className={cn('text-xs font-mono font-bold w-8 text-right', masteryColor(learningData.mastery))}>
            {learningData.mastery}%
          </span>
        </div>
      </div>
      {/* Last active */}
      <div className="col-span-2 text-center">
        <span className="text-[11px] text-muted-foreground font-mono">{formatLastActive(learningData.lastActiveHours)}</span>
      </div>
      {/* Status */}
      <div className="col-span-2 flex justify-end">
        {statusBadge(learningData.status)}
      </div>
    </motion.button>
  )
}

function PlayerProfile({
  player,
  learningData,
  onBack,
}: {
  player: AccPlayer
  learningData: ReturnType<typeof generateLearningData>
  onBack: () => void
}) {
  const masteryBreakdown = [
    { label: 'Formation Recognition', value: learningData.formationMastery, icon: <Eye className="size-3" /> },
    { label: 'Alignment Accuracy', value: learningData.alignmentMastery, icon: <Crosshair className="size-3" /> },
    { label: 'Assignment Accuracy', value: learningData.assignmentMastery, icon: <Target className="size-3" /> },
    { label: 'Defensive Recognition', value: learningData.recognitionMastery, icon: <Shield className="size-3" /> },
    { label: 'Adjustment Accuracy', value: learningData.adjustmentMastery, icon: <Zap className="size-3" /> },
    { label: 'Recall Accuracy', value: learningData.recallMastery, icon: <Brain className="size-3" /> },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className="size-3.5 rotate-180" />
        Back to roster
      </button>

      {/* Player header */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="size-16 rounded-full helmet-gradient flex items-center justify-center text-xl font-bold text-primary-foreground shadow-lg shrink-0">
            {player.jersey}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{player.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="font-mono text-xs">{player.position}</Badge>
              {statusBadge(learningData.status)}
            </div>
            {player.notes && <p className="text-xs text-muted-foreground mt-2">{player.notes}</p>}
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Overall Mastery</div>
            <div className={cn('text-3xl font-bold font-mono', masteryColor(learningData.mastery))}>{learningData.mastery}%</div>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        <StatTile label="Assigned" value={learningData.assigned} icon={<Target className="size-3.5" />} />
        <StatTile label="Completed" value={learningData.completed} icon={<CheckCircle2 className="size-3.5" />} color="text-primary" />
        <StatTile label="Overdue" value={learningData.overdue} icon={<AlertTriangle className="size-3.5" />} color={learningData.overdue > 0 ? 'text-destructive' : 'text-muted-foreground'} />
        <StatTile label="Study Time" value={`${learningData.studyMinutes}m`} icon={<Clock className="size-3.5" />} />
        <StatTile label="Streak" value={`${learningData.streakDays}d`} icon={<Flame className="size-3.5" />} color="text-accent" />
        <StatTile label="Last Active" value={formatLastActive(learningData.lastActiveHours)} icon={<Activity className="size-3.5" />} />
      </div>

      {/* Mastery breakdown */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Multidimensional Mastery Breakdown
          </h3>
        </div>
        <div className="space-y-3">
          {masteryBreakdown.map((m, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  <span className={masteryColor(m.value)}>{m.icon}</span>
                  {m.label}
                </span>
                <span className={cn('text-xs font-mono font-bold', masteryColor(m.value))}>{m.value}%</span>
              </div>
              <Progress value={m.value} className="h-1.5" />
            </div>
          ))}
        </div>
      </Card>

      {/* Activity history (simulated) */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="size-4 text-chart-5" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Recent Activity
          </h3>
        </div>
        <div className="space-y-1.5">
          {[
            { time: '8:41 PM', action: 'Opened Counter GT lesson', icon: <Eye className="size-3 text-primary" /> },
            { time: '8:43 PM', action: 'Watched animation — 100% complete', icon: <CheckCircle2 className="size-3 text-primary" /> },
            { time: '8:46 PM', action: 'Alignment challenge — Incorrect', icon: <AlertCircle className="size-3 text-destructive" /> },
            { time: '8:47 PM', action: 'Alignment challenge — Correct', icon: <CheckCircle2 className="size-3 text-primary" /> },
            { time: '8:50 PM', action: 'Quiz attempt — Score: 70%', icon: <Brain className="size-3 text-chart-3" /> },
            { time: '8:54 PM', action: 'Recall attempt — Failed', icon: <AlertCircle className="size-3 text-destructive" /> },
            { time: '8:57 PM', action: 'Recall attempt — Passed', icon: <CheckCircle2 className="size-3 text-primary" /> },
          ].map((event, i) => (
            <div key={i} className="flex items-center gap-3 text-xs py-1 border-l-2 border-border pl-3 hover:border-primary/30 transition-colors">
              <span className="font-mono text-muted-foreground w-16 shrink-0">{event.time}</span>
              {event.icon}
              <span className="text-foreground">{event.action}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Coach actions */}
      <Card className="p-4 border-l-4 border-l-accent bg-accent/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Coach Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Bell className="size-3 mr-1.5" />
            Send Reminder
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Target className="size-3 mr-1.5" />
            Assign Review
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Mail className="size-3 mr-1.5" />
            Add Note
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

function AccountabilityMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<AccData>
    },
    staleTime: 60_000,
  })

  const players = data?.team?.players ?? []
  const [selectedPlayer, setSelectedPlayer] = React.useState<AccPlayer | null>(null)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'ready' | 'review' | 'not_ready'>('all')

  // Generate learning data for all players
  const playerData = React.useMemo(() => {
    return players.map((p) => ({
      player: p,
      learning: generateLearningData(p),
    }))
  }, [players])

  // Compute team stats
  const teamStats = React.useMemo(() => {
    if (playerData.length === 0) return { ready: 0, review: 0, notReady: 0, avgMastery: 0, totalOverdue: 0, avgStudy: 0, readiness: 0 }
    const ready = playerData.filter((p) => p.learning.status === 'ready').length
    const review = playerData.filter((p) => p.learning.status === 'review').length
    const notReady = playerData.filter((p) => p.learning.status === 'not_ready').length
    const avgMastery = Math.round(playerData.reduce((a, p) => a + p.learning.mastery, 0) / playerData.length)
    const totalOverdue = playerData.reduce((a, p) => a + p.learning.overdue, 0)
    const avgStudy = Math.round(playerData.reduce((a, p) => a + p.learning.studyMinutes, 0) / playerData.length)
    const readiness = Math.round((ready / playerData.length) * 100)
    return { ready, review, notReady, avgMastery, totalOverdue, avgStudy, readiness }
  }, [playerData])

  // Position group mastery
  const positionGroups = React.useMemo(() => {
    const groups = new Map<string, { count: number; totalMastery: number }>()
    for (const pd of playerData) {
      const room = pd.player.position.toUpperCase()
      const key = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB'].includes(room) ? room : 'OTHER'
      const entry = groups.get(key) ?? { count: 0, totalMastery: 0 }
      entry.count++
      entry.totalMastery += pd.learning.mastery
      groups.set(key, entry)
    }
    return Array.from(groups.entries())
      .map(([pos, v]) => ({ position: pos, mastery: Math.round(v.totalMastery / v.count), count: v.count }))
      .sort((a, b) => b.mastery - a.mastery)
  }, [playerData])

  // Intervention queue — players needing attention
  const interventionQueue = React.useMemo(() => {
    return playerData
      .filter((p) => p.learning.status !== 'ready' || p.learning.overdue > 0)
      .sort((a, b) => {
        // Sort by overdue first, then by lowest mastery
        if (b.learning.overdue !== a.learning.overdue) return b.learning.overdue - a.learning.overdue
        return a.learning.mastery - b.learning.mastery
      })
      .slice(0, 6)
  }, [playerData])

  // Filtered players for the grid
  const filtered = React.useMemo(() => {
    return playerData.filter((pd) => {
      if (statusFilter !== 'all' && pd.learning.status !== statusFilter) return false
      if (search) {
        const s = search.toLowerCase()
        return pd.player.name.toLowerCase().includes(s) || pd.player.position.toLowerCase().includes(s) || String(pd.player.jersey).includes(s)
      }
      return true
    })
  }, [playerData, statusFilter, search])

  if (selectedPlayer) {
    return (
      <PlayerProfile
        player={selectedPlayer}
        learningData={generateLearningData(selectedPlayer)}
        onBack={() => setSelectedPlayer(null)}
      />
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
              AccountabilityIQ™ · Player Accountability Center
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Who Studied? What Did They Learn?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {players.length} players · {teamStats.ready} ready · {teamStats.review} need review · {teamStats.notReady} not ready · {teamStats.totalOverdue} overdue items · {teamStats.avgStudy}m avg study time
            </p>
          </div>
        </div>
      </div>

      {/* Team Readiness Score */}
      <Card className="p-4 border-l-4 border-l-primary bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="size-8 text-primary" />
            <div>
              <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Team Readiness Score</div>
              <div className="text-3xl font-bold font-mono text-primary">{teamStats.readiness}<span className="text-lg text-muted-foreground">/100</span></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {positionGroups.map((pg) => (
              <div key={pg.position} className="text-center">
                <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">{pg.position}</div>
                <div className={cn('text-lg font-bold font-mono', masteryColor(pg.mastery))}>{pg.mastery}%</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <StatTile label="Team Mastery" value={`${teamStats.avgMastery}%`} icon={<TrendingUp className="size-3.5" />} color={masteryColor(teamStats.avgMastery)} />
        <StatTile label="Players Ready" value={`${teamStats.ready}/${players.length}`} icon={<CheckCircle2 className="size-3.5" />} color="text-primary" />
        <StatTile label="Needs Review" value={teamStats.review} icon={<Eye className="size-3.5" />} color="text-chart-3" />
        <StatTile label="Not Ready" value={teamStats.notReady} icon={<AlertTriangle className="size-3.5" />} color="text-destructive" />
        <StatTile label="Overdue Items" value={teamStats.totalOverdue} icon={<Clock className="size-3.5" />} color={teamStats.totalOverdue > 0 ? 'text-destructive' : 'text-muted-foreground'} />
      </div>

      {/* Intervention Center */}
      {interventionQueue.length > 0 && (
        <Card className="p-4 border-l-4 border-l-accent bg-accent/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Players Needing Attention ({interventionQueue.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {interventionQueue.map((pd) => (
              <div
                key={pd.player.id}
                className="flex items-center gap-3 rounded-md border border-border bg-background/40 p-2.5 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedPlayer(pd.player)}
              >
                <div className="size-7 rounded-full helmet-gradient flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                  {pd.player.jersey}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold">{pd.player.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono ml-2">#{pd.player.jersey} · {pd.player.position}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {pd.learning.overdue > 0
                    ? `${pd.learning.overdue} overdue`
                    : `Mastery ${pd.learning.mastery}%`}
                </span>
                {statusBadge(pd.learning.status)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Player Progress Grid */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Player Progress Grid
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['all', 'ready', 'review', 'not_ready'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded border font-mono uppercase tracking-wider transition-all',
                    statusFilter === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  )}
                >
                  {s === 'not_ready' ? 'Not Ready' : s}
                </button>
              ))}
            </div>
            <div className="relative w-40">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="h-7 pl-7 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Grid header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground border-b border-border">
          <div className="col-span-3">Player</div>
          <div className="col-span-1 text-center">Asgn</div>
          <div className="col-span-1 text-center">Done</div>
          <div className="col-span-1 text-center">Over</div>
          <div className="col-span-2">Mastery</div>
          <div className="col-span-2 text-center">Last Active</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {/* Grid rows */}
        <div className="space-y-1 mt-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No players match the current filter.</div>
          ) : (
            filtered.map((pd) => (
              <PlayerRow
                key={pd.player.id}
                player={pd.player}
                learningData={pd.learning}
                onClick={() => setSelectedPlayer(pd.player)}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export default function AccountabilityIQ() {
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
      <AccountabilityMain />
    </QueryClientProvider>
  )
}
