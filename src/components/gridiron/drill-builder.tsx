'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  Clock,
  Dumbbell,
  Filter,
  Flame,
  Footprints,
  Layers,
  Plus,
  Save,
  Search,
  Shield,
  Target,
  Timer,
  Trash2,
  Users,
  Wind,
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

type DrillCategory = 'passing' | 'run_game' | 'team' | 'special_teams' | 'defense' | 'individual'
type DrillIntensity = 'low' | 'medium' | 'high'

interface Drill {
  id: string
  name: string
  category: DrillCategory
  duration: number // minutes
  intensity: DrillIntensity
  group: 'team' | 'offense' | 'defense' | 'special'
  equipment: string[]
  coachingPoints: string[]
  progression: string[]
  tags: string[]
  custom?: boolean
}

const CATEGORY_META: Record<DrillCategory, { label: string; icon: React.ReactNode; color: string }> = {
  passing: { label: 'Passing', icon: <Target className="size-3.5" />, color: 'text-chart-3' },
  run_game: { label: 'Run Game', icon: <Dumbbell className="size-3.5" />, color: 'text-primary' },
  team: { label: 'Team', icon: <Users className="size-3.5" />, color: 'text-accent' },
  special_teams: { label: 'Special Teams', icon: <Zap className="size-3.5" />, color: 'text-chart-5' },
  defense: { label: 'Defense', icon: <Shield className="size-3.5" />, color: 'text-chart-5' },
  individual: { label: 'Individual (Indy)', icon: <Activity className="size-3.5" />, color: 'text-muted-foreground' },
}

const INTENSITY_META: Record<DrillIntensity, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-primary', bg: 'bg-primary/15 border-primary/30' },
  medium: { label: 'Medium', color: 'text-chart-3', bg: 'bg-chart-3/15 border-chart-3/30' },
  high: { label: 'High', color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30' },
}

const GROUP_META: Record<Drill['group'], { label: string; color: string }> = {
  team: { label: 'Team', color: 'bg-accent/15 text-accent border-accent/30' },
  offense: { label: 'Offense', color: 'bg-primary/15 text-primary border-primary/30' },
  defense: { label: 'Defense', color: 'bg-chart-5/15 text-chart-5 border-chart-5/30' },
  special: { label: 'Special', color: 'bg-chart-3/15 text-chart-3 border-chart-3/30' },
}

// Pre-seeded drill library — 14 drills across categories
const SEED_DRILLS: Drill[] = [
  {
    id: 'drill-seed-1',
    name: 'Routes on Air — Concept Reps',
    category: 'passing',
    duration: 10,
    intensity: 'low',
    group: 'offense',
    equipment: ['Balls (4)', 'Cones (8)', 'Kicking net'],
    coachingPoints: [
      'QB footwork mirrors game action — no flat-footed reps',
      'WR stems at top of route — drive at 90% then break',
      'Throw timing: ball out as WR breaks',
      'Hear QB call cadence + protection live',
    ],
    progression: [
      'Walkthrough at 50% speed — no ball',
      'Full speed with ball — QB reads triangle',
      'Add DB shadow (no contact) — QB progresses',
    ],
    tags: ['routes', 'timing', 'qb_footwork', 'wr_stems'],
  },
  {
    id: 'drill-seed-2',
    name: 'Inside Run Period',
    category: 'run_game',
    duration: 15,
    intensity: 'high',
    group: 'offense',
    equipment: ['Balls (3)', 'Tackling dummies (2)', 'Cones'],
    coachingPoints: [
      'RB press the hole — patience to the second level',
      'OL double-team climb — drive the second-level defender',
      'QB ride the mesh — keep eyes on backside end',
      'Live finish — 5 yards past the LOS',
    ],
    progression: [
      'Fit & freeze — no tackle',
      'Thud tempo — wrap but don\'t take down',
      'Live — full tackle to ground',
    ],
    tags: ['inside_zone', 'ol_blocks', 'rb_vision', 'qb_mesh'],
  },
  {
    id: 'drill-seed-3',
    name: 'Skelly 7-on-7',
    category: 'team',
    duration: 15,
    intensity: 'medium',
    group: 'team',
    equipment: ['Balls (4)', 'Cones', 'Down marker'],
    coachingPoints: [
      'QB full read progression — no forced balls',
      'WR vs DB — full speed stems + breaks',
      'LB zone drops — eyes on QB, pattern-match',
      'Install script: 4 concepts from game plan',
    ],
    progression: [
      'Zone coverage only — read progression',
      'Man coverage — rub concepts + stems',
      'Mixed — QB calls audibles',
    ],
    tags: ['7-on-7', 'passing', 'concept_install', 'coverage'],
  },
  {
    id: 'drill-seed-4',
    name: 'Team Period — Scripted',
    category: 'team',
    duration: 20,
    intensity: 'high',
    group: 'team',
    equipment: ['Balls (5)', 'Full pads', 'Down marker'],
    coachingPoints: [
      'Run the script in order — test the look squad',
      'Tempo: fast between plays, slow at line',
      'Coaches in huddle between series only',
      'Track play-by-play results on script card',
    ],
    progression: [
      'First 5 plays — openers',
      'Situational: 3rd & medium, red zone',
      'Two-minute drill at end',
    ],
    tags: ['team', 'script', 'tempo', 'game_situations'],
  },
  {
    id: 'drill-seed-5',
    name: 'Punt Team Operation',
    category: 'special_teams',
    duration: 10,
    intensity: 'low',
    group: 'special',
    equipment: ['Balls (3)', 'Kicking net', 'Cones'],
    coachingPoints: [
      'Operation time < 2.1 seconds snap-to-kick',
      'Personal protectors — eyes on threat, don\'t watch the snap',
      'Gunners release with violent hands — beat the jam',
      'Coverage lane integrity — stay in your lane',
    ],
    progression: [
      'Air operation — no rush',
      'Add rush — escape drills',
      'Full coverage live',
    ],
    tags: ['punt', 'operation', 'coverage', 'protection'],
  },
  {
    id: 'drill-seed-6',
    name: 'PAT / Field Goal Operation',
    category: 'special_teams',
    duration: 5,
    intensity: 'low',
    group: 'special',
    equipment: ['Balls (3)', 'Kicking net', 'Tee'],
    coachingPoints: [
      'Snap-hold-kick: 1.3 seconds target',
      'Holder spot the laces out — every time',
      'Linemen fire out — no deep setters',
      'Pressure from edge only for reps',
    ],
    progression: [
      'Air snaps — no kick',
      'Full operation — no rush',
      'Add edge rush',
    ],
    tags: ['pat', 'field_goal', 'operation', 'snaps'],
  },
  {
    id: 'drill-seed-7',
    name: 'Indy — QB Footwork',
    category: 'individual',
    duration: 12,
    intensity: 'low',
    group: 'offense',
    equipment: ['Balls (3)', 'Cones (6)'],
    coachingPoints: [
      'Drop depth consistent — 3/5/7 step',
      'Shoulder square to target at top of drop',
      'Front shoulder stays closed on boot action',
      'Throw on time — ball out at top of drop',
    ],
    progression: [
      'Dry drops — no ball',
      'Drops + throw to stationary target',
      'Drops + throw to moving target',
    ],
    tags: ['qb', 'footwork', 'drops', 'throwing'],
  },
  {
    id: 'drill-seed-8',
    name: 'Indy — RB Press & Vision',
    category: 'individual',
    duration: 10,
    intensity: 'medium',
    group: 'offense',
    equipment: ['Balls (2)', 'Bags (3)', 'Cones'],
    coachingPoints: [
      'Press the line — shoulders square, eyes up',
      'Plant foot at 90° — drive off inside foot',
      'One cut, then north — no dancing',
      'Finishing: fall forward through contact',
    ],
    progression: [
      'Bags only — press + cut',
      'Add linebacker fit — thud tempo',
      'Live read — LB chooses gap',
    ],
    tags: ['rb', 'press', 'vision', 'cuts'],
  },
  {
    id: 'drill-seed-9',
    name: 'Indy — WR Stem & Top of Route',
    category: 'individual',
    duration: 10,
    intensity: 'medium',
    group: 'offense',
    equipment: ['Balls (2)', 'Cones (8)'],
    coachingPoints: [
      'Stem: drive at 90% then break — sell vertical',
      'Plant foot at 90° — drive off outside foot',
      'Eyes back to QB at top of break',
      'Catch with hands — no body catches',
    ],
    progression: [
      'Air routes — no DB',
      'DB shadow (no contact)',
      'Live vs DB',
    ],
    tags: ['wr', 'stems', 'routes', 'catching'],
  },
  {
    id: 'drill-seed-10',
    name: 'Indy — OL Pass Set',
    category: 'individual',
    duration: 10,
    intensity: 'medium',
    group: 'offense',
    equipment: ['Bags (4)', 'Cones'],
    coachingPoints: [
      'Kick slide — short sets, deep sets',
      'Hands inside — punch to numbers',
      'Anchor: sink hips, feet shoulder-width',
      'Reset hands if defender swipes',
    ],
    progression: [
      'Air sets — no defender',
      'Bag work — punch technique',
      'Live vs DE/DT',
    ],
    tags: ['ol', 'pass_protection', 'sets', 'punch'],
  },
  {
    id: 'drill-seed-11',
    name: 'Indy — DL Get-Off & Escape',
    category: 'individual',
    duration: 10,
    intensity: 'high',
    group: 'defense',
    equipment: ['Bags (4)', 'Cones', 'Football on sled'],
    coachingPoints: [
      'Stance: weight forward, eyes on ball',
      'Get-off: 6-inch first step, violent hands',
      'Escape: rip or swim — never stop feet',
      'Pursuit: take proper angle — don\'t over-run',
    ],
    progression: [
      'Bag work — get-off + escape',
      'Sled work — explosive power',
      'Live vs OL',
    ],
    tags: ['dl', 'get_off', 'escape', 'pursuit'],
  },
  {
    id: 'drill-seed-12',
    name: 'Indy — LB Run Fits',
    category: 'individual',
    duration: 12,
    intensity: 'medium',
    group: 'defense',
    equipment: ['Balls (2)', 'Bags (3)', 'Cones'],
    coachingPoints: [
      'Read backfield flow — fast flow vs slow flow',
      'Fit: eyes on hip of RB, helmet in front',
      'Shed: violent hands to chest plate',
      'Tackle: wrap and drive — no arm tackles',
    ],
    progression: [
      'Walkthrough — fit & freeze',
      'Thud — wrap but don\'t take down',
      'Live — full tackle',
    ],
    tags: ['lb', 'run_fits', 'shedding', 'tackling'],
  },
  {
    id: 'drill-seed-13',
    name: 'Indy — DB Backpedal & Break',
    category: 'individual',
    duration: 10,
    intensity: 'medium',
    group: 'defense',
    equipment: ['Balls (2)', 'Cones (6)'],
    coachingPoints: [
      'Backpedal: weight on balls of feet, shoulders square',
      'Plant: drive foot at 90°, no false step',
      'Break: snap eyes to QB, drive to target',
      'Ball skills: high-point, hands above head',
    ],
    progression: [
      'Air pedal — no QB',
      'Add QB — read throw',
      'Live vs WR',
    ],
    tags: ['db', 'backpedal', 'break', 'ball_skills'],
  },
  {
    id: 'drill-seed-14',
    name: 'Red Zone 7-on-7',
    category: 'team',
    duration: 10,
    intensity: 'medium',
    group: 'team',
    equipment: ['Balls (3)', 'Cones', 'Down marker'],
    coachingPoints: [
      'QB ball placement — back shoulder + high point',
      'WR win at top of route — fade vs post',
      'DB pattern-match — squat at sticks',
      'Track red-zone concepts: snag, stick, smash',
    ],
    progression: [
      'High red (25-15) — full field',
      'Low red (15-5) — compact',
      'Goal line (5-in) — fade & stick',
    ],
    tags: ['red_zone', '7-on-7', 'high_red', 'low_red', 'goal_line'],
  },
]

function DrillCard({
  drill,
  onDelete,
}: {
  drill: Drill
  onDelete?: (id: string) => void
}) {
  const [expanded, setExpanded] = React.useState(false)
  const cat = CATEGORY_META[drill.category]
  const intensity = INTENSITY_META[drill.intensity]
  const group = GROUP_META[drill.group]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full text-left p-3 hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'size-10 rounded-md flex items-center justify-center shrink-0',
                'bg-muted',
                cat.color
              )}
            >
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-semibold text-sm truncate">{drill.name}</h4>
                {drill.custom && (
                  <Badge variant="outline" className="text-[9px] font-mono bg-accent/10 text-accent border-accent/30">
                    CUSTOM
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className={cn('text-[10px] font-mono', group.color)}>
                  {group.label}
                </Badge>
                <Badge variant="outline" className={cn('text-[10px] font-mono', intensity.bg, intensity.color, 'border')}>
                  {intensity.label}
                </Badge>
                <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-0.5">
                  <Clock className="size-2.5" />
                  {drill.duration}m
                </span>
              </div>
            </div>
            <div className="text-right">
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(drill.id)
                  }}
                  className="opacity-0 hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1 rounded"
                  aria-label="Delete drill"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-1 border-t border-border space-y-3 bg-muted/10">
                {/* Equipment */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
                    Equipment
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {drill.equipment.map((e, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] font-mono bg-muted/30">
                        {e}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Coaching points */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
                    Coaching Points
                  </div>
                  <ul className="space-y-1">
                    {drill.coachingPoints.map((cp, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5">
                        <span className="text-primary font-mono text-[10px] mt-0.5 shrink-0">
                          {i + 1}.
                        </span>
                        <span>{cp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Progression */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
                    Progression
                  </div>
                  <div className="space-y-1.5">
                    {drill.progression.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="size-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="flex-1 pt-0.5">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {drill.tags.map((t, i) => (
                      <Badge key={i} variant="outline" className="text-[9px] font-mono bg-background/40">
                        {t.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

function AddDrillForm({
  onAdd,
}: {
  onAdd: (drill: Drill) => void
}) {
  const [name, setName] = React.useState('')
  const [category, setCategory] = React.useState<DrillCategory>('passing')
  const [duration, setDuration] = React.useState('10')
  const [intensity, setIntensity] = React.useState<DrillIntensity>('medium')
  const [group, setGroup] = React.useState<Drill['group']>('offense')
  const [equipment, setEquipment] = React.useState('')
  const [coachingPoints, setCoachingPoints] = React.useState('')
  const [progression, setProgression] = React.useState('')
  const [tags, setTags] = React.useState('')

  function submit() {
    if (!name.trim()) return
    const drill: Drill = {
      id: `drill-custom-${Date.now()}`,
      name: name.trim(),
      category,
      duration: parseInt(duration, 10) || 10,
      intensity,
      group,
      equipment: equipment.split(',').map((s) => s.trim()).filter(Boolean),
      coachingPoints: coachingPoints.split('\n').map((s) => s.trim()).filter(Boolean),
      progression: progression.split('\n').map((s) => s.trim()).filter(Boolean),
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      custom: true,
    }
    onAdd(drill)
    setName('')
    setEquipment('')
    setCoachingPoints('')
    setProgression('')
    setTags('')
  }

  return (
    <Card className="p-4 border-l-4 border-l-accent">
      <div className="flex items-center gap-2 mb-3">
        <Plus className="size-4 text-accent" />
        <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
          Add Custom Drill
        </h3>
      </div>
      <div className="space-y-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Drill name"
          className="text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DrillCategory)}
            className="text-xs bg-background border border-border rounded-md px-2 py-1.5 h-9 font-mono"
          >
            {Object.entries(CATEGORY_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value as Drill['group'])}
            className="text-xs bg-background border border-border rounded-md px-2 py-1.5 h-9 font-mono"
          >
            <option value="team">Team</option>
            <option value="offense">Offense</option>
            <option value="defense">Defense</option>
            <option value="special">Special</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (min)"
            className="text-sm"
          />
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value as DrillIntensity)}
            className="text-xs bg-background border border-border rounded-md px-2 py-1.5 h-9 font-mono"
          >
            <option value="low">Low intensity</option>
            <option value="medium">Medium intensity</option>
            <option value="high">High intensity</option>
          </select>
        </div>
        <Input
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          placeholder="Equipment (comma-separated)"
          className="text-sm"
        />
        <Textarea
          value={coachingPoints}
          onChange={(e) => setCoachingPoints(e.target.value)}
          placeholder="Coaching points (one per line)"
          className="text-sm min-h-[60px]"
        />
        <Textarea
          value={progression}
          onChange={(e) => setProgression(e.target.value)}
          placeholder="Progression (one step per line)"
          className="text-sm min-h-[60px]"
        />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated)"
          className="text-sm"
        />
        <Button onClick={submit} disabled={!name.trim()} className="w-full">
          <Save className="size-3.5 mr-1.5" />
          Save Custom Drill
        </Button>
      </div>
    </Card>
  )
}

function DrillBuilderMain() {
  const { toast } = useToast()
  const [drills, setDrills] = React.useState<Drill[]>(SEED_DRILLS)
  const [categoryFilter, setCategoryFilter] = React.useState<DrillCategory | 'all'>('all')
  const [groupFilter, setGroupFilter] = React.useState<'all' | Drill['group']>('all')
  const [intensityFilter, setIntensityFilter] = React.useState<'all' | DrillIntensity>('all')
  const [search, setSearch] = React.useState('')

  // Load custom drills from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('gridironiq:drillbuilder:custom')
      if (raw) {
        const custom = JSON.parse(raw) as Drill[]
        setDrills([...SEED_DRILLS, ...custom])
      }
    } catch {
      // ignore
    }
  }, [])

  function persistCustom(custom: Drill[]) {
    try {
      localStorage.setItem('gridironiq:drillbuilder:custom', JSON.stringify(custom))
    } catch {
      // ignore
    }
  }

  function addDrill(drill: Drill) {
    setDrills((prev) => {
      const next = [...prev, drill]
      const custom = next.filter((d) => d.custom)
      persistCustom(custom)
      return next
    })
    toast({
      title: 'Drill saved',
      description: `${drill.name} added to your library.`,
    })
  }

  function deleteDrill(id: string) {
    setDrills((prev) => {
      const next = prev.filter((d) => d.id !== id)
      const custom = next.filter((d) => d.custom)
      persistCustom(custom)
      return next
    })
  }

  const filtered = React.useMemo(() => {
    return drills.filter((d) => {
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false
      if (groupFilter !== 'all' && d.group !== groupFilter) return false
      if (intensityFilter !== 'all' && d.intensity !== intensityFilter) return false
      if (search) {
        const s = search.toLowerCase()
        return (
          d.name.toLowerCase().includes(s) ||
          d.tags.some((t) => t.toLowerCase().includes(s)) ||
          d.coachingPoints.some((cp) => cp.toLowerCase().includes(s))
        )
      }
      return true
    })
  }, [drills, categoryFilter, groupFilter, intensityFilter, search])

  const stats = React.useMemo(() => {
    const total = drills.length
    const totalDuration = drills.reduce((a, d) => a + d.duration, 0)
    const byCategory: Record<DrillCategory, number> = {
      passing: 0,
      run_game: 0,
      team: 0,
      special_teams: 0,
      defense: 0,
      individual: 0,
    }
    drills.forEach((d) => {
      byCategory[d.category]++
    })
    return { total, totalDuration, byCategory }
  }, [drills])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Dumbbell className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              DrillBuilder™ · Practice Drill Library
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Drill Library
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} drills · {stats.totalDuration} min total ·{' '}
              {stats.byCategory.individual} indy · {stats.byCategory.team} team ·{' '}
              {stats.byCategory.passing} passing · {stats.byCategory.run_game} run
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {(Object.keys(CATEGORY_META) as DrillCategory[]).map((cat, i) => {
          const meta = CATEGORY_META[cat]
          const count = stats.byCategory[cat]
          return (
            <Card
              key={cat}
              className={cn('p-3 slide-up-fade hover:shadow-md hover:-translate-y-0.5 transition-all', `stagger-${i + 1}`)}
            >
              <div className="flex items-center justify-between">
                <span className={cn('flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono', meta.color)}>
                  {meta.icon}
                  {meta.label}
                </span>
              </div>
              <div className="text-xl font-bold font-mono mt-1">{count}</div>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as DrillCategory | 'all')}
            className="text-xs bg-background border border-border rounded-md px-2 py-1 h-7 font-mono"
          >
            <option value="all">All categories</option>
            {(Object.keys(CATEGORY_META) as DrillCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value as 'all' | Drill['group'])}
            className="text-xs bg-background border border-border rounded-md px-2 py-1 h-7 font-mono"
          >
            <option value="all">All groups</option>
            <option value="team">Team</option>
            <option value="offense">Offense</option>
            <option value="defense">Defense</option>
            <option value="special">Special</option>
          </select>
          <select
            value={intensityFilter}
            onChange={(e) => setIntensityFilter(e.target.value as 'all' | DrillIntensity)}
            className="text-xs bg-background border border-border rounded-md px-2 py-1 h-7 font-mono"
          >
            <option value="all">All intensities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drills, tags, coaching points…"
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {filtered.length} / {drills.length}
          </Badge>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Drill list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Drills ({filtered.length})
            </h3>
          </div>
          {filtered.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <Dumbbell className="size-10 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  No drills match the current filter. Try widening your search or add a custom drill.
                </p>
              </div>
            </Card>
          ) : (
            <ScrollArea className="max-h-[800px] scrollbar-thin -mx-1 px-1">
              <div className="grid sm:grid-cols-2 gap-2">
                <AnimatePresence>
                  {filtered.map((d) => (
                    <DrillCard key={d.id} drill={d} onDelete={d.custom ? deleteDrill : undefined} />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Add drill form (right rail) */}
        <div className="lg:col-span-1">
          <AddDrillForm onAdd={addDrill} />

          {/* Tips card */}
          <Card className="mt-4 p-4 border-l-4 border-l-chart-5">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="size-3.5 text-chart-5" />
              <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                Practice Planning Tips
              </h3>
            </div>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono text-[10px] mt-0.5">•</span>
                <span>Indy drills build individual technique — start every practice with 15-20 min.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono text-[10px] mt-0.5">•</span>
                <span>Routes on Air → Skelly → Team builds from technique to live.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono text-[10px] mt-0.5">•</span>
                <span>High-intensity drills should be limited to ~25% of practice time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono text-[10px] mt-0.5">•</span>
                <span>Track drill performance and tag film to drill IDs for cross-reference.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono text-[10px] mt-0.5">•</span>
                <span>Custom drills persist to localStorage — share via export.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DrillBuilder() {
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
      <DrillBuilderMain />
    </QueryClientProvider>
  )
}
