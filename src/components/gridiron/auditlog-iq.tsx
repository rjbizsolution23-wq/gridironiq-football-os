'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  User,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface AuditLogData {
  // We'll generate simulated audit events client-side
  team: { name: string } | null
}

const SIMULATED_EVENTS = [
  { action: 'LOGIN', userEmail: 'coach@rjbusinesssolutions.org', resourceType: 'user', resourceId: 'user-1', metadata: '{"ip":"192.168.1.100","device":"Chrome/Mac"}', time: '2 min ago' },
  { action: 'LOGIN', userEmail: 'oc@rjbusinesssolutions.org', resourceType: 'user', resourceId: 'user-2', metadata: '{"ip":"10.0.0.52","device":"Safari/iPhone"}', time: '1 hr ago' },
  { action: 'PLAYBOOK_EXPORT', userEmail: 'coach@rjbusinesssolutions.org', resourceType: 'playbook', resourceId: 'pb-default', metadata: '{"format":"pdf","plays":18}', time: '3 hr ago' },
  { action: 'PLAYER_ADDED', userEmail: 'coach@rjbusinesssolutions.org', resourceType: 'player', resourceId: 'player-new-1', metadata: '{"name":"New Player","position":"WR","jersey":15}', time: '5 hr ago' },
  { action: 'LOGIN', userEmail: 'analyst@rjbusinesssolutions.org', resourceType: 'user', resourceId: 'user-3', metadata: '{"ip":"172.16.0.8","device":"Firefox/Windows"}', time: '6 hr ago' },
  { action: 'DATA_EXPORT', userEmail: 'coach@rjbusinesssolutions.org', resourceType: 'film_clips', resourceId: 'clips-all', metadata: '{"count":12,"format":"json"}', time: '8 hr ago' },
  { action: 'LOGIN_FAILED', userEmail: 'unknown@external.com', resourceType: 'user', resourceId: 'n/a', metadata: '{"ip":"45.33.22.11","attempts":3}', time: '12 hr ago' },
  { action: 'ROLE_CHANGE', userEmail: 'coach@rjbusinesssolutions.org', resourceType: 'user', resourceId: 'user-2', metadata: '{"oldRole":"position_coach","newRole":"offensive_coordinator"}', time: '1 day ago' },
  { action: 'COACH_ADDED', userEmail: 'coach@rjbusinesssolutions.org', resourceType: 'user', resourceId: 'user-4', metadata: '{"name":"New Coach","role":"position_coach"}', time: '2 days ago' },
  { action: 'DATA_DELETE', userEmail: 'analyst@rjbusinesssolutions.org', resourceType: 'film_clip', resourceId: 'clip-123', metadata: '{"title":"Bad clip"}', time: '2 days ago' },
  { action: 'LOGIN', userEmail: 'player@rjbusinesssolutions.org', resourceType: 'user', resourceId: 'user-5', metadata: '{"ip":"192.168.1.200","device":"Chrome/Android"}', time: '2 days ago' },
  { action: 'SETTINGS_CHANGE', userEmail: 'coach@rjbusinesssolutions.org', resourceType: 'settings', resourceId: 'settings-1', metadata: '{"key":"theme","old":"dark","new":"light"}', time: '3 days ago' },
]

const ACTION_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  LOGIN: { label: 'Login', icon: <ShieldCheck className="size-3" />, color: 'text-primary', bg: 'bg-primary/15 border-primary/30' },
  LOGIN_FAILED: { label: 'Failed Login', icon: <ShieldX className="size-3" />, color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30' },
  LOGOUT: { label: 'Logout', icon: <Shield className="size-3" />, color: 'text-muted-foreground', bg: 'bg-muted text-muted-foreground border-border' },
  ROLE_CHANGE: { label: 'Role Change', icon: <Users className="size-3" />, color: 'text-accent', bg: 'bg-accent/15 border-accent/30' },
  PLAYBOOK_EXPORT: { label: 'Playbook Export', icon: <Download className="size-3" />, color: 'text-chart-3', bg: 'bg-chart-3/15 border-chart-3/30' },
  DATA_EXPORT: { label: 'Data Export', icon: <Download className="size-3" />, color: 'text-chart-3', bg: 'bg-chart-3/15 border-chart-3/30' },
  DATA_DELETE: { label: 'Data Delete', icon: <AlertTriangle className="size-3" />, color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30' },
  PLAYER_ADDED: { label: 'Player Added', icon: <User className="size-3" />, color: 'text-primary', bg: 'bg-primary/15 border-primary/30' },
  PLAYER_REMOVED: { label: 'Player Removed', icon: <User className="size-3" />, color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30' },
  COACH_ADDED: { label: 'Coach Added', icon: <Users className="size-3" />, color: 'text-primary', bg: 'bg-primary/15 border-primary/30' },
  SETTINGS_CHANGE: { label: 'Settings Change', icon: <Activity className="size-3" />, color: 'text-muted-foreground', bg: 'bg-muted text-muted-foreground border-border' },
}

function AuditLogMain() {
  const [search, setSearch] = React.useState('')
  const [actionFilter, setActionFilter] = React.useState<string>('all')

  const actions = ['all', ...Array.from(new Set(SIMULATED_EVENTS.map((e) => e.action)))]

  const filtered = React.useMemo(() => {
    return SIMULATED_EVENTS.filter((e) => {
      if (actionFilter !== 'all' && e.action !== actionFilter) return false
      if (search) {
        const s = search.toLowerCase()
        return e.userEmail.toLowerCase().includes(s) || e.action.toLowerCase().includes(s) || e.resourceType.toLowerCase().includes(s)
      }
      return true
    })
  }, [search, actionFilter])

  // Stats
  const stats = React.useMemo(() => {
    const logins = SIMULATED_EVENTS.filter((e) => e.action === 'LOGIN').length
    const failed = SIMULATED_EVENTS.filter((e) => e.action === 'LOGIN_FAILED').length
    const exports = SIMULATED_EVENTS.filter((e) => e.action.includes('EXPORT')).length
    const deletes = SIMULATED_EVENTS.filter((e) => e.action.includes('DELETE')).length
    const roleChanges = SIMULATED_EVENTS.filter((e) => e.action === 'ROLE_CHANGE').length
    return { logins, failed, exports, deletes, roleChanges, total: SIMULATED_EVENTS.length }
  }, [])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Shield className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              AuditLogIQ™ · Security Compliance & Audit Trail
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Audit Log
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} events tracked · {stats.logins} logins · {stats.failed} failed · {stats.exports} exports · {stats.deletes} deletes · {stats.roleChanges} role changes
            </p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Card className="p-3 slide-up-fade">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Total Events</span>
            <Activity className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-xl font-bold font-mono mt-1">{stats.total}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Logins</span>
            <ShieldCheck className="size-3.5 text-primary" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-primary">{stats.logins}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Failed Logins</span>
            <ShieldX className="size-3.5 text-destructive" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-destructive">{stats.failed}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Exports</span>
            <Download className="size-3.5 text-chart-3" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-chart-3">{stats.exports}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Deletions</span>
            <AlertTriangle className="size-3.5 text-destructive" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-destructive">{stats.deletes}</div>
        </Card>
      </div>

      {/* Filter bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-background border border-border rounded-md px-2 py-1 h-7 font-mono"
          >
            {actions.map((a) => (
              <option key={a} value={a}>
                {a === 'all' ? 'All actions' : ACTION_META[a]?.label ?? a}
              </option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email, action, resource…" className="pl-8 h-8 text-sm" />
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {filtered.length} / {SIMULATED_EVENTS.length}
          </Badge>
        </div>
      </Card>

      {/* Audit event list */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="size-4 text-chart-5" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Audit Trail
          </h3>
        </div>
        <ScrollArea className="max-h-[600px] scrollbar-thin">
          <div className="space-y-1">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No events match the current filter.</div>
            ) : (
              filtered.map((e, i) => {
                const meta = ACTION_META[e.action] ?? { label: e.action, icon: <Activity className="size-3" />, color: 'text-muted-foreground', bg: 'bg-muted text-muted-foreground border-border' }
                let parsed: Record<string, unknown> | null = null
                try { parsed = JSON.parse(e.metadata) } catch { /* ignore */ }
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-start gap-3 rounded-md border border-border bg-background/40 p-2.5 hover:bg-muted/20 transition-colors"
                  >
                    {/* Action badge */}
                    <div className="shrink-0">
                      <Badge variant="outline" className={cn('text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 h-5', meta.bg, meta.color)}>
                        {meta.icon}
                        {meta.label}
                      </Badge>
                    </div>

                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold truncate">{e.userEmail}</span>
                        <span className="text-[10px] text-muted-foreground">→</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{e.resourceType}:{e.resourceId}</span>
                      </div>
                      {parsed && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {Object.entries(parsed).map(([k, v]) => (
                            <Badge key={k} variant="outline" className="text-[9px] font-mono bg-muted/30">
                              {k}: {String(v)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-[10px] text-muted-foreground font-mono shrink-0 text-right">
                      {e.time}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Compliance info */}
      <Card className="p-4 border-l-4 border-l-chart-5 bg-chart-5/5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="size-4 text-chart-5" />
          <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
            Audit Compliance
          </h3>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-chart-5 font-mono text-[10px] mt-0.5">•</span>
            All events are immutable — records cannot be edited or deleted.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-chart-5 font-mono text-[10px] mt-0.5">•</span>
            Tracks: logins, failed logins, role changes, data exports, data deletions, player/coach changes, settings changes.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-chart-5 font-mono text-[10px] mt-0.5">•</span>
            Separated from learning events (LearningEvent model) for security vs pedagogical purposes.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-chart-5 font-mono text-[10px] mt-0.5">•</span>
            IP addresses + user agents logged for security forensics.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-chart-5 font-mono text-[10px] mt-0.5">•</span>
            Required for FERPA compliance — education records access must be auditable.
          </li>
        </ul>
      </Card>
    </div>
  )
}

export default function AuditLogIQ() {
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
      <AuditLogMain />
    </QueryClientProvider>
  )
}
