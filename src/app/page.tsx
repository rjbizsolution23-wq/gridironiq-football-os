'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import {
  Activity,
  Brain,
  CalendarClock,
  ClipboardList,
  Clapperboard,
  Clock,
  Crosshair,
  Dumbbell,
  Eye,
  FlaskConical,
  Flame,
  Gamepad2,
  GraduationCap,
  Layers,
  LayoutDashboard,
  ListChecks,
  Menu,
  PlayCircle,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Watch,
  X,
  Zap,
} from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAppStore, type ModuleId } from '@/lib/store'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import {
  CommandPalette,
  useCommandPaletteShortcut,
} from '@/components/gridiron/command-palette'
import { UserMenu } from '@/components/auth/user-menu'

// Lazy-load modules so each module's React Query provider doesn't initialize
// until the user opens it. Keeps initial bundle smaller + avoids hydration mismatches.
const Dashboard = dynamic(() => import('@/components/gridiron/dashboard'))
const PlaybookIQ = dynamic(() => import('@/components/gridiron/playbook-iq'))
const PlayDesigner = dynamic(() => import('@/components/gridiron/play-designer'))
const ScoutIQ = dynamic(() => import('@/components/gridiron/scout-iq'))
const GamePlanIQ = dynamic(() => import('@/components/gridiron/gameplan-iq'))
const CallSheetIQ = dynamic(() => import('@/components/gridiron/callsheet-iq'))
const AnalyticsIQ = dynamic(() => import('@/components/gridiron/analytics-iq'))
const CoachAI = dynamic(() => import('@/components/gridiron/coach-ai'))
const InstallIQ = dynamic(() => import('@/components/gridiron/install-iq'))
const PlayerQuiz = dynamic(() => import('@/components/gridiron/player-quiz'))
const WristbandIQ = dynamic(() => import('@/components/gridiron/wristband-iq'))
const PracticeIQ = dynamic(() => import('@/components/gridiron/practice-iq'))
const PersonnelIQ = dynamic(() => import('@/components/gridiron/personnel-iq'))
const TwoMinuteIQ = dynamic(() => import('@/components/gridiron/two-minute-iq'))
const FilmIQ = dynamic(() => import('@/components/gridiron/film-iq'))
const RedZoneIQ = dynamic(() => import('@/components/gridiron/redzone-iq'))
const SituationalIQ = dynamic(() => import('@/components/gridiron/situational-iq'))
const TendencyLab = dynamic(() => import('@/components/gridiron/tendency-lab'))
const MatchupIQ = dynamic(() => import('@/components/gridiron/matchup-iq'))
const DrillBuilder = dynamic(() => import('@/components/gridiron/drill-builder'))
const DepthChartIQ = dynamic(() => import('@/components/gridiron/depthchart-iq'))
const SelfScoutIQ = dynamic(() => import('@/components/gridiron/selfscout-iq'))
const WeekPlanIQ = dynamic(() => import('@/components/gridiron/weekplan-iq'))
const SettingsIQ = dynamic(() => import('@/components/gridiron/settings-iq'))

interface NavItem {
  id: ModuleId
  label: string
  short: string
  icon: React.ReactNode
  group: 'intelligence' | 'planning' | 'operation'
  badge?: string
}

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Command Center', short: 'Home', icon: <LayoutDashboard className="size-4" />, group: 'intelligence' },
  { id: 'playbook', label: 'PlaybookIQ', short: 'Playbook', icon: <PlayCircle className="size-4" />, group: 'intelligence' },
  { id: 'designer', label: 'Formation Lab', short: 'Designer', icon: <Crosshair className="size-4" />, group: 'intelligence' },
  { id: 'scout', label: 'ScoutIQ', short: 'Scout', icon: <Shield className="size-4" />, group: 'intelligence' },
  { id: 'coach-ai', label: 'Coach AI', short: 'Coach', icon: <Brain className="size-4" />, group: 'intelligence' },
  { id: 'tendencylab', label: 'TendencyLab', short: 'Tendency Lab', icon: <FlaskConical className="size-4" />, group: 'intelligence', badge: 'NEW' },
  { id: 'situational', label: 'SituationalIQ', short: 'Situational', icon: <Crosshair className="size-4" />, group: 'intelligence', badge: 'NEW' },
  { id: 'selfscout', label: 'SelfScoutIQ', short: 'Self-Scout', icon: <Eye className="size-4" />, group: 'intelligence', badge: 'NEW' },
  { id: 'depthchart', label: 'DepthChartIQ', short: 'Depth Chart', icon: <Layers className="size-4" />, group: 'intelligence', badge: 'NEW' },
  { id: 'gameplan', label: 'GamePlanIQ', short: 'Game Plan', icon: <Target className="size-4" />, group: 'planning' },
  { id: 'callsheet', label: 'CallSheetIQ', short: 'Call Sheet', icon: <ListChecks className="size-4" />, group: 'planning' },
  { id: 'wristband', label: 'WristbandIQ', short: 'Wristband', icon: <Watch className="size-4" />, group: 'planning', badge: 'NEW' },
  { id: 'practice', label: 'PracticeIQ', short: 'Practice', icon: <CalendarClock className="size-4" />, group: 'planning', badge: 'NEW' },
  { id: 'analytics', label: 'AnalyticsIQ', short: 'Analytics', icon: <TrendingUp className="size-4" />, group: 'planning' },
  { id: 'redzone', label: 'RedZoneIQ', short: 'Red Zone', icon: <Flame className="size-4" />, group: 'planning', badge: 'NEW' },
  { id: 'film', label: 'FilmIQ', short: 'Film', icon: <Clapperboard className="size-4" />, group: 'planning', badge: 'NEW' },
  { id: 'matchup', label: 'MatchupIQ', short: 'Matchup', icon: <Gamepad2 className="size-4" />, group: 'planning', badge: 'NEW' },
  { id: 'weekplan', label: 'WeekPlanIQ', short: 'Week Plan', icon: <CalendarClock className="size-4" />, group: 'planning', badge: 'NEW' },
  { id: 'install', label: 'InstallIQ', short: 'Install', icon: <GraduationCap className="size-4" />, group: 'operation' },
  { id: 'personnel', label: 'PersonnelIQ', short: 'Personnel', icon: <Users className="size-4" />, group: 'operation', badge: 'NEW' },
  { id: 'quiz', label: 'PlayerQuiz', short: 'Quiz', icon: <Sparkles className="size-4" />, group: 'operation', badge: 'NEW' },
  { id: 'twominute', label: 'TwoMinuteIQ', short: '2-Min Drill', icon: <Clock className="size-4" />, group: 'operation', badge: 'NEW' },
  { id: 'drills', label: 'DrillBuilder', short: 'Drills', icon: <Dumbbell className="size-4" />, group: 'operation', badge: 'NEW' },
  { id: 'settings', label: 'SettingsIQ', short: 'Settings', icon: <Settings className="size-4" />, group: 'operation' },
]

const GROUP_LABELS: Record<NavItem['group'], string> = {
  intelligence: 'Intelligence',
  planning: 'Planning',
  operation: 'Operation',
}

function SidebarContent() {
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

  const groups = React.useMemo(() => {
    const m = new Map<NavItem['group'], NavItem[]>()
    for (const item of NAV) {
      const list = m.get(item.group) ?? []
      list.push(item)
      m.set(item.group, list)
    }
    return m
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
        <div className="relative size-9 rounded-md helmet-gradient flex items-center justify-center shadow-md">
          <Activity className="size-5 text-primary-foreground" />
          <div className="absolute -bottom-1 -right-1 size-3 rounded-full bg-accent border-2 border-sidebar" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold tracking-tight leading-none">
            GridironIQ
            <span className="text-primary">™</span>
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            Football Intelligence OS
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-4">
        {Array.from(groups.entries()).map(([group, items]) => (
          <div key={group}>
            <div className="px-2 mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/70 font-mono">
              {GROUP_LABELS[group]}
            </div>
            <div className="space-y-0.5">
              {items.map((item) => {
                const active = activeModule === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id)
                      setSidebarOpen(false)
                    }}
                    className={cn(
                      'group w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all text-left relative',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5'
                    )}
                  >
                    <span
                      className={cn(
                        active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm',
                          active
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-accent/20 text-accent border border-accent/30'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {active && !item.badge && (
                      <span className="size-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer of sidebar */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
          <span className="size-1.5 rounded-full bg-primary animate-pulse-soft" />
          v1.0 · LIVE
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground/70">
          Build the system. Teach the system. Scout the opponent. Attack the weakness.
        </div>
      </div>
    </div>
  )
}

function ModuleRouter() {
  const activeModule = useAppStore((s) => s.activeModule)
  switch (activeModule) {
    case 'dashboard':
      return <Dashboard />
    case 'playbook':
      return <PlaybookIQ />
    case 'designer':
      return <PlayDesigner />
    case 'scout':
      return <ScoutIQ />
    case 'gameplan':
      return <GamePlanIQ />
    case 'callsheet':
      return <CallSheetIQ />
    case 'wristband':
      return <WristbandIQ />
    case 'practice':
      return <PracticeIQ />
    case 'analytics':
      return <AnalyticsIQ />
    case 'coach-ai':
      return <CoachAI />
    case 'install':
      return <InstallIQ />
    case 'personnel':
      return <PersonnelIQ />
    case 'quiz':
      return <PlayerQuiz />
    case 'twominute':
      return <TwoMinuteIQ />
    case 'film':
      return <FilmIQ />
    case 'redzone':
      return <RedZoneIQ />
    case 'situational':
      return <SituationalIQ />
    case 'tendencylab':
      return <TendencyLab />
    case 'matchup':
      return <MatchupIQ />
    case 'drills':
      return <DrillBuilder />
    case 'depthchart':
      return <DepthChartIQ />
    case 'selfscout':
      return <SelfScoutIQ />
    case 'weekplan':
      return <WeekPlanIQ />
    case 'settings':
      return <SettingsIQ />
    default:
      return <Dashboard />
  }
}

function AnimatedModuleRouter() {
  const activeModule = useAppStore((s) => s.activeModule)
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeModule}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <ModuleRouter />
      </motion.div>
    </AnimatePresence>
  )
}

function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const activeModule = useAppStore((s) => s.activeModule)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

  const current = NAV.find((n) => n.id === activeModule)
  const breadcrumb = current ? current.label : 'Command Center'

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md print:hidden">
      <div className="flex h-14 items-center gap-3 px-3 md:px-6">
        {/* Mobile sidebar toggle */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
            GridironIQ
          </span>
          <span className="text-muted-foreground/40 text-xs hidden sm:inline">/</span>
          <span className="text-sm font-semibold truncate">{breadcrumb}</span>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Command palette trigger */}
          <button
            onClick={onOpenPalette}
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-muted/30 hover:bg-muted hover:border-primary/40 transition-colors text-xs text-muted-foreground"
            title="Open command palette (⌘K)"
          >
            <Search className="size-3.5" />
            <span className="hidden lg:inline">Search…</span>
            <kbd className="px-1 py-0.5 rounded border border-border bg-background text-[9px] font-mono">⌘K</kbd>
          </button>
          <Badge
            variant="outline"
            className="hidden md:inline-flex text-[10px] font-mono bg-primary/10 text-primary border-primary/30"
          >
            <span className="size-1.5 rounded-full bg-primary mr-1.5 animate-pulse-soft" />
            SEASON ACTIVE
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => useAppStore.getState().setActiveModule('coach-ai')}
          >
            <Brain className="size-3.5 mr-1.5" />
            <span className="hidden sm:inline">Ask Coach AI</span>
          </Button>
          <UserMenu />
        </div>
      </div>
      <Separator className="chalk-divider" />
    </header>
  )
}

export default function Home() {
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  useCommandPaletteShortcut(() => setPaletteOpen((o) => !o))

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Desktop sidebar (sticky) */}
      <aside className="hidden lg:flex w-64 shrink-0 fixed inset-y-0 left-0 z-30 bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Main column */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <TopBar onOpenPalette={() => setPaletteOpen(true)} />
        <main className="flex-1 px-3 md:px-6 py-4 md:py-6">
          <AnimatedModuleRouter />
        </main>

        {/* Sticky footer */}
        <footer className="mt-auto border-t border-border bg-card/40 backdrop-blur-sm">
          <div className="px-3 md:px-6 py-3 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded helmet-gradient flex items-center justify-center helmet-shine overflow-hidden">
                  <Activity className="size-3.5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-mono font-semibold leading-none">GridironIQ™</div>
                  <div className="text-[9px] text-muted-foreground/70 mt-0.5 leading-none">
                    Football Intelligence OS
                  </div>
                </div>
              </div>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono">
                <Zap className="size-3 text-accent" />
                <span className="text-accent">24 modules</span>
                <span className="opacity-30">·</span>
                <span className="text-primary">LLM-powered</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
              <button
                onClick={() => setPaletteOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                title="Open command palette (Cmd+K)"
              >
                <Search className="size-3" />
                <span>Search</span>
                <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[9px]">⌘K</kbd>
              </button>
              <span className="hidden sm:inline tracking-widest uppercase">PLAYBOOK · SCOUT · GAMEPLAN · DEVELOP</span>
              <span className="opacity-50 hidden sm:inline">·</span>
              <span className="text-primary tracking-widest uppercase">Build · Teach · Attack</span>
            </div>
          </div>
          {/* Made by RJ Business Solutions branding */}
          <div className="px-3 md:px-6 pb-3 flex items-center justify-center gap-2 text-[11px] border-t border-border/50 pt-2.5">
            <span className="text-muted-foreground">Made by</span>
            <a
              href="https://rjbusinesssolutions.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:text-accent transition-colors inline-flex items-center gap-1.5"
            >
              RJ Business Solutions
              <span className="text-muted-foreground font-normal">&</span>
              Rick Jefferson
            </a>
            <span className="text-muted-foreground/50">·</span>
            <a
              href="https://rjbusinesssolutions.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
            >
              rjbusinesssolutions.org
            </a>
          </div>
        </footer>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <SonnerToaster richColors position="top-right" />
    </div>
  )
}
