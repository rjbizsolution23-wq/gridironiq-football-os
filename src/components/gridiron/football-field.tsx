'use client'

/**
 * FootballField — pure SVG football field renderer.
 *
 * Renders a realistic-looking football field at viewBox `0 0 1000 520`:
 *  - dark green turf gradient (with subtle mowing stripes)
 *  - white yard lines every 5 yards (40% opacity; goal lines + 50 thicker)
 *  - hash marks (left + right) every 1 yard
 *  - end zones with orange diagonal stripes (left & right strips)
 *  - yard-line numbers (10, 20, 30, 40, 50, 40, 30, 20, 10) at top & bottom
 *  - "GridironIQ" logo embossed at midfield
 *  - hash indicator triangle at top sideline (L / M / R)
 *
 * Purely presentational. Optional `children` are rendered inside the SVG so
 * callers can overlay players / paths (see PlayDiagram). The viewBox is
 * 1000×520 but the element is responsive via width/height props.
 *
 * Field orientation: LANDSCAPE — the long axis (end-zone to end-zone) runs
 * horizontally (along X), the short axis (sideline to sideline) runs vertically
 * (along Y). End zones are on the left (own) and right (opponent) ends.
 *
 * Coordinate mapping (football grid 0-100 → SVG):
 *   gridX (sideline to sideline, 0=top sideline, 100=bottom sideline) → svgY
 *   gridY (end zone to end zone, 0=own goal, 100=opponent goal) → svgX
 *
 * The seed data uses x=0..100 with 50=middle of field (sideline-to-sideline)
 * and y=0..100 with 70≈LOS (offensive perspective). The mapping above makes
 * the seed formations render correctly on the landscape field.
 */

import * as React from 'react'

// ----------------------------------------------------------------------------
//  Field geometry constants
// ----------------------------------------------------------------------------

export const FIELD_VIEWBOX = { width: 1000, height: 520 } as const

const END_ZONE_WIDTH = 80 // SVG units = 10 yards
export const PLAYABLE_X_START = END_ZONE_WIDTH
export const PLAYABLE_X_END = FIELD_VIEWBOX.width - END_ZONE_WIDTH
export const PLAYABLE_WIDTH = PLAYABLE_X_END - PLAYABLE_X_START // 840 = 100 yards

const SVG_PER_YARD_X = PLAYABLE_WIDTH / 100 // 8.4 SVG units per grid yard along the long axis
const SVG_PER_YARD_Y = FIELD_VIEWBOX.height / 100 // 5.2 SVG units per grid unit along the short axis

// Hash mark positions (along the short/vertical axis — top sideline at y=0)
export const HASH_LEFT_Y = FIELD_VIEWBOX.height / 3 // ~173
export const HASH_RIGHT_Y = (FIELD_VIEWBOX.height * 2) / 3 // ~347
const HASH_MID_Y = FIELD_VIEWBOX.height / 2 // 260
const HASH_TICK_WIDTH = 14 // SVG units

// ----------------------------------------------------------------------------
//  Coordinate conversion helpers (exported for use by PlayDiagram)
// ----------------------------------------------------------------------------

/** Convert football grid coords (0-100) to SVG coordinates. */
export function gridToSvg(gx: number, gy: number): { x: number; y: number } {
  return {
    x: PLAYABLE_X_START + gy * SVG_PER_YARD_X,
    y: gx * SVG_PER_YARD_Y,
  }
}

/** Inverse of gridToSvg. */
export function svgToGrid(sx: number, sy: number): { x: number; y: number } {
  return {
    x: sy / SVG_PER_YARD_Y,
    y: (sx - PLAYABLE_X_START) / SVG_PER_YARD_X,
  }
}

/** Convert a hash mark (L/M/R or left/middle/right) to its SVG y coordinate. */
export function hashToSvgY(hash: string): number {
  const h = hash.toUpperCase()
  if (h === 'L' || h === 'LEFT') return HASH_LEFT_Y
  if (h === 'R' || h === 'RIGHT') return HASH_RIGHT_Y
  return HASH_MID_Y
}

// ----------------------------------------------------------------------------
//  Component
// ----------------------------------------------------------------------------

export interface FootballFieldProps {
  width?: number | string
  height?: number | string
  /** Hash position indicator: "L"/"R"/"M" (or "left"/"right"/"middle"). */
  hash?: string
  className?: string
  children?: React.ReactNode
  /** Ref to the underlying <svg> element. Used by PlayDiagram for dnd-kit scale math. */
  svgRef?: React.Ref<SVGSVGElement>
}

export function FootballField({
  width = '100%',
  height = '100%',
  hash = 'M',
  className,
  children,
  svgRef,
}: FootballFieldProps) {
  // Yard lines every 5 yards (gridY 0,5,...,100 → svgX 80,122,...,920)
  const yardLines = React.useMemo(() => {
    const lines: { x: number; major: boolean }[] = []
    for (let i = 0; i <= 20; i++) {
      const x = PLAYABLE_X_START + i * (PLAYABLE_WIDTH / 20)
      const major = i === 0 || i === 20 || i === 10 // goal lines + 50
      lines.push({ x, major })
    }
    return lines
  }, [])

  // Hash marks every 1 yard (gridY 0..100 → svgX 80..920, 101 ticks)
  const hashMarks = React.useMemo(() => {
    const ticks: number[] = []
    for (let i = 0; i <= 100; i++) {
      ticks.push(PLAYABLE_X_START + i * SVG_PER_YARD_X)
    }
    return ticks
  }, [])

  // Field numbers: 10, 20, 30, 40, 50, 40, 30, 20, 10 (placed every 10 yards)
  const fieldNumbers = React.useMemo(() => {
    const seq = [1, 2, 3, 4, 5, 4, 3, 2, 1] // tens digits
    return seq.map((d, i) => {
      const gridY = 10 + i * 10
      const x = PLAYABLE_X_START + gridY * SVG_PER_YARD_X
      return { x, label: `${d}0` }
    })
  }, [])

  const hashTriangleY = hashToSvgY(hash)

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${FIELD_VIEWBOX.width} ${FIELD_VIEWBOX.height}`}
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Football field"
      style={{ display: 'block' }}
    >
      <defs>
        {/* Turf gradient */}
        <linearGradient id="field-turf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.32 0.05 152)" />
          <stop offset="100%" stopColor="oklch(0.28 0.04 152)" />
        </linearGradient>

        {/* End-zone orange diagonal stripes */}
        <pattern
          id="end-zone-stripes"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="7" height="14" fill="oklch(0.68 0.18 55 / 0.34)" />
          <rect x="7" width="7" height="14" fill="oklch(0.68 0.18 55 / 0.10)" />
        </pattern>

        {/* Mowing stripes (subtle vertical bands every 5 yards) */}
        <pattern
          id="mow-stripes"
          width={SVG_PER_YARD_X * 5}
          height={FIELD_VIEWBOX.height}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={SVG_PER_YARD_X * 2.5}
            height={FIELD_VIEWBOX.height}
            fill="oklch(0.32 0.05 152)"
          />
          <rect
            x={SVG_PER_YARD_X * 2.5}
            width={SVG_PER_YARD_X * 2.5}
            height={FIELD_VIEWBOX.height}
            fill="oklch(0.30 0.045 152)"
          />
        </pattern>

        {/* Midfield logo glow */}
        <radialGradient id="midfield-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.62 0.16 152 / 0.16)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* Arrow markers (used by PlayDiagram paths) */}
        <marker
          id="arrow-orange"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="oklch(0.68 0.18 55)" />
        </marker>
        <marker
          id="arrow-white"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="oklch(0.97 0.005 120)" />
        </marker>
      </defs>

      {/* === Field background === */}
      <rect
        x="0"
        y="0"
        width={FIELD_VIEWBOX.width}
        height={FIELD_VIEWBOX.height}
        fill="oklch(0.16 0.012 150)"
      />
      <rect
        x={PLAYABLE_X_START}
        y="0"
        width={PLAYABLE_WIDTH}
        height={FIELD_VIEWBOX.height}
        fill="url(#mow-stripes)"
      />
      <rect
        x={PLAYABLE_X_START}
        y="0"
        width={PLAYABLE_WIDTH}
        height={FIELD_VIEWBOX.height}
        fill="url(#field-turf)"
        opacity="0.85"
      />

      {/* === End zones (left = own, right = opponent) === */}
      <g>
        <rect
          x="0"
          y="0"
          width={END_ZONE_WIDTH}
          height={FIELD_VIEWBOX.height}
          fill="oklch(0.22 0.04 60)"
        />
        <rect
          x="0"
          y="0"
          width={END_ZONE_WIDTH}
          height={FIELD_VIEWBOX.height}
          fill="url(#end-zone-stripes)"
        />
        <text
          x={END_ZONE_WIDTH / 2}
          y={FIELD_VIEWBOX.height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
          fontWeight="800"
          fontFamily="var(--font-geist-mono, monospace)"
          fill="oklch(0.97 0.005 120 / 0.55)"
          transform={`rotate(-90 ${END_ZONE_WIDTH / 2} ${FIELD_VIEWBOX.height / 2})`}
        >
          OWN
        </text>
        <line
          x1={END_ZONE_WIDTH}
          y1="0"
          x2={END_ZONE_WIDTH}
          y2={FIELD_VIEWBOX.height}
          stroke="oklch(0.97 0.005 120 / 0.9)"
          strokeWidth="3"
        />

        <rect
          x={PLAYABLE_X_END}
          y="0"
          width={END_ZONE_WIDTH}
          height={FIELD_VIEWBOX.height}
          fill="oklch(0.22 0.04 60)"
        />
        <rect
          x={PLAYABLE_X_END}
          y="0"
          width={END_ZONE_WIDTH}
          height={FIELD_VIEWBOX.height}
          fill="url(#end-zone-stripes)"
        />
        <text
          x={PLAYABLE_X_END + END_ZONE_WIDTH / 2}
          y={FIELD_VIEWBOX.height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
          fontWeight="800"
          fontFamily="var(--font-geist-mono, monospace)"
          fill="oklch(0.97 0.005 120 / 0.55)"
          transform={`rotate(90 ${PLAYABLE_X_END + END_ZONE_WIDTH / 2} ${FIELD_VIEWBOX.height / 2})`}
        >
          OPP
        </text>
        <line
          x1={PLAYABLE_X_END}
          y1="0"
          x2={PLAYABLE_X_END}
          y2={FIELD_VIEWBOX.height}
          stroke="oklch(0.97 0.005 120 / 0.9)"
          strokeWidth="3"
        />
      </g>

      {/* === Midfield logo === */}
      <g>
        <ellipse
          cx={FIELD_VIEWBOX.width / 2}
          cy={FIELD_VIEWBOX.height / 2}
          rx="170"
          ry="100"
          fill="url(#midfield-glow)"
        />
        <text
          x={FIELD_VIEWBOX.width / 2}
          y={FIELD_VIEWBOX.height / 2 - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-geist-mono, monospace)"
          fontSize="30"
          fontWeight="800"
          letterSpacing="4"
          fill="oklch(0.97 0.005 120 / 0.16)"
        >
          GRIDIRON
        </text>
        <text
          x={FIELD_VIEWBOX.width / 2}
          y={FIELD_VIEWBOX.height / 2 + 24}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-geist-mono, monospace)"
          fontSize="18"
          fontWeight="700"
          letterSpacing="6"
          fill="oklch(0.68 0.18 55 / 0.28)"
        >
          IQ™
        </text>
      </g>

      {/* === Yard lines (vertical, every 5 yards) === */}
      <g>
        {yardLines.map(({ x, major }) => (
          <line
            key={`yl-${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2={FIELD_VIEWBOX.height}
            stroke="oklch(0.97 0.005 120 / 0.4)"
            strokeWidth={major ? 2.5 : 1.2}
          />
        ))}
      </g>

      {/* === Hash marks (every 1 yard, at left & right hash positions) === */}
      <g>
        {hashMarks.map((x, i) => (
          <g key={`hash-${i}`}>
            <line
              x1={x - HASH_TICK_WIDTH / 2}
              y1={HASH_LEFT_Y}
              x2={x + HASH_TICK_WIDTH / 2}
              y2={HASH_LEFT_Y}
              stroke="oklch(0.97 0.005 120 / 0.4)"
              strokeWidth="1.2"
            />
            <line
              x1={x - HASH_TICK_WIDTH / 2}
              y1={HASH_RIGHT_Y}
              x2={x + HASH_TICK_WIDTH / 2}
              y2={HASH_RIGHT_Y}
              stroke="oklch(0.97 0.005 120 / 0.4)"
              strokeWidth="1.2"
            />
          </g>
        ))}
      </g>

      {/* === Field numbers (top & bottom) === */}
      <g
        fill="oklch(0.97 0.005 120 / 0.3)"
        fontFamily="var(--font-geist-mono, monospace)"
        fontSize="18"
        fontWeight="700"
        textAnchor="middle"
      >
        {fieldNumbers.map((n, i) => (
          <g key={`num-${i}`}>
            <text x={n.x} y={30}>
              {n.label}
            </text>
            <text x={n.x} y={FIELD_VIEWBOX.height - 12}>
              {n.label}
            </text>
          </g>
        ))}
      </g>

      {/* === Sidelines (top & bottom border) === */}
      <g fill="none" stroke="oklch(0.97 0.005 120 / 0.85)" strokeWidth="2">
        <line x1="0" y1="0" x2={FIELD_VIEWBOX.width} y2="0" />
        <line
          x1="0"
          y1={FIELD_VIEWBOX.height}
          x2={FIELD_VIEWBOX.width}
          y2={FIELD_VIEWBOX.height}
        />
      </g>

      {/* === Hash indicator triangle (top sideline, pointing down) === */}
      <g>
        <polygon
          points={`${hashTriangleY - 9},0 ${hashTriangleY + 9},0 ${hashTriangleY},16`}
          fill="oklch(0.68 0.18 55 / 0.9)"
        />
      </g>

      {/* === Diagram overlay (players + paths) === */}
      {children}
    </svg>
  )
}

export default FootballField
