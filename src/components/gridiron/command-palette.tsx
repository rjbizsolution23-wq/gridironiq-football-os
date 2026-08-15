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
  Zap,
} from 'lucide-react'

import { useAppStore, type ModuleId } from '@/lib/store'
import { cn } from '@/lib/utils'

interface PaletteItem {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  group: 'Navigate' | 'Action'
  keywords: string
  action: () => void
  shortcut?: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const items = React.useMemo<PaletteItem[]>(() => {
    const navItems: PaletteItem[] = [
      { id: 'nav-dashboard', label: 'Command Center', description: 'Dashboard overview', icon: <LayoutDashboard className="size-4" />, group: 'Navigate', keywords: 'dashboard home command center overview', action: () => setActiveModule('dashboard') },
      { id: 'nav-playbook', label: 'PlaybookIQ', description: 'Browse installed plays & Play DNA', icon: <PlayCircle className="size-4" />, group: 'Navigate', keywords: 'playbook play dna browse', action: () => setActiveModule('playbook') },
      { id: 'nav-designer', label: 'Formation Lab', description: 'SVG play designer', icon: <Crosshair className="size-4" />, group: 'Navigate', keywords: 'formation lab designer diagram svg', action: () => setActiveModule('designer') },
      { id: 'nav-scout', label: 'ScoutIQ', description: 'Opponent tendencies', icon: <Shield className="size-4" />, group: 'Navigate', keywords: 'scout opponent tendencies', action: () => setActiveModule('scout') },
      { id: 'nav-coach-ai', label: 'Coach AI', description: 'LLM assistant', icon: <Brain className="size-4" />, group: 'Navigate', keywords: 'coach ai llm assistant chat', action: () => setActiveModule('coach-ai') },
      { id: 'nav-tendencylab', label: 'TendencyLab', description: 'Interactive tendency explorer', icon: <FlaskConical className="size-4" />, group: 'Navigate', keywords: 'tendency lab explorer charts', action: () => setActiveModule('tendencylab') },
      { id: 'nav-situational', label: 'SituationalIQ', description: 'Down/distance × hash × zone', icon: <Crosshair className="size-4" />, group: 'Navigate', keywords: 'situational down distance hash zone', action: () => setActiveModule('situational') },
      { id: 'nav-selfscout', label: 'SelfScoutIQ', description: 'Team predictability warnings', icon: <Eye className="size-4" />, group: 'Navigate', keywords: 'self scout predictability warnings', action: () => setActiveModule('selfscout') },
      { id: 'nav-depthchart', label: 'DepthChartIQ', description: 'Visual depth chart', icon: <Layers className="size-4" />, group: 'Navigate', keywords: 'depth chart formation alignment', action: () => setActiveModule('depthchart') },
      { id: 'nav-gameplan', label: 'GamePlanIQ', description: 'AI opening script', icon: <Target className="size-4" />, group: 'Navigate', keywords: 'game plan opening script situation', action: () => setActiveModule('gameplan') },
      { id: 'nav-callsheet', label: 'CallSheetIQ', description: 'Situational call sheet', icon: <ListChecks className="size-4" />, group: 'Navigate', keywords: 'call sheet situational game day', action: () => setActiveModule('callsheet') },
      { id: 'nav-wristband', label: 'WristbandIQ', description: 'QB wristband call sheet', icon: <Watch className="size-4" />, group: 'Navigate', keywords: 'wristband qb call sheet', action: () => setActiveModule('wristband') },
      { id: 'nav-practice', label: 'PracticeIQ', description: 'Practice scripts', icon: <CalendarClock className="size-4" />, group: 'Navigate', keywords: 'practice script template', action: () => setActiveModule('practice') },
      { id: 'nav-analytics', label: 'AnalyticsIQ', description: 'Postgame analytics', icon: <TrendingUp className="size-4" />, group: 'Navigate', keywords: 'analytics postgame self scout', action: () => setActiveModule('analytics') },
      { id: 'nav-redzone', label: 'RedZoneIQ', description: 'Red zone heat map', icon: <Flame className="size-4" />, group: 'Navigate', keywords: 'red zone heat map efficiency', action: () => setActiveModule('redzone') },
      { id: 'nav-film', label: 'FilmIQ', description: 'AI film tagging', icon: <Clapperboard className="size-4" />, group: 'Navigate', keywords: 'film iq tagging clips', action: () => setActiveModule('film') },
      { id: 'nav-matchup', label: 'MatchupIQ', description: 'AI game prediction', icon: <Gamepad2 className="size-4" />, group: 'Navigate', keywords: 'matchup prediction game score', action: () => setActiveModule('matchup') },
      { id: 'nav-weekplan', label: 'WeekPlanIQ', description: 'Weekly game-prep dashboard', icon: <CalendarClock className="size-4" />, group: 'Navigate', keywords: 'week plan timeline game prep', action: () => setActiveModule('weekplan') },
      { id: 'nav-install', label: 'InstallIQ', description: 'Install schedule', icon: <GraduationCap className="size-4" />, group: 'Navigate', keywords: 'install schedule mastery', action: () => setActiveModule('install') },
      { id: 'nav-personnel', label: 'PersonnelIQ', description: 'Roster & availability', icon: <Users className="size-4" />, group: 'Navigate', keywords: 'personnel roster availability depth', action: () => setActiveModule('personnel') },
      { id: 'nav-quiz', label: 'PlayerQuiz', description: 'Playbook recall quizzes', icon: <Sparkles className="size-4" />, group: 'Navigate', keywords: 'quiz player recall test', action: () => setActiveModule('quiz') },
      { id: 'nav-twominute', label: 'TwoMinuteIQ', description: '2-min drill simulator', icon: <Clock className="size-4" />, group: 'Navigate', keywords: 'two minute drill simulator clock', action: () => setActiveModule('twominute') },
      { id: 'nav-drills', label: 'DrillBuilder', description: 'Practice drill library', icon: <Dumbbell className="size-4" />, group: 'Navigate', keywords: 'drill builder library practice', action: () => setActiveModule('drills') },
      { id: 'nav-settings', label: 'SettingsIQ', description: 'App preferences', icon: <Settings className="size-4" />, group: 'Navigate', keywords: 'settings preferences theme storage', action: () => setActiveModule('settings') },
    ]

    const actionItems: PaletteItem[] = [
      { id: 'action-ask-coach', label: 'Ask Coach AI', description: 'Open Coach AI chat', icon: <Brain className="size-4" />, group: 'Action', keywords: 'ask coach ai question', action: () => setActiveModule('coach-ai'), shortcut: 'A' },
      { id: 'action-build-game-plan', label: 'Build Game Plan', description: 'Generate AI opening script', icon: <Target className="size-4" />, group: 'Action', keywords: 'build game plan opening script', action: () => setActiveModule('gameplan'), shortcut: 'G' },
      { id: 'action-predict-matchup', label: 'Predict Matchup', description: 'AI game prediction', icon: <Gamepad2 className="size-4" />, group: 'Action', keywords: 'predict matchup game score', action: () => setActiveModule('matchup'), shortcut: 'P' },
      { id: 'action-tag-film', label: 'Tag Film Clip', description: 'AI film tagging', icon: <Clapperboard className="size-4" />, group: 'Action', keywords: 'tag film clip ai', action: () => setActiveModule('film'), shortcut: 'F' },
      { id: 'action-start-quiz', label: 'Start Quiz', description: 'Test playbook knowledge', icon: <Sparkles className="size-4" />, group: 'Action', keywords: 'start quiz test playbook', action: () => setActiveModule('quiz'), shortcut: 'Q' },
      { id: 'action-2min-drill', label: '2-Minute Drill', description: 'Simulate end-of-half', icon: <Clock className="size-4" />, group: 'Action', keywords: 'two minute drill simulate', action: () => setActiveModule('twominute'), shortcut: '2' },
    ]

    return [...navItems, ...actionItems]
  }, [setActiveModule])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    )
  }, [items, query])

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
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[selectedIndex]
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

  // Group filtered items
  const navigateItems = filtered.filter((i) => i.group === 'Navigate')
  const actionItems = filtered.filter((i) => i.group === 'Action')

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
                placeholder="Search modules, actions, or type a command…"
                className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto scrollbar-thin p-2">
              {filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <Search className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No results for &quot;{query}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Try searching for a module name, action, or keyword.
                  </p>
                </div>
              ) : (
                <>
                  {/* Navigate group */}
                  {navigateItems.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-[10px] uppercase tracking-widest font-mono text-muted-foreground/70">
                        Navigate ({navigateItems.length})
                      </div>
                      {navigateItems.map((item) => {
                        const idx = filtered.indexOf(item)
                        const isSelected = idx === selectedIndex
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={cn(
                              'w-full flex items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            )}
                          >
                            <span className={cn(
                              'size-7 rounded-md flex items-center justify-center shrink-0',
                              isSelected ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}>
                              {item.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className={cn('text-sm font-medium', isSelected ? 'text-primary-foreground' : 'text-foreground')}>
                                {item.label}
                              </div>
                              <div className={cn('text-xs truncate', isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                                {item.description}
                              </div>
                            </div>
                            {isSelected && (
                              <kbd className="text-[10px] font-mono opacity-70">↵</kbd>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Action group */}
                  {actionItems.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] uppercase tracking-widest font-mono text-muted-foreground/70">
                        Actions ({actionItems.length})
                      </div>
                      {actionItems.map((item) => {
                        const idx = filtered.indexOf(item)
                        const isSelected = idx === selectedIndex
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={cn(
                              'w-full flex items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
                              isSelected
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-muted'
                            )}
                          >
                            <span className={cn(
                              'size-7 rounded-md flex items-center justify-center shrink-0',
                              isSelected ? 'bg-accent-foreground/15 text-accent-foreground' : 'bg-muted text-muted-foreground'
                            )}>
                              {item.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className={cn('text-sm font-medium', isSelected ? 'text-accent-foreground' : 'text-foreground')}>
                                {item.label}
                              </div>
                              <div className={cn('text-xs truncate', isSelected ? 'text-accent-foreground/70' : 'text-muted-foreground')}>
                                {item.description}
                              </div>
                            </div>
                            {item.shortcut && (
                              <kbd className={cn(
                                'text-[10px] font-mono px-1.5 py-0.5 rounded border',
                                isSelected ? 'border-accent-foreground/30 text-accent-foreground' : 'border-border text-muted-foreground'
                              )}>
                                {item.shortcut}
                              </kbd>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
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
