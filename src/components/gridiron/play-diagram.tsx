'use client'

/**
 * PlayDiagram — renders players + paths from a SerializedPlay.diagram on top
 * of the FootballField. Handles:
 *
 *  • Drag-and-drop of player circles via @dnd-kit/core (positions are reported
 *    back to the parent, which keeps them in a local `positionOverrides` map).
 *  • Layer visibility (players / routes / blocking / motion / reads / coverage).
 *  • Perspective filtering (offense only / defense only / both).
 *  • Animation highlight (a single `activePathIndex` is highlighted; others
 *    are dimmed).
 *  • "Draw Route" click-to-add mode: click a player (becomes the route start),
 *    then click anywhere on the field to add a dashed route path.
 *
 * Rendered as a `<g>` element to be placed inside the FootballField's `<svg>`.
 * The parent passes an `svgRef` so this component can convert CSS-pixel drag
 * deltas back to football grid coordinates.
 */

import * as React from 'react'
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'

import type { SerializedPlay } from '@/lib/data'
import {
  FIELD_VIEWBOX,
  PLAYABLE_X_END,
  PLAYABLE_X_START,
  gridToSvg,
} from './football-field'

// ----------------------------------------------------------------------------
//  Types
// ----------------------------------------------------------------------------

export type LayerKey =
  | 'players'
  | 'routes'
  | 'blocking'
  | 'motion'
  | 'reads'
  | 'coverage'

export type LayerVisibility = Record<LayerKey, boolean>

export type Perspective = 'offense' | 'defense' | 'both'

type DiagramPath = NonNullable<SerializedPlay['diagram']>['paths'][number]
type DiagramPlayer = NonNullable<SerializedPlay['diagram']>['players'][number]

export interface PlayDiagramProps {
  diagram: NonNullable<SerializedPlay['diagram']>
  layers: LayerVisibility
  perspective: Perspective
  /** Per-player position overrides from drag-and-drop (grid coords). */
  positionOverrides: Record<string, { x: number; y: number }>
  /** Called when a player is dragged to a new grid position. */
  onPlayerDragEnd: (id: string, x: number, y: number) => void
  /** Path index to highlight (during animation); null = no highlight. */
  activePathIndex: number | null
  /** When true, clicking a player selects them as the route start. */
  drawRouteMode: boolean
  /** Player id of the currently-selected route start (if any). */
  drawRouteStart: string | null
  /** Called when a player is clicked in draw-route mode. */
  onPlayerClick: (id: string) => void
  /** Called when the empty field is clicked in draw-route mode. SVG coords. */
  onFieldClick: (svgX: number, svgY: number) => void
  /** Ref to the parent <svg> — used for dnd-kit scale math. */
  svgRef?: React.RefObject<SVGSVGElement | null>
}

// ----------------------------------------------------------------------------
//  Constants — colors (NO indigo / blue)
// ----------------------------------------------------------------------------

const COLOR_OFFENSE_FILL = 'oklch(0.62 0.16 152)' // primary green
const COLOR_DEFENSE_FILL = 'oklch(0.5 0.1 195)' // chart-5 teal
const COLOR_PLAYER_STROKE = 'oklch(0.97 0.005 120)' // white
const COLOR_PLAYER_LABEL = 'oklch(0.97 0.005 120)' // white
const COLOR_ROUTE = 'oklch(0.68 0.18 55)' // accent orange
const COLOR_BLOCK = 'oklch(0.78 0.16 90)' // chart-3 gold
const COLOR_MOTION = 'oklch(0.97 0.005 120)' // white
const COLOR_READ = 'oklch(0.62 0.22 25)' // destructive red

// SVG_PER_YARD constants (mirrored from football-field.tsx for drag math)
const SVG_PER_YARD_X = (PLAYABLE_X_END - PLAYABLE_X_START) / 100 // 8.4
const SVG_PER_YARD_Y = FIELD_VIEWBOX.height / 100 // 5.2

// ----------------------------------------------------------------------------
//  Side classification — guess offense vs defense from the player label
// ----------------------------------------------------------------------------

const OFFENSE_LABELS = new Set([
  'QB', 'RB', 'FB', 'X', 'Y', 'Z', 'H', 'F', 'TE', 'WR', 'SB', 'WB',
  'LT', 'LG', 'C', 'RG', 'RT',
])

const DEFENSE_LABELS = new Set([
  'DE', 'DT', 'NG', 'N', 'MIKE', 'WILL', 'SAM', 'MAC', 'BUCK', 'RALPH',
  'CB', 'CB1', 'CB2', 'S', 'SS', 'FS', 'NB', 'DIME', 'M', 'W', 'SL',
  'E', 'T', 'T1', 'T2', 'E1', 'E2', 'CORN', 'STAR',
])

function classifySide(label: string): 'offense' | 'defense' | 'unknown' {
  const u = label.toUpperCase()
  if (OFFENSE_LABELS.has(u)) return 'offense'
  if (DEFENSE_LABELS.has(u)) return 'defense'
  // Heuristic fallback
  if (/^(DE|DT|NG|CB|SS|FS|NB|MIKE|WILL|SAM|MAC|BUCK|RALPH|DIME|STAR|CORN)/i.test(label)) {
    return 'defense'
  }
  if (/^(QB|RB|FB|WR|TE|LT|LG|RG|RT)/i.test(label)) return 'offense'
  return 'unknown'
}

// ----------------------------------------------------------------------------
//  Draggable player
// ----------------------------------------------------------------------------

interface DraggablePlayerProps {
  player: DiagramPlayer
  side: 'offense' | 'defense' | 'unknown'
  isReadDefender: boolean
  isActive: boolean
  dimmed: boolean
  drawRouteMode: boolean
  drawRouteStart: string | null
  onPlayerClick: (id: string) => void
}

function DraggablePlayer({
  player,
  side,
  isReadDefender,
  isActive,
  dimmed,
  drawRouteMode,
  drawRouteStart,
  onPlayerClick,
}: DraggablePlayerProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${player.id}`,
    disabled: drawRouteMode,
  })

  const { x, y } = gridToSvg(player.x, player.y)
  const fill = side === 'defense' ? COLOR_DEFENSE_FILL : COLOR_OFFENSE_FILL
  const isSelectedAsRouteStart = drawRouteMode && drawRouteStart === player.id

  // CSS transform during drag (in CSS pixels — dnd-kit default behavior).
  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: drawRouteMode
      ? 'pointer'
      : isDragging
        ? 'grabbing'
        : 'grab',
    touchAction: 'none',
    opacity: dimmed ? 0.5 : isDragging ? 0.92 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
    if (drawRouteMode) {
      e.stopPropagation()
      onPlayerClick(player.id)
    }
  }

  return (
    <g
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      data-player-id={player.id}
    >
      {/* Read defender pulse ring (outer) */}
      {isReadDefender && (
        <circle
          cx={x}
          cy={y}
          r="22"
          fill="none"
          stroke={COLOR_READ}
          strokeWidth="2.5"
          strokeDasharray="4 4"
          className="animate-pulse-soft"
        />
      )}

      {/* Active highlight ring (during animation) */}
      {isActive && (
        <circle
          cx={x}
          cy={y}
          r="18"
          fill="none"
          stroke={COLOR_ROUTE}
          strokeWidth="2.5"
          opacity="0.95"
        />
      )}

      {/* Draw-route selection ring */}
      {isSelectedAsRouteStart && (
        <circle
          cx={x}
          cy={y}
          r="18"
          fill="none"
          stroke={COLOR_ROUTE}
          strokeWidth="2.5"
          strokeDasharray="3 3"
        />
      )}

      {/* Player circle */}
      <circle
        cx={x}
        cy={y}
        r="13"
        fill={fill}
        stroke={COLOR_PLAYER_STROKE}
        strokeWidth="2"
      />

      {/* Player label */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="700"
        fill={COLOR_PLAYER_LABEL}
        fontFamily="var(--font-geist-sans, sans-serif)"
        pointerEvents="none"
      >
        {player.label}
      </text>
    </g>
  )
}

// ----------------------------------------------------------------------------
//  Path rendering
// ----------------------------------------------------------------------------

interface PathProps {
  from: { x: number; y: number }
  toX: number
  toY: number
  label?: string
  isActive: boolean
  dimmed: boolean
  dashed?: boolean
}

function RoutePath({ from, toX, toY, label, isActive, dimmed, dashed }: PathProps) {
  const start = gridToSvg(from.x, from.y)
  const end = gridToSvg(toX, toY)

  // Quadratic bezier with a perpendicular offset at the midpoint to give the
  // route a nice arc instead of a straight line.
  const dx = end.x - start.x
  const dy = end.y - start.y
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const arcHeight = Math.min(45, len * 0.28)
  const cpX = midX + (-dy / len) * arcHeight
  const cpY = midY + (dx / len) * arcHeight

  const pathD = `M ${start.x} ${start.y} Q ${cpX} ${cpY} ${end.x} ${end.y}`
  const opacity = dimmed ? 0.22 : 1
  const strokeWidth = isActive ? 4.5 : 3

  return (
    <g opacity={opacity}>
      <path
        d={pathD}
        fill="none"
        stroke={COLOR_ROUTE}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashed ? '5 4' : undefined}
        markerEnd="url(#arrow-orange)"
        className={isActive ? 'animate-pulse-soft' : undefined}
      />
      {label && (
        <text
          x={cpX}
          y={cpY - 6}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill={COLOR_ROUTE}
          fontFamily="var(--font-geist-mono, monospace)"
          pointerEvents="none"
        >
          {label}
        </text>
      )}
      {/* Endpoint dot */}
      <circle cx={end.x} cy={end.y} r="3" fill={COLOR_ROUTE} />
    </g>
  )
}

function BlockPath({ from, toX, toY, isActive, dimmed }: PathProps) {
  const start = gridToSvg(from.x, from.y)
  const end = gridToSvg(toX, toY)
  const opacity = dimmed ? 0.2 : 1
  const strokeWidth = isActive ? 4 : 2.5

  return (
    <g opacity={opacity}>
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={COLOR_BLOCK}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Block target dot (perpendicular T-cap look) */}
      <circle cx={end.x} cy={end.y} r="3.5" fill={COLOR_BLOCK} />
    </g>
  )
}

function MotionPath({ from, toX, toY, label, isActive, dimmed }: PathProps) {
  const start = gridToSvg(from.x, from.y)
  const end = gridToSvg(toX, toY)
  const opacity = dimmed ? 0.2 : 1
  const strokeWidth = isActive ? 3 : 2

  return (
    <g opacity={opacity}>
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={COLOR_MOTION}
        strokeWidth={strokeWidth}
        strokeDasharray="6 4"
        markerEnd="url(#arrow-white)"
        className={isActive ? 'animate-pulse-soft' : undefined}
      />
      {label && (
        <text
          x={(start.x + end.x) / 2}
          y={(start.y + end.y) / 2 - 8}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill={COLOR_MOTION}
          fontFamily="var(--font-geist-mono, monospace)"
          pointerEvents="none"
        >
          {label}
        </text>
      )}
      {/* Endpoint dot */}
      <circle cx={end.x} cy={end.y} r="3" fill={COLOR_MOTION} />
    </g>
  )
}

function ReadIndicator({ from, isActive, dimmed }: PathProps) {
  const pos = gridToSvg(from.x, from.y)
  const opacity = dimmed ? 0.2 : 1
  return (
    <g opacity={opacity}>
      <circle
        cx={pos.x}
        cy={pos.y}
        r={isActive ? 26 : 22}
        fill="none"
        stroke={COLOR_READ}
        strokeWidth={isActive ? 3 : 2.5}
        strokeDasharray="4 4"
        className="animate-pulse-soft"
      />
    </g>
  )
}

// ----------------------------------------------------------------------------
//  Main diagram
// ----------------------------------------------------------------------------

export function PlayDiagram({
  diagram,
  layers,
  perspective,
  positionOverrides,
  onPlayerDragEnd,
  activePathIndex,
  drawRouteMode,
  drawRouteStart,
  onPlayerClick,
  onFieldClick,
  svgRef,
}: PlayDiagramProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  // Resolve effective player positions (with overrides applied)
  const players = React.useMemo<DiagramPlayer[]>(() => {
    return diagram.players.map((p) => {
      const ov = positionOverrides[p.id]
      return { ...p, x: ov?.x ?? p.x, y: ov?.y ?? p.y }
    })
  }, [diagram.players, positionOverrides])

  const playersById = React.useMemo(() => {
    const map: Record<string, DiagramPlayer> = {}
    for (const p of players) map[p.id] = p
    return map
  }, [players])

  // Convert a CSS-pixel drag delta into football grid coords.
  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event
      if (!delta || (delta.x === 0 && delta.y === 0)) return
      const playerId = String(active.id).replace(/^player-/, '')
      const player = playersById[playerId]
      if (!player) return

      const svgEl = svgRef?.current
      if (!svgEl) return
      const rect = svgEl.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const pxPerSvgX = rect.width / FIELD_VIEWBOX.width
      const pxPerSvgY = rect.height / FIELD_VIEWBOX.height
      const svgDeltaX = delta.x / pxPerSvgX
      const svgDeltaY = delta.y / pxPerSvgY
      // gridX maps to svgY; gridY maps to svgX (see football-field.tsx).
      const gridDeltaX = svgDeltaY / SVG_PER_YARD_Y
      const gridDeltaY = svgDeltaX / SVG_PER_YARD_X

      const newX = Math.max(-10, Math.min(110, player.x + gridDeltaX))
      const newY = Math.max(-10, Math.min(110, player.y + gridDeltaY))
      onPlayerDragEnd(playerId, newX, newY)
    },
    [onPlayerDragEnd, playersById, svgRef],
  )

  // Resolve each path's "from" player (with overrides applied)
  const paths = React.useMemo(() => {
    return diagram.paths.map((p, i) => {
      const from = playersById[p.from] ?? { id: p.from, x: 50, y: 70, label: p.from }
      return { ...p, from, index: i }
    })
  }, [diagram.paths, playersById])

  // Layer-filtered path buckets
  const visibleRoutes = layers.routes ? paths.filter((p) => p.type === 'route') : []
  const visibleBlocks = layers.blocking ? paths.filter((p) => p.type === 'block') : []
  const visibleMotion = layers.motion ? paths.filter((p) => p.type === 'motion') : []
  const visibleReads = layers.reads ? paths.filter((p) => p.type === 'read') : []

  // Read defenders (referenced by read-type paths)
  const readDefenderIds = React.useMemo(
    () => new Set(visibleReads.map((p) => p.from.id)),
    [visibleReads],
  )

  // Player perspective filter
  const visiblePlayers = React.useMemo(() => {
    if (!layers.players) return []
    return players.filter((p) => {
      if (perspective === 'both') return true
      const side = classifySide(p.label)
      if (perspective === 'offense') return side !== 'defense'
      // defense perspective: show defense + unknown
      return side === 'defense' || side === 'unknown'
    })
  }, [layers.players, perspective, players])

  // Click on the SVG background (transparent catcher rect)
  const handleFieldClick = (e: React.MouseEvent<SVGRectElement>) => {
    if (!drawRouteMode || !drawRouteStart) return
    const rectEl = e.currentTarget
    const svgEl = rectEl.ownerSVGElement
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    const pxPerSvgX = rect.width / FIELD_VIEWBOX.width
    const pxPerSvgY = rect.height / FIELD_VIEWBOX.height
    const svgX = (e.clientX - rect.left) / pxPerSvgX
    const svgY = (e.clientY - rect.top) / pxPerSvgY
    onFieldClick(svgX, svgY)
  }

  const isAnyPathActive = activePathIndex !== null

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <g className="play-diagram">
        {/* Transparent click-catcher for draw-route destination clicks */}
        <rect
          x={0}
          y={0}
          width={FIELD_VIEWBOX.width}
          height={FIELD_VIEWBOX.height}
          fill="oklch(0 0 0 / 0)"
          pointerEvents={drawRouteMode && drawRouteStart ? 'all' : 'none'}
          onClick={handleFieldClick}
          style={{
            cursor: drawRouteMode && drawRouteStart ? 'crosshair' : 'default',
          }}
        />

        {/* === Coverage zones (placeholder tinted bands) === */}
        {layers.coverage && (
          <g opacity={isAnyPathActive ? 0.08 : 0.16}>
            <rect
              x={PLAYABLE_X_START}
              y={0}
              width={PLAYABLE_X_END - PLAYABLE_X_START}
              height={FIELD_VIEWBOX.height / 3}
              fill="oklch(0.5 0.1 195)"
            />
            <rect
              x={PLAYABLE_X_START}
              y={FIELD_VIEWBOX.height / 3}
              width={PLAYABLE_X_END - PLAYABLE_X_START}
              height={FIELD_VIEWBOX.height / 3}
              fill="oklch(0.62 0.16 152)"
            />
            <rect
              x={PLAYABLE_X_START}
              y={(FIELD_VIEWBOX.height * 2) / 3}
              width={PLAYABLE_X_END - PLAYABLE_X_START}
              height={FIELD_VIEWBOX.height / 3}
              fill="oklch(0.5 0.1 195)"
            />
          </g>
        )}

        {/* === Motion paths === */}
        <g>
          {visibleMotion.map((p) => (
            <MotionPath
              key={`motion-${p.index}`}
              from={p.from}
              toX={p.toX}
              toY={p.toY}
              label={p.label}
              dashed={p.dashed}
              isActive={activePathIndex === p.index}
              dimmed={isAnyPathActive && activePathIndex !== p.index}
            />
          ))}
        </g>

        {/* === Block paths === */}
        <g>
          {visibleBlocks.map((p) => (
            <BlockPath
              key={`block-${p.index}`}
              from={p.from}
              toX={p.toX}
              toY={p.toY}
              label={p.label}
              dashed={p.dashed}
              isActive={activePathIndex === p.index}
              dimmed={isAnyPathActive && activePathIndex !== p.index}
            />
          ))}
        </g>

        {/* === Route paths === */}
        <g>
          {visibleRoutes.map((p) => (
            <RoutePath
              key={`route-${p.index}`}
              from={p.from}
              toX={p.toX}
              toY={p.toY}
              label={p.label}
              dashed={p.dashed}
              isActive={activePathIndex === p.index}
              dimmed={isAnyPathActive && activePathIndex !== p.index}
            />
          ))}
        </g>

        {/* === Read indicators (drawn around read defenders, even if players layer hidden) === */}
        <g>
          {visibleReads.map((p) => (
            <ReadIndicator
              key={`read-${p.index}`}
              from={p.from}
              toX={p.toX}
              toY={p.toY}
              label={p.label}
              isActive={activePathIndex === p.index}
              dimmed={isAnyPathActive && activePathIndex !== p.index}
            />
          ))}
        </g>

        {/* === Players === */}
        <g>
          {visiblePlayers.map((p) => {
            const side = classifySide(p.label)
            return (
              <DraggablePlayer
                key={p.id}
                player={p}
                side={side}
                isReadDefender={readDefenderIds.has(p.id)}
                isActive={false}
                dimmed={isAnyPathActive}
                drawRouteMode={drawRouteMode}
                drawRouteStart={drawRouteStart}
                onPlayerClick={onPlayerClick}
              />
            )
          })}
        </g>
      </g>
    </DndContext>
  )
}

export default PlayDiagram
