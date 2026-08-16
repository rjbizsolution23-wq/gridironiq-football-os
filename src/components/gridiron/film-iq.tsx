'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Clapperboard,
  ClipboardList,
  Clock,
  Film,
  Filter,
  Loader2,
  Plus,
  Search,
  Send,
  Sparkles,
  Tag,
  Trash2,
  Video,
  X,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface FilmClip {
  id: string
  title: string
  description: string
  opponent?: string
  tags: {
    personnel?: string | null
    formation?: string | null
    formationStrength?: string | null
    motion?: string | null
    concept?: string | null
    playType?: string | null
    front?: string | null
    coverage?: string | null
    pressure?: string | null
    result?: string | null
    yardsGained?: number | null
    explosive?: boolean
    turnover?: boolean
    tags?: string[]
    coachingNote?: string
  }
  createdAt: number
}

interface FilmData {
  opponents: Array<{ id: string; name: string; mascot: string | null }>
}

const RESULT_COLORS: Record<string, string> = {
  completion: 'bg-primary/15 text-primary border-primary/30',
  explosive: 'bg-accent/20 text-accent border-accent/40',
  touchdown: 'bg-accent/20 text-accent border-accent/40',
  first_down: 'bg-primary/15 text-primary border-primary/30',
  interception: 'bg-destructive/15 text-destructive border-destructive/30',
  fumble: 'bg-destructive/15 text-destructive border-destructive/30',
  sack: 'bg-destructive/15 text-destructive border-destructive/30',
  tfl: 'bg-destructive/15 text-destructive border-destructive/30',
  incompletion: 'bg-muted text-muted-foreground border-border',
  short_gain: 'bg-muted text-muted-foreground border-border',
  no_gain: 'bg-muted text-muted-foreground border-border',
}

const PLAY_TYPE_COLORS: Record<string, string> = {
  run: 'bg-primary/15 text-primary border-primary/30',
  pass: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  rpo: 'bg-accent/15 text-accent border-accent/30',
  play_action: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  screen: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  boot: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
}

function TagPill({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-muted-foreground font-mono uppercase tracking-wider">
        {label}:
      </span>
      <span className="font-mono text-foreground">{value.replace(/_/g, ' ')}</span>
    </div>
  )
}

function ClipCard({
  clip,
  onDelete,
}: {
  clip: FilmClip
  onDelete: (id: string) => void
}) {
  const t = clip.tags
  const resultColor = t.result ? RESULT_COLORS[t.result] ?? 'bg-muted text-muted-foreground border-border' : ''
  const typeColor = t.playType ? PLAY_TYPE_COLORS[t.playType] ?? '' : ''

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow group">
        {/* Clip header */}
        <div className="flex items-start gap-3 p-3 bg-card">
          <div className="size-10 rounded-md helmet-gradient flex items-center justify-center shrink-0">
            <Film className="size-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-semibold text-sm truncate">{clip.title}</h4>
              {t.explosive && (
                <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30 text-[9px] px-1 py-0 h-4 font-mono">
                  <Zap className="size-2.5 mr-0.5" />
                  EXP
                </Badge>
              )}
              {t.turnover && (
                <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 text-[9px] px-1 py-0 h-4 font-mono">
                  <AlertCircle className="size-2.5 mr-0.5" />
                  TO
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              {clip.description}
            </p>
          </div>
          <button
            onClick={() => onDelete(clip.id)}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded"
            aria-label="Delete clip"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Tags grid */}
        <div className="px-3 py-2 bg-muted/20 border-t border-border grid grid-cols-2 gap-x-4 gap-y-1.5">
          <TagPill label="Pers" value={t.personnel} />
          <TagPill label="Form" value={t.formation} />
          <TagPill label="Motion" value={t.motion} />
          <TagPill label="Concept" value={t.concept} />
          <TagPill label="Front" value={t.front} />
          <TagPill label="Cov" value={t.coverage} />
          <TagPill label="Pressure" value={t.pressure} />
          <TagPill label="Result" value={t.result} />
          {t.yardsGained != null && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground font-mono uppercase tracking-wider">Yds:</span>
              <span
                className={cn(
                  'font-mono font-bold',
                  t.yardsGained >= 0 ? 'text-primary' : 'text-destructive'
                )}
              >
                {t.yardsGained >= 0 ? '+' : ''}{t.yardsGained}
              </span>
            </div>
          )}
        </div>

        {/* Badges row */}
        <div className="px-3 py-2 flex items-center gap-1.5 flex-wrap border-t border-border">
          {t.playType && (
            <Badge variant="outline" className={cn('text-[10px] uppercase tracking-wider font-mono', typeColor)}>
              {t.playType.replace(/_/g, ' ')}
            </Badge>
          )}
          {t.result && (
            <Badge variant="outline" className={cn('text-[10px] uppercase tracking-wider font-mono', resultColor)}>
              {t.result.replace(/_/g, ' ')}
            </Badge>
          )}
          {t.tags?.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-[9px] font-mono bg-muted/30">
              {tag.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>

        {/* Coaching note */}
        {t.coachingNote && (
          <div className="px-3 py-2 border-t border-border bg-accent/5 flex items-start gap-2">
            <Sparkles className="size-3 text-accent mt-0.5 shrink-0" />
            <p className="text-[11px] text-foreground leading-relaxed">
              {t.coachingNote}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function ClipAdder({ opponents }: { opponents: FilmData['opponents'] }) {
  const { toast } = useToast()
  const [description, setDescription] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [opponentId, setOpponentId] = React.useState('')
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const onAddRef = React.useRef<(clip: FilmClip) => void>(() => {})

  // We expose a way to add via a parent — but to keep this self-contained,
  // we accept an onAdded callback prop. For simplicity, the parent passes via ref.
  // Instead, just emit via a window event.

  async function submit() {
    if (!description.trim()) {
      setError('Description is required.')
      return
    }
    setIsPending(true)
    setError(null)
    try {
      const r = await fetch('/api/film-tag', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          title: title.trim() || undefined,
          opponentId: opponentId || undefined,
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const json = await r.json()
      if (json.error) throw new Error(json.error)
      const clip: FilmClip = {
        id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: json.title || description.slice(0, 60),
        description: description.trim(),
        opponent: opponents.find((o) => o.id === opponentId)?.name,
        tags: json.tags ?? {},
        createdAt: Date.now(),
      }
      // Emit event for parent to catch
      window.dispatchEvent(new CustomEvent('gridironiq:film:added', { detail: clip }))
      setDescription('')
      setTitle('')
      setOpponentId('')
      toast({
        title: 'Clip tagged',
        description: `AI tagged: ${clip.tags.concept ?? 'unknown concept'} · ${clip.tags.coverage ?? 'unknown coverage'}.`,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to tag clip'
      setError(msg)
      toast({
        title: 'Tag failed',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="p-4 border-l-4 border-l-primary">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
          Tag New Clip with AI
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Upload a video clip for VLM frame analysis, or describe the play in plain English for LLM text tagging.
      </p>

      <div className="space-y-3">
        {/* Video upload */}
        <div>
          <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1.5">
            Upload Video (optional — MP4/MOV/WebM, max 500MB)
          </label>
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideofile,video/webm"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setIsUploading(true)
              setError(null)
              try {
                const formData = new FormData()
                formData.append('file', file)
                const r = await fetch('/api/upload-video', { method: 'POST', body: formData })
                if (!r.ok) throw new Error(`Upload failed: ${r.status}`)
                const json = await r.json()
                setVideoUrl(json.url)
                toast({
                  title: 'Video uploaded',
                  description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB) uploaded successfully.`,
                })
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Upload failed')
              } finally {
                setIsUploading(false)
              }
            }}
            className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer file:hover:bg-primary/90"
          />
          {isUploading && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Uploading video…
            </div>
          )}
          {videoUrl && (
            <div className="flex items-center gap-2 mt-2 text-xs text-primary">
              <CheckCircle2 className="size-3.5" />
              Video uploaded — click "Analyze Frame with VLM" below
            </div>
          )}
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Clip title (optional) — e.g. Q3 3rd & 4 vs Central"
          className="text-sm"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the play… e.g. 'Gun Trips right, Z in jet motion, QB hands inside zone, RB cuts back for 8 yards. Defense was in 4-2-5 Cover 3.'"
          className="text-sm min-h-[88px]"
        />
        {opponents.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              Opponent:
            </span>
            <select
              value={opponentId}
              onChange={(e) => setOpponentId(e.target.value)}
              className="text-xs bg-background border border-border rounded-md px-2 py-1 h-8"
            >
              <option value="">— None —</option>
              {opponents.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive border border-destructive/30 bg-destructive/5 rounded-md p-2">
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </div>
        )}
        <Button onClick={submit} disabled={isPending || !description.trim()} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              Tagging…
            </>
          ) : (
            <>
              <Brain className="size-3.5 mr-1.5" />
              Tag with AI
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

function FilmMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<FilmData>
    },
    staleTime: 60_000,
  })

  const opponents = data?.opponents ?? []
  const [clips, setClips] = React.useState<FilmClip[]>([])
  const [filter, setFilter] = React.useState<'all' | 'explosive' | 'turnover' | 'pass' | 'run'>('all')
  const [search, setSearch] = React.useState('')

  // Load clips from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('gridironiq:film:clips')
      if (raw) {
        const parsed = JSON.parse(raw) as FilmClip[]
        setClips(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  // Save clips to localStorage on change
  React.useEffect(() => {
    try {
      localStorage.setItem('gridironiq:film:clips', JSON.stringify(clips.slice(0, 100)))
    } catch {
      // ignore
    }
  }, [clips])

  // Listen for new clips from ClipAdder
  React.useEffect(() => {
    function handleAdd(e: Event) {
      const detail = (e as CustomEvent<FilmClip>).detail
      setClips((prev) => [detail, ...prev])
    }
    window.addEventListener('gridironiq:film:added', handleAdd)
    return () => window.removeEventListener('gridironiq:film:added', handleAdd)
  }, [])

  function handleDelete(id: string) {
    setClips((prev) => prev.filter((c) => c.id !== id))
  }

  function clearAll() {
    setClips([])
  }

  const filtered = React.useMemo(() => {
    return clips.filter((c) => {
      if (filter === 'explosive' && !c.tags.explosive) return false
      if (filter === 'turnover' && !c.tags.turnover) return false
      if (filter === 'pass' && c.tags.playType !== 'pass') return false
      if (filter === 'run' && c.tags.playType !== 'run') return false
      if (search) {
        const s = search.toLowerCase()
        return (
          c.title.toLowerCase().includes(s) ||
          c.description.toLowerCase().includes(s) ||
          c.tags.concept?.toLowerCase().includes(s) ||
          c.tags.coverage?.toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [clips, filter, search])

  // Stats
  const stats = React.useMemo(() => {
    const total = clips.length
    const explosive = clips.filter((c) => c.tags.explosive).length
    const turnovers = clips.filter((c) => c.tags.turnover).length
    const passPlays = clips.filter((c) => c.tags.playType === 'pass').length
    const runPlays = clips.filter((c) => c.tags.playType === 'run').length
    const avgYards =
      total > 0
        ? Math.round(
            (clips.reduce((a, c) => a + (c.tags.yardsGained ?? 0), 0) / total) * 10
          ) / 10
        : 0
    return { total, explosive, turnovers, passPlays, runPlays, avgYards }
  }, [clips])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Clapperboard className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              FilmIQ™ · AI-Powered Film Tagging
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Film Library
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} clips · {stats.explosive} explosive · {stats.turnovers} turnovers ·{' '}
              avg{' '}
              <span className="font-mono text-primary">{stats.avgYards} yds</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Card className="p-3 slide-up-fade stagger-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Total Clips</span>
              <Video className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold font-mono mt-1">{stats.total}</div>
          </Card>
          <Card className="p-3 slide-up-fade stagger-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Explosive</span>
              <Zap className="size-3.5 text-accent" />
            </div>
            <div className="text-xl font-bold font-mono mt-1 text-accent">{stats.explosive}</div>
          </Card>
          <Card className="p-3 slide-up-fade stagger-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Turnovers</span>
              <AlertCircle className="size-3.5 text-destructive" />
            </div>
            <div className="text-xl font-bold font-mono mt-1 text-destructive">{stats.turnovers}</div>
          </Card>
          <Card className="p-3 slide-up-fade stagger-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Pass / Run</span>
              <Film className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold font-mono mt-1">
              <span className="text-chart-3">{stats.passPlays}</span>
              <span className="text-muted-foreground/40 mx-1">/</span>
              <span className="text-primary">{stats.runPlays}</span>
            </div>
          </Card>
          <Card className="p-3 slide-up-fade stagger-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Avg Yards</span>
              <Tag className="size-3.5 text-primary" />
            </div>
            <div className="text-xl font-bold font-mono mt-1 text-primary">{stats.avgYards}</div>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: clip adder */}
        <div className="lg:col-span-1">
          <ClipAdder opponents={opponents} />
        </div>

        {/* Right: clip library */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="explosive" className="text-xs">
                  <Zap className="size-3 mr-1" />
                  Explosive
                </TabsTrigger>
                <TabsTrigger value="turnover" className="text-xs">Turnovers</TabsTrigger>
                <TabsTrigger value="pass" className="text-xs">Pass</TabsTrigger>
                <TabsTrigger value="run" className="text-xs">Run</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clips…"
                className="pl-8 h-9 text-sm"
              />
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              <Filter className="size-3 mr-1" />
              {filtered.length} / {clips.length}
            </Badge>
            {clips.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs text-muted-foreground hover:text-destructive">
                <Trash2 className="size-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          {/* Clip grid */}
          {filtered.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                  <Film className="size-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold">
                  {clips.length === 0 ? 'No clips tagged yet' : 'No clips match your filter'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {clips.length === 0
                    ? 'Describe a play on the left and let AI auto-tag it. Clips persist in your browser.'
                    : 'Try adjusting or clearing the filter.'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {filtered.map((clip) => (
                  <ClipCard key={clip.id} clip={clip} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FilmIQ() {
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
      <FilmMain />
    </QueryClientProvider>
  )
}
