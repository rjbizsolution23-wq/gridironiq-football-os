/**
 * GridironIQ™ — Football Domain Knowledge Library
 * ===============================================
 *
 * Pure TypeScript constants + types describing the football domain.
 * Used across the UI for dropdowns, badges, route trees, formation libraries,
 * play-family templates, and situation filters.
 *
 * No Prisma, no React, no Node-only APIs — safe to import from any client
 * or server component. ES module syntax. No default exports.
 */

// ============================================================================
//  Philosophy
// ============================================================================

/**
 * Offensive philosophy descriptor — used in the team profile UI.
 */
export interface Philosophy {
  id: string;
  name: string;
  description: string;
  /** True if this philosophy leans heavily on run game (>=55% rush share) */
  runHeavy: boolean;
  /** True if RPO concepts are a core pillar of the system */
  rpoHeavy: boolean;
  /** True if the system throws the ball >=55% of the time */
  passHeavy: boolean;
}

export const PHILOSOPHIES: Philosophy[] = [
  {
    id: "spread",
    name: "Spread",
    description:
      "Spread the field with 10/11 personnel in 2x2 or 3x1 sets; QB in gun. Built on Inside Zone, RPOs, and quick game. Modern default.",
    runHeavy: false,
    rpoHeavy: true,
    passHeavy: false,
  },
  {
    id: "air_raid",
    name: "Air Raid",
    description:
      "Four-verticals, Mesh, and Y-Cross based. 10 personnel 2x2/empty. High-volume passing with quick rhythm.",
    runHeavy: false,
    rpoHeavy: false,
    passHeavy: true,
  },
  {
    id: "west_coast",
    name: "West Coast",
    description:
      "Ball-control horizontal passing game. Slant/arrow, stick, drive concepts. Under center & gun. Run-play-action balance.",
    runHeavy: false,
    rpoHeavy: false,
    passHeavy: true,
  },
  {
    id: "pro_style",
    name: "Pro Style",
    description:
      "Multiple personnel with under-center core. Power, Duo, PA Boot. Drop-back game built off play-action.",
    runHeavy: false,
    rpoHeavy: false,
    passHeavy: false,
  },
  {
    id: "pistol",
    name: "Pistol",
    description:
      "RB aligned directly behind QB at 7 yards. Directional run game (Zone Read, Power Read, Veer). Balanced run/pass.",
    runHeavy: true,
    rpoHeavy: false,
    passHeavy: false,
  },
  {
    id: "wing_t",
    name: "Wing-T",
    description:
      "Wingback motion series — Buck Sweep, Belly, Trap, Down. Run-heavy with complementary play-action.",
    runHeavy: true,
    rpoHeavy: false,
    passHeavy: false,
  },
  {
    id: "flexbone",
    name: "Flexbone",
    description:
      "Triple option base — dive, keep, pitch. Two slotbacks. Time-of-possession run-heavy.",
    runHeavy: true,
    rpoHeavy: false,
    passHeavy: false,
  },
  {
    id: "rpo_heavy",
    name: "RPO-heavy",
    description:
      "Built on third-level RPO tree (Glance, Bubble, Stick). QB reads apex/force defender post-snap.",
    runHeavy: false,
    rpoHeavy: true,
    passHeavy: false,
  },
  {
    id: "power_gap",
    name: "Power / Gap",
    description:
      "Gap-scheme run game — Power, Counter, Trap, Wham. Pulling OL. Run-play-action heavy.",
    runHeavy: true,
    rpoHeavy: false,
    passHeavy: false,
  },
  {
    id: "zone_based",
    name: "Zone-based",
    description:
      "Inside Zone and Outside Zone framework. Covered/uncovered rules. Modern spread run answer.",
    runHeavy: true,
    rpoHeavy: false,
    passHeavy: false,
  },
  {
    id: "multiple",
    name: "Multiple Offense",
    description:
      "Mixes spread, pro, and gap concepts. No single philosophy — adapts week to week.",
    runHeavy: false,
    rpoHeavy: false,
    passHeavy: false,
  },
];

// ============================================================================
//  Offensive concepts
// ============================================================================

/** High-level concept class. */
export type OffensiveConceptType =
  | "run"
  | "pass"
  | "rpo"
  | "play_action"
  | "screen"
  | "boot"
  | "shot";

export interface OffensiveConcept {
  id: string;
  name: string;
  family: string;
  type: OffensiveConceptType;
  coachingPoint: string;
}

export const OFFENSIVE_CONCEPTS: OffensiveConcept[] = [
  // ---- Run: Zone family ----
  {
    id: "inside_zone",
    name: "Inside Zone",
    family: "Zone",
    type: "run",
    coachingPoint:
      "Covered OL block playside gap, uncovered OL reach to playside A and climb. RB aims playside A, eyes backside 1.",
  },
  {
    id: "outside_zone",
    name: "Outside Zone",
    family: "Zone",
    type: "run",
    coachingPoint:
      "Stretch the front side; reach & cutoff on the backside. RB presses the edge, cuts up when defense over-commits.",
  },
  {
    id: "wide_zone",
    name: "Wide Zone",
    family: "Zone",
    type: "run",
    coachingPoint:
      "Outside zone with wider landmark — RB aims outside the tackle. Forces defense to widen, opens cutback lanes.",
  },
  {
    id: "split_zone",
    name: "Split Zone",
    family: "Zone",
    type: "run",
    coachingPoint:
      "IZ scheme with backside OL wrapping to cut backside DE. Slows backside pursuit, gives RB cutback lane.",
  },
  {
    id: "duo",
    name: "Duo",
    family: "Man",
    type: "run",
    coachingPoint:
      "Double-team first DL play side, climb to second level. RB reads Mike — cut opposite his flow.",
  },
  // ---- Run: Power / Gap family ----
  {
    id: "power",
    name: "Power",
    family: "Gap",
    type: "run",
    coachingPoint:
      "Kickout DE with pulling guard (or H), lead through hole with backside guard or fullback. Classic power gap.",
  },
  {
    id: "counter",
    name: "Counter",
    family: "Gap",
    type: "run",
    coachingPoint:
      "Fake flow one way, pull backside guard and tackle (or just guard) to play side. RB aims backside A and bounces front side.",
  },
  {
    id: "gt_counter",
    name: "GT Counter",
    family: "Gap",
    type: "run",
    coachingPoint:
      "Counter with guard & tackle pulling. Guard kicks DE, tackle wraps to LB. Constraint to fast-flowing defenses.",
  },
  {
    id: "trap",
    name: "Trap",
    family: "Gap",
    type: "run",
    coachingPoint:
      "Pull backside guard to trap play-side DL over tackle. Classic quick-hitting gap scheme.",
  },
  {
    id: "wham",
    name: "Wham",
    family: "Gap",
    type: "run",
    coachingPoint:
      "TE or H back wham-blocks an uncovered DL inside. RB hits the gap fast. Used vs wide alignments.",
  },
  {
    id: "pin_pull",
    name: "Pin / Pull",
    family: "Gap",
    type: "run",
    coachingPoint:
      "Pin down on first DL play side, pull around the corner. Tackle pulls as lead blocker.",
  },
  {
    id: "buck_sweep",
    name: "Buck Sweep",
    family: "Gap",
    type: "run",
    coachingPoint:
      "Wing-T classic — two pullers (guard & tackle / guard & wingback) lead around the corner. QB fakes inside.",
  },
  {
    id: "jet_sweep",
    name: "Jet Sweep",
    family: "Constraint",
    type: "run",
    coachingPoint:
      "RB in jet motion receives the handoff outside the tackle. OL blocks outside zone track to play side.",
  },
  {
    id: "toss",
    name: "Toss",
    family: "Gap",
    type: "run",
    coachingPoint:
      "Pitch to RB outside the tackle with a lead blocker. Fast perimeter run.",
  },
  {
    id: "stretch",
    name: "Stretch",
    family: "Zone",
    type: "run",
    coachingPoint:
      "Outside zone stretch — OL reaches play side, RB presses edge and cuts up when blocked.",
  },
  {
    id: "draw",
    name: "Draw",
    family: "Pass-Constraint",
    type: "run",
    coachingPoint:
      "QB drops like pass, hands to RB on draw path. Slows down rush, sets up cutback.",
  },
  {
    id: "qb_power",
    name: "QB Power",
    family: "QB Run",
    type: "run",
    coachingPoint:
      "Power read — QB keeps on the backside with lead blockers. Constraint vs defensive end pinning inside.",
  },
  {
    id: "qb_counter",
    name: "QB Counter",
    family: "QB Run",
    type: "run",
    coachingPoint:
      "QB counter path with pulling guard and lead blockers — backside constraint off zone reads.",
  },
  {
    id: "power_read",
    name: "Power Read",
    family: "QB Run",
    type: "run",
    coachingPoint:
      "Power O with QB/RB read on the backside end. End crashes → QB keeps; end sits → RB runs power.",
  },
  {
    id: "zone_read",
    name: "Zone Read",
    family: "QB Run",
    type: "run",
    coachingPoint:
      "Inside Zone with read on backside DE. DE crashes → QB keeps; DE sits → hand to RB.",
  },
  {
    id: "bash",
    name: "Bash",
    family: "QB Run",
    type: "run",
    coachingPoint:
      "Back away — RB goes away, QB keeps backside with lead blockers. Constraint to inside zone.",
  },
  {
    id: "speed_option",
    name: "Speed Option",
    family: "Option",
    type: "run",
    coachingPoint:
      "QB attacks edge with pitch read on the force defender. Pitch if force turns, keep if force sits.",
  },
  {
    id: "triple_option",
    name: "Triple Option",
    family: "Option",
    type: "run",
    coachingPoint:
      "Dive/keep/pitch triple option — QB reads dive key first, then pitch key. Flexbone base.",
  },
  // ---- Pass families ----
  {
    id: "quick_game",
    name: "Quick Game",
    family: "Quick Game",
    type: "pass",
    coachingPoint:
      "3-step drop, ball out quick. Slant/arrow, stick, snag, out/flat. Beats press and man-blitz.",
  },
  {
    id: "dropback",
    name: "Dropback",
    family: "Dropback",
    type: "pass",
    coachingPoint:
      "5-step timing routes — dig, post, corner, cross. Read coverage pre-snap, throw progression.",
  },
  {
    id: "play_action",
    name: "Play Action",
    family: "Play Action",
    type: "play_action",
    coachingPoint:
      "Sell run fake, roll or set up. Read safety driven by run-action. PA Flood, Y-Cross, Boot concepts.",
  },
  {
    id: "boot",
    name: "Boot",
    family: "Boot",
    type: "boot",
    coachingPoint:
      "QB rolls away from run action with boot concept (flood, sail, waggle). Read flat to deep third safety.",
  },
  {
    id: "movement_pass",
    name: "Movement Pass",
    family: "Boot",
    type: "boot",
    coachingPoint:
      "Designed QB movement — sprint out or keep pass. Shortens field for QB, creates roll-out reads.",
  },
  {
    id: "screens",
    name: "Screens",
    family: "Screen",
    type: "screen",
    coachingPoint:
      "Tunnel, bubble, RB screen, jailbreak. Constraint vs aggressive pass rush and DB sitting on routes.",
  },
  {
    id: "rpo",
    name: "RPO",
    family: "RPO",
    type: "rpo",
    coachingPoint:
      "Run/pass option tied to a conflict defender. OL blocks run, QB reads defender post-snap — hand or throw.",
  },
  {
    id: "shot_plays",
    name: "Shot Plays",
    family: "Shot",
    type: "shot",
    coachingPoint:
      "Deep vertical shots — four verts, post-dig, post-corner. Used vs Cover 3 / Cover 2 shells.",
  },
  {
    id: "empty",
    name: "Empty",
    family: "Empty",
    type: "pass",
    coachingPoint:
      "5-receiver empty sets — 3x2 or 4x1. Forces speed substitution, attacks weak-link defender.",
  },
  // ---- Pass concepts ----
  {
    id: "flood",
    name: "Flood",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Three-level flood to one side: deep corner, intermediate out, flat. Read the deep third safety.",
  },
  {
    id: "mesh",
    name: "Mesh",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Two shallow crossers rubbing at 5-6 yards. Dig and wheel combo. Read mesh point: vs man throw crosser; vs zone throw dig.",
  },
  {
    id: "y_cross",
    name: "Y-Cross",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "TE runs deep cross at 16-18. Read middle safety — if he drives cross, throw post behind; if he sits, throw cross in front.",
  },
  {
    id: "four_verticals",
    name: "Four Verticals",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Push all four verticals. Vs Cover 2 throw seam; vs Cover 3 throw middle void; vs Quarters read 2 vertical.",
  },
  {
    id: "drive",
    name: "Drive",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Shallow crosser under a dig. Cross picks the chase defender. Quick 3-step rhythm concept.",
  },
  {
    id: "shallow",
    name: "Shallow",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Shallow crosser at 4-5 yards as primary. Read defense over the top. Beats man with rubs.",
  },
  {
    id: "dagger",
    name: "Dagger",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Vertical clears with dig underneath. Read the safety — if he drives dig, throw post behind.",
  },
  {
    id: "mills",
    name: "Mills",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Post over a dig. Read deep safety — if he sits deep, throw dig; if he drives dig, throw post.",
  },
  {
    id: "smash",
    name: "Smash",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "#1 corner (smash), #2 deep out, #3 sit. Read CB — if CB sits, throw deep out; if CB squats on corner, throw out.",
  },
  {
    id: "stick",
    name: "Stick",
    family: "Quick Game",
    type: "pass",
    coachingPoint:
      "#2 flat, #1 stick (quick out at 4). Read apex — if apex flattens, throw stick; if apex sits, throw flat.",
  },
  {
    id: "spacing",
    name: "Spacing",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Three-receiver spacing at 5, 5, 5 to one side — sit, flat, sit. Quick spacing vs zone.",
  },
  {
    id: "snag",
    name: "Snag",
    family: "Quick Game",
    type: "pass",
    coachingPoint:
      "Flat, corner, snag (stop-route). Read flat defender to corner. Classic 3-level quick concept.",
  },
  {
    id: "levels",
    name: "Levels",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Two receivers at different levels — dig at 12, cross at 6. Read defense in the middle of the field.",
  },
  {
    id: "sail",
    name: "Sail",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Vertical clear, deep out, flat. Three-level flood to single-receiver side. Sail high to flat low.",
  },
  {
    id: "scissors",
    name: "Scissors",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Post-corner combo on two receivers. Read the safety — high-low the deep third.",
  },
  {
    id: "post_wheel",
    name: "Post-Wheel",
    family: "Concept",
    type: "pass",
    coachingPoint:
      "Post over wheel — high-low the deep third safety. Big-play concept vs Cover 3 / Quarters.",
  },
];

// ============================================================================
//  Defensive fronts
// ============================================================================

export interface DefensiveFront {
  id: string;
  name: string;
  alignment: string;
  description: string;
}

export const DEFENSIVE_FRONTS: DefensiveFront[] = [
  {
    id: "4_2_5",
    name: "4-2-5",
    alignment: "4 DL / 2 LB / 5 DB",
    description:
      "Modern spread-defense base. Four-down front, two LBs, five DBs. Matches 10/11 personnel spread.",
  },
  {
    id: "4_3",
    name: "4-3",
    alignment: "4 DL / 3 LB / 4 DB",
    description:
      "Traditional 4-3 — Over or Under. Base personnel vs 21/12. 3-tech and 1-tech DT alignment.",
  },
  {
    id: "3_4",
    name: "3-4",
    alignment: "3 DL / 4 LB / 4 DB",
    description:
      "Three-down with two OLBs on the edge. Versatile pressure looks. Base for pro-style opponents.",
  },
  {
    id: "3_3_5",
    name: "3-3-5",
    alignment: "3 DL / 3 LB / 5 DB",
    description:
      "Stack defense — three LBs stacked behind DL. Multiple simulated pressure looks. Spread-base.",
  },
  {
    id: "mint",
    name: "Mint",
    alignment: "4-2-5 with reduced splits",
    description:
      "Mint front — 4-down with reduced DT splits (3-tech / 1-tech shaded). Stuffs inside zone.",
  },
  {
    id: "tite",
    name: "Tite",
    alignment: "4i-0-4i with 5-tech OLBs",
    description:
      "Tite front — 4i DL inside OTs, head-up nose, OLBs on edge. Eliminates inside zone, forces bounce.",
  },
  {
    id: "bear",
    name: "Bear",
    alignment: "3 DL head-up (0/2/2) + 2 LB",
    description:
      "Bear front — head-up DT, two head-up DEs. Used in goal line / short yardage. Six-man box.",
  },
  {
    id: "odd",
    name: "Odd",
    alignment: "5-2 or 3-4 odd stack",
    description:
      "Odd front — center, two 5-tech DEs. Stack LBs behind. Two-high friendly.",
  },
  {
    id: "even",
    name: "Even",
    alignment: "4 DL in 4-0-4-0 (even)",
    description:
      "Even front — two 4-tech DEs and two 1-tech DTs. Strong vs gap schemes.",
  },
  {
    id: "nickel",
    name: "Nickel",
    alignment: "Sub package — 5 DBs",
    description:
      "Substitution package — third CB on the field (nickel). Used on likely passing downs.",
  },
  {
    id: "dime",
    name: "Dime",
    alignment: "Sub package — 6 DBs",
    description:
      "Substitution package — six DBs (two extra). Long-yardage and two-minute defense.",
  },
  {
    id: "goal_line",
    name: "Goal Line",
    alignment: "Heavy front (5-3 or 6-2)",
    description:
      "Goal-line defense — heavy box, minimal coverage. Used inside the 5-yard line.",
  },
  {
    id: "prevent",
    name: "Prevent",
    alignment: "3-deep / 4-deep shell",
    description:
      "Prevent defense — keep everything in front. Used end of half with multi-score lead.",
  },
];

// ============================================================================
//  Coverages
// ============================================================================

export type CoverageType = "man" | "zone" | "match" | "bracket";

export interface Coverage {
  id: string;
  name: string;
  type: CoverageType;
  description: string;
}

export const COVERAGES: Coverage[] = [
  {
    id: "cover_0",
    name: "Cover 0",
    type: "man",
    description:
      "Pure man-to-man with no deep safety help. Pressure package — must get home.",
  },
  {
    id: "cover_1",
    name: "Cover 1",
    type: "man",
    description:
      "Man-free — man across with one deep middle safety. Pressure-friendly man coverage.",
  },
  {
    id: "cover_1_robber",
    name: "Cover 1 Robber",
    type: "man",
    description:
      "Man-free with safety robbing the middle (robber). Reads the QB's eyes.",
  },
  {
    id: "cover_2",
    name: "Cover 2",
    type: "zone",
    description:
      "Two-deep safety shell, five underneath zones. Corners funnel #1 vertical to safety. Vulnerable to seams.",
  },
  {
    id: "tampa_2",
    name: "Tampa 2",
    type: "zone",
    description:
      "Cover 2 with Mike running the middle deep third. Protects the seam hole of Cover 2.",
  },
  {
    id: "cover_3",
    name: "Cover 3",
    type: "zone",
    description:
      "Three-deep thirds, four underneath. Single-high shell. Strong vs four verticals with seam-hole read.",
  },
  {
    id: "cover_3_match",
    name: "Cover 3 Match",
    type: "match",
    description:
      "C3 with match principles — apex carries #2 vertical, corners cloud #1. Match convert vs trips.",
  },
  {
    id: "quarters",
    name: "Quarters (Cover 4)",
    type: "match",
    description:
      "Two-high read coverage. Read #2 vertical — match vertical, half-turn vs flat, switch vs crossers.",
  },
  {
    id: "palms",
    name: "Palms",
    type: "match",
    description:
      "Quarters variant — safeties read 2 vertical and overhang. Bracket seams vs 4 verts.",
  },
  {
    id: "cover_6",
    name: "Cover 6",
    type: "match",
    description:
      "Half-quarters (Cover 4) to one side, Cover 2 to the other. Used to field/boundary split.",
  },
  {
    id: "bracket",
    name: "Bracket",
    type: "bracket",
    description:
      "Two defenders bracket one receiver (high/low or in/out). Used vs elite WR or in red zone.",
  },
  {
    id: "box",
    name: "Box",
    type: "zone",
    description:
      "Heavy box coverage — eight in the box, single high. Run-first defense vs heavy personnel.",
  },
  {
    id: "cone",
    name: "Cone",
    type: "zone",
    description:
      "Three-deep cone — three defenders drop to deep thirds with cone landmark. End of half / prevent.",
  },
  {
    id: "red_zone_match",
    name: "Red Zone Match",
    type: "match",
    description:
      "Match coverage compressed for red zone. Carries verticals, caps corners, fits flat.",
  },
];

// ============================================================================
//  Pressures
// ============================================================================

export interface Pressure {
  id: string;
  name: string;
  description: string;
}

export const PRESSURES: Pressure[] = [
  {
    id: "traditional_blitz",
    name: "Traditional Blitz",
    description:
      "Five or six rushers, man coverage behind. Send LB or DB over the top. Brings real heat, exposes coverage.",
  },
  {
    id: "zone_pressure",
    name: "Zone Pressure",
    description:
      "Five rushers with zone coverage behind. Keeps disguise, protects deep. Modern base pressure.",
  },
  {
    id: "simulated_pressure",
    name: "Simulated Pressure",
    description:
      "Show six rushers, bring four with two dropping into coverage. Confuses OL protection count and QB read.",
  },
  {
    id: "creeper",
    name: "Creeper",
    description:
      "DL shows rush, drops to flat/hook. LB replaces him as rusher. Brings four from a six-man look.",
  },
  {
    id: "fire_zone",
    name: "Fire Zone",
    description:
      "Three-deep, three-under fire zone pressure. Sends six, drops three. Strong vs spread.",
  },
  {
    id: "overload",
    name: "Overload",
    description:
      "Stack rushers to one side to overload protection. Brings five with a numbers advantage.",
  },
  {
    id: "cross_dog",
    name: "Cross Dog",
    description:
      "Two LBs cross paths through A and B gaps. Slows OL pickup and creates pass-rush lanes.",
  },
  {
    id: "edge_pressure",
    name: "Edge Pressure",
    description:
      "Bring a DB or OLB off the edge. Forces QB to step up into interior rush.",
  },
  {
    id: "interior_pressure",
    name: "Interior Pressure",
    description:
      "Bring LB or safety through the A or B gap. Collapses pocket, flushes QB outside.",
  },
  {
    id: "replacement_pressure",
    name: "Replacement Pressure",
    description:
      "Rusher over a defender's alignment then drops, replaced by another blitzer. Confuses QB's hot read.",
  },
];

// ============================================================================
//  Situations
// ============================================================================

export interface Situation {
  id: string;
  label: string;
  /** Down label like "1st", "2nd", "3rd", "4th" — or special marker. */
  downRange: string;
  /** Filter for down (if applicable). */
  downFilter?: number;
  /** Min distance filter. */
  distanceFilter?: number;
  /** Max distance filter (uses the lower number for ranges like 4-6). */
  distanceFilterMax?: number;
  /** Hash filter: "left" | "right" | "middle". */
  hashFilter?: "left" | "right" | "middle";
  /** Field zone filter, e.g. "backed_up", "high_red". */
  fieldZone?: string;
}

export const SITUATIONS: Situation[] = [
  {
    id: "1st_10",
    label: "1st & 10",
    downRange: "1st",
    downFilter: 1,
    distanceFilter: 10,
    distanceFilterMax: 10,
  },
  {
    id: "2nd_long",
    label: "2nd & Long",
    downRange: "2nd",
    downFilter: 2,
    distanceFilter: 8,
  },
  {
    id: "2nd_medium",
    label: "2nd & Medium",
    downRange: "2nd",
    downFilter: 2,
    distanceFilter: 5,
    distanceFilterMax: 7,
  },
  {
    id: "2nd_short",
    label: "2nd & Short",
    downRange: "2nd",
    downFilter: 2,
    distanceFilter: 1,
    distanceFilterMax: 3,
  },
  {
    id: "3rd_short",
    label: "3rd & Short (1-3)",
    downRange: "3rd",
    downFilter: 3,
    distanceFilter: 1,
    distanceFilterMax: 3,
  },
  {
    id: "3rd_medium",
    label: "3rd & Medium (4-6)",
    downRange: "3rd",
    downFilter: 3,
    distanceFilter: 4,
    distanceFilterMax: 6,
  },
  {
    id: "3rd_long",
    label: "3rd & Long (7+)",
    downRange: "3rd",
    downFilter: 3,
    distanceFilter: 7,
  },
  {
    id: "backed_up",
    label: "Backed Up (own 1-10)",
    downRange: "any",
    fieldZone: "backed_up",
  },
  {
    id: "coming_out",
    label: "Coming Out (own 10-25)",
    downRange: "any",
    fieldZone: "coming_out",
  },
  {
    id: "open_field",
    label: "Open Field (25-25)",
    downRange: "any",
    fieldZone: "open_field",
  },
  {
    id: "high_red",
    label: "High Red (25-15)",
    downRange: "any",
    fieldZone: "high_red",
  },
  {
    id: "low_red",
    label: "Low Red (15-5)",
    downRange: "any",
    fieldZone: "low_red",
  },
  {
    id: "goal_line",
    label: "Goal Line (5-in)",
    downRange: "any",
    fieldZone: "goal_line",
  },
  {
    id: "2_point",
    label: "2 Point",
    downRange: "try",
    fieldZone: "2_point",
  },
  {
    id: "4_minute",
    label: "4 Minute",
    downRange: "any",
    fieldZone: "4_minute",
  },
  {
    id: "2_minute",
    label: "2 Minute",
    downRange: "any",
    fieldZone: "2_minute",
  },
];

// ============================================================================
//  Route tree
// ============================================================================

export interface RouteTreeEntry {
  /** Standard route tree number 0-12. */
  number: number;
  name: string;
  /** Typical depth in yards at the top of the stem (0 for non-vertical routes). */
  depth: number;
  notes: string;
}

/**
 * The classic West Coast route tree. Numbered 0-12.
 * Used for play diagram legend and route picker UI.
 */
export const ROUTE_TREE: RouteTreeEntry[] = [
  { number: 0, name: "Flat", depth: 0, notes: "Drive flat to sideline at 0-2 yards. Quick game & screen route." },
  { number: 1, name: "Quick Out", depth: 3, notes: "Sharp 90° break at 3 yards. Quick game base route." },
  { number: 2, name: "Slant", depth: 3, notes: "45° inside break at 3-5 yards. Quick game vs man." },
  { number: 3, name: "Out", depth: 8, notes: "90° break to sideline at 8-10 yards. Stem + drive out." },
  { number: 4, name: "Curl", depth: 10, notes: "Hook back to QB at 10-12 yards. Vs zone settle in window." },
  { number: 5, name: "Comeback", depth: 12, notes: "Drive vertical then break back to sideline at 12 yards." },
  { number: 6, name: "In / Dig", depth: 12, notes: "90° inside break at 12 yards. Vs Cover 3 sit in window." },
  { number: 7, name: "Corner", depth: 12, notes: "Drive vertical then break to corner at 12-18 yards." },
  { number: 8, name: "Post", depth: 12, notes: "Drive vertical then break to post at 12-14 yards." },
  { number: 9, name: "Fade / Go", depth: 25, notes: "Vertical release — win up the field. Stack and run." },
  { number: 10, name: "Wheel", depth: 18, notes: "Flat release then up the sideline — RB or slot wheel." },
  { number: 11, name: "Crosser / Mesh", depth: 5, notes: "Shallow crosser at 5-6 yards — Mesh concept." },
  { number: 12, name: "Stick", depth: 4, notes: "Quick out at 4 yards — Stick concept base route." },
];

// ============================================================================
//  Play family template
// ============================================================================

/**
 * Standard play-family structure derived from a single base concept.
 * One blocking framework (e.g. Inside Zone) generates an entire family.
 */
export interface PlayFamilyTemplate {
  /** Base concept id, e.g. "inside_zone". */
  base: string;
  /** Read concept built on the base (e.g. Zone Read). */
  read: string;
  /** RPO off the base (e.g. IZ Glance). */
  rpo: string;
  /** Constraint play that punishes defense for cheating (e.g. Jet Sweep). */
  constraint: string;
  /** Counter play that punishes over-pursuit (e.g. Counter Bash). */
  counter: string;
  /** Play-action off the base (e.g. IZ PA Flood). */
  playAction: string;
  /** Shot play off the base (e.g. Glance-and-Go). */
  shot: string;
  /** Screen off the base fake (e.g. Fake IZ RB Screen). */
  screen: string;
  /** Boot / movement pass off the base action. */
  boot: string;
}

/**
 * Build the standard play-family structure for a given base concept.
 * Returns commonly-known complementary pieces by base concept name.
 *
 * @example
 * ```ts
 * buildPlayFamily("inside_zone")
 * // => { base: "inside_zone", read: "zone_read", rpo: "iz_glance_rpo", ... }
 * ```
 */
export function buildPlayFamily(base: string): PlayFamilyTemplate {
  switch (base) {
    case "inside_zone":
      return {
        base: "inside_zone",
        read: "zone_read",
        rpo: "iz_glance_rpo",
        constraint: "jet_sweep",
        counter: "counter_bash",
        playAction: "iz_pa_flood",
        shot: "glance_and_go",
        screen: "fake_iz_rb_screen",
        boot: "split_flow_boot",
      };
    case "outside_zone":
      return {
        base: "outside_zone",
        read: "oz_read",
        rpo: "bubble_oz_rpo",
        constraint: "toss",
        counter: "stretch_counter",
        playAction: "oz_pa_crosser",
        shot: "boot_wagon_wheel",
        screen: "bubble_screen",
        boot: "oz_boot",
      };
    case "counter":
      return {
        base: "counter",
        read: "counter_read",
        rpo: "counter_glance_rpo",
        constraint: "iz",
        counter: "gt_counter",
        playAction: "counter_pa_boot",
        shot: "counter_pa_shot",
        screen: "fake_counter_screen",
        boot: "counter_boot",
      };
    case "power":
      return {
        base: "power",
        read: "power_read",
        rpo: "power_rpo",
        constraint: "qb_keeper",
        counter: "counter",
        playAction: "pa_power_pass",
        shot: "pa_power_post",
        screen: "power_screen",
        boot: "power_keeper",
      };
    case "mesh":
      return {
        base: "mesh",
        read: "mesh_full_field",
        rpo: "mesh_rpo",
        constraint: "bubble",
        counter: "mesh_post",
        playAction: "mesh_pa",
        shot: "mesh_wheel",
        screen: "tunnel_screen",
        boot: "mesh_boot",
      };
    default:
      return {
        base,
        read: `${base}_read`,
        rpo: `${base}_rpo`,
        constraint: `${base}_constraint`,
        counter: `${base}_counter`,
        playAction: `${base}_pa`,
        shot: `${base}_shot`,
        screen: `${base}_screen`,
        boot: `${base}_boot`,
      };
  }
}

// ============================================================================
//  Formation library (mirrors prisma seed formations)
// ============================================================================

export interface FormationLibEntry {
  code: string;
  name: string;
  side: "offense" | "defense";
  personnel: string;
  backfield: string | null;
  strength: string | null;
  description: string;
}

/**
 * Mirror of the formations seeded into the database via prisma/seed.ts.
 * Lets the UI render formations without a DB round-trip.
 */
export const FORMATION_LIBRARY: FormationLibEntry[] = [
  {
    code: "GUN_TRIPS_R",
    name: "Gun Trips Right",
    side: "offense",
    personnel: "11",
    backfield: "gun",
    strength: "field",
    description:
      "10 personnel (1 RB, 1 TE, 3 WR) with RB at 5 yards in gun and three receivers stacked to the field. Base spread formation for RPO game.",
  },
  {
    code: "GUN_TRIPS_L",
    name: "Gun Trips Left",
    side: "offense",
    personnel: "11",
    backfield: "gun",
    strength: "field",
    description:
      "Mirror of Gun Trips Right — trips surface to the boundary or field-left. Used to attack overhang defenders.",
  },
  {
    code: "GUN_DOUBLES",
    name: "Gun Doubles",
    side: "offense",
    personnel: "10",
    backfield: "gun",
    strength: "field",
    description:
      "2x2 spread with RB in gun. Equalizes the box and forces defenses to declare strength post-snap.",
  },
  {
    code: "GUN_EMPTY_QUAD",
    name: "Gun Empty Quad",
    side: "offense",
    personnel: "10",
    backfield: "gun",
    strength: "field",
    description:
      "Empty set with four receivers to one side. Forces defensive speed substitution and stresses secondary depth.",
  },
  {
    code: "GUN_2X2_ACE",
    name: "Gun 2x2 Ace",
    side: "offense",
    personnel: "11",
    backfield: "gun",
    strength: "field",
    description:
      "11 personnel in 2x2 with TE on the line. Balance the box and run split-zone concepts.",
  },
  {
    code: "PISTOL_TRIPS",
    name: "Pistol Trips",
    side: "offense",
    personnel: "11",
    backfield: "pistol",
    strength: "field",
    description:
      "RB directly behind QB at 7 yards. Allows either-direction runs and read concepts without backfield tell.",
  },
  {
    code: "I_PRO_RIGHT",
    name: "I-Pro Right",
    side: "offense",
    personnel: "21",
    backfield: "under_center",
    strength: "right",
    description:
      "Two-back pro set under center. Power/gap scheme base — lead ISO and play-action boot off it.",
  },
  {
    code: "ACE_DOUBLES",
    name: "Ace Doubles",
    side: "offense",
    personnel: "12",
    backfield: "under_center",
    strength: "field",
    description:
      "12 personnel (2 TE) under center in 2x2. Heavy play-action and gap-scheme runs.",
  },
  {
    code: "GUN_TREY",
    name: "Gun Trey",
    side: "offense",
    personnel: "11",
    backfield: "gun",
    strength: "field",
    description:
      "11 personnel with TE and two WRs to one side (Trey), single WR backside. Strong-side run game base.",
  },
  {
    code: "GUN_BUNCH",
    name: "Gun Bunch",
    side: "offense",
    personnel: "11",
    backfield: "gun",
    strength: "field",
    description:
      "Tight bunch of three receivers creates high-traffic rub routes and run-game numbers at the point of attack.",
  },
  {
    code: "WING_T_WING",
    name: "Wing-T Wing",
    side: "offense",
    personnel: "21",
    backfield: "under_center",
    strength: "field",
    description:
      "Classic Wing-T with wingback in motion capability. Buck sweep and trap series base.",
  },
  {
    code: "FLEXBONE_TRIPS",
    name: "Flexbone Trips",
    side: "offense",
    personnel: "23",
    backfield: "under_center",
    strength: "field",
    description:
      "Option-based flexbone set with two slotbacks and triple-option capability.",
  },
  {
    code: "DEF_4_2_5",
    name: "Base 4-2-5",
    side: "defense",
    personnel: "nickel",
    backfield: "defense",
    strength: "field",
    description:
      "Four-down front with two linebackers and five DBs — the modern spread-defense base.",
  },
  {
    code: "DEF_3_3_5",
    name: "3-3-5 Stack",
    side: "defense",
    personnel: "nickel",
    backfield: "defense",
    strength: "field",
    description:
      "Three-down stack defense with three LBs stacked behind DL. Multiple pressure looks.",
  },
  {
    code: "DEF_4_3",
    name: "4-3 Over",
    side: "defense",
    personnel: "base",
    backfield: "defense",
    strength: "field",
    description:
      "Traditional 4-3 over front — 3-tech to strong side, 1-tech to weak. Base personnel vs 21/12.",
  },
  {
    code: "DEF_3_4_OK",
    name: "3-4 Okie",
    side: "defense",
    personnel: "base",
    backfield: "defense",
    strength: "field",
    description:
      "3-4 with two OLBs on the edge. Okie alignment — 5-technique ends, zero nose. Two-high shell.",
  },
];
