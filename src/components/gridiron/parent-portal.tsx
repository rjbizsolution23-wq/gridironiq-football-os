'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Heart,
  Lock,
  Mail,
  Shield,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ParentData {
  team: {
    name: string
    players: Array<{
      id: string
      jersey: number
      name: string
      position: string
      group: string
      quizScore: number | null
      notes: string | null
    }>
  } | null
}

const SIMULATED_ASSIGNMENTS = [
  { title: 'Week 5 Install — Gun Trips RPO', dueDate: 'Wed Oct 14, 8:00 PM', status: 'in_progress', progress: 60, items: ['Watch animation (100%)', 'Quiz: 85%', 'Recall: Pending'] },
  { title: 'Inside Zone — Alignment Practice', dueDate: 'Thu Oct 15, 8:00 PM', status: 'not_started', progress: 0, items: ['Not yet opened'] },
  { title: 'Cover 3 Recognition', dueDate: 'Fri Oct 16, 8:00 PM', status: 'completed', progress: 100, items: ['Watched (100%)', 'Quiz: 92%', 'Recall: Passed'] },
  { title: 'Counter GT — Assignment Review', dueDate: 'Mon Oct 19, 8:00 PM', status: 'completed', progress: 100, items: ['Watched (100%)', 'Quiz: 88%', 'Recall: Passed'] },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  completed: { label: 'Completed', color: 'text-primary', bg: 'bg-primary/15 border-primary/30', icon: <CheckCircle2 className="size-3" /> },
  in_progress: { label: 'In Progress', color: 'text-chart-3', bg: 'bg-chart-3/15 border-chart-3/30', icon: <Clock className="size-3" /> },
  not_started: { label: 'Not Started', color: 'text-muted-foreground', bg: 'bg-muted text-muted-foreground border-border', icon: <Eye className="size-3" /> },
  overdue: { label: 'Overdue', color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30', icon: <Clock className="size-3" /> },
}

function ParentPortalMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<ParentData>
    },
    staleTime: 60_000,
  })

  const players = data?.team?.players ?? []
  // Pick the first player as the "child" (in production this would be determined by the parent_guardian user's linked player)
  const child = players[0] ?? null

  if (!child) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Users className="size-10 opacity-50" />
      </div>
    )
  }

  const mastery = Math.round((child.quizScore ?? 0) * 100)
  const completed = SIMULATED_ASSIGNMENTS.filter((a) => a.status === 'completed').length
  const inProgress = SIMULATED_ASSIGNMENTS.filter((a) => a.status === 'in_progress').length
  const notStarted = SIMULATED_ASSIGNMENTS.filter((a) => a.status === 'not_started').length
  const overallProgress = Math.round(SIMULATED_ASSIGNMENTS.reduce((a, a2) => a + a2.progress, 0) / SIMULATED_ASSIGNMENTS.length)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Heart className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Parent/Guardian Portal · Limited Access View
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              {child.name}'s Progress
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              #{child.jersey} · {child.position} · {data?.team?.name ?? 'Team'}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <Card className="p-3 border-l-4 border-l-chart-5 bg-chart-5/5">
        <div className="flex items-start gap-2">
          <Lock className="size-3.5 text-chart-5 mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            This is a <strong>limited-access parent/guardian view</strong>. You can see assigned work,
            completion status, and general progress. You cannot see: depth chart, internal evaluations,
            opponent scouting, private coach notes, or team strategy.
          </p>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3 slide-up-fade">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Overall Progress</span>
            <TrendingUp className="size-3.5 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-primary">{overallProgress}%</div>
          <Progress value={overallProgress} className="h-1 mt-1.5" />
        </Card>
        <Card className="p-3 slide-up-fade stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Completed</span>
            <CheckCircle2 className="size-3.5 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-primary">{completed}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">In Progress</span>
            <Clock className="size-3.5 text-chart-3" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-chart-3">{inProgress}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Not Started</span>
            <Eye className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-muted-foreground">{notStarted}</div>
        </Card>
      </div>

      {/* Assignments */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Assignments & Deadlines
          </h3>
        </div>
        <div className="space-y-3">
          {SIMULATED_ASSIGNMENTS.map((a, i) => {
            const meta = STATUS_META[a.status] ?? STATUS_META.not_started
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-border bg-background/40 p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-semibold">{a.title}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Due: {a.dueDate}</div>
                  </div>
                  <Badge variant="outline" className={cn('text-[9px] font-mono uppercase tracking-wider', meta.bg, meta.color)}>
                    {meta.icon}
                    {meta.label}
                  </Badge>
                </div>
                <Progress value={a.progress} className="h-1.5 mb-2" />
                <div className="flex flex-wrap gap-1.5">
                  {a.items.map((item, j) => (
                    <Badge key={j} variant="outline" className="text-[9px] font-mono bg-muted/30">
                      {item}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>

      {/* General mastery */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            General Mastery
          </h3>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Overall mastery score</span>
          <span className={cn('text-2xl font-bold font-mono', mastery >= 90 ? 'text-primary' : mastery >= 75 ? 'text-chart-3' : 'text-accent')}>
            {mastery}%
          </span>
        </div>
        <Progress value={mastery} className="h-2 mb-3" />
        <p className="text-[11px] text-muted-foreground">
          Note: Detailed mastery breakdown by dimension (formation, alignment, assignment, etc.) is only visible to coaching staff.
        </p>
      </Card>

      {/* Contact coach */}
      <Card className="p-4 border-l-4 border-l-accent bg-accent/5">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="size-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Need to Contact the Coach?
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          If you have questions about your child's assignments, progress, or deadlines, please reach out to the coaching staff directly. They can provide more context than what's shown here.
        </p>
        <div className="flex items-center gap-2 text-xs">
          <Shield className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Coach contact information is available through the school athletic department.</span>
        </div>
      </Card>
    </div>
  )
}

export default function ParentPortal() {
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
      <ParentPortalMain />
    </QueryClientProvider>
  )
}
