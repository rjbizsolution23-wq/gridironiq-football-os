'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Database,
  Download,
  Eye,
  HardDrive,
  Info,
  Moon,
  Palette,
  RefreshCw,
  Settings,
  Star,
  Sun,
  Target,
  Trash2,
  Upload,
  Users,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

const STORAGE_KEYS = [
  { key: 'gridironiq:coach-ai:history', label: 'Coach AI chat history', icon: Brain, color: 'text-accent' },
  { key: 'gridironiq:gameplan:opening_script', label: 'GamePlanIQ opening scripts', icon: Target, color: 'text-primary', note: 'Multiple keys (per opponent)' },
  { key: 'gridironiq:gameplan:situation_recommendation', label: 'GamePlanIQ situation recs', icon: Target, color: 'text-primary', note: 'Multiple keys (per opponent)' },
  { key: 'gridironiq:matchup:last', label: 'MatchupIQ last prediction', icon: Zap, color: 'text-accent' },
  { key: 'gridironiq:film:clips', label: 'FilmIQ clips library', icon: Eye, color: 'text-primary' },
  { key: 'gridironiq:personnel:availability', label: 'PersonnelIQ availability state', icon: Users, color: 'text-chart-5' },
  { key: 'gridironiq:drillbuilder:custom', label: 'DrillBuilder custom drills', icon: HardDrive, color: 'text-chart-3' },
]

function SettingsRow({
  icon: Icon,
  iconColor,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className={cn('size-9 rounded-md bg-muted flex items-center justify-center shrink-0', iconColor)}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SettingsMain() {
  const { toast } = useToast()
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const situation = useAppStore((s) => s.situation)
  const setSituation = useAppStore((s) => s.setSituation)

  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark')
  const [defaultDown, setDefaultDown] = React.useState<'1' | '2' | '3' | '4'>('1')
  const [autoSaveClips, setAutoSaveClips] = React.useState(true)
  const [showTooltips, setShowTooltips] = React.useState(true)
  const [compactMode, setCompactMode] = React.useState(false)

  // Load preferences from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('gridironiq:settings')
      if (raw) {
        const obj = JSON.parse(raw) as {
          theme?: 'dark' | 'light'
          defaultDown?: '1' | '2' | '3' | '4'
          autoSaveClips?: boolean
          showTooltips?: boolean
          compactMode?: boolean
        }
        if (obj.theme) setTheme(obj.theme)
        if (obj.defaultDown) setDefaultDown(obj.defaultDown)
        if (obj.autoSaveClips != null) setAutoSaveClips(obj.autoSaveClips)
        if (obj.showTooltips != null) setShowTooltips(obj.showTooltips)
        if (obj.compactMode != null) setCompactMode(obj.compactMode)
      }
    } catch {
      // ignore
    }
  }, [])

  function persistPrefs(patch: Record<string, unknown>) {
    try {
      const raw = localStorage.getItem('gridironiq:settings')
      const current = raw ? JSON.parse(raw) : {}
      const next = { ...current, ...patch }
      localStorage.setItem('gridironiq:settings', JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  function handleThemeChange(t: 'dark' | 'light') {
    setTheme(t)
    persistPrefs({ theme: t })
    document.documentElement.classList.toggle('dark', t === 'dark')
    document.documentElement.classList.toggle('light', t === 'light')
    toast({
      title: 'Theme updated',
      description: `Switched to ${t} mode.`,
    })
  }

  function handleDefaultDownChange(d: '1' | '2' | '3' | '4') {
    setDefaultDown(d)
    setSituation({ down: parseInt(d, 10) })
    persistPrefs({ defaultDown: d })
    toast({
      title: 'Default situation updated',
      description: `Default down set to ${d}${d === '1' ? 'st' : d === '2' ? 'nd' : d === '3' ? 'rd' : 'th'} down.`,
    })
  }

  // Storage usage stats
  const [storageStats, setStorageStats] = React.useState<Array<{ key: string; size: number; count: number | null }>>([])

  React.useEffect(() => {
    const stats = STORAGE_KEYS.map((sk) => {
      let size = 0
      let count: number | null = null
      // Handle multi-key storage (per-opponent)
      if (sk.note?.includes('Multiple keys')) {
        const prefix = sk.key
        const matchingKeys = Object.keys(localStorage).filter((k) => k.startsWith(prefix))
        size = matchingKeys.reduce((a, k) => a + (localStorage.getItem(k)?.length ?? 0), 0)
        count = matchingKeys.length
      } else {
        const raw = localStorage.getItem(sk.key)
        size = raw?.length ?? 0
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) count = parsed.length
            else if (typeof parsed === 'object' && parsed !== null) {
              const entries = Object.entries(parsed)
              if (entries.length > 0 && typeof entries[0][1] === 'object') count = entries.length
            }
          } catch {
            // ignore
          }
        }
      }
      return { key: sk.key, size, count }
    })
    setStorageStats(stats)
  }, [])

  const totalStorageBytes = storageStats.reduce((a, s) => a + s.size, 0)
  const totalStorageKB = (totalStorageBytes / 1024).toFixed(1)

  function clearKey(key: string) {
    if (key.includes('Multiple keys')) {
      // Clear all matching keys
      const prefix = key.replace(/\s*\(.*\)/, '')
      const matchingKeys = Object.keys(localStorage).filter((k) => k.startsWith(prefix))
      matchingKeys.forEach((k) => localStorage.removeItem(k))
    } else {
      localStorage.removeItem(key)
    }
    // Refresh stats
    setTimeout(() => {
      const stats = STORAGE_KEYS.map((sk) => {
        let size = 0
        let count: number | null = null
        if (sk.note?.includes('Multiple keys')) {
          const prefix = sk.key
          const matchingKeys = Object.keys(localStorage).filter((k) => k.startsWith(prefix))
          size = matchingKeys.reduce((a, k) => a + (localStorage.getItem(k)?.length ?? 0), 0)
          count = matchingKeys.length
        } else {
          const raw = localStorage.getItem(sk.key)
          size = raw?.length ?? 0
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed)) count = parsed.length
            } catch {
              // ignore
            }
          }
        }
        return { key: sk.key, size, count }
      })
      setStorageStats(stats)
    }, 50)
    toast({
      title: 'Data cleared',
      description: `Removed ${key} from local storage.`,
    })
  }

  function clearAll() {
    STORAGE_KEYS.forEach((sk) => {
      if (sk.note?.includes('Multiple keys')) {
        const prefix = sk.key
        Object.keys(localStorage)
          .filter((k) => k.startsWith(prefix))
          .forEach((k) => localStorage.removeItem(k))
      } else {
        localStorage.removeItem(sk.key)
      }
    })
    setTimeout(() => {
      const stats = STORAGE_KEYS.map((sk) => ({ key: sk.key, size: 0, count: null }))
      setStorageStats(stats)
    }, 50)
    toast({
      title: 'All app data cleared',
      description: 'Removed all module data from local storage.',
      variant: 'destructive',
    })
  }

  function exportAll() {
    const exportObj: Record<string, unknown> = {}
    STORAGE_KEYS.forEach((sk) => {
      if (sk.note?.includes('Multiple keys')) {
        const prefix = sk.key
        const matchingKeys = Object.keys(localStorage).filter((k) => k.startsWith(prefix))
        matchingKeys.forEach((k) => {
          exportObj[k] = localStorage.getItem(k)
        })
      } else {
        exportObj[sk.key] = localStorage.getItem(sk.key)
      }
    })
    exportObj['gridironiq:settings'] = localStorage.getItem('gridironiq:settings')
    exportObj['_exportedAt'] = new Date().toISOString()
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gridironiq-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: 'Data exported',
      description: 'All module data downloaded as JSON.',
    })
  }

  const totalModules = 22

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Settings className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              SettingsIQ™ · App Preferences & Data Management
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Settings
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {totalModules} modules · {totalStorageKB} KB local storage ·{' '}
              {storageStats.filter((s) => s.count != null && s.count > 0).length} data stores active
            </p>
          </div>
        </div>
      </div>

      {/* Preferences card */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Preferences
          </h3>
        </div>

        <SettingsRow
          icon={theme === 'dark' ? Moon : Sun}
          iconColor={theme === 'dark' ? 'text-chart-5' : 'text-chart-3'}
          title="Theme"
          description="Toggle between dark (field-turf) and light (sideline) themes."
        >
          <Tabs value={theme} onValueChange={(v) => handleThemeChange(v as 'dark' | 'light')}>
            <TabsList className="h-8">
              <TabsTrigger value="dark" className="text-xs px-3">
                <Moon className="size-3 mr-1" />
                Dark
              </TabsTrigger>
              <TabsTrigger value="light" className="text-xs px-3">
                <Sun className="size-3 mr-1" />
                Light
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </SettingsRow>

        <SettingsRow
          icon={Target}
          iconColor="text-accent"
          title="Default Down & Distance"
          description={`Default situation used across modules. Currently: ${situation.down}${situation.down === 1 ? 'st' : situation.down === 2 ? 'nd' : situation.down === 3 ? 'rd' : 'th'} & ${situation.distance}.`}
        >
          <Tabs value={defaultDown} onValueChange={(v) => handleDefaultDownChange(v as '1' | '2' | '3' | '4')}>
            <TabsList className="h-8">
              <TabsTrigger value="1" className="text-xs px-2.5">1st</TabsTrigger>
              <TabsTrigger value="2" className="text-xs px-2.5">2nd</TabsTrigger>
              <TabsTrigger value="3" className="text-xs px-2.5">3rd</TabsTrigger>
              <TabsTrigger value="4" className="text-xs px-2.5">4th</TabsTrigger>
            </TabsList>
          </Tabs>
        </SettingsRow>

        <SettingsRow
          icon={Eye}
          iconColor="text-primary"
          title="Auto-save FilmIQ clips"
          description="Automatically persist AI-tagged film clips to local storage."
        >
          <Switch
            checked={autoSaveClips}
            onCheckedChange={(v) => {
              setAutoSaveClips(v)
              persistPrefs({ autoSaveClips: v })
            }}
          />
        </SettingsRow>

        <SettingsRow
          icon={Info}
          iconColor="text-chart-3"
          title="Show tooltips"
          description="Display helpful tooltips on hover across the app."
        >
          <Switch
            checked={showTooltips}
            onCheckedChange={(v) => {
              setShowTooltips(v)
              persistPrefs({ showTooltips: v })
            }}
          />
        </SettingsRow>

        <SettingsRow
          icon={HardDrive}
          iconColor="text-chart-5"
          title="Compact mode"
          description="Reduce padding and font sizes for denser information display."
        >
          <Switch
            checked={compactMode}
            onCheckedChange={(v) => {
              setCompactMode(v)
              persistPrefs({ compactMode: v })
            }}
          />
        </SettingsRow>
      </Card>

      {/* Data management card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-chart-5" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Local Storage
            </h3>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {totalStorageKB} KB total
          </Badge>
        </div>

        <div className="space-y-2">
          {STORAGE_KEYS.map((sk) => {
            const stat = storageStats.find((s) => s.key === sk.key)
            const sizeKB = ((stat?.size ?? 0) / 1024).toFixed(1)
            const hasData = (stat?.size ?? 0) > 0
            return (
              <motion.div
                key={sk.key}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-md border border-border bg-background/40 p-2.5"
              >
                <div className={cn('size-7 rounded-md bg-muted flex items-center justify-center shrink-0', sk.color)}>
                  <sk.icon className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{sk.label}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {sizeKB} KB{stat?.count != null && stat.count > 0 ? ` · ${stat.count} item${stat.count !== 1 ? 's' : ''}` : ''}
                    {sk.note && <span className="ml-1 opacity-60">({sk.note})</span>}
                  </div>
                </div>
                {hasData ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => clearKey(sk.key)}
                  >
                    <Trash2 className="size-3 mr-1" />
                    Clear
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-[9px] font-mono bg-muted/30 text-muted-foreground">
                    Empty
                  </Badge>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportAll} className="h-8">
            <Download className="size-3.5 mr-1.5" />
            Export All Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="h-8 border-destructive/30 hover:border-destructive hover:bg-destructive/5 text-destructive"
          >
            <Trash2 className="size-3.5 mr-1.5" />
            Clear All
          </Button>
        </div>
      </Card>

      {/* About card */}
      <Card className="p-4 border-l-4 border-l-primary bg-primary/5">
        <div className="flex items-start gap-3">
          <Star className="size-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest font-mono text-primary mb-1">
              About GridironIQ™
            </div>
            <p className="text-sm leading-relaxed">
              <strong>GridironIQ™</strong> is a Football Intelligence Operating System built for
              football coaches. It combines play design, opponent scouting, AI game planning,
              practice scripting, film tagging, and postgame analytics into one platform.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                  Modules
                </div>
                <div className="text-base font-bold font-mono">{totalModules}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                  AI Engines
                </div>
                <div className="text-base font-bold font-mono text-accent">4</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                  Version
                </div>
                <div className="text-base font-bold font-mono">1.6</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                  Build
                </div>
                <div className="text-base font-bold font-mono">LIVE</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick nav card */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="size-4 text-chart-3" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Quick Navigation
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'dashboard' as const, label: 'Command Center', icon: Target, color: 'text-primary' },
            { id: 'coach-ai' as const, label: 'Coach AI', icon: Brain, color: 'text-accent' },
            { id: 'matchup' as const, label: 'MatchupIQ', icon: Zap, color: 'text-accent' },
            { id: 'film' as const, label: 'FilmIQ', icon: Eye, color: 'text-primary' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className="group flex flex-col items-start gap-1 rounded-md border border-border bg-background/40 hover:bg-primary/5 hover:border-primary/40 p-2.5 transition-all"
            >
              <item.icon className={cn('size-4', item.color, 'group-hover:scale-110 transition-transform')} />
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function SettingsIQ() {
  return <SettingsMain />
}
