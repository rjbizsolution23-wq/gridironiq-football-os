'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Brain,
  CalendarClock,
  Clapperboard,
  Clock,
  Crosshair,
  Dumbbell,
  Eye,
  FlaskConical,
  Flame,
  Gamepad2,
  GraduationCap,
  History,
  Layers,
  LayoutDashboard,
  ListChecks,
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
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface PaletteItem {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  group: 'Navigate' | 'Action' | 'Recent' | 'Play' | 'Opponent' | 'Player' | 'Drill'
  keywords: string
  action: () => void
  shortcut?: string
  typeLabel?: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DataResult {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  group: 'Play' | 'Opponent' | 'Player' | 'Drill'
  typeLabel: string
  action: () => void
}

const RECENT_STORAGE_KEY = 'gridironiq:palette:recent'
const MAX_RECENT = 5

// Inline drill catalog (mirrors DrillBuilder seed)
const DRILL_CATALOG = [
  'Routes on Air — Concept Reps', 'Inside Run Period', 'Skelly 7-on-7', 'Team Period — Scripted',
  'Punt Team Operation', 'PAT / Field Goal Operation', 'Indy — QB Footwork', 'Indy — RB Press & Vision',
  'Indy — WR Stem & Top of Route', 'Indy — OL Pass Set', 'Indy — DL Get-Off & Escape',
  'Indy — LB Run Fits', 'Indy — DB Backpedal & Break', 'Red Zone 7-on-7',
]

function CommandPaletteInner({ open, onOpenChange }: CommandPaletteProps) {
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const setSelectedPlayId = useAppStore((s) => s.setSelectedPlayId)
  const setSelectedOpponentId = useAppStore((s) => s.setSelectedOpponentId)
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Recent searches (module IDs)
  const [recent, setRecent] = React.useState<string[]>([])
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_STORAGE_KEY)
      if (raw) setRecent(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  function pushRecent(id: string) {
    setRecent((prev) => {
      const next = [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT)
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  function clearRecent() {
    setRecent([])
    try {
      localStorage.removeItem(RECENT_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  // Fetch data for search (plays, opponents, players)
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<{
        plays: Array<{ id: string; playId: string; name: string; concept: string; side: string }>
        opponents: Array<{ id: string; name: string; mascot: string | null; league: string | null }>
        team: { players: Array<{ id: string; jersey: number; name: string; position: string }> } | null
      }>
    },
    enabled: open,
    staleTime: 60_000,
  })

  const navItems: PaletteItem[] = React.useMemo(() => [
    { id: 'nav-dashboard', label: 'Command Center', description: 'Dashboard overview', icon: <LayoutDashboard className="size-4" />, group: 'Navigate', keywords: 'dashboard home command center overview', action: () => { setActiveModule('dashboard'); pushRecent('nav-dashboard') } },
    { id: 'nav-playbook', label: 'PlaybookIQ', description: 'Browse installed plays & Play DNA', icon: <PlayCircle className="size-4" />, group: 'Navigate', keywords: 'playbook play dna browse', action: () => { setActiveModule('playbook'); pushRecent('nav-playbook') } },
    { id: 'nav-designer', label: 'Formation Lab', description: 'SVG play designer', icon: <Crosshair className="size-4" />, group: 'Navigate', keywords: 'formation lab designer diagram svg', action: () => { setActiveModule('designer'); pushRecent('nav-designer') } },
    { id: 'nav-scout', label: 'ScoutIQ', description: 'Opponent tendencies', icon: <Shield className="size-4" />, group: 'Navigate', keywords: 'scout opponent tendencies', action: () => { setActiveModule('scout'); pushRecent('nav-scout') } },
    { id: 'nav-coach-ai', label: 'Coach AI', description: 'LLM assistant', icon: <Brain className="size-4" />, group: 'Navigate', keywords: 'coach ai llm assistant chat', action: () => { setActiveModule('coach-ai'); pushRecent('nav-coach-ai') } },
    { id: 'nav-tendencylab', label: 'TendencyLab', description: 'Interactive tendency explorer', icon: <FlaskConical className="size-4" />, group: 'Navigate', keywords: 'tendency lab explorer charts', action: () => { setActiveModule('tendencylab'); pushRecent('nav-tendencylab') } },
    { id: 'nav-situational', label: 'SituationalIQ', description: 'Down/distance × hash × zone', icon: <Crosshair className="size-4" />, group: 'Navigate', keywords: 'situational down distance hash zone', action: () => { setActiveModule('situational'); pushRecent('nav-situational') } },
    { id: 'nav-selfscout', label: 'SelfScoutIQ', description: 'Team predictability warnings', icon: <Eye className="size-4" />, group: 'Navigate', keywords: 'self scout predictability warnings', action: () => { setActiveModule('selfscout'); pushRecent('nav-selfscout') } },
    { id: 'nav-depthchart', label: 'DepthChartIQ', description: 'Visual depth chart', icon: <Layers className="size-4" />, group: 'Navigate', keywords: 'depth chart formation alignment', action: () => { setActiveModule('depthchart'); pushRecent('nav-depthchart') } },
    { id: 'nav-gameplan', label: 'GamePlanIQ', description: 'AI opening script', icon: <Target className="size-4" />, group: 'Navigate', keywords: 'game plan opening script situation', action: () => { setActiveModule('gameplan'); pushRecent('nav-gameplan') } },
    { id: 'nav-callsheet', label: 'CallSheetIQ', description: 'Situational call sheet', icon: <ListChecks className="size-4" />, group: 'Navigate', keywords: 'call sheet situational game day', action: () => { setActiveModule('callsheet'); pushRecent('nav-callsheet') } },
    { id: 'nav-wristband', label: 'WristbandIQ', description: 'QB wristband call sheet', icon: <Watch className="size-4" />, group: 'Navigate', keywords: 'wristband qb call sheet', action: () => { setActiveModule('wristband'); pushRecent('nav-wristband') } },
    { id: 'nav-practice', label: 'PracticeIQ', description: 'Practice scripts', icon: <CalendarClock className="size-4" />, group: 'Navigate', keywords: 'practice script template', action: () => { setActiveModule('practice'); pushRecent('nav-practice') } },
    { id: 'nav-analytics', label: 'AnalyticsIQ', description: 'Postgame analytics', icon: <TrendingUp className="size-4" />, group: 'Navigate', keywords: 'analytics postgame self scout', action: () => { setActiveModule('analytics'); pushRecent('nav-analytics') } },
    { id: 'nav-redzone', label: 'RedZoneIQ', description: 'Red zone heat map', icon: <Flame className="size-4" />, group: 'Navigate', keywords: 'red zone heat map efficiency', action: () => { setActiveModule('redzone'); pushRecent('nav-redzone') } },
    { id: 'nav-film', label: 'FilmIQ', description: 'AI film tagging', icon: <Clapperboard className="size-4" />, group: 'Navigate', keywords: 'film iq tagging clips', action: () => { setActiveModule('film'); pushRecent('nav-film') } },
    { id: 'nav-matchup', label: 'MatchupIQ', description: 'AI game prediction', icon: <Gamepad2 className="size-4" />, group: 'Navigate', keywords: 'matchup prediction game score', action: () => { setActiveModule('matchup'); pushRecent('nav-matchup') } },
    { id: 'nav-weekplan', label: 'WeekPlanIQ', description: 'Weekly game-prep dashboard', icon: <CalendarClock className="size-4" />, group: 'Navigate', keywords: 'week plan timeline game prep', action: () => { setActiveModule('weekplan'); pushRecent('nav-weekplan') } },
    { id: 'nav-install', label: 'InstallIQ', description: 'Install schedule', icon: <GraduationCap className="size-4" />, group: 'Navigate', keywords: 'install schedule mastery', action: () => { setActiveModule('install'); pushRecent('nav-install') } },
    { id: 'nav-personnel', label: 'PersonnelIQ', description: 'Roster & availability', icon: <Users className="size-4" />, group: 'Navigate', keywords: 'personnel roster availability depth', action: () => { setActiveModule('personnel'); pushRecent('nav-personnel') } },
    { id: 'nav-quiz', label: 'PlayerQuiz', description: 'Playbook recall quizzes', icon: <Sparkles className="size-4" />, group: 'Navigate', keywords: 'quiz player recall test', action: () => { setActiveModule('quiz'); pushRecent('nav-quiz') } },
    { id: 'nav-twominute', label: 'TwoMinuteIQ', description: '2-min drill simulator', icon: <Clock className="size-4" />, group: 'Navigate', keywords: 'two minute drill simulator clock', action: () => { setActiveModule('twominute'); pushRecent('nav-twominute') } },
    { id: 'nav-drills', label: 'DrillBuilder', description: 'Practice drill library', icon: <Dumbbell className="size-4" />, group: 'Navigate', keywords: 'drill builder library practice', action: () => { setActiveModule('drills'); pushRecent('nav-drills') } },
    { id: 'nav-settings', label: 'SettingsIQ', description: 'App preferences', icon: <Settings className="size-4" />, group: 'Navigate', keywords: 'settings preferences theme storage', action: () => { setActiveModule('settings'); pushRecent('nav-settings') } },
  ], [setActiveModule])

  const actionItems: PaletteItem[] = React.useMemo(() => [
    { id: 'action-ask-coach', label: 'Ask Coach AI', description: 'Open Coach AI chat', icon: <Brain className="size-4" />, group: 'Action', keywords: 'ask coach ai question', action: () => setActiveModule('coach-ai'), shortcut: 'A' },
    { id: 'action-build-game-plan', label: 'Build Game Plan', description: 'Generate AI opening script', icon: <Target className="size-4" />, group: 'Action', keywords: 'build game plan opening script', action: () => setActiveModule('gameplan'), shortcut: 'G' },
    { id: 'action-predict-matchup', label: 'Predict Matchup', description: 'AI game prediction', icon: <Gamepad2 className="size-4" />, group: 'Action', keywords: 'predict matchup game score', action: () => setActiveModule('matchup'), shortcut: 'P' },
    { id: 'action-tag-film', label: 'Tag Film Clip', description: 'AI film tagging', icon: <Clapperboard className="size-4" />, group: 'Action', keywords: 'tag film clip ai', action: () => setActiveModule('film'), shortcut: 'F' },
    { id: 'action-start-quiz', label: 'Start Quiz', description: 'Test playbook knowledge', icon: <Sparkles className="size-4" />, group: 'Action', keywords: 'start quiz test playbook', action: () => setActiveModule('quiz'), shortcut: 'Q' },
    { id: 'action-2min-drill', label: '2-Minute Drill', description: 'Simulate end-of-half', icon: <Clock className="size-4" />, group: 'Action', keywords: 'two minute drill simulate', action: () => setActiveModule('twominute'), shortcut: '2' },
  ], [setActiveModule])

  // Data search results (plays, opponents, players, drills)
  const dataResults: PaletteItem[] = React.useMemo(() => {
    if (!query.trim() || !data) return []
    const q = query.toLowerCase()
    const results: PaletteItem[] = []

    // Plays
    for (const play of data.plays) {
      if (
        play.name.toLowerCase().includes(q) ||
        play.playId.toLowerCase().includes(q) ||
        play.concept.toLowerCase().includes(q)
      ) {
        results.push({
          id: `play-${play.id}`,
          label: play.name,
          description: `${play.playId} · ${play.concept.replace(/_/g, ' ')} · ${play.side}`,
          icon: <PlayCircle className="size-4" />,
          group: 'Play',
          typeLabel: 'Play',
          keywords: play.concept,
          action: () => {
            setSelectedPlayId(play.id)
            setActiveModule('playbook')
            pushRecent(`play-${play.id}`)
          },
        })
      }
      if (results.length >= 20) break
    }

    // Opponents
    for (const opp of data.opponents) {
      if (
        opp.name.toLowerCase().includes(q) ||
        (opp.mascot?.toLowerCase().includes(q) ?? false) ||
        (opp.league?.toLowerCase().includes(q) ?? false)
      ) {
        results.push({
          id: `opp-${opp.id}`,
          label: opp.name,
          description: `${opp.mascot ?? ''} · ${opp.league ?? ''}`.trim(),
          icon: <Shield className="size-4" />,
          group: 'Opponent',
          typeLabel: 'Opponent',
          keywords: opp.mascot ?? '',
          action: () => {
            setSelectedOpponentId(opp.id)
            setActiveModule('scout')
            pushRecent(`opp-${opp.id}`)
          },
        })
      }
    }

    // Players
    if (data.team?.players) {
      for (const player of data.team.players) {
        if (
          player.name.toLowerCase().includes(q) ||
          player.position.toLowerCase().includes(q) ||
          String(player.jersey).includes(q)
        ) {
          results.push({
            id: `player-${player.id}`,
            label: `${player.name} (#${player.jersey})`,
            description: `${player.position} · click to open in PersonnelIQ`,
            icon: <Users className="size-4" />,
            group: 'Player',
            typeLabel: 'Player',
            keywords: player.position,
            action: () => {
              setActiveModule('personnel')
              pushRecent(`player-${player.id}`)
            },
          })
        }
      }
    }

    // Drills
    for (const drillName of DRILL_CATALOG) {
      if (drillName.toLowerCase().includes(q)) {
        results.push({
          id: `drill-${drillName}`,
          label: drillName,
          description: 'Practice drill · click to open in DrillBuilder',
          icon: <Dumbbell className="size-4" />,
          group: 'Drill',
          typeLabel: 'Drill',
          keywords: drillName,
          action: () => {
            setActiveModule('drills')
            pushRecent(`drill-${drillName}`)
          },
        })
      }
    }

    return results.slice(0, 15)
  }, [query, data, setActiveModule, setSelectedPlayId, setSelectedOpponentId])

  // Recent items (only when query is empty)
  const recentItems: PaletteItem[] = React.useMemo(() => {
    if (query.trim() || recent.length === 0) return []
    const items: PaletteItem[] = []
    for (const rid of recent) {
      if (rid.startsWith('nav-')) {
        const found = navItems.find((n) => n.id === rid)
        if (found) items.push({ ...found, group: 'Recent' })
      } else if (rid.startsWith('action-')) {
        const found = actionItems.find((a) => a.id === rid)
        if (found) items.push({ ...found, group: 'Recent' })
      } else if (rid.startsWith('play-')) {
        const playId = rid.replace('play-', '')
        const play = data?.plays.find((p) => p.id === playId)
        if (play) {
          items.push({
            id: rid,
            label: play.name,
            description: `${play.playId} · ${play.concept.replace(/_/g, ' ')}`,
            icon: <PlayCircle className="size-4" />,
            group: 'Recent',
            typeLabel: 'Play',
            keywords: '',
            action: () => {
              setSelectedPlayId(play.id)
              setActiveModule('playbook')
            },
          })
        }
      } else if (rid.startsWith('opp-')) {
        const oppId = rid.replace('opp-', '')
        const opp = data?.opponents.find((o) => o.id === oppId)
        if (opp) {
          items.push({
            id: rid,
            label: opp.name,
            description: `${opp.mascot ?? ''} · ${opp.league ?? ''}`.trim(),
            icon: <Shield className="size-4" />,
            group: 'Recent',
            typeLabel: 'Opponent',
            keywords: '',
            action: () => {
              setSelectedOpponentId(opp.id)
              setActiveModule('scout')
            },
          })
        }
      }
    }
    return items
  }, [query, recent, navItems, actionItems, data, setActiveModule, setSelectedPlayId, setSelectedOpponentId])

  // Build the full filtered list (for keyboard navigation)
  const allFiltered = React.useMemo(() => {
    if (!query.trim()) {
      // Empty query: show recent + navigate + actions
      return [...recentItems, ...navItems, ...actionItems]
    }
    const q = query.toLowerCase()
    const navActionFiltered = [...navItems, ...actionItems].filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    )
    return [...navActionFiltered, ...dataResults]
  }, [query, recentItems, navItems, actionItems, dataResults])

  // Reset selection when query changes
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, allFiltered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = allFiltered[selectedIndex]
      if (item) {
        item.action()
        onOpenChange(false)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onOpenChange(false)
    }
  }

  // Scroll selected item into view
  React.useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.children[selectedIndex] as HTMLElement | undefined
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  function handleItemClick(item: PaletteItem) {
    item.action()
    onOpenChange(false)
  }

  // Group filtered items for rendering
  const recentGroup = allFiltered.filter((i) => i.group === 'Recent')
  const navigateGroup = allFiltered.filter((i) => i.group === 'Navigate')
  const actionGroup = allFiltered.filter((i) => i.group === 'Action')
  const playGroup = allFiltered.filter((i) => i.group === 'Play')
  const opponentGroup = allFiltered.filter((i) => i.group === 'Opponent')
  const playerGroup = allFiltered.filter((i) => i.group === 'Player')
  const drillGroup = allFiltered.filter((i) => i.group === 'Drill')

  const hasQuery = query.trim().length > 0

  function renderItem(item: PaletteItem, idx: number) {
    const isSelected = idx === selectedIndex
    const isAction = item.group === 'Action'
    const isData = ['Play', 'Opponent', 'Player', 'Drill'].includes(item.group)
    const isRecent = item.group === 'Recent'

    const selectedBg = isAction
      ? 'bg-accent text-accent-foreground'
      : isData || isRecent
      ? 'bg-chart-5 text-chart-5-foreground'
      : 'bg-primary text-primary-foreground'
    const selectedIconBg = isAction
      ? 'bg-accent-foreground/15 text-accent-foreground'
      : isData || isRecent
      ? 'bg-chart-5-foreground/15 text-chart-5-foreground'
      : 'bg-primary-foreground/15 text-primary-foreground'
    const selectedText = isAction
      ? 'text-accent-foreground'
      : isData || isRecent
      ? 'text-chart-5-foreground'
      : 'text-primary-foreground'
    const selectedDesc = isAction
      ? 'text-accent-foreground/70'
      : isData || isRecent
      ? 'text-chart-5-foreground/70'
      : 'text-primary-foreground/70'

    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item)}
        onMouseEnter={() => setSelectedIndex(idx)}
        className={cn(
          'w-full flex items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
          isSelected ? selectedBg : 'hover:bg-muted'
        )}
      >
        <span className={cn(
          'size-7 rounded-md flex items-center justify-center shrink-0',
          isSelected ? selectedIconBg : 'bg-muted text-muted-foreground'
        )}>
          {item.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className={cn('text-sm font-medium truncate', isSelected ? selectedText : 'text-foreground')}>
            {item.label}
          </div>
          <div className={cn('text-xs truncate', isSelected ? selectedDesc : 'text-muted-foreground')}>
            {item.description}
          </div>
        </div>
        {item.typeLabel && (
          <span className={cn(
            'text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0',
            isSelected
              ? isAction
                ? 'border-accent-foreground/30 text-accent-foreground'
                : 'border-chart-5-foreground/30 text-chart-5-foreground'
              : 'border-border text-muted-foreground'
          )}>
            {item.typeLabel}
          </span>
        )}
        {item.shortcut && (
          <kbd className={cn(
            'text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0',
            isSelected ? 'border-accent-foreground/30 text-accent-foreground' : 'border-border text-muted-foreground'
          )}>
            {item.shortcut}
          </kbd>
        )}
        {isSelected && !item.shortcut && !item.typeLabel && (
          <kbd className="text-[10px] font-mono opacity-70 shrink-0">↵</kbd>
        )}
      </button>
    )
  }

  function renderGroup(label: string, items: PaletteItem[]) {
    if (items.length === 0) return null
    return (
      <div className="mb-2">
        <div className="px-2 py-1 text-[10px] uppercase tracking-widest font-mono text-muted-foreground/70">
          {label} ({items.length})
        </div>
        {items.map((item) => renderItem(item, allFiltered.indexOf(item)))}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          onClick={() => onOpenChange(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-xl border border-border bg-popover shadow-2xl overflow-hidden glow-primary-soft"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search modules, plays, opponents, players, drills…"
                className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto scrollbar-thin p-2">
              {allFiltered.length === 0 ? (
                <div className="py-10 text-center">
                  <Search className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No results for &quot;{query}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Try searching for a module, play, opponent, player, or drill.
                  </p>
                </div>
              ) : (
                <>
                  {/* Recent group (only when no query) */}
                  {!hasQuery && recentGroup.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between px-2 py-1">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground/70">
                          <History className="size-3" />
                          Recent ({recentGroup.length})
                        </div>
                        <button
                          onClick={clearRecent}
                          className="text-[10px] text-muted-foreground hover:text-destructive font-mono uppercase tracking-wider transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      {recentGroup.map((item) => renderItem(item, allFiltered.indexOf(item)))}
                    </div>
                  )}

                  {renderGroup('Navigate', navigateGroup)}
                  {renderGroup('Actions', actionGroup)}
                  {renderGroup('Plays', playGroup)}
                  {renderGroup('Opponents', opponentGroup)}
                  {renderGroup('Players', playerGroup)}
                  {renderGroup('Drills', drillGroup)}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted">esc</kbd>
                  close
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Zap className="size-3 text-accent" />
                GridironIQ™
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Wrapper with QueryClientProvider so the palette can fetch data
export function CommandPalette(props: CommandPaletteProps) {
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
      <CommandPaletteInner {...props} />
    </QueryClientProvider>
  )
}

// Hook for Cmd+K / Ctrl+K listener
export function useCommandPaletteShortcut(onToggle: () => void) {
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onToggle()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onToggle])
}
