'use client'

import * as React from 'react'
import {
  DndContext,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Activity,
  ChevronRight,
  CircleDashed,
  Crosshair,
  Dices,
  Layers,
  RotateCcw,
  Users,
  Play,
  Pause,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { SerializedPlay } from '@/lib/data'

interface DiagramPath {
  type: 'route' | 'block' | 'motion' | 'handoff' | 'read'
  from: string
  toX: number
  toY: number
  label?: string
  dashed?: boolean
}

interface DiagramPlayer {
  id: string
  x: number
  y: number
  label: string
}

interface Diagram {
  players: DiagramPlayer[]
  paths: DiagramPath[]
  hash: 'L' | 'R' | 'M'
  yardLine: number
}

type LayerKey = 'players' | 'routes' | 'blocks' | 'motion' | 'reads'
type Perspective = 'offense' | 'defense' | 'both'

const LAYER_META: Record<LayerKey, { label: string; icon: React.ReactNode }> = {
  players: { label: 'Players', icon: <Users className="size-3.5" /> },
  routes: { label: 'Routes', icon: <ChevronRight className="size-3.5" /> },
  blocks: { label: 'Blocking', icon: <Layers className="size-3.5" /> },
  motion: { label: 'Motion', icon: <CircleDashed className="size-3.5" /> },
  reads: { label: 'Reads', icon: <Crosshair className="size-3.5" /> },
}

// SVG viewBox is 0..1000 (x), 0..520 (y). Diagram uses 0..100 grid.
// Mapping: svgX = gridX * 10 (so 0 -> 0, 100 -> 1000). Hmm that's too wide.
// Use a tighter mapping: x_grid (0..100) -> svgX = 100 + gridX * 8 (so 0 -> 100, 100 -> 900)
// y_grid (0..100) -> svgY = (gridY / 100) * 520 = 0..520.
// We want the LOS at y_grid=70 to be visible — 70*5.2 = 364. The field is rendered 0..520
// with end zones at 0..50 (own) and 470..520 (opponent). LOS at 364 is in the lower-middle area,
// which represents the offensive perspective. Looks right.

const SVG_W = 1000
const SVG_H = 520
const X_PAD = 60
const X_USABLE = SVG_W - X_PAD * 2
const Y_USABLE = SVG_H

function gx(v: number) {
  return X_PAD + (v / 100) * X_USABLE
}
function gy(v: number) {
  return (v / 100) * Y_USABLE
}

function OffensivePlayerDot({
  player,
  activeStep,
  animatedPathIds,
}: {
  player: DiagramPlayer
  activeStep: number
  animatedPathIds: Set<string>
}) {
  const isAnimated = animatedPathIds.has(player.id)
  return (
    <g
      transform={`translate(${gx(player.x)} ${gy(player.y)})`}
      style={{ transition: 'transform 0.2s ease-out' }}
    >
      <circle
        r={14}
        fill="oklch(0.62 0.16 152)"
        stroke="white"
        strokeWidth={2.5}
        style={{
          filter: isAnimated
            ? 'drop-shadow(0 0 8px oklch(0.62 0.16 152 / 0.9))'
            : undefined,
        }}
      />
      <text
        textAnchor="middle"
        y={5}
        fontSize={11}
        fontWeight={700}
        fill="white"
        fontFamily="var(--font-geist-mono)"
      >
        {player.label}
      </text>
      {isAnimated && activeStep >= 0 && (
        <circle
          r={20}
          fill="none"
          stroke="oklch(0.62 0.16 152)"
          strokeWidth={1.5}
          opacity={0.5}
          className="animate-pulse-soft"
        />
      )}
    </g>
  )
}

function DefensivePlayerDot({ player }: { player: DiagramPlayer }) {
  return (
    <g transform={`translate(${gx(player.x)} ${gy(player.y)})`}>
      <circle
        r={13}
        fill="oklch(0.5 0.1 195)"
        stroke="white"
        strokeWidth={2}
      />
      <text
        textAnchor="middle"
        y={4}
        fontSize={10}
        fontWeight={700}
        fill="white"
        fontFamily="var(--font-geist-mono)"
      >
        {player.label}
      </text>
    </g>
  )
}

function DraggablePlayer({
  player,
  side,
  isAnimated,
  onPositionChange,
}: {
  player: DiagramPlayer
  side: 'offense' | 'defense'
  isAnimated: boolean
  onPositionChange: (id: string, newX: number, newY: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
  })

  // Convert drag delta (pixels) back to grid coordinates
  // X_USABLE = SVG_W - 2 * X_PAD = 1000 - 120 = 880; grid 0-100 → 8.8px per unit
  // Y_USABLE = SVG_H = 520; grid 0-100 → 5.2px per unit
  const xPerUnit = X_USABLE / 100
  const yPerUnit = Y_USABLE / 100

  const dragX = transform ? transform.x / xPerUnit : 0
  const dragY = transform ? transform.y / yPerUnit : 0

  const isOff = side === 'offense'
  return (
    <g
      ref={(el) => setNodeRef(el as unknown as HTMLElement | null)}
      transform={`translate(${gx(player.x + dragX)} ${gy(player.y + dragY)})`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      {...listeners}
      {...attributes}
      onPointerUp={() => {
        if (dragX !== 0 || dragY !== 0) {
          const newX = Math.max(0, Math.min(100, player.x + dragX))
          const newY = Math.max(0, Math.min(100, player.y + dragY))
          onPositionChange(player.id, Math.round(newX), Math.round(newY))
        }
      }}
    >
      <circle
        r={14}
        fill={isOff ? 'oklch(0.62 0.16 152)' : 'oklch(0.5 0.1 195)'}
        stroke="white"
        strokeWidth={2.5}
        style={{
          filter: isAnimated
            ? 'drop-shadow(0 0 8px oklch(0.62 0.16 152 / 0.9))'
            : undefined,
          opacity: isDragging ? 0.8 : 1,
        }}
      />
      <text
        textAnchor="middle"
        y={5}
        fontSize={11}
        fontWeight={700}
        fill="white"
        fontFamily="var(--font-geist-mono)"
        style={{ pointerEvents: 'none' }}
      >
        {player.label}
      </text>
    </g>
  )
}

function FootballFieldSvg() {
  // Field: end zones 0..40 (own) and 480..520 (opponent). Playing field 40..480.
  // 5-yard lines every ~22 units (440 / 20 = 22). Yard numbers from 50..10..50.
  const yardLines = Array.from({ length: 21 }, (_, i) => 40 + i * 22)
  const hashMarks: number[] = []
  for (let i = 1; i < 100; i++) {
    if (i % 5 !== 0) hashMarks.push(40 + (i / 100) * 440)
  }

  // Yard numbers: at i=10 -> 50 yard line midpoint of own half (closer to bottom)
  // At i=0 -> goal line (y=40), at i=20 -> opponent goal line (y=480).
  // Number every other line (i = 0, 2, 4...). Numbers go 0,10,20,30,40,50,40,30,20,10,0
  const numbers = [10, 20, 30, 40, 50, 40, 30, 20, 10]
  const numberPositions = yardLines.filter((_, i) => i % 2 === 0).slice(0, 9)

  return (
    <g>
      {/* End zones */}
      <rect
        x={0}
        y={0}
        width={SVG_W}
        height={40}
        fill="oklch(0.68 0.18 55 / 0.18)"
      />
      <rect
        x={0}
        y={480}
        width={SVG_W}
        height={40}
        fill="oklch(0.68 0.18 55 / 0.18)"
      />
      {/* End zone diagonal stripes */}
      {Array.from({ length: 30 }).map((_, i) => (
        <React.Fragment key={`ez-${i}`}>
          <line
            x1={i * 33}
            y1={0}
            x2={i * 33 + 30}
            y2={40}
            stroke="oklch(0.68 0.18 55 / 0.18)"
            strokeWidth={6}
          />
          <line
            x1={i * 33}
            y1={520}
            x2={i * 33 + 30}
            y2={480}
            stroke="oklch(0.68 0.18 55 / 0.18)"
            strokeWidth={6}
          />
        </React.Fragment>
      ))}

      {/* End zone labels */}
      <text
        x={SVG_W / 2}
        y={25}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="oklch(0.97 0.005 120 / 0.4)"
        fontFamily="var(--font-geist-mono)"
        letterSpacing="0.3em"
      >
        GRIDIRON
      </text>
      <text
        x={SVG_W / 2}
        y={505}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="oklch(0.97 0.005 120 / 0.4)"
        fontFamily="var(--font-geist-mono)"
        letterSpacing="0.3em"
      >
        GRIDIRON
      </text>

      {/* Goal lines (thick white) */}
      <line
        x1={0}
        y1={40}
        x2={SVG_W}
        y2={40}
        stroke="oklch(0.97 0.005 120 / 0.7)"
        strokeWidth={2.5}
      />
      <line
        x1={0}
        y1={480}
        x2={SVG_W}
        y2={480}
        stroke="oklch(0.97 0.005 120 / 0.7)"
        strokeWidth={2.5}
      />

      {/* 5-yard lines */}
      {yardLines.map((y, i) => (
        <line
          key={`yl-${i}`}
          x1={0}
          y1={y}
          x2={SVG_W}
          y2={y}
          stroke="oklch(0.97 0.005 120 / 0.35)"
          strokeWidth={i % 4 === 0 ? 1.5 : 1}
        />
      ))}

      {/* Hash marks (left, right, middle) */}
      {hashMarks.map((y, i) => (
        <g key={`hm-${i}`}>
          <line
            x1={X_PAD}
            y1={y}
            x2={X_PAD + 12}
            y2={y}
            stroke="oklch(0.97 0.005 120 / 0.45)"
            strokeWidth={1.2}
          />
          <line
            x1={SVG_W - X_PAD - 12}
            y1={y}
            x2={SVG_W - X_PAD}
            y2={y}
            stroke="oklch(0.97 0.005 120 / 0.45)"
            strokeWidth={1.2}
          />
          <line
            x1={SVG_W / 2 - 6}
            y1={y}
            x2={SVG_W / 2 + 6}
            y2={y}
            stroke="oklch(0.97 0.005 120 / 0.35)"
            strokeWidth={1.2}
          />
        </g>
      ))}

      {/* Yard numbers */}
      {numberPositions.map((y, i) => (
        <g key={`num-${i}`}>
          <text
            x={80}
            y={y + 4}
            textAnchor="middle"
            fontSize={22}
            fontWeight={700}
            fill="oklch(0.97 0.005 120 / 0.4)"
            fontFamily="var(--font-geist-mono)"
          >
            {numbers[i]}
          </text>
          <text
            x={SVG_W - 80}
            y={y + 4}
            textAnchor="middle"
            fontSize={22}
            fontWeight={700}
            fill="oklch(0.97 0.005 120 / 0.4)"
            fontFamily="var(--font-geist-mono)"
          >
            {numbers[i]}
          </text>
        </g>
      ))}

      {/* Sidelines */}
      <line
        x1={X_PAD}
        y1={0}
        x2={X_PAD}
        y2={SVG_H}
        stroke="oklch(0.97 0.005 120 / 0.6)"
        strokeWidth={3}
      />
      <line
        x1={SVG_W - X_PAD}
        y1={0}
        x2={SVG_W - X_PAD}
        y2={SVG_H}
        stroke="oklch(0.97 0.005 120 / 0.6)"
        strokeWidth={3}
      />
    </g>
  )
}

function PathRenderer({
  path,
  fromPlayer,
  activeStep,
  stepIndex,
  totalSteps,
}: {
  path: DiagramPath
  fromPlayer?: DiagramPlayer
  activeStep: number
  stepIndex: number
  totalSteps: number
}) {
  if (!fromPlayer) return null
  const x1 = gx(fromPlayer.x)
  const y1 = gy(fromPlayer.y)
  const x2 = gx(path.toX)
  const y2 = gy(path.toY)
  const isActive = activeStep === stepIndex
  const isCompleted = activeStep > stepIndex

  let stroke = 'oklch(0.68 0.18 55)'
  let width = 3
  let dashed = false
  let arrowSize = 8

  if (path.type === 'route') {
    stroke = 'oklch(0.68 0.18 55)'
    width = 3
  } else if (path.type === 'block') {
    stroke = 'oklch(0.78 0.16 90)'
    width = 2.5
  } else if (path.type === 'motion') {
    stroke = 'oklch(0.97 0.005 120)'
    width = 2
    dashed = true
    arrowSize = 6
  } else if (path.type === 'handoff') {
    stroke = 'oklch(0.62 0.16 152)'
    width = 2
    dashed = true
  } else if (path.type === 'read') {
    stroke = 'oklch(0.62 0.22 25)'
    width = 2.5
    dashed = true
  }

  const opacity = isActive ? 1 : isCompleted ? 0.65 : 0.35
  const pathId = `arrow-${stepIndex}`

  return (
    <g style={{ opacity, transition: 'opacity 0.4s ease' }}>
      <defs>
        <marker
          id={pathId}
          markerWidth={arrowSize}
          markerHeight={arrowSize}
          refX={arrowSize - 1}
          refY={arrowSize / 2}
          orient="auto"
        >
          <path
            d={`M0,0 L${arrowSize},${arrowSize / 2} L0,${arrowSize} Z`}
            fill={stroke}
          />
        </marker>
      </defs>
      {path.type === 'route' ? (
        // Curved bezier for routes
        <path
          d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 20} ${x2} ${y2}`}
          stroke={stroke}
          strokeWidth={width + (isActive ? 1.5 : 0)}
          fill="none"
          strokeLinecap="round"
          markerEnd={`url(#${pathId})`}
          style={{
            filter: isActive ? `drop-shadow(0 0 6px ${stroke})` : undefined,
          }}
        />
      ) : (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={stroke}
          strokeWidth={width + (isActive ? 1.5 : 0)}
          strokeDasharray={dashed ? '8 5' : undefined}
          strokeLinecap="round"
          markerEnd={`url(#${pathId})`}
          style={{
            filter: isActive ? `drop-shadow(0 0 6px ${stroke})` : undefined,
          }}
        />
      )}
      {path.label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 6}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill={stroke}
          fontFamily="var(--font-geist-mono)"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          {path.label}
        </text>
      )}
    </g>
  )
}

function DesignerMain() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('fetch failed')
      return r.json() as Promise<{ plays: SerializedPlay[] }>
    },
    staleTime: 60_000,
  })

  const selectedPlayId = useAppStore((s) => s.selectedPlayId)
  const setSelectedPlayId = useAppStore((s) => s.setSelectedPlayId)
  const pushNotice = useAppStore((s) => s.pushNotice)

  const plays = data?.plays ?? []
  const offensivePlays = plays.filter((p) => p.side === 'offense')

  const selectedPlay = React.useMemo(() => {
    if (selectedPlayId) {
      return (
        plays.find((p) => p.id === selectedPlayId || p.playId === selectedPlayId) ??
        null
      )
    }
    return offensivePlays.find((p) => p.diagram) ?? plays[0] ?? null
  }, [plays, selectedPlayId, offensivePlays])

  const diagram = (selectedPlay?.diagram as Diagram | null) ?? null

  const [layers, setLayers] = React.useState<Record<LayerKey, boolean>>({
    players: true,
    routes: true,
    blocks: true,
    motion: true,
    reads: true,
  })
  const [perspective, setPerspective] = React.useState<Perspective>('offense')
  const [playerPositions, setPlayerPositions] = React.useState<
    Record<string, { x: number; y: number }>
  >({})
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [activeStep, setActiveStep] = React.useState(-1)

  // Reset positions when play changes
  React.useEffect(() => {
    setPlayerPositions({})
    setActiveStep(-1)
    setIsPlaying(false)
  }, [selectedPlay?.playId])

  const playerLookup = React.useMemo(() => {
    const map = new Map<string, DiagramPlayer>()
    diagram?.players.forEach((p) => {
      map.set(p.id, {
        ...p,
        x: playerPositions[p.id]?.x ?? p.x,
        y: playerPositions[p.id]?.y ?? p.y,
      })
    })
    return map
  }, [diagram, playerPositions])

  const paths = diagram?.paths ?? []

  // Animation: cycle through motion paths first, then reads, then routes
  const animationOrder = React.useMemo(() => {
    return paths
      .map((p, i) => ({ p, i }))
      .sort((a, b) => {
        const order = { motion: 0, handoff: 1, read: 2, block: 3, route: 4 }
        return (order[a.p.type] ?? 5) - (order[b.p.type] ?? 5)
      })
  }, [paths])

  const totalSteps = animationOrder.length

  React.useEffect(() => {
    if (!isPlaying) return
    if (totalSteps === 0) {
      setIsPlaying(false)
      return
    }
    const id = window.setInterval(() => {
      setActiveStep((s) => {
        if (s >= totalSteps - 1) {
          window.clearInterval(id)
          setIsPlaying(false)
          return -1
        }
        return s + 1
      })
    }, 750)
    return () => window.clearInterval(id)
  }, [isPlaying, totalSteps])

  function handlePositionChange(id: string, newX: number, newY: number) {
    setPlayerPositions((prev) => ({ ...prev, [id]: { x: newX, y: newY } }))
    pushNotice({
      kind: 'info',
      title: `${id} repositioned`,
      body: `New position: (${newX}, ${newY})`,
    })
  }

  function handlePlayerClick(id: string) {
    const player = playerLookup.get(id)
    if (player) {
      pushNotice({
        kind: 'info',
        title: `${player.label} selected`,
        body: `Position: (${player.x.toFixed(0)}, ${player.y.toFixed(0)}) on the schematic grid.`,
      })
    }
  }

  function resetPositions() {
    setPlayerPositions({})
    setActiveStep(-1)
    setIsPlaying(false)
    pushNotice({
      kind: 'info',
      title: 'Positions reset',
      body: 'All players returned to their schematic positions.',
    })
  }

  async function handleSave() {
    if (!selectedPlay || !diagram) {
      pushNotice({
        kind: 'warning',
        title: 'Nothing to save',
        body: 'Load a play with a diagram first.',
      })
      return
    }

    // Build the updated diagram with current player positions
    const updatedPlayers = diagram.players.map((p) => {
      const live = playerLookup.get(p.id)
      return live ? { ...p, x: live.x, y: live.y } : p
    })
    const updatedDiagram = { ...diagram, players: updatedPlayers }

    try {
      const response = await fetch('/api/plays', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: selectedPlay.id,
          name: selectedPlay.name,
          coachingPoints: selectedPlay.coachingPoints,
          assignments: selectedPlay.assignments,
          routes: selectedPlay.routes,
          diagram: updatedDiagram,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      pushNotice({
        kind: 'success',
        title: 'Play saved to database',
        body: `${selectedPlay.name} diagram + player positions persisted.`,
      })
    } catch (e) {
      pushNotice({
        kind: 'error',
        title: 'Save failed',
        body: e instanceof Error ? e.message : 'Unknown error',
      })
    }
  }

  if (plays.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <Activity className="size-8 animate-pulse-soft" />
          <p className="text-sm">Loading playbook…</p>
        </div>
      </div>
    )
  }

  if (!diagram) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <Dices className="size-10 text-muted-foreground/60" />
          <h3 className="text-lg font-semibold">No diagram available</h3>
          <p className="text-sm text-muted-foreground">
            This play doesn&apos;t have a schematic diagram in the database yet.
            Pick a different play from the right rail.
          </p>
        </div>
      </div>
    )
  }

  const offPlayers = diagram.players.filter((p) =>
    ['LT', 'LG', 'C', 'RG', 'RT', 'QB', 'RB', 'X', 'Y', 'Z', 'H', 'F', 'TE', 'WR', 'FB'].some(
      (k) => p.label.startsWith(k) || p.id.startsWith(k)
    )
  )
  const defPlayers = diagram.players.filter((p) => !offPlayers.includes(p))

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Toolbar + Field */}
      <div className="lg:col-span-8 xl:col-span-9">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-border bg-card/80 backdrop-blur px-4 py-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              {(['players', 'routes', 'blocks', 'motion', 'reads'] as LayerKey[]).map(
                (k) => (
                  <button
                    key={k}
                    onClick={() => setLayers((l) => ({ ...l, [k]: !l[k] }))}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
                      layers[k]
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                    )}
                    title={`Toggle ${LAYER_META[k].label}`}
                  >
                    {LAYER_META[k].icon}
                    {LAYER_META[k].label}
                  </button>
                )
              )}
            </div>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Tabs
              value={perspective}
              onValueChange={(v) => setPerspective(v as Perspective)}
            >
              <TabsList className="h-8">
                <TabsTrigger value="offense" className="text-xs px-2.5">
                  O
                </TabsTrigger>
                <TabsTrigger value="defense" className="text-xs px-2.5">
                  D
                </TabsTrigger>
                <TabsTrigger value="both" className="text-xs px-2.5">
                  Both
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={resetPositions}
                className="h-8"
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (isPlaying) {
                    setIsPlaying(false)
                    setActiveStep(-1)
                  } else {
                    setActiveStep(-1)
                    setIsPlaying(true)
                    setTimeout(() => setActiveStep(0), 50)
                  }
                }}
                className="h-8"
              >
                {isPlaying ? (
                  <>
                    <Pause className="size-3.5 mr-1.5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 mr-1.5" />
                    Animate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Field SVG */}
          <div className="relative bg-gradient-to-b from-[oklch(0.28_0.05_152)] to-[oklch(0.22_0.04_152)] p-2">
            <DndContext
              sensors={sensors}
              onDragEnd={(e: DragEndEvent) => {
                // Position is committed on pointer up in DraggablePlayer
                // This is a no-op to satisfy DndContext
              }}
            >
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full h-auto max-h-[60vh] block"
              style={{ background: 'transparent', touchAction: 'none' }}
            >
              <FootballFieldSvg />

              {/* Hash marker indicator */}
              <g>
                <text
                  x={12}
                  y={gy(diagram.yardLine) + 4}
                  fontSize={11}
                  fontWeight={700}
                  fill="oklch(0.68 0.18 55)"
                  fontFamily="var(--font-geist-mono)"
                >
                  {diagram.hash === 'L' ? '◄' : diagram.hash === 'R' ? '►' : '◆'}{' '}
                  {diagram.yardLine}
                </text>
              </g>

              {/* Render paths (under players) */}
              {layers.routes || layers.blocks || layers.motion || layers.reads ? (
                <g>
                  {animationOrder.map(({ p, i }, idx) => {
                    if (p.type === 'route' && !layers.routes) return null
                    if (p.type === 'block' && !layers.blocks) return null
                    if (p.type === 'motion' && !layers.motion) return null
                    if (p.type === 'read' && !layers.reads) return null
                    if (p.type === 'handoff' && !layers.motion) return null
                    const fromPlayer = playerLookup.get(p.from)
                    if (!fromPlayer) return null
                    return (
                      <PathRenderer
                        key={`path-${i}`}
                        path={p}
                        fromPlayer={fromPlayer}
                        activeStep={activeStep}
                        stepIndex={idx}
                        totalSteps={totalSteps}
                      />
                    )
                  })}
                </g>
              ) : null}

              {/* Render players */}
              {layers.players ? (
                <g>
                  {(perspective === 'offense' || perspective === 'both') &&
                    offPlayers.map((p) => {
                      const live = playerLookup.get(p.id)!
                      return (
                        <DraggablePlayer
                          key={`o-${p.id}`}
                          player={live}
                          side="offense"
                          onPositionChange={handlePositionChange}
                          isAnimated={
                            animationOrder.some(
                              ({ p: ap }) => ap.from === p.id
                            ) && activeStep >= 0
                          }
                        />
                      )
                    })}
                  {(perspective === 'defense' || perspective === 'both') &&
                    defPlayers.map((p) => {
                      const live = playerLookup.get(p.id)!
                      return (
                        <DraggablePlayer
                          key={`d-${p.id}`}
                          player={live}
                          side="defense"
                          onPositionChange={handlePositionChange}
                          isAnimated={false}
                        />
                      )
                    })}
                </g>
              ) : null}
            </svg>
            </DndContext>

            {/* Active step indicator */}
            {isPlaying && activeStep >= 0 && (
              <div className="absolute top-3 right-3 rounded-md bg-background/90 backdrop-blur border border-border px-2.5 py-1.5 text-xs font-mono">
                Step {activeStep + 1} / {totalSteps}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right rail: play info + picker + coaching points */}
      <div className="lg:col-span-4 xl:col-span-3">
        <ScrollArea className="h-[calc(100vh-9rem)] pr-3 scrollbar-thin">
          <div className="space-y-4">
            {/* Play info card */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] uppercase tracking-wide text-primary border-primary/40"
                >
                  {selectedPlay?.playId}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase tracking-wide"
                >
                  {selectedPlay?.side === 'offense' ? 'Offense' : 'Defense'}
                </Badge>
              </div>
              <h3 className="text-base font-semibold leading-tight">
                {selectedPlay?.name}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedPlay?.personnel && (
                  <Badge variant="outline" className="text-xs font-mono">
                    Pers {selectedPlay.personnel}
                  </Badge>
                )}
                {selectedPlay?.motion && (
                  <Badge
                    variant="outline"
                    className="text-xs font-mono border-accent/40 text-accent"
                  >
                    {selectedPlay.motion}
                  </Badge>
                )}
                {selectedPlay?.formation && (
                  <Badge variant="outline" className="text-xs">
                    {selectedPlay.formation.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Play picker */}
            <div className="rounded-lg border border-border bg-card p-4">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2 block">
                Loaded play
              </label>
              <Select
                value={selectedPlay?.id ?? ''}
                onValueChange={(v) => v && setSelectedPlayId(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a play to diagram" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {plays.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {p.playId}
                      </span>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Coaching point callout */}
            {selectedPlay?.coachingPoints && (
              <div className="rounded-lg border border-accent/40 bg-accent/5 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Crosshair className="size-3.5 text-accent" />
                  <span className="text-xs uppercase tracking-widest font-mono text-accent">
                    Coaching Point
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {selectedPlay.coachingPoints}
                </p>
              </div>
            )}

            {/* Read info */}
            {selectedPlay?.readType && (
              <div className="rounded-lg border border-border bg-card p-4">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2 block">
                  QB Read
                </span>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Type</div>
                    <div className="font-mono">
                      {selectedPlay.readType.replace(/_/g, ' ')}
                    </div>
                  </div>
                  {selectedPlay.readDefender && (
                    <div>
                      <div className="text-muted-foreground text-xs">Defender</div>
                      <div className="font-mono">
                        {selectedPlay.readDefender.replace(/_/g, ' ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Targets */}
            {selectedPlay && selectedPlay.coverageTargets.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2 block">
                  Coverage Targets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlay.coverageTargets.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="text-xs font-mono border-primary/30 text-primary"
                    >
                      {c.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Save button */}
            <Button
              onClick={handleSave}
              className="w-full"
              variant="default"
            >
              Save to Database
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default function PlayDesigner() {
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
      <DesignerMain />
    </QueryClientProvider>
  )
}
