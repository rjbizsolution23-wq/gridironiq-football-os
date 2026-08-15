/**
 * GridironIQ™ — Football Intelligence OS
 * Seed script (Bun-runnable).
 *
 * Run with:
 *   bun prisma/seed.ts
 *
 * Seeds a complete football domain dataset across the entire Prisma schema.
 * All JSON-string fields are written via JSON.stringify(...) so they are
 * guaranteed to parse back as valid JSON when consumed by the UI.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
//  Small typed helpers
// ============================================================================

type Assignment = {
  position: string;
  alignment: string;
  assignment: string;
  landmark: string;
  vsMan: string;
  vsZone: string;
};

type Route = { player: string; route: string; depth: number };

type DiagramPlayer = { id: string; x: number; y: number; label: string };
type DiagramPath = {
  type: "route" | "block" | "motion";
  from: string;
  to?: string;
  toX?: number;
  toY?: number;
  dashed?: boolean;
  label?: string;
};
type Diagram = {
  players: DiagramPlayer[];
  paths: DiagramPath[];
  hash: "right" | "left" | "middle";
  yardLine: number;
};

// ============================================================================
//  FORMATIONS
// ============================================================================

const formations = [
  // ---- Offense ----
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
  // ---- Defense ----
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

// ============================================================================
//  PLAY FAMILIES
// ============================================================================

const playFamilies = [
  {
    code: "INSIDE_ZONE_FAMILY",
    name: "Inside Zone Family",
    side: "offense",
    baseConcept: "inside_zone",
    description:
      "One blocking framework (covered OL playside, uncovered reach backside) generates an entire family: Inside Zone → Zone Read → IZ Glance RPO → Jet Sweep constraint → Counter Bash counter → IZ Play Action → Glance-and-Go shot → Fake IZ RB Screen → Split Flow Boot.",
  },
  {
    code: "OUTSIDE_ZONE_FAMILY",
    name: "Outside Zone Family",
    side: "offense",
    baseConcept: "outside_zone",
    description:
      "Outside stretch zone framework — reach & cutoff. Generates Stretch, Zone Read OZ, Bubble OZ RPO, Boot Wagon Wheel, Keeper, and OZ PA Crosser.",
  },
  {
    code: "COUNTER_FAMILY",
    name: "Counter Family",
    side: "offense",
    baseConcept: "counter",
    description:
      "Pull-and-kick gap schemes. Counter, GT Counter, Counter Bash, Counter Read, and Counter PA Boot.",
  },
  {
    code: "POWER_FAMILY",
    name: "Power Family",
    side: "offense",
    baseConcept: "power",
    description:
      "Power / ISO gap schemes with kickout and lead. Power, Power Read, Power G, PA Power Pass, and Power Keeper.",
  },
  {
    code: "MESH_FAMILY",
    name: "Mesh Family",
    side: "offense",
    baseConcept: "mesh",
    description:
      "Shallow crosser mesh concept generating Mesh, Mesh Y-Corner, Mesh Wheel, Mesh Post, and Mesh RPO (Glance tagged off mesh action).",
  },
  {
    code: "RPO_FAMILY",
    name: "RPO Family",
    side: "offense",
    baseConcept: "inside_zone_glance_rpo",
    description:
      "Third-level RPO tree built on IZ: Glance, Bubble, Stick, Slant/Arrow, and Peek concepts — each tied to a specific conflict defender.",
  },
  {
    code: "QUARTERS_FAMILY",
    name: "Quarters Family",
    side: "defense",
    baseConcept: "cover_4_quarters",
    description:
      "Quarters match principles. Read 2 (slot) and distribute by #2 vertical: quarters vs vertical, half-turn vs flat, switch vs crossers.",
  },
  {
    code: "COVER3_MATCH_FAMILY",
    name: "Cover 3 Match Family",
    side: "defense",
    baseConcept: "cover_3_match",
    description:
      "Single-high match family. Apex in run support, 3 deep thirds, match convert vs 3x1 to clouds. Generates C3 Sky / C3 Cloud / C3 Match variations.",
  },
];

// ============================================================================
//  PLAY DNA — full Play DNA shape per play
// ============================================================================

const plays: Array<{
  playId: string;
  name: string;
  side: string;
  formationCode?: string;
  familyCode?: string;
  personnel?: string;
  motion?: string;
  concept: string;
  readType?: string;
  readDefender?: string;
  protection?: string;
  qbFootwork?: string;
  constraints: string[];
  preferredFronts: string[];
  coverageTargets: string[];
  fieldZones: string[];
  coachingPoints: string;
  assignments: Assignment[];
  routes?: Route[];
  diagram?: Diagram;
  complementary: string[];
  teamOwned: boolean;
}> = [
  // ---------------------------------------------------------------- OFFENSE
  {
    playId: "OFF-RPO-0172",
    name: "Gun Trips F Jet IZ Glance",
    side: "offense",
    formationCode: "GUN_TRIPS_R",
    familyCode: "INSIDE_ZONE_FAMILY",
    personnel: "11",
    motion: "F Jet",
    concept: "iz_glance_rpo",
    readType: "conflict_defender",
    readDefender: "boundary_apex",
    protection: "run_blocking",
    qbFootwork: "mesh_read",
    constraints: ["jet_sweep", "bubble", "boot", "split_zone"],
    preferredFronts: ["even", "over", "tite"],
    coverageTargets: ["cover_3", "quarters"],
    fieldZones: ["open_field", "high_red"],
    coachingPoints:
      "Apex defender conflict — if he flattens to jet, hand IZ; if he sits for IZ, throw glance. Glance is third-level RPO: OL blocks IZ (covered-down scheme), QB reads apex defender post-snap.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "Mesh with RB on jet path; eyes to apex",
        landmark: "boundary apex",
        vsMan: "Hand if apex fits flat for jet",
        vsZone: "Throw glance if apex settles at 6",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Jet motion path across formation; IZ path if handed",
        landmark: "A-gap",
        vsMan: "Aim inside hip of center",
        vsZone: "Cut off backside 2i",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Glance route (slant-flat combo, drive at 4-6 yards)",
        landmark: "boundary stick at 5",
        vsMan: "Beat press inside, sit in window",
        vsZone: "Find soft spot in zone",
      },
      {
        position: "Y",
        alignment: "TE trips side",
        assignment: "Vertical seam to clear apex",
        landmark: "15-20 yards seam",
        vsMan: "Win vertical",
        vsZone: "Stretch deep third",
      },
      {
        position: "Z",
        alignment: "trips #2",
        assignment: "Quick out flat control",
        landmark: "boundary numbers, 3 yards",
        vsMan: "Stack & drive out",
        vsZone: "Settle flat",
      },
      {
        position: "C",
        alignment: "ball",
        assignment: "Covered — block back on Mike, secure A-gap",
        landmark: "playside A",
        vsMan: "Cut Mike if 1-tech shaded",
        vsZone: "Reach playside A",
      },
    ],
    routes: [
      { player: "X", route: "glance", depth: 5 },
      { player: "Y", route: "seam", depth: 18 },
      { player: "Z", route: "flat", depth: 3 },
    ],
    diagram: {
      hash: "right",
      yardLine: 35,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 66, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 30, y: 77, label: "RB" },
        { id: "X", x: 14, y: 70, label: "X" },
        { id: "Z1", x: 72, y: 70, label: "Z" },
        { id: "Z2", x: 78, y: 71, label: "H" },
        { id: "Z3", x: 84, y: 70, label: "F" },
      ],
      paths: [
        { type: "motion", from: "RB", toX: 70, toY: 74, label: "Jet" },
        { type: "route", from: "X", toX: 30, toY: 65, label: "Glance" },
        { type: "route", from: "Y", toX: 70, toY: 90, label: "Seam" },
        { type: "route", from: "Z1", toX: 90, toY: 67, label: "Flat" },
        { type: "block", from: "LT", toX: 40, toY: 60 },
        { type: "block", from: "C", toX: 50, toY: 64 },
      ],
    },
    complementary: [
      "OFF-RUN-0042",
      "OFF-RUN-0055",
      "OFF-RUN-0048",
      "OFF-PA-0203",
    ],
    teamOwned: true,
  },
  {
    playId: "OFF-RUN-0042",
    name: "Gun Trips 18 Inside Zone",
    side: "offense",
    formationCode: "GUN_TRIPS_R",
    familyCode: "INSIDE_ZONE_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "inside_zone",
    readType: "covered_uncovered",
    readDefender: "mike",
    protection: "run_blocking",
    qbFootwork: "ride_and_decide",
    constraints: ["jet_sweep", "glance_rpo", "split_zone", "boot"],
    preferredFronts: ["even", "over", "tite", "under"],
    coverageTargets: ["cover_3", "quarters", "cover_2"],
    fieldZones: ["open_field", "high_red", "low_red"],
    coachingPoints:
      "Covered OL block playside gap (drive covered DL), uncovered OL reach to playside A and climb to backer. RB aims playside A-gap, eyes on backside 1/2i for cut. Reads second-level hat of Mike.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "Ride RB, hand unless backside 5-tech crashes",
        landmark: "backside 5",
        vsMan: "Hand",
        vsZone: "Hand",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Aim playside A, press line of scrimmage, eyes backside 1",
        landmark: "playside A",
        vsMan: "Cut backside if 1-tech wrong",
        vsZone: "Bend behind center",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Stalk #1 corner, fight across face on flow",
        landmark: "CB",
        vsMan: "Block CB",
        vsZone: "Block CB",
      },
      {
        position: "Y",
        alignment: "TE trips side",
        assignment: "Combo with RT to Sam, climb to apex",
        landmark: "Sam",
        vsMan: "Combo to Sam",
        vsZone: "Climb to apex",
      },
      {
        position: "Z",
        alignment: "trips #2",
        assignment: "Stalk flat defender",
        landmark: "apex",
        vsMan: "Block apex",
        vsZone: "Block apex",
      },
      {
        position: "C",
        alignment: "ball",
        assignment: "Reach playside A, climb to Mike if uncovered",
        landmark: "playside A",
        vsMan: "Reach 1-tech if shade",
        vsZone: "Climb to Mike",
      },
    ],
    diagram: {
      hash: "right",
      yardLine: 35,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 66, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 77, label: "RB" },
        { id: "X", x: 14, y: 70, label: "X" },
        { id: "Z1", x: 72, y: 70, label: "Z" },
        { id: "Z2", x: 78, y: 71, label: "H" },
        { id: "Z3", x: 84, y: 70, label: "F" },
      ],
      paths: [
        { type: "block", from: "LT", toX: 38, toY: 60, label: "Drive" },
        { type: "block", from: "LG", toX: 48, toY: 60, label: "Reach A" },
        { type: "block", from: "C", toX: 52, toY: 62, label: "Reach A" },
        { type: "block", from: "RG", toX: 58, toY: 60, label: "Climb" },
        { type: "block", from: "RT", toX: 64, toY: 60, label: "Drive" },
        { type: "route", from: "RB", toX: 54, toY: 55, label: "IZ path" },
      ],
    },
    complementary: [
      "OFF-RPO-0172",
      "OFF-RUN-0048",
      "OFF-RUN-0055",
      "OFF-PA-0203",
    ],
    teamOwned: true,
  },
  {
    playId: "OFF-RUN-0048",
    name: "Gun Trips 19 Split Zone",
    side: "offense",
    formationCode: "GUN_TRIPS_R",
    familyCode: "INSIDE_ZONE_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "split_zone",
    readType: "covered_uncovered",
    readDefender: "backside_end",
    protection: "run_blocking",
    qbFootwork: "ride_and_decide",
    constraints: ["iz", "glance_rpo", "boot", "counter_bash"],
    preferredFronts: ["even", "over", "tite"],
    coverageTargets: ["cover_3", "quarters"],
    fieldZones: ["open_field", "high_red"],
    coachingPoints:
      "Split Zone = IZ scheme with backside OL wrapping across formation to cut backside DE. Slows backside pursuit, gives RB cutback lane. Constraint to inside zone vs teams fast flowing backside.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "Hand to RB, ride, sell glance fake",
        landmark: "backside DE",
        vsMan: "Hand",
        vsZone: "Hand",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Aim playside A, plant and cut back off split block",
        landmark: "backside B",
        vsMan: "Cut off LT split block",
        vsZone: "Bend behind center",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Stalk CB",
        landmark: "CB",
        vsMan: "Block CB",
        vsZone: "Block CB",
      },
      {
        position: "Y",
        alignment: "TE trips side",
        assignment: "Reach 7-tech, climb to Sam",
        landmark: "Sam",
        vsMan: "Reach DE",
        vsZone: "Climb",
      },
      {
        position: "Z",
        alignment: "trips #2",
        assignment: "Stalk apex",
        landmark: "apex",
        vsMan: "Block apex",
        vsZone: "Block apex",
      },
      {
        position: "LT",
        alignment: "left tackle",
        assignment: "Split block — pull across and cut backside DE",
        landmark: "backside DE",
        vsMan: "Wrap & cut",
        vsZone: "Wrap & cut",
      },
    ],
    diagram: {
      hash: "right",
      yardLine: 35,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 66, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 77, label: "RB" },
        { id: "X", x: 14, y: 70, label: "X" },
        { id: "Z1", x: 72, y: 70, label: "Z" },
        { id: "Z2", x: 78, y: 71, label: "H" },
        { id: "Z3", x: 84, y: 70, label: "F" },
      ],
      paths: [
        { type: "block", from: "LT", toX: 65, toY: 65, label: "Split wrap" },
        { type: "block", from: "LG", toX: 46, toY: 60, label: "Drive" },
        { type: "block", from: "C", toX: 52, toY: 62, label: "Reach" },
        { type: "block", from: "RG", toX: 58, toY: 60, label: "Climb" },
        { type: "block", from: "RT", toX: 64, toY: 60, label: "Drive" },
        { type: "route", from: "RB", toX: 46, toY: 55, label: "Cutback" },
      ],
    },
    complementary: ["OFF-RUN-0042", "OFF-RPO-0172", "OFF-RUN-0061"],
    teamOwned: true,
  },
  {
    playId: "OFF-RUN-0055",
    name: "Gun Trips Jet Sweep",
    side: "offense",
    formationCode: "GUN_TRIPS_R",
    familyCode: "INSIDE_ZONE_FAMILY",
    personnel: "11",
    motion: "F Jet",
    concept: "jet_sweep",
    readType: "none",
    readDefender: "force",
    protection: "run_blocking",
    qbFootwork: "ride_and_decide",
    constraints: ["iz", "glance_rpo", "bubble", "boot"],
    preferredFronts: ["even", "over", "tite", "under"],
    coverageTargets: ["cover_3", "quarters", "cover_2"],
    fieldZones: ["open_field", "high_red", "low_red"],
    coachingPoints:
      "Constraint of IZ family. RB in jet motion receives the snap handoff path outside the tackle. OL blocks outside zone track to play side. Forces apex/force defender to widen, opening IZ lane.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "Receive snap, ride RB, fake IZ to RB",
        landmark: "RB",
        vsMan: "Hand",
        vsZone: "Hand",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Jet motion pre-snap, receive handoff, get vertical outside",
        landmark: "outside tackle",
        vsMan: "Press edge",
        vsZone: "Press edge",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Stalk CB, force collision with backside pursuit",
        landmark: "CB",
        vsMan: "Block CB",
        vsZone: "Block CB",
      },
      {
        position: "Y",
        alignment: "TE trips side",
        assignment: "Arc release to apex",
        landmark: "apex",
        vsMan: "Arc to apex",
        vsZone: "Arc to apex",
      },
      {
        position: "Z",
        alignment: "trips #2",
        assignment: "Block #2 defender — stalk flat control",
        landmark: "#2",
        vsMan: "Stalk #2",
        vsZone: "Stalk #2",
      },
      {
        position: "RT",
        alignment: "right tackle",
        assignment: "Reach 5-tech outside, climb to Sam",
        landmark: "5-tech",
        vsMan: "Reach DE",
        vsZone: "Climb",
      },
    ],
    diagram: {
      hash: "right",
      yardLine: 35,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 66, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 30, y: 71, label: "RB" },
        { id: "X", x: 14, y: 70, label: "X" },
        { id: "Z1", x: 72, y: 70, label: "Z" },
        { id: "Z2", x: 78, y: 71, label: "H" },
        { id: "Z3", x: 84, y: 70, label: "F" },
      ],
      paths: [
        { type: "motion", from: "RB", toX: 70, toY: 71, label: "Jet path" },
        { type: "block", from: "LT", toX: 38, toY: 60 },
        { type: "block", from: "LG", toX: 44, toY: 60 },
        { type: "block", from: "C", toX: 50, toY: 60 },
        { type: "block", from: "RG", toX: 60, toY: 60 },
        { type: "block", from: "RT", toX: 66, toY: 60, label: "Reach" },
      ],
    },
    complementary: ["OFF-RUN-0042", "OFF-RPO-0172", "OFF-RUN-0048"],
    teamOwned: true,
  },
  {
    playId: "OFF-PA-0203",
    name: "PA Flood",
    side: "offense",
    formationCode: "GUN_TRIPS_R",
    familyCode: "INSIDE_ZONE_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "flood",
    readType: "deep_third_safety",
    readDefender: "deep_third_safety",
    protection: "6_man_half_slide",
    qbFootwork: "5_step_boot",
    constraints: ["iz", "glance_rpo", "split_zone"],
    preferredFronts: ["even", "over", "tite"],
    coverageTargets: ["cover_3", "quarters", "cover_2"],
    fieldZones: ["open_field", "high_red"],
    coachingPoints:
      "PA Flood off IZ action. Three-level flood to one side: deep corner, intermediate out, flat. Read the deep third safety — if he stays deep, throw flat; if he drives flat, throw corner.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "Sell IZ fake, boot playside, read deep third safety",
        landmark: "deep third safety",
        vsMan: "Throw flat if S sits",
        vsZone: "Throw corner if S drives flat",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Sell IZ fake, leak flat as third receiver",
        landmark: "flat",
        vsMan: "Flat",
        vsZone: "Flat",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Deep corner route — flood high",
        landmark: "deep corner",
        vsMan: "Win on corner",
        vsZone: "Sit in corner of third",
      },
      {
        position: "Y",
        alignment: "TE trips side",
        assignment: "Intermediate out — flood mid",
        landmark: "10-12 out",
        vsMan: "Out route",
        vsZone: "Out settle",
      },
      {
        position: "Z",
        alignment: "trips #2",
        assignment: "Flat route as flood low",
        landmark: "flat",
        vsMan: "Flat",
        vsZone: "Flat",
      },
      {
        position: "LT",
        alignment: "left tackle",
        assignment: "Half-slide protection — slide right, anchor backside",
        landmark: "backside B",
        vsMan: "Anchor DE",
        vsZone: "Anchor DE",
      },
    ],
    routes: [
      { player: "X", route: "corner", depth: 18 },
      { player: "Y", route: "out", depth: 12 },
      { player: "Z", route: "flat", depth: 3 },
      { player: "RB", route: "flat_leak", depth: 4 },
    ],
    diagram: {
      hash: "right",
      yardLine: 35,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 66, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 77, label: "RB" },
        { id: "X", x: 14, y: 70, label: "X" },
        { id: "Z1", x: 72, y: 70, label: "Z" },
        { id: "Z2", x: 78, y: 71, label: "H" },
        { id: "Z3", x: 84, y: 70, label: "F" },
      ],
      paths: [
        { type: "route", from: "X", toX: 8, toY: 90, label: "Corner" },
        { type: "route", from: "Y", toX: 86, toY: 82, label: "Out" },
        { type: "route", from: "Z1", toX: 92, toY: 72, label: "Flat" },
        { type: "route", from: "RB", toX: 30, toY: 72, label: "Leak" },
        { type: "motion", from: "QB", toX: 56, toY: 73, label: "Boot" },
      ],
    },
    complementary: ["OFF-RUN-0042", "OFF-PA-0211", "OFF-PASS-0310"],
    teamOwned: true,
  },
  {
    playId: "OFF-PA-0211",
    name: "Counter Boot",
    side: "offense",
    formationCode: "GUN_TRIPS_R",
    familyCode: "COUNTER_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "boot_flood",
    readType: "deep_third_safety",
    readDefender: "deep_third_safety",
    protection: "7_man_counter",
    qbFootwork: "5_step_boot",
    constraints: ["gt_counter", "iz", "split_zone"],
    preferredFronts: ["even", "over", "tite"],
    coverageTargets: ["cover_3", "quarters"],
    fieldZones: ["open_field", "high_red"],
    coachingPoints:
      "Counter Boot — sell GT Counter action, boot backside with flood concept. Backside DE is unblocked (assumed crash on counter), QB escapes opposite. Read flat defender to deep third safety.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "Sell counter fake, boot backside, read S",
        landmark: "deep third S",
        vsMan: "Throw dig vs man",
        vsZone: "Throw flat if S sits",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Sell counter, leak backside flat",
        landmark: "backside flat",
        vsMan: "Flat",
        vsZone: "Flat",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Deep dig at 15-18 yards",
        landmark: "deep dig",
        vsMan: "Beat man inside",
        vsZone: "Sit in window",
      },
      {
        position: "Y",
        alignment: "TE trips side",
        assignment: "Cross backside at 8 yards",
        landmark: "cross",
        vsMan: "Cross",
        vsZone: "Cross settle",
      },
      {
        position: "Z",
        alignment: "trips #2",
        assignment: "Flat",
        landmark: "flat",
        vsMan: "Flat",
        vsZone: "Flat",
      },
      {
        position: "LG",
        alignment: "left guard",
        assignment: "Counter pull — kickout DE",
        landmark: "DE",
        vsMan: "Kickout DE",
        vsZone: "Kickout DE",
      },
    ],
    routes: [
      { player: "X", route: "dig", depth: 16 },
      { player: "Y", route: "cross", depth: 8 },
      { player: "Z", route: "flat", depth: 3 },
      { player: "RB", route: "flat", depth: 4 },
    ],
    diagram: {
      hash: "right",
      yardLine: 35,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 66, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 77, label: "RB" },
        { id: "X", x: 14, y: 70, label: "X" },
        { id: "Z1", x: 72, y: 70, label: "Z" },
        { id: "Z2", x: 78, y: 71, label: "H" },
        { id: "Z3", x: 84, y: 70, label: "F" },
      ],
      paths: [
        { type: "route", from: "X", toX: 22, toY: 88, label: "Dig" },
        { type: "route", from: "Y", toX: 30, toY: 80, label: "Cross" },
        { type: "route", from: "Z1", toX: 92, toY: 72, label: "Flat" },
        { type: "motion", from: "QB", toX: 38, toY: 74, label: "Boot L" },
        { type: "block", from: "LG", toX: 62, toY: 65, label: "Pull KO" },
      ],
    },
    complementary: ["OFF-PA-0203", "OFF-RUN-0061", "OFF-PASS-0310"],
    teamOwned: true,
  },
  {
    playId: "OFF-PASS-0310",
    name: "62 Mesh",
    side: "offense",
    formationCode: "GUN_2X2_ACE",
    familyCode: "MESH_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "mesh",
    readType: "full_field",
    readDefender: "apex",
    protection: "6_man_half_slide",
    qbFootwork: "5_step_ride_mesh",
    constraints: ["iz", "glance_rpo", "boot"],
    preferredFronts: ["even", "over", "tite", "under"],
    coverageTargets: ["cover_3", "quarters", "cover_2", "cover_1"],
    fieldZones: ["open_field", "high_red"],
    coachingPoints:
      "4-man Mesh concept — two shallow crossers rubbing at 5-6 yards, dig at 12, wheel by RB. Read mesh point: vs man, throw crosser separating from rub; vs zone, throw dig sitting in soft window. Wheel is alerts vs Cover 1/quarters.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "5-step, ride mesh point, read meshers + dig",
        landmark: "mesh point",
        vsMan: "Throw crosser off rub",
        vsZone: "Throw dig in window",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Wheel route — alert vs man/quarters",
        landmark: "wheel",
        vsMan: "Wheel",
        vsZone: "Delay flat",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Shallow cross at 5-6 yards",
        landmark: "shallow",
        vsMan: "Beat man across",
        vsZone: "Find window",
      },
      {
        position: "Y",
        alignment: "TE inline",
        assignment: "Dig route at 12 yards crossing opposite X",
        landmark: "dig",
        vsMan: "Win inside",
        vsZone: "Sit in window",
      },
      {
        position: "Z",
        alignment: "split wide right",
        assignment: "Shallow cross opposite X",
        landmark: "shallow",
        vsMan: "Beat man across",
        vsZone: "Find window",
      },
      {
        position: "C",
        alignment: "ball",
        assignment: "Half-slide — block Mike, secure A",
        landmark: "Mike",
        vsMan: "Cut Mike",
        vsZone: "Block Mike",
      },
    ],
    routes: [
      { player: "X", route: "shallow_cross", depth: 5 },
      { player: "Y", route: "dig", depth: 12 },
      { player: "Z", route: "shallow_cross", depth: 5 },
      { player: "RB", route: "wheel", depth: 12 },
    ],
    diagram: {
      hash: "middle",
      yardLine: 35,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 38, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 78, label: "RB" },
        { id: "X", x: 12, y: 70, label: "X" },
        { id: "Z1", x: 88, y: 70, label: "Z" },
        { id: "Z2", x: 80, y: 71, label: "H" },
      ],
      paths: [
        { type: "route", from: "X", toX: 60, toY: 65, label: "Shallow" },
        { type: "route", from: "Z1", toX: 40, toY: 65, label: "Shallow" },
        { type: "route", from: "Y", toX: 70, toY: 82, label: "Dig" },
        { type: "route", from: "RB", toX: 80, toY: 90, label: "Wheel" },
      ],
    },
    complementary: ["OFF-PASS-0305", "OFF-PASS-0320", "OFF-PASS-0340"],
    teamOwned: true,
  },
  {
    playId: "OFF-PASS-0305",
    name: "Stick",
    side: "offense",
    formationCode: "GUN_TRIPS_R",
    familyCode: "RPO_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "stick",
    readType: "half_field",
    readDefender: "apex",
    protection: "6_man_half_slide",
    qbFootwork: "3_step",
    constraints: ["iz", "glance_rpo", "bubble"],
    preferredFronts: ["even", "over", "tite", "under"],
    coverageTargets: ["cover_3", "quarters", "cover_2", "cover_1"],
    fieldZones: ["open_field", "high_red", "low_red"],
    coachingPoints:
      "Stick concept — #2 (Z) runs a flat, #1 (F) runs a stick (quick out at 4 yards breaking inside). Read apex: if apex flattens to flat, throw stick; if apex sits, throw flat. Quick game answer vs apex cheating.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "3-step, read apex, throw stick or flat",
        landmark: "apex",
        vsMan: "Throw stick if apex inside",
        vsZone: "Throw flat if apex widens",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Flat protection / release",
        landmark: "flat",
        vsMan: "Block if needed",
        vsZone: "Block if needed",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Slant or settle route",
        landmark: "slant",
        vsMan: "Slant",
        vsZone: "Sit at 6",
      },
      {
        position: "Y",
        alignment: "TE trips side",
        assignment: "Vertical seam",
        landmark: "seam",
        vsMan: "Win vertical",
        vsZone: "Stretch deep",
      },
      {
        position: "Z",
        alignment: "trips #2",
        assignment: "Flat route",
        landmark: "flat",
        vsMan: "Flat",
        vsZone: "Flat",
      },
      {
        position: "RT",
        alignment: "right tackle",
        assignment: "Half-slide, set vs DE",
        landmark: "DE",
        vsMan: "Anchor",
        vsZone: "Anchor",
      },
    ],
    routes: [
      { player: "X", route: "slant", depth: 5 },
      { player: "Y", route: "seam", depth: 15 },
      { player: "Z", route: "flat", depth: 2 },
      { player: "F", route: "stick", depth: 4 },
    ],
    diagram: {
      hash: "right",
      yardLine: 35,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 66, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 77, label: "RB" },
        { id: "X", x: 14, y: 70, label: "X" },
        { id: "Z1", x: 72, y: 70, label: "Z" },
        { id: "Z2", x: 78, y: 71, label: "H" },
        { id: "Z3", x: 84, y: 70, label: "F" },
      ],
      paths: [
        { type: "route", from: "X", toX: 28, toY: 65, label: "Slant" },
        { type: "route", from: "Y", toX: 70, toY: 90, label: "Seam" },
        { type: "route", from: "Z1", toX: 92, toY: 70, label: "Flat" },
        { type: "route", from: "Z3", toX: 88, toY: 66, label: "Stick" },
      ],
    },
    complementary: ["OFF-RPO-0172", "OFF-PASS-0310", "OFF-PASS-0330"],
    teamOwned: true,
  },
  {
    playId: "OFF-PASS-0320",
    name: "Four Verticals",
    side: "offense",
    formationCode: "GUN_2X2_ACE",
    familyCode: "MESH_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "four_verticals",
    readType: "full_field",
    readDefender: "middle_safety",
    protection: "6_man_half_slide",
    qbFootwork: "5_step_ride_middle",
    constraints: ["iz", "glance_rpo", "bubble", "boot"],
    preferredFronts: ["even", "over", "tite"],
    coverageTargets: ["cover_3", "cover_2", "quarters"],
    fieldZones: ["open_field", "high_red"],
    coachingPoints:
      "Four Verts — push all four verticals, read middle safety (Mike/Safety overhang). Vs Cover 2 — throw seam/possession; vs Cover 3 — throw middle third void; vs Quarters — read 2 vertical to throw seam.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "5-step, ride middle safety, throw side he leaves",
        landmark: "middle safety",
        vsMan: "Throw outside seam",
        vsZone: "Throw seam in void",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Check release to flat as fifth option",
        landmark: "flat",
        vsMan: "Block then release",
        vsZone: "Block then release",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Vertical — bend to numbers, stack CB",
        landmark: "vertical",
        vsMan: "Win vertical",
        vsZone: "Bend to void",
      },
      {
        position: "Y",
        alignment: "TE inline",
        assignment: "Seam route inside",
        landmark: "seam",
        vsMan: "Win seam",
        vsZone: "Sit in window",
      },
      {
        position: "Z",
        alignment: "split wide right",
        assignment: "Vertical",
        landmark: "vertical",
        vsMan: "Win vertical",
        vsZone: "Bend to void",
      },
      {
        position: "C",
        alignment: "ball",
        assignment: "Half-slide, secure A",
        landmark: "Mike",
        vsMan: "Block Mike",
        vsZone: "Block Mike",
      },
    ],
    routes: [
      { player: "X", route: "go", depth: 25 },
      { player: "Y", route: "seam", depth: 25 },
      { player: "Z", route: "go", depth: 25 },
      { player: "H", route: "seam", depth: 25 },
    ],
    diagram: {
      hash: "middle",
      yardLine: 50,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 38, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 78, label: "RB" },
        { id: "X", x: 12, y: 70, label: "X" },
        { id: "Z1", x: 88, y: 70, label: "Z" },
        { id: "Z2", x: 80, y: 71, label: "H" },
      ],
      paths: [
        { type: "route", from: "X", toX: 12, toY: 95, label: "Vert" },
        { type: "route", from: "Y", toX: 40, toY: 95, label: "Seam" },
        { type: "route", from: "Z1", toX: 88, toY: 95, label: "Vert" },
        { type: "route", from: "Z2", toX: 80, toY: 95, label: "Seam" },
      ],
    },
    complementary: ["OFF-PASS-0310", "OFF-PASS-0308", "OFF-PASS-0340"],
    teamOwned: true,
  },
  {
    playId: "OFF-PASS-0308",
    name: "Smash",
    side: "offense",
    formationCode: "GUN_TRIPS_R",
    familyCode: "MESH_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "smash",
    readType: "half_field",
    readDefender: "corner_flat",
    protection: "6_man_half_slide",
    qbFootwork: "5_step",
    constraints: ["iz", "glance_rpo", "bubble"],
    preferredFronts: ["even", "over", "tite", "under"],
    coverageTargets: ["cover_3", "quarters", "cover_2"],
    fieldZones: ["open_field", "high_red", "low_red"],
    coachingPoints:
      "Smash — #1 runs a corner (smash), #2 runs a deep out, #3 sits shallow. Read CB: if CB sits deep third, throw corner; if CB squats on corner, throw deep out behind him.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "5-step, read CB smash to out",
        landmark: "CB",
        vsMan: "Throw corner if CB inside",
        vsZone: "Throw out if CB squats",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Block then check release",
        landmark: "flat",
        vsMan: "Block",
        vsZone: "Block",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Corner route (smash)",
        landmark: "corner 18",
        vsMan: "Win corner",
        vsZone: "Sit corner third",
      },
      {
        position: "Y",
        alignment: "TE trips side",
        assignment: "Deep out at 12 yards",
        landmark: "out 12",
        vsMan: "Out route",
        vsZone: "Out settle",
      },
      {
        position: "Z",
        alignment: "trips #2",
        assignment: "Sit at 4 yards",
        landmark: "sit",
        vsMan: "Sit",
        vsZone: "Sit",
      },
      {
        position: "RT",
        alignment: "right tackle",
        assignment: "Half-slide, anchor DE",
        landmark: "DE",
        vsMan: "Anchor",
        vsZone: "Anchor",
      },
    ],
    routes: [
      { player: "X", route: "corner", depth: 18 },
      { player: "Y", route: "out", depth: 12 },
      { player: "Z", route: "sit", depth: 4 },
    ],
    diagram: {
      hash: "right",
      yardLine: 40,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 66, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 77, label: "RB" },
        { id: "X", x: 14, y: 70, label: "X" },
        { id: "Z1", x: 72, y: 70, label: "Z" },
        { id: "Z2", x: 78, y: 71, label: "H" },
        { id: "Z3", x: 84, y: 70, label: "F" },
      ],
      paths: [
        { type: "route", from: "X", toX: 8, toY: 90, label: "Corner" },
        { type: "route", from: "Y", toX: 86, toY: 82, label: "Out" },
        { type: "route", from: "Z1", toX: 80, toY: 66, label: "Sit" },
      ],
    },
    complementary: ["OFF-PASS-0310", "OFF-PASS-0320", "OFF-PASS-0305"],
    teamOwned: true,
  },
  {
    playId: "OFF-PASS-0330",
    name: "Tunnel Screen",
    side: "offense",
    formationCode: "GUN_TRIPS_R",
    familyCode: "MESH_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "tunnel_screen",
    readType: "screen",
    readDefender: "apex",
    protection: "screen",
    qbFootwork: "3_step_flick",
    constraints: ["iz", "glance_rpo", "bubble", "jet_sweep"],
    preferredFronts: ["even", "over", "tite", "under"],
    coverageTargets: ["cover_3", "quarters", "cover_2"],
    fieldZones: ["open_field", "high_red", "low_red"],
    coachingPoints:
      "Tunnel Screen — WR inside (#2 of trips) catches tunnel screen behind stalk block by #1 and crack/arcs by #3. Constraint vs DBs sitting on slants and out routes.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "3-step, fake to RB, throw tunnel screen",
        landmark: "#2 WR",
        vsMan: "Throw tunnel",
        vsZone: "Throw tunnel",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Sell IZ fake, leak flat as outlet",
        landmark: "flat",
        vsMan: "Flat",
        vsZone: "Flat",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Block corner (stalk)",
        landmark: "CB",
        vsMan: "Stalk CB",
        vsZone: "Stalk CB",
      },
      {
        position: "Y",
        alignment: "TE trips side",
        assignment: "Arc to block apex",
        landmark: "apex",
        vsMan: "Arc apex",
        vsZone: "Arc apex",
      },
      {
        position: "Z",
        alignment: "trips #2 (inside)",
        assignment: "Catch tunnel screen at 2 yards behind LOS",
        landmark: "tunnel 2y behind LOS",
        vsMan: "Catch and turn up",
        vsZone: "Catch and turn up",
      },
      {
        position: "RT",
        alignment: "right tackle",
        assignment: "Pass set then release for second-level block",
        landmark: "Sam",
        vsMan: "Pass set first",
        vsZone: "Release",
      },
    ],
    routes: [
      { player: "Z", route: "tunnel", depth: -2 },
      { player: "F", route: "stalk_block", depth: 0 },
      { player: "RB", route: "flat_outlet", depth: 2 },
    ],
    diagram: {
      hash: "right",
      yardLine: 40,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 66, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 77, label: "RB" },
        { id: "X", x: 14, y: 70, label: "X" },
        { id: "Z1", x: 72, y: 70, label: "Z" },
        { id: "Z2", x: 78, y: 71, label: "H" },
        { id: "Z3", x: 84, y: 70, label: "F" },
      ],
      paths: [
        { type: "route", from: "Z1", toX: 68, toY: 72, label: "Tunnel catch" },
        { type: "route", from: "Z3", toX: 70, toY: 64, label: "Stalk" },
        { type: "route", from: "Y", toX: 70, toY: 66, label: "Arc" },
      ],
    },
    complementary: ["OFF-PASS-0305", "OFF-RUN-0055", "OFF-RPO-0172"],
    teamOwned: true,
  },
  {
    playId: "OFF-RUN-0061",
    name: "Gun 16 GT Counter",
    side: "offense",
    formationCode: "GUN_DOUBLES",
    familyCode: "COUNTER_FAMILY",
    personnel: "10",
    motion: "none",
    concept: "gt_counter",
    readType: "none",
    readDefender: "kickout_end",
    protection: "run_blocking",
    qbFootwork: "ride_and_decide",
    constraints: ["iz", "split_zone", "bash"],
    preferredFronts: ["even", "over", "under", "tite"],
    coverageTargets: ["cover_3", "quarters", "cover_2"],
    fieldZones: ["open_field", "high_red", "low_red"],
    coachingPoints:
      "GT Counter — guard and tackle pull to play side; guard kicks DE, tackle wraps to playside LB. RB aims backside A and bounces to front side pulling trail. Constraint to IZ when defenses fast-flow.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "Ride RB, hand",
        landmark: "RB",
        vsMan: "Hand",
        vsZone: "Hand",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Counter path — aim backside A, press LOS, bounce front side",
        landmark: "front side B",
        vsMan: "Cut off wrap block",
        vsZone: "Bounce off kickout",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Stalk CB",
        landmark: "CB",
        vsMan: "Block CB",
        vsZone: "Block CB",
      },
      {
        position: "Y",
        alignment: "TE inline",
        assignment: "Block DE",
        landmark: "DE",
        vsMan: "Block DE",
        vsZone: "Block DE",
      },
      {
        position: "Z",
        alignment: "split wide right",
        assignment: "Stalk CB",
        landmark: "CB",
        vsMan: "Block CB",
        vsZone: "Block CB",
      },
      {
        position: "LG",
        alignment: "left guard",
        assignment: "Pull, kickout playside DE",
        landmark: "playside DE",
        vsMan: "Kickout DE",
        vsZone: "Kickout DE",
      },
    ],
    diagram: {
      hash: "right",
      yardLine: 35,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 38, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 77, label: "RB" },
        { id: "X", x: 14, y: 70, label: "X" },
        { id: "Z1", x: 86, y: 70, label: "Z" },
        { id: "Z2", x: 80, y: 71, label: "H" },
      ],
      paths: [
        { type: "block", from: "LG", toX: 62, toY: 65, label: "Pull KO" },
        { type: "block", from: "RT", toX: 60, toY: 65, label: "Pull wrap" },
        { type: "route", from: "RB", toX: 60, toY: 55, label: "Counter path" },
        { type: "block", from: "LT", toX: 38, toY: 60 },
        { type: "block", from: "C", toX: 48, toY: 62 },
        { type: "block", from: "RG", toX: 54, toY: 60 },
      ],
    },
    complementary: ["OFF-RUN-0042", "OFF-RUN-0048", "OFF-PA-0211"],
    teamOwned: true,
  },
  {
    playId: "OFF-PASS-0340",
    name: "Y-Cross",
    side: "offense",
    formationCode: "GUN_2X2_ACE",
    familyCode: "MESH_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "y_cross",
    readType: "full_field",
    readDefender: "middle_safety",
    protection: "6_man_half_slide",
    qbFootwork: "5_step_ride_middle",
    constraints: ["iz", "glance_rpo", "boot"],
    preferredFronts: ["even", "over", "tite", "under"],
    coverageTargets: ["cover_3", "quarters", "cover_2"],
    fieldZones: ["open_field", "high_red"],
    coachingPoints:
      "Y-Cross — TE runs deep cross at 16-18 yards, single-high safety reads. Read middle safety — if he drives cross, throw post behind him. If he sits deep, throw cross in front. Backside post clears the deep third.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "5-step, ride middle safety, throw cross or post",
        landmark: "middle safety",
        vsMan: "Throw cross vs man",
        vsZone: "Throw cross if S sits deep",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Check release to flat",
        landmark: "flat",
        vsMan: "Flat",
        vsZone: "Flat",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Post route — clear deep third",
        landmark: "post",
        vsMan: "Win vertical then post",
        vsZone: "Clear third",
      },
      {
        position: "Y",
        alignment: "TE inline",
        assignment: "Deep cross at 16-18 yards",
        landmark: "deep cross",
        vsMan: "Beat LB across",
        vsZone: "Sit in window",
      },
      {
        position: "Z",
        alignment: "split wide right",
        assignment: "Dig at 12 yards",
        landmark: "dig",
        vsMan: "Win inside",
        vsZone: "Sit in window",
      },
      {
        position: "C",
        alignment: "ball",
        assignment: "Half-slide, secure A",
        landmark: "Mike",
        vsMan: "Block Mike",
        vsZone: "Block Mike",
      },
    ],
    routes: [
      { player: "X", route: "post", depth: 18 },
      { player: "Y", route: "deep_cross", depth: 16 },
      { player: "Z", route: "dig", depth: 12 },
      { player: "RB", route: "flat", depth: 3 },
    ],
    diagram: {
      hash: "middle",
      yardLine: 45,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 38, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 78, label: "RB" },
        { id: "X", x: 12, y: 70, label: "X" },
        { id: "Z1", x: 88, y: 70, label: "Z" },
        { id: "Z2", x: 80, y: 71, label: "H" },
      ],
      paths: [
        { type: "route", from: "X", toX: 50, toY: 90, label: "Post" },
        { type: "route", from: "Y", toX: 70, toY: 84, label: "Cross" },
        { type: "route", from: "Z1", toX: 70, toY: 80, label: "Dig" },
      ],
    },
    complementary: ["OFF-PASS-0310", "OFF-PASS-0320", "OFF-PA-0203"],
    teamOwned: true,
  },
  {
    playId: "OFF-RUN-0071",
    name: "Gun 18 Duo",
    side: "offense",
    formationCode: "GUN_2X2_ACE",
    familyCode: "POWER_FAMILY",
    personnel: "11",
    motion: "none",
    concept: "duo",
    readType: "covered_uncovered",
    readDefender: "mike",
    protection: "run_blocking",
    qbFootwork: "ride_and_decide",
    constraints: ["iz", "split_zone", "counter_bash"],
    preferredFronts: ["even", "over", "under"],
    coverageTargets: ["cover_3", "quarters", "cover_2"],
    fieldZones: ["open_field", "high_red", "low_red"],
    coachingPoints:
      "Duo — double-team first down linemen on play side, climb to second level. RB reads Mike: if Mike flows over, cut back; if Mike fits wrong, press front side. Man-blocking answer in zone-heavy world.",
    assignments: [
      {
        position: "QB",
        alignment: "gun 5y",
        assignment: "Ride RB, hand",
        landmark: "RB",
        vsMan: "Hand",
        vsZone: "Hand",
      },
      {
        position: "RB",
        alignment: "gun 7y",
        assignment: "Press line, read Mike hat, cut opposite",
        landmark: "Mike",
        vsMan: "Cut off Mike",
        vsZone: "Press front side",
      },
      {
        position: "X",
        alignment: "split wide left",
        assignment: "Stalk CB",
        landmark: "CB",
        vsMan: "Block CB",
        vsZone: "Block CB",
      },
      {
        position: "Y",
        alignment: "TE inline",
        assignment: "Double DE with RT, climb to Sam",
        landmark: "Sam",
        vsMan: "Double then Sam",
        vsZone: "Double then Sam",
      },
      {
        position: "Z",
        alignment: "split wide right",
        assignment: "Stalk CB",
        landmark: "CB",
        vsMan: "Block CB",
        vsZone: "Block CB",
      },
      {
        position: "C",
        alignment: "ball",
        assignment: "Double playside 1-tech with RG, climb to Mike",
        landmark: "Mike",
        vsMan: "Double then climb",
        vsZone: "Double then climb",
      },
    ],
    diagram: {
      hash: "middle",
      yardLine: 35,
      players: [
        { id: "LT", x: 38, y: 70, label: "LT" },
        { id: "LG", x: 44, y: 70, label: "LG" },
        { id: "C", x: 50, y: 70, label: "C" },
        { id: "RG", x: 56, y: 70, label: "RG" },
        { id: "RT", x: 62, y: 70, label: "RT" },
        { id: "Y", x: 38, y: 70, label: "Y" },
        { id: "QB", x: 50, y: 75, label: "QB" },
        { id: "RB", x: 50, y: 77, label: "RB" },
        { id: "X", x: 12, y: 70, label: "X" },
        { id: "Z1", x: 88, y: 70, label: "Z" },
        { id: "Z2", x: 80, y: 71, label: "H" },
      ],
      paths: [
        { type: "block", from: "LT", toX: 38, toY: 62, label: "Drive DE" },
        { type: "block", from: "LG", toX: 46, toY: 60, label: "Drive" },
        { type: "block", from: "C", toX: 54, toY: 62, label: "Double" },
        { type: "block", from: "RG", toX: 56, toY: 62, label: "Double" },
        { type: "block", from: "RT", toX: 62, toY: 60, label: "Double" },
        { type: "route", from: "RB", toX: 54, toY: 55, label: "Duo path" },
      ],
    },
    complementary: ["OFF-RUN-0042", "OFF-RUN-0061", "OFF-PA-0203"],
    teamOwned: true,
  },
  // ---------------------------------------------------------------- DEFENSE
  {
    playId: "DEF-COV-0011",
    name: "Cover 3 Match",
    side: "defense",
    formationCode: "DEF_4_2_5",
    familyCode: "COVER3_MATCH_FAMILY",
    personnel: "nickel",
    motion: "none",
    concept: "cover_3_match",
    readType: "match",
    readDefender: "apex",
    protection: "na",
    qbFootwork: "na",
    constraints: ["cover_2", "quarters", "cover_1"],
    preferredFronts: ["4-2-5", "3-3-5", "4-3"],
    coverageTargets: ["trips", "empty", "2x2"],
    fieldZones: ["open_field", "high_red", "low_red"],
    coachingPoints:
      "Single-high safety with 3 deep thirds, 4 under. Apex (slot) is the match convert — vs 3x1, apex carries #2 vertical, corners cloud #1. Match principles convert vs vertical releases.",
    assignments: [
      {
        position: "FS",
        alignment: "deep middle",
        assignment: "Middle third, rally on dig",
        landmark: "deep middle",
        vsMan: "Cover middle third",
        vsZone: "Match dig",
      },
      {
        position: "BC",
        alignment: "deep third L",
        assignment: "Deep third left, match #1 vertical",
        landmark: "deep third L",
        vsMan: "Match #1 vert",
        vsZone: "Cloud #1 flat",
      },
      {
        position: "FC",
        alignment: "deep third R",
        assignment: "Deep third right",
        landmark: "deep third R",
        vsMan: "Match #1 vert",
        vsZone: "Cloud #1 flat",
      },
      {
        position: "Apex",
        alignment: "slot aligned 4x4",
        assignment: "Match #2 vertical, run support apex",
        landmark: "#2",
        vsMan: "Match #2 vert",
        vsZone: "Apex in run support",
      },
      {
        position: "Mike",
        alignment: "stack over C",
        assignment: "Match #3 vertical, run fit A-gap",
        landmark: "#3 / A",
        vsMan: "Match #3 vert",
        vsZone: "Fit A-gap",
      },
      {
        position: "DE",
        alignment: "5-tech",
        assignment: "C-gap control, contain QB",
        landmark: "C gap",
        vsMan: "C gap",
        vsZone: "C gap",
      },
    ],
    diagram: {
      hash: "middle",
      yardLine: 35,
      players: [
        { id: "DE1", x: 36, y: 72, label: "DE" },
        { id: "DT1", x: 44, y: 72, label: "DT" },
        { id: "DT2", x: 56, y: 72, label: "DT" },
        { id: "DE2", x: 64, y: 72, label: "DE" },
        { id: "MLB", x: 50, y: 76, label: "Mike" },
        { id: "WLB", x: 42, y: 78, label: "Will" },
        { id: "NB", x: 58, y: 78, label: "Apex" },
        { id: "BC", x: 16, y: 74, label: "BC" },
        { id: "FC", x: 84, y: 74, label: "FC" },
        { id: "SS1", x: 28, y: 82, label: "Star" },
        { id: "SS2", x: 72, y: 82, label: "Cat" },
        { id: "FS", x: 50, y: 88, label: "FS" },
      ],
      paths: [
        { type: "block", from: "FS", toX: 50, toY: 82, label: "Match" },
        { type: "block", from: "BC", toX: 16, toY: 88, label: "Third" },
        { type: "block", from: "FC", toX: 84, toY: 88, label: "Third" },
      ],
    },
    complementary: ["DEF-COV-0004", "DEF-FRT-0033", "DEF-PRS-0022"],
    teamOwned: true,
  },
  {
    playId: "DEF-PRS-0022",
    name: "Nickel Simulated Pressure",
    side: "defense",
    formationCode: "DEF_4_2_5",
    familyCode: "COVER3_MATCH_FAMILY",
    personnel: "nickel",
    motion: "none",
    concept: "simulated_pressure",
    readType: "match",
    readDefender: "mike",
    protection: "na",
    qbFootwork: "na",
    constraints: ["cover_3", "cover_2", "quarters"],
    preferredFronts: ["4-2-5", "3-3-5"],
    coverageTargets: ["dropback", "rpo", "play_action"],
    fieldZones: ["open_field", "high_red", "low_red"],
    coachingPoints:
      "Simulated pressure — Mike shows A-gap blitz then drops to hook, DE drops to flat. Brings 4, looks like 6. Cover 3 behind. Forces QB to slide protection wrong way.",
    assignments: [
      {
        position: "Mike",
        alignment: "show A-gap",
        assignment: "Show A, drop to hook on snap",
        landmark: "hook",
        vsMan: "Drop to hook",
        vsZone: "Drop to hook",
      },
      {
        position: "Will",
        alignment: "B-gap show",
        assignment: "Blitz B-gap",
        landmark: "B",
        vsMan: "Blitz B",
        vsZone: "Blitz B",
      },
      {
        position: "Apex",
        alignment: "slot aligned",
        assignment: "Match #2 vertical, run fit",
        landmark: "#2",
        vsMan: "Match #2",
        vsZone: "Match #2",
      },
      {
        position: "FS",
        alignment: "deep middle",
        assignment: "Middle third rally",
        landmark: "middle third",
        vsMan: "Middle third",
        vsZone: "Match",
      },
      {
        position: "BC",
        alignment: "deep third L",
        assignment: "Deep third L",
        landmark: "third L",
        vsMan: "Match #1",
        vsZone: "Cloud #1",
      },
      {
        position: "DE",
        alignment: "5-tech",
        assignment: "Drop to flat (replacement)",
        landmark: "flat",
        vsMan: "Drop flat",
        vsZone: "Drop flat",
      },
    ],
    diagram: {
      hash: "middle",
      yardLine: 35,
      players: [
        { id: "DE1", x: 36, y: 72, label: "DE" },
        { id: "DT1", x: 44, y: 72, label: "DT" },
        { id: "DT2", x: 56, y: 72, label: "DT" },
        { id: "DE2", x: 64, y: 72, label: "DE" },
        { id: "MLB", x: 50, y: 75, label: "Mike" },
        { id: "WLB", x: 46, y: 78, label: "Will" },
        { id: "NB", x: 58, y: 78, label: "Apex" },
        { id: "BC", x: 16, y: 74, label: "BC" },
        { id: "FC", x: 84, y: 74, label: "FC" },
        { id: "SS1", x: 28, y: 82, label: "Star" },
        { id: "SS2", x: 72, y: 82, label: "Cat" },
        { id: "FS", x: 50, y: 88, label: "FS" },
      ],
      paths: [
        { type: "block", from: "MLB", toX: 50, toY: 65, label: "Show A" },
        { type: "block", from: "WLB", toX: 46, toY: 60, label: "Blitz B" },
        { type: "block", from: "MLB", toX: 50, toY: 80, label: "Drop hook" },
        { type: "block", from: "DE1", toX: 28, toY: 78, label: "Drop flat" },
      ],
    },
    complementary: ["DEF-COV-0011", "DEF-COV-0004", "DEF-FRT-0033"],
    teamOwned: true,
  },
  {
    playId: "DEF-COV-0004",
    name: "Quarters vs Trips",
    side: "defense",
    formationCode: "DEF_4_2_5",
    familyCode: "QUARTERS_FAMILY",
    personnel: "nickel",
    motion: "none",
    concept: "cover_4_quarters",
    readType: "match",
    readDefender: "apex",
    protection: "na",
    qbFootwork: "na",
    constraints: ["cover_3", "cover_2", "cover_1"],
    preferredFronts: ["4-2-5", "3-3-5", "4-3"],
    coverageTargets: ["trips", "2x2"],
    fieldZones: ["open_field", "high_red"],
    coachingPoints:
      "Quarters vs trips — apex reads #2 vertical: if #2 vertical, apex matches #2, safety brackets #1. If #2 flat, apex drives flat, safety stays on #1. Match convert vs trips splits.",
    assignments: [
      {
        position: "FS",
        alignment: "deep half trips side",
        assignment: "Match #1 vertical, half-turn vs flat",
        landmark: "#1 trips",
        vsMan: "Bracket #1",
        vsZone: "Half-turn",
      },
      {
        position: "BC",
        alignment: "deep half backside",
        assignment: "Match #1 backside vertical",
        landmark: "#1 backside",
        vsMan: "Match #1 vert",
        vsZone: "Match #1 vert",
      },
      {
        position: "Apex",
        alignment: "slot aligned 4x4",
        assignment: "Read #2 — vertical match, flat drive",
        landmark: "#2",
        vsMan: "Match #2 vert",
        vsZone: "Drive flat",
      },
      {
        position: "Star",
        alignment: "trips #3 inside",
        assignment: "Match #3 vertical",
        landmark: "#3",
        vsMan: "Match #3",
        vsZone: "Cloud #3",
      },
      {
        position: "Mike",
        alignment: "stack over C",
        assignment: "Hook zone, run fit A",
        landmark: "hook / A",
        vsMan: "Match #3 cross",
        vsZone: "Hook",
      },
      {
        position: "DE",
        alignment: "5-tech",
        assignment: "C gap contain",
        landmark: "C",
        vsMan: "C gap",
        vsZone: "C gap",
      },
    ],
    diagram: {
      hash: "right",
      yardLine: 35,
      players: [
        { id: "DE1", x: 36, y: 72, label: "DE" },
        { id: "DT1", x: 44, y: 72, label: "DT" },
        { id: "DT2", x: 56, y: 72, label: "DT" },
        { id: "DE2", x: 64, y: 72, label: "DE" },
        { id: "MLB", x: 50, y: 76, label: "Mike" },
        { id: "WLB", x: 42, y: 78, label: "Will" },
        { id: "NB", x: 70, y: 78, label: "Apex" },
        { id: "BC", x: 16, y: 74, label: "BC" },
        { id: "FC", x: 84, y: 74, label: "FC" },
        { id: "SS1", x: 78, y: 82, label: "Star" },
        { id: "SS2", x: 28, y: 82, label: "Cat" },
        { id: "FS", x: 70, y: 88, label: "FS" },
      ],
      paths: [
        { type: "block", from: "FS", toX: 80, toY: 82, label: "Match #1" },
        { type: "block", from: "NB", toX: 76, toY: 80, label: "Match #2" },
        { type: "block", from: "SS1", toX: 74, toY: 78, label: "Match #3" },
      ],
    },
    complementary: ["DEF-COV-0011", "DEF-PRS-0022", "DEF-FRT-0033"],
    teamOwned: true,
  },
  {
    playId: "DEF-FRT-0033",
    name: "Tite Front",
    side: "defense",
    formationCode: "DEF_4_2_5",
    familyCode: "QUARTERS_FAMILY",
    personnel: "nickel",
    motion: "none",
    concept: "tite_front",
    readType: "front",
    readDefender: "edge",
    protection: "na",
    qbFootwork: "na",
    constraints: ["4-3", "4-2-5", "3-4"],
    preferredFronts: ["4-2-5", "3-3-5"],
    coverageTargets: ["cover_3", "quarters", "cover_2"],
    fieldZones: ["open_field", "high_red", "low_red"],
    coachingPoints:
      "Tite front — 4i-0-4i alignment. Two 4i-tech DL align inside the OTs, head up center, OLBs on edge. Eliminates inside zone, forces bounce where apex/OLB fit.",
    assignments: [
      {
        position: "4i-DE1",
        alignment: "inside shade OT left",
        assignment: "Penetrate B gap, control OT",
        landmark: "B",
        vsMan: "B gap squeeze",
        vsZone: "B gap squeeze",
      },
      {
        position: "Nose",
        alignment: "0-tech over C",
        assignment: "Two-gap A",
        landmark: "A both sides",
        vsMan: "Two-gap A",
        vsZone: "Two-gap A",
      },
      {
        position: "4i-DE2",
        alignment: "inside shade OT right",
        assignment: "Penetrate B gap right",
        landmark: "B right",
        vsMan: "B gap squeeze",
        vsZone: "B gap squeeze",
      },
      {
        position: "OLB1",
        alignment: "5-tech edge left",
        assignment: "Set edge contain",
        landmark: "C edge L",
        vsMan: "Set edge",
        vsZone: "Set edge",
      },
      {
        position: "Mike",
        alignment: "stack over C",
        assignment: "Fit A clean",
        landmark: "A",
        vsMan: "Fit A",
        vsZone: "Fit A",
      },
      {
        position: "OLB2",
        alignment: "5-tech edge right",
        assignment: "Set edge contain",
        landmark: "C edge R",
        vsMan: "Set edge",
        vsZone: "Set edge",
      },
    ],
    diagram: {
      hash: "middle",
      yardLine: 35,
      players: [
        { id: "DE1", x: 42, y: 72, label: "4i" },
        { id: "Nose", x: 50, y: 72, label: "0" },
        { id: "DE2", x: 58, y: 72, label: "4i" },
        { id: "OLB1", x: 32, y: 74, label: "5" },
        { id: "OLB2", x: 68, y: 74, label: "5" },
        { id: "MLB", x: 50, y: 78, label: "Mike" },
        { id: "WLB", x: 44, y: 80, label: "Will" },
        { id: "NB", x: 56, y: 80, label: "Apex" },
      ],
      paths: [
        { type: "block", from: "DE1", toX: 42, toY: 65, label: "Penetrate B" },
        { type: "block", from: "Nose", toX: 46, toY: 66, label: "A gap" },
        { type: "block", from: "Nose", toX: 54, toY: 66, label: "A gap" },
        { type: "block", from: "DE2", toX: 58, toY: 65, label: "Penetrate B" },
      ],
    },
    complementary: ["DEF-COV-0011", "DEF-COV-0004", "DEF-PRS-0022"],
    teamOwned: true,
  },
];

// ============================================================================
//  TEAM
// ============================================================================

const teamData = {
  name: "Riverside Warriors",
  philosophy: "Spread / RPO-heavy",
  primaryColor: "#16a34a",
};

// ============================================================================
//  PLAYERS
// ============================================================================

const players = [
  { jersey: 9, name: "Marcus Bell", position: "QB", group: "offensive", height: "6'2", weight: 205, speedGrade: "A", notes: "Team captain, RPO triggerman, accurate on the move.", quizScore: 0.96 },
  { jersey: 22, name: "Tyler Reed", position: "RB", group: "offensive", height: "5'10", weight: 195, speedGrade: "A+", notes: "Starter. Inside zone vision, explosive cutback ability.", quizScore: 0.91 },
  { jersey: 5, name: "Drew Carter", position: "WR", group: "offensive", height: "6'1", weight: 185, speedGrade: "A", notes: "X receiver, vertical separator.", quizScore: 0.87 },
  { jersey: 2, name: "Andre Bishop", position: "WR", group: "offensive", height: "5'11", weight: 180, speedGrade: "A+", notes: "Z receiver, jet sweep and bubble specialist.", quizScore: 0.82 },
  { jersey: 8, name: "Sam Hall", position: "WR", group: "offensive", height: "5'10", weight: 175, speedGrade: "A", notes: "Slot H, mismatch vs apex.", quizScore: 0.79 },
  { jersey: 88, name: "Jake Foster", position: "TE", group: "offensive", height: "6'4", weight: 245, speedGrade: "B+", notes: "Y tight end, run-blocker and seam threat.", quizScore: 0.84 },
  { jersey: 71, name: "Pete Olson", position: "OL", group: "offensive", height: "6'4", weight: 285, speedGrade: "B", notes: "Left tackle, pass-set anchor.", quizScore: 0.78 },
  { jersey: 66, name: "Vince Diaz", position: "OL", group: "offensive", height: "6'2", weight: 280, speedGrade: "B+", notes: "Left guard, pull-and-kick specialist.", quizScore: 0.81 },
  { jersey: 53, name: "Dom Reyes", position: "OL", group: "offensive", height: "6'1", weight: 275, speedGrade: "B", notes: "Center, run-blocking signal caller.", quizScore: 0.93 },
  { jersey: 76, name: "Mike Bryant", position: "OL", group: "offensive", height: "6'3", weight: 290, speedGrade: "B", notes: "Right guard, double-team mauler.", quizScore: 0.75 },
  { jersey: 79, name: "Trey Walker", position: "OL", group: "offensive", height: "6'5", weight: 290, speedGrade: "B", notes: "Right tackle, edge setter in run game.", quizScore: 0.72 },
  { jersey: 44, name: "Carlos Mendez", position: "LB", group: "defensive", height: "6'0", weight: 220, speedGrade: "A", notes: "Mike LB, defensive signal caller.", quizScore: 0.88 },
];

// ============================================================================
//  OPPONENTS + TENDENCIES
// ============================================================================

const opponents = [
  {
    name: "Central High Wildcats",
    mascot: "Wildcats",
    league: "Region 4-6A",
    scoutSummary:
      "Run-heavy 21 personnel team that uses I-Pro Right and Ace Doubles. Will run Counter and Power. Pass game built off play-action (PA Flood, Counter Boot). Defensively: 4-3 Over base, Cover 3 majority with simulated pressures on 3rd & long.",
    tendencies: [
      { situation: "1st_&_10", formationKey: "I-Pro", personnel: "21", hash: null, result: "run", value: "Power", probability: 0.34, sampleSize: 52, confidence: "HIGH", notes: "Favorite first-down run." },
      { situation: "1st_&_10", formationKey: "I-Pro", personnel: "21", hash: null, result: "run", value: "Counter", probability: 0.21, sampleSize: 52, confidence: "HIGH" },
      { situation: "2nd_&_medium", formationKey: "Ace", personnel: "12", hash: null, result: "run", value: "Duo", probability: 0.28, sampleSize: 38, confidence: "MEDIUM" },
      { situation: "3rd_&_4_6", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Mesh", probability: 0.34, sampleSize: 41, confidence: "HIGH" },
      { situation: "3rd_&_7+", formationKey: "Empty", personnel: "10", hash: null, result: "pass", value: "Four Verts", probability: 0.28, sampleSize: 36, confidence: "HIGH" },
      { situation: "red_zone", formationKey: "Ace", personnel: "12", hash: null, result: "run", value: "QB Run", probability: 0.29, sampleSize: 24, confidence: "MEDIUM" },
      { situation: "2nd_&_long", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Stick", probability: 0.41, sampleSize: 33, confidence: "HIGH" },
      { situation: "1st_&_10", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Glance RPO", probability: 0.21, sampleSize: 47, confidence: "HIGH" },
      { situation: "1st_&_10", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Y Cross", probability: 0.17, sampleSize: 47, confidence: "HIGH" },
      { situation: "3rd_&_short", formationKey: "Ace", personnel: "12", hash: null, result: "run", value: "QB Sneak", probability: 0.45, sampleSize: 22, confidence: "HIGH" },
      { situation: "2nd_&_short", formationKey: "I-Pro", personnel: "21", hash: null, result: "run", value: "ISO", probability: 0.52, sampleSize: 28, confidence: "HIGH" },
      { situation: "backed_up", formationKey: "Ace", personnel: "12", hash: null, result: "run", value: "Duo", probability: 0.48, sampleSize: 19, confidence: "MEDIUM" },
    ],
  },
  {
    name: "Northside Academy Eagles",
    mascot: "Eagles",
    league: "Region 4-6A",
    scoutSummary:
      "Spread 10/11 personnel RPO team. Heavy Trips sets with Glance and Stick RPOs. Will run Inside Zone and Split Zone to constrain. Defensively 4-2-5 with Quarters match and Cover 3 cloud.",
    tendencies: [
      { situation: "1st_&_10", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Glance RPO", probability: 0.28, sampleSize: 58, confidence: "HIGH" },
      { situation: "1st_&_10", formationKey: "Trips", personnel: "11", hash: null, result: "run", value: "Inside Zone", probability: 0.31, sampleSize: 58, confidence: "HIGH" },
      { situation: "2nd_&_medium", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Mesh", probability: 0.29, sampleSize: 44, confidence: "HIGH" },
      { situation: "3rd_&_4_6", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Stick", probability: 0.36, sampleSize: 39, confidence: "HIGH" },
      { situation: "3rd_&_7+", formationKey: "Empty", personnel: "10", hash: null, result: "pass", value: "Four Verts", probability: 0.33, sampleSize: 31, confidence: "HIGH" },
      { situation: "red_zone", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Smash", probability: 0.27, sampleSize: 21, confidence: "MEDIUM" },
      { situation: "2nd_&_long", formationKey: "Empty", personnel: "10", hash: null, result: "pass", value: "Y Cross", probability: 0.24, sampleSize: 25, confidence: "MEDIUM" },
      { situation: "1st_&_10", formationKey: "Empty", personnel: "10", hash: null, result: "pass", value: "Tunnel Screen", probability: 0.18, sampleSize: 41, confidence: "HIGH" },
      { situation: "3rd_&_short", formationKey: "Trips", personnel: "11", hash: null, result: "run", value: "QB Draw", probability: 0.31, sampleSize: 18, confidence: "MEDIUM" },
      { situation: "goal_line", formationKey: "Ace", personnel: "12", hash: null, result: "run", value: "Power", probability: 0.42, sampleSize: 16, confidence: "MEDIUM" },
    ],
  },
  {
    name: "Westview Titans",
    mascot: "Titans",
    league: "Region 4-6A",
    scoutSummary:
      "Multiple offense — 11/12 personnel with heavy Wing-T influences. Buck Sweep, Counter, and Trap run game. Play-action Y-Cross off Counter is favorite shot. Defensively 3-4 Okie with Cover 3 and simulated pressure.",
    tendencies: [
      { situation: "1st_&_10", formationKey: "Wing-T", personnel: "21", hash: null, result: "run", value: "Buck Sweep", probability: 0.27, sampleSize: 49, confidence: "HIGH" },
      { situation: "1st_&_10", formationKey: "Wing-T", personnel: "21", hash: null, result: "run", value: "Trap", probability: 0.19, sampleSize: 49, confidence: "HIGH" },
      { situation: "2nd_&_medium", formationKey: "Ace", personnel: "12", hash: null, result: "run", value: "Counter", probability: 0.26, sampleSize: 37, confidence: "MEDIUM" },
      { situation: "3rd_&_4_6", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Y Cross", probability: 0.31, sampleSize: 35, confidence: "HIGH" },
      { situation: "3rd_&_7+", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Four Verts", probability: 0.22, sampleSize: 29, confidence: "MEDIUM" },
      { situation: "red_zone", formationKey: "Ace", personnel: "12", hash: null, result: "run", value: "Power", probability: 0.34, sampleSize: 23, confidence: "HIGH" },
      { situation: "2nd_&_long", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Stick", probability: 0.38, sampleSize: 27, confidence: "HIGH" },
      { situation: "1st_&_10", formationKey: "Trips", personnel: "11", hash: null, result: "pass", value: "Glance RPO", probability: 0.18, sampleSize: 44, confidence: "MEDIUM" },
      { situation: "3rd_&_short", formationKey: "Wing-T", personnel: "21", hash: null, result: "run", value: "QB Sneak", probability: 0.39, sampleSize: 18, confidence: "MEDIUM" },
      { situation: "2nd_&_short", formationKey: "Wing-T", personnel: "21", hash: null, result: "run", value: "Buck Sweep", probability: 0.41, sampleSize: 22, confidence: "HIGH" },
    ],
  },
];

// ============================================================================
//  GAMES + SNAP RESULTS
// ============================================================================

type SnapResultSeed = {
  quarter: number;
  clock?: string;
  down: number;
  distance: number;
  hash?: string;
  yardLine: number;
  formation?: string;
  personnel?: string;
  motion?: string;
  concept?: string;
  front?: string;
  coverage?: string;
  pressure?: string;
  playType?: string;
  playId?: string;
  yardsGained: number;
  success: boolean;
  explosive: boolean;
  negative: boolean;
  turnover?: boolean;
  penalty?: boolean;
};

const games: Array<{
  week: number;
  date: Date;
  location: string;
  opponentIndex: number;
  ourScore: number;
  oppScore: number;
  result: string;
  snapResults: SnapResultSeed[];
}> = [
  {
    week: 1,
    date: new Date("2024-09-06T19:00:00Z"),
    location: "home",
    opponentIndex: 0,
    ourScore: 28,
    oppScore: 17,
    result: "W",
    snapResults: [
      { quarter: 1, clock: "10:42", down: 1, distance: 10, hash: "right", yardLine: 32, formation: "Gun Trips R", personnel: "11", concept: "iz_glance_rpo", front: "4-2-5", coverage: "Cover 3", playType: "pass", playId: "OFF-RPO-0172", yardsGained: 9, success: true, explosive: false, negative: false },
      { quarter: 1, clock: "08:13", down: 2, distance: 1, hash: "right", yardLine: 41, formation: "Gun Trips R", personnel: "11", concept: "inside_zone", front: "4-2-5", coverage: "Cover 3", playType: "run", playId: "OFF-RUN-0042", yardsGained: 6, success: true, explosive: false, negative: false },
      { quarter: 1, clock: "06:55", down: 1, distance: 10, hash: "middle", yardLine: 47, formation: "Gun Trips R", personnel: "11", concept: "flood", front: "4-3", coverage: "Quarters", playType: "pass", playId: "OFF-PA-0203", yardsGained: 27, success: true, explosive: true, negative: false },
      { quarter: 2, clock: "12:18", down: 3, distance: 5, hash: "left", yardLine: 28, formation: "Gun 2x2 Ace", personnel: "11", concept: "mesh", front: "4-2-5", coverage: "Cover 3", playType: "pass", playId: "OFF-PASS-0310", yardsGained: 11, success: true, explosive: false, negative: false },
      { quarter: 2, clock: "08:42", down: 2, distance: 8, hash: "right", yardLine: 45, formation: "Gun Doubles", personnel: "10", concept: "gt_counter", front: "4-2-5", coverage: "Cover 3", playType: "run", playId: "OFF-RUN-0061", yardsGained: 14, success: true, explosive: true, negative: false },
      { quarter: 2, clock: "03:11", down: 1, distance: 10, hash: "middle", yardLine: 22, formation: "Gun Trips R", personnel: "11", concept: "stick", front: "4-3", coverage: "Quarters", playType: "pass", playId: "OFF-PASS-0305", yardsGained: 6, success: true, explosive: false, negative: false },
      { quarter: 3, clock: "09:33", down: 2, distance: 7, hash: "right", yardLine: 38, formation: "Gun 2x2 Ace", personnel: "11", concept: "four_verticals", front: "4-2-5", coverage: "Cover 3", playType: "pass", playId: "OFF-PASS-0320", yardsGained: 32, success: true, explosive: true, negative: false },
      { quarter: 3, clock: "05:22", down: 1, distance: 10, hash: "left", yardLine: 15, formation: "Gun Trips R", personnel: "11", concept: "split_zone", front: "4-2-5", coverage: "Cover 3", playType: "run", playId: "OFF-RUN-0048", yardsGained: -2, success: false, explosive: false, negative: true },
      { quarter: 4, clock: "11:08", down: 3, distance: 8, hash: "right", yardLine: 40, formation: "Gun 2x2 Ace", personnel: "11", concept: "y_cross", front: "4-3", coverage: "Quarters", playType: "pass", playId: "OFF-PASS-0340", yardsGained: 22, success: true, explosive: true, negative: false },
      { quarter: 4, clock: "02:45", down: 2, distance: 4, hash: "middle", yardLine: 33, formation: "Gun Doubles", personnel: "10", concept: "duo", front: "4-3", coverage: "Cover 2", playType: "run", playId: "OFF-RUN-0071", yardsGained: 8, success: true, explosive: false, negative: false },
    ],
  },
  {
    week: 2,
    date: new Date("2024-09-13T19:00:00Z"),
    location: "away",
    opponentIndex: 1,
    ourScore: 31,
    oppScore: 24,
    result: "W",
    snapResults: [
      { quarter: 1, clock: "11:33", down: 1, distance: 10, hash: "right", yardLine: 25, formation: "Gun Trips R", personnel: "11", concept: "iz_glance_rpo", front: "4-2-5", coverage: "Quarters", playType: "pass", playId: "OFF-RPO-0172", yardsGained: 7, success: true, explosive: false, negative: false },
      { quarter: 1, clock: "08:55", down: 1, distance: 10, hash: "middle", yardLine: 40, formation: "Gun Trips R", personnel: "11", concept: "inside_zone", front: "4-2-5", coverage: "Quarters", playType: "run", playId: "OFF-RUN-0042", yardsGained: 5, success: true, explosive: false, negative: false },
      { quarter: 2, clock: "13:20", down: 2, distance: 6, hash: "left", yardLine: 48, formation: "Gun 2x2 Ace", personnel: "11", concept: "mesh", front: "4-2-5", coverage: "Quarters", playType: "pass", playId: "OFF-PASS-0310", yardsGained: 18, success: true, explosive: true, negative: false },
      { quarter: 2, clock: "09:11", down: 3, distance: 4, hash: "right", yardLine: 35, formation: "Gun Trips R", personnel: "11", concept: "stick", front: "4-2-5", coverage: "Cover 3", playType: "pass", playId: "OFF-PASS-0305", yardsGained: 5, success: true, explosive: false, negative: false },
      { quarter: 2, clock: "02:42", down: 1, distance: 10, hash: "right", yardLine: 25, formation: "Gun Trips R", personnel: "11", concept: "jet_sweep", front: "4-2-5", coverage: "Cover 3", playType: "run", playId: "OFF-RUN-0055", yardsGained: 12, success: true, explosive: false, negative: false },
      { quarter: 3, clock: "10:18", down: 2, distance: 8, hash: "middle", yardLine: 42, formation: "Gun Doubles", personnel: "10", concept: "gt_counter", front: "4-2-5", coverage: "Quarters", playType: "run", playId: "OFF-RUN-0061", yardsGained: 9, success: true, explosive: false, negative: false },
      { quarter: 3, clock: "06:55", down: 1, distance: 10, hash: "left", yardLine: 30, formation: "Gun Trips R", personnel: "11", concept: "boot_flood", front: "4-2-5", coverage: "Cover 3", playType: "pass", playId: "OFF-PA-0211", yardsGained: 21, success: true, explosive: true, negative: false },
      { quarter: 3, clock: "02:33", down: 3, distance: 7, hash: "right", yardLine: 28, formation: "Gun 2x2 Ace", personnel: "11", concept: "four_verticals", front: "4-2-5", coverage: "Cover 3", playType: "pass", playId: "OFF-PASS-0320", yardsGained: 4, success: false, explosive: false, negative: false },
      { quarter: 4, clock: "12:48", down: 1, distance: 10, hash: "middle", yardLine: 50, formation: "Gun 2x2 Ace", personnel: "11", concept: "duo", front: "4-2-5", coverage: "Quarters", playType: "run", playId: "OFF-RUN-0071", yardsGained: 6, success: true, explosive: false, negative: false },
      { quarter: 4, clock: "08:11", down: 2, distance: 5, hash: "right", yardLine: 18, formation: "Gun Trips R", personnel: "11", concept: "smash", front: "4-2-5", coverage: "Cover 3", playType: "pass", playId: "OFF-PASS-0308", yardsGained: 13, success: true, explosive: false, negative: false },
    ],
  },
  {
    week: 3,
    date: new Date("2024-09-20T19:00:00Z"),
    location: "home",
    opponentIndex: 2,
    ourScore: 21,
    oppScore: 24,
    result: "L",
    snapResults: [
      { quarter: 1, clock: "10:12", down: 1, distance: 10, hash: "left", yardLine: 28, formation: "Gun Trips R", personnel: "11", concept: "iz_glance_rpo", front: "3-4", coverage: "Cover 3", playType: "pass", playId: "OFF-RPO-0172", yardsGained: 4, success: false, explosive: false, negative: false },
      { quarter: 1, clock: "07:33", down: 2, distance: 6, hash: "middle", yardLine: 32, formation: "Gun Doubles", personnel: "10", concept: "split_zone", front: "3-4", coverage: "Cover 3", playType: "run", playId: "OFF-RUN-0048", yardsGained: 3, success: true, explosive: false, negative: false },
      { quarter: 1, clock: "03:18", down: 3, distance: 3, hash: "right", yardLine: 35, formation: "Gun Trips R", personnel: "11", concept: "inside_zone", front: "3-4", coverage: "Cover 3", playType: "run", playId: "OFF-RUN-0042", yardsGained: 1, success: false, explosive: false, negative: false },
      { quarter: 2, clock: "11:42", down: 2, distance: 8, hash: "left", yardLine: 25, formation: "Gun 2x2 Ace", personnel: "11", concept: "y_cross", front: "3-4", coverage: "Cover 3", playType: "pass", playId: "OFF-PASS-0340", yardsGained: 24, success: true, explosive: true, negative: false },
      { quarter: 2, clock: "07:55", down: 1, distance: 10, hash: "middle", yardLine: 49, formation: "Gun Trips R", personnel: "11", concept: "flood", front: "3-4", coverage: "Cover 3", playType: "pass", playId: "OFF-PA-0203", yardsGained: 0, success: false, explosive: false, negative: false, turnover: true },
      { quarter: 2, clock: "03:18", down: 3, distance: 5, hash: "right", yardLine: 33, formation: "Gun 2x2 Ace", personnel: "11", concept: "mesh", front: "3-4", coverage: "Cover 3", playType: "pass", playId: "OFF-PASS-0310", yardsGained: 6, success: true, explosive: false, negative: false },
      { quarter: 3, clock: "10:18", down: 1, distance: 10, hash: "left", yardLine: 22, formation: "Gun Doubles", personnel: "10", concept: "gt_counter", front: "3-4", coverage: "Cover 3", playType: "run", playId: "OFF-RUN-0061", yardsGained: 8, success: true, explosive: false, negative: false },
      { quarter: 3, clock: "06:55", down: 2, distance: 7, hash: "middle", yardLine: 30, formation: "Gun Trips R", personnel: "11", concept: "smash", front: "3-4", coverage: "Cover 3", playType: "pass", playId: "OFF-PASS-0308", yardsGained: 16, success: true, explosive: false, negative: false },
      { quarter: 4, clock: "08:18", down: 1, distance: 10, hash: "right", yardLine: 38, formation: "Gun Trips R", personnel: "11", concept: "jet_sweep", front: "3-4", coverage: "Cover 3", playType: "run", playId: "OFF-RUN-0055", yardsGained: -3, success: false, explosive: false, negative: true },
      { quarter: 4, clock: "02:42", down: 2, distance: 13, hash: "left", yardLine: 35, formation: "Gun 2x2 Ace", personnel: "11", concept: "four_verticals", front: "3-4", coverage: "Cover 3", playType: "pass", playId: "OFF-PASS-0320", yardsGained: 17, success: true, explosive: false, negative: false },
    ],
  },
];

// ============================================================================
//  CALL SHEET
// ============================================================================

const callSheetSections = [
  {
    situation: "Openers",
    plays: [
      { playId: "OFF-RPO-0172", note: "Glance RPO — apex conflict", priority: 1 },
      { playId: "OFF-RUN-0042", note: "IZ — base run", priority: 2 },
      { playId: "OFF-PASS-0305", note: "Stick — quick game", priority: 3 },
    ],
  },
  {
    situation: "Base Runs",
    plays: [
      { playId: "OFF-RUN-0042", note: "IZ — covered/uncovered", priority: 1 },
      { playId: "OFF-RUN-0048", note: "Split Zone — slow backside flow", priority: 2 },
      { playId: "OFF-RUN-0061", note: "GT Counter — pull & kick", priority: 3 },
      { playId: "OFF-RUN-0071", note: "Duo — double-team climb", priority: 4 },
    ],
  },
  {
    situation: "Quick Game",
    plays: [
      { playId: "OFF-PASS-0305", note: "Stick — apex read", priority: 1 },
      { playId: "OFF-PASS-0308", note: "Smash — corner/out", priority: 2 },
      { playId: "OFF-PASS-0330", note: "Tunnel Screen — constraint", priority: 3 },
    ],
  },
  {
    situation: "Dropback",
    plays: [
      { playId: "OFF-PASS-0310", note: "Mesh — 4-man rub", priority: 1 },
      { playId: "OFF-PASS-0340", note: "Y-Cross — read middle safety", priority: 2 },
      { playId: "OFF-PASS-0320", note: "Four Verts — push vertical", priority: 3 },
    ],
  },
  {
    situation: "Play Action",
    plays: [
      { playId: "OFF-PA-0203", note: "PA Flood — three-level flood", priority: 1 },
      { playId: "OFF-PA-0211", note: "Counter Boot — opposite direction", priority: 2 },
    ],
  },
  {
    situation: "Screens",
    plays: [
      { playId: "OFF-PASS-0330", note: "Tunnel Screen — trips", priority: 1 },
      { playId: "OFF-RUN-0055", note: "Jet Sweep — constraint screen", priority: 2 },
    ],
  },
  {
    situation: "RPO",
    plays: [
      { playId: "OFF-RPO-0172", note: "IZ Glance — apex conflict", priority: 1 },
      { playId: "OFF-PASS-0305", note: "Stick RPO — apex flatten", priority: 2 },
    ],
  },
  {
    situation: "3rd & Short",
    plays: [
      { playId: "OFF-RUN-0042", note: "IZ — fall forward", priority: 1 },
      { playId: "OFF-PASS-0305", note: "Stick — quick conversion", priority: 2 },
      { playId: "OFF-RUN-0071", note: "Duo — power", priority: 3 },
    ],
  },
  {
    situation: "3rd & Medium",
    plays: [
      { playId: "OFF-PASS-0310", note: "Mesh — find window", priority: 1 },
      { playId: "OFF-PASS-0308", note: "Smash — corner or out", priority: 2 },
      { playId: "OFF-RPO-0172", note: "Glance RPO — keep honest", priority: 3 },
    ],
  },
  {
    situation: "3rd & Long",
    plays: [
      { playId: "OFF-PASS-0320", note: "Four Verts — push", priority: 1 },
      { playId: "OFF-PASS-0340", note: "Y-Cross — big play", priority: 2 },
      { playId: "OFF-PA-0203", note: "PA Flood — if off-schedule", priority: 3 },
    ],
  },
  {
    situation: "Backed Up",
    plays: [
      { playId: "OFF-RUN-0042", note: "IZ — safe call", priority: 1 },
      { playId: "OFF-PASS-0305", note: "Stick — quick game", priority: 2 },
      { playId: "OFF-RUN-0071", note: "Duo — control line", priority: 3 },
    ],
  },
  {
    situation: "High Red",
    plays: [
      { playId: "OFF-RPO-0172", note: "Glance RPO — apex conflict", priority: 1 },
      { playId: "OFF-PASS-0340", note: "Y-Cross — shot", priority: 2 },
      { playId: "OFF-PA-0203", note: "PA Flood", priority: 3 },
    ],
  },
  {
    situation: "Low Red",
    plays: [
      { playId: "OFF-RUN-0061", note: "GT Counter — pull", priority: 1 },
      { playId: "OFF-PASS-0308", note: "Smash — corner shot", priority: 2 },
      { playId: "OFF-RUN-0042", note: "IZ", priority: 3 },
    ],
  },
  {
    situation: "Goal Line",
    plays: [
      { playId: "OFF-RUN-0071", note: "Duo — pound it", priority: 1 },
      { playId: "OFF-PA-0211", note: "Counter Boot — bootleg", priority: 2 },
    ],
  },
  {
    situation: "2 Point",
    plays: [
      { playId: "OFF-PASS-0305", note: "Stick — quick", priority: 1 },
      { playId: "OFF-RUN-0042", note: "IZ — QB sneak option", priority: 2 },
    ],
  },
  {
    situation: "4 Minute",
    plays: [
      { playId: "OFF-RUN-0042", note: "IZ — keep clock", priority: 1 },
      { playId: "OFF-RUN-0071", note: "Duo — fall forward", priority: 2 },
      { playId: "OFF-RUN-0061", note: "GT Counter — if box loaded", priority: 3 },
    ],
  },
  {
    situation: "2 Minute",
    plays: [
      { playId: "OFF-PASS-0310", note: "Mesh — boundary/field", priority: 1 },
      { playId: "OFF-PASS-0305", note: "Stick — get out", priority: 2 },
      { playId: "OFF-PASS-0330", note: "Tunnel Screen — spike ready", priority: 3 },
    ],
  },
];

// ============================================================================
//  INSTALL PLAN
// ============================================================================

const installPlans = [
  {
    day: 1,
    title: "Foundations — Formations, Inside Zone, Stick, Half-Slide",
    focus: "Install base spread formations and the Inside Zone framework (the spine of the offense).",
    sections: [
      {
        period: "Formations",
        items: [
          { type: "formation", name: "Gun Doubles" },
          { type: "formation", name: "Gun Trips Right" },
          { type: "formation", name: "Gun 2x2 Ace" },
        ],
      },
      {
        period: "Runs",
        items: [
          { type: "play", name: "Inside Zone" },
          { type: "play", name: "Counter" },
        ],
      },
      {
        period: "Pass",
        items: [{ type: "play", name: "Stick" }],
      },
      {
        period: "Protection",
        items: [{ type: "protection", name: "6-Man Half Slide" }],
      },
    ],
  },
  {
    day: 2,
    title: "Motion, Jet Sweep, RPO, Mesh",
    focus: "Layer motion onto Day 1 framework and introduce RPO conflict and Mesh concept.",
    sections: [
      {
        period: "Motion",
        items: [{ type: "motion", name: "Jet" }],
      },
      {
        period: "Runs",
        items: [{ type: "play", name: "Jet Sweep" }],
      },
      {
        period: "RPO",
        items: [{ type: "play", name: "IZ Glance" }],
      },
      {
        period: "Pass",
        items: [{ type: "play", name: "Mesh" }],
      },
    ],
  },
];

// ============================================================================
//  SEED EXECUTION
// ============================================================================

async function main() {
  console.log("▶ GridironIQ seed: starting\n");

  // --- WIPE existing data in correct dependency order --------------
  console.log("· Wiping existing data...");
  await prisma.snapResult.deleteMany();
  await prisma.callSheet.deleteMany();
  await prisma.installPlan.deleteMany();
  await prisma.tendency.deleteMany();
  await prisma.snapResult.deleteMany();
  await prisma.game.deleteMany();
  await prisma.play.deleteMany();
  await prisma.player.deleteMany();
  await prisma.formation.deleteMany();
  await prisma.playFamily.deleteMany();
  await prisma.opponent.deleteMany();
  await prisma.team.deleteMany();
  console.log("· Wipe complete.\n");

  // --- TEAM -------------------------------------------------------
  console.log("· Seeding team...");
  const team = await prisma.team.create({
    data: {
      name: teamData.name,
      philosophy: teamData.philosophy,
      primaryColor: teamData.primaryColor,
    },
  });
  console.log(`  ✓ Team: ${team.name} (${team.id})`);

  // --- PLAYERS ----------------------------------------------------
  console.log("· Seeding players...");
  for (const p of players) {
    await prisma.player.create({
      data: { ...p, teamId: team.id },
    });
  }
  console.log(`  ✓ Players: ${players.length}`);

  // --- FORMATIONS -------------------------------------------------
  console.log("· Seeding formations...");
  const formationMap = new Map<string, string>();
  for (const f of formations) {
    const created = await prisma.formation.create({ data: f });
    formationMap.set(f.code, created.id);
  }
  console.log(`  ✓ Formations: ${formations.length}`);

  // --- PLAY FAMILIES ----------------------------------------------
  console.log("· Seeding play families...");
  const familyMap = new Map<string, string>();
  for (const fam of playFamilies) {
    const created = await prisma.playFamily.create({ data: fam });
    familyMap.set(fam.code, created.id);
  }
  console.log(`  ✓ Play Families: ${playFamilies.length}`);

  // --- PLAYS ------------------------------------------------------
  console.log("· Seeding plays...");
  const playMap = new Map<string, string>();
  for (const p of plays) {
    const created = await prisma.play.create({
      data: {
        playId: p.playId,
        name: p.name,
        side: p.side,
        teamId: p.teamOwned ? team.id : null,
        formationId: p.formationCode ? formationMap.get(p.formationCode) : null,
        familyId: p.familyCode ? familyMap.get(p.familyCode) : null,
        personnel: p.personnel ?? null,
        motion: p.motion ?? null,
        concept: p.concept,
        readType: p.readType ?? null,
        readDefender: p.readDefender ?? null,
        protection: p.protection ?? null,
        qbFootwork: p.qbFootwork ?? null,
        constraints: JSON.stringify(p.constraints),
        preferredFronts: JSON.stringify(p.preferredFronts),
        coverageTargets: JSON.stringify(p.coverageTargets),
        fieldZones: JSON.stringify(p.fieldZones),
        coachingPoints: p.coachingPoints,
        assignments: JSON.stringify(p.assignments),
        routes: p.routes ? JSON.stringify(p.routes) : null,
        diagram: p.diagram ? JSON.stringify(p.diagram) : null,
        complementary: JSON.stringify(p.complementary),
      },
    });
    playMap.set(p.playId, created.id);
  }
  console.log(`  ✓ Plays: ${plays.length}`);

  // --- OPPONENTS + TENDENCIES -------------------------------------
  console.log("· Seeding opponents + tendencies...");
  let totalTendencies = 0;
  const opponentMap = new Map<number, string>();
  for (let i = 0; i < opponents.length; i++) {
    const o = opponents[i];
    const created = await prisma.opponent.create({
      data: {
        teamId: team.id,
        name: o.name,
        mascot: o.mascot,
        league: o.league,
        scoutSummary: o.scoutSummary,
      },
    });
    opponentMap.set(i, created.id);

    for (const t of o.tendencies) {
      await prisma.tendency.create({
        data: {
          opponentId: created.id,
          situation: t.situation,
          formationKey: t.formationKey ?? null,
          personnel: t.personnel ?? null,
          hash: t.hash ?? null,
          result: t.result,
          value: t.value,
          probability: t.probability,
          sampleSize: t.sampleSize,
          confidence: t.confidence,
          notes: t.notes ?? null,
        },
      });
      totalTendencies++;
    }
  }
  console.log(`  ✓ Opponents: ${opponents.length}`);
  console.log(`  ✓ Tendencies: ${totalTendencies}`);

  // --- GAMES + SNAP RESULTS ---------------------------------------
  console.log("· Seeding games + snap results...");
  let totalSnaps = 0;
  for (const g of games) {
    const createdGame = await prisma.game.create({
      data: {
        teamId: team.id,
        opponentId: opponentMap.get(g.opponentIndex) ?? null,
        week: g.week,
        date: g.date,
        location: g.location,
        ourScore: g.ourScore,
        oppScore: g.oppScore,
        result: g.result,
      },
    });

    for (const s of g.snapResults) {
      await prisma.snapResult.create({
        data: {
          gameId: createdGame.id,
          playId: s.playId ? playMap.get(s.playId) : null,
          opponentId: opponentMap.get(g.opponentIndex) ?? null,
          quarter: s.quarter,
          clock: s.clock ?? null,
          down: s.down,
          distance: s.distance,
          hash: s.hash ?? null,
          yardLine: s.yardLine,
          formation: s.formation ?? null,
          personnel: s.personnel ?? null,
          motion: s.motion ?? null,
          concept: s.concept ?? null,
          front: s.front ?? null,
          coverage: s.coverage ?? null,
          pressure: s.pressure ?? null,
          playType: s.playType ?? null,
          yardsGained: s.yardsGained,
          success: s.success,
          explosive: s.explosive,
          negative: s.negative,
          turnover: s.turnover ?? false,
          penalty: s.penalty ?? null,
        },
      });
      totalSnaps++;
    }
  }
  console.log(`  ✓ Games: ${games.length}`);
  console.log(`  ✓ SnapResults: ${totalSnaps}`);

  // --- CALL SHEET -------------------------------------------------
  console.log("· Seeding call sheet...");
  await prisma.callSheet.create({
    data: {
      teamId: team.id,
      name: "Default Call Sheet",
      sections: JSON.stringify(callSheetSections),
    },
  });
  console.log(`  ✓ CallSheet sections: ${callSheetSections.length}`);

  // --- INSTALL PLAN -----------------------------------------------
  console.log("· Seeding install plans...");
  for (const plan of installPlans) {
    await prisma.installPlan.create({
      data: {
        teamId: team.id,
        day: plan.day,
        title: plan.title,
        focus: plan.focus,
        sections: JSON.stringify(plan.sections),
      },
    });
  }
  console.log(`  ✓ InstallPlans: ${installPlans.length}`);

  // --- SUMMARY ----------------------------------------------------
  console.log("\n────────────────────────────────────────");
  console.log("  SEED COMPLETE — record counts:");
  console.log("────────────────────────────────────────");
  console.log(`  Teams           : 1`);
  console.log(`  Players         : ${players.length}`);
  console.log(`  Formations      : ${formations.length}`);
  console.log(`  PlayFamilies    : ${playFamilies.length}`);
  console.log(`  Plays           : ${plays.length}`);
  console.log(`  Opponents       : ${opponents.length}`);
  console.log(`  Tendencies      : ${totalTendencies}`);
  console.log(`  Games           : ${games.length}`);
  console.log(`  SnapResults     : ${totalSnaps}`);
  console.log(`  CallSheets      : 1 (${callSheetSections.length} sections)`);
  console.log(`  InstallPlans    : ${installPlans.length}`);
  console.log("────────────────────────────────────────\n");
}

main()
  .catch((err) => {
    console.error("✗ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
