# 🏈 GridironIQ™ — Football Intelligence Operating System
> **Autonomous Coordinator-Level Football Intelligence, DNA-Level Playbook Catalog, Opponent Scouting & Sideline Execution Platform**  
> Engineered exclusively for Rick Jefferson | RJ Business Solutions & High-Performance Football Programs  
> **Production Live URL**: [https://football.empirecontentstudios.com](https://football.empirecontentstudios.com)

---

## ⚡ Executive Overview

**GridironIQ™** is a full-stack, enterprise-grade Football Intelligence Operating System designed for high school, collegiate, and professional football coaches, coordinators, analysts, and players. 

Built on Next.js 16 (Turbopack), Tailwind CSS, SQLite, and powered by Rick Jefferson's Sovereign Cloudflare Free Models Router, GridironIQ™ bridges the gap between deep film analysis, weekly game planning, interactive tactical play design, and lightning-fast sideline tempo execution.

---

## 🏆 Core Capabilities & The 10 Feature Pillars

### 1. 🧠 Command Center (Operational HUD)
- Real-time season record, offensive efficiency metrics, explosive play counters, and third-down conversion rates.
- Concept performance matrix analyzing real team play success rates across Inside Zone, Mesh, Glance RPO, Stick, and Counter.
- Direct shortcuts into scouting reports, weekly install calendars, and game-night wristband generators.

### 2. 📖 PlaybookIQ™ (DNA-Level Playbook Catalog)
- Interactive catalog of installed plays with instant filtering by concept family, offensive personnel groupings (`10`, `11`, `12`, `20`, `21`), pass/run tags, and defensive front vulnerability targets.
- Detailed play cards featuring diagrams, blocking rules, route depths, progression reads, and alert checks.
- One-click export into weekly game plans and sideline call sheets.

### 3. 🎯 Formation Lab & Interactive Play Designer
- Full vector-based tactical chalkboard for offensive play design and defensive alignment analysis.
- Offensive formations (Spread, Trips, Bunch, Pistol, Empty) mapped with offensive line splits and eligible receivers.
- Defensive coverage shell overlay supporting Cover 1, Cover 2, Cover 3, Quarters (Cover 4), Tampa 2, and Quarters Bracket.

### 4. 🛡️ ScoutIQ™ (Opponent Tendency Exploitation)
- Multi-dimensional opponent scouting reports with situational tendency probabilities.
- Down-and-distance blitz frequency models, boundary vs. field coverage habits, and defensive personnel alerts.
- Sample sizes, historical tendency charts, and automated weakness exploit recommendations.

### 5. 🤖 Coach AI™ & Sovereign Free Models Router
- Coordinator-level AI intelligence providing situational play calls, red-zone adjustments, and protection audits.
- **100% Free OpenRouter Model Architecture**: Dynamically routes requests through Rick Jefferson's Cloudflare Worker (`openrouter-free-router.rickjefferson.workers.dev`) with zero paid token overhead.
- **Interactive Model Dropdown Selector**: Switch between 19 verified free models in real-time, including:
  - `openrouter/free` (Auto Dynamic Router)
  - `google/gemma-4-31b-it:free` & `google/gemma-4-26b-a4b-it:free`
  - `nvidia/nemotron-3.5-super-vl:free` (1M Multimodal Context)
  - `poolside/laguna-s-2.1:free` & `poolside/laguna-xs-2.1:free`
  - `thinkingmachines/inkling:free` & `thinkingmachines/inkling-small:free`
  - `cohere/north-mini-code:free`
- Structured coordinator responses framed with **WHY / WHAT / HOW / EXPLAINABILITY**.

### 6. 📋 GamePlanIQ™ (Situational Scripting)
- Automated Opening 15-script generation based on opponent defensive tendency profiles.
- Situational call scripts for 3rd & Short, 3rd & Medium, 3rd & Long, Backed-Up (Coming Out), and Goal Line.
- One-click PDF export formatted cleanly for press box and sideline binders.

### 7. ⏱️ CallSheetIQ™ & WristbandIQ™ (Sideline Execution)
- High-contrast, laminated sideline call sheet views categorized by down, distance, and field zone.
- Automated QB/WR wristband inserts with 3x4 grid code numbering and position filtering.
- Randomized week-to-week code mapping to eliminate sign stealing and communicate tempo in under 3 seconds.

### 8. 🎥 FilmIQ™ & AI Video Frame Vision
- Upload game and practice film clips with playback scrubbing and timestamp bookmarks.
- Integrated AI frame tagging powered by `nvidia/nemotron-3.5-super-vl:free` to detect defensive safety depths and box counts directly from video frames.
- Player grading cards and drill clip categorization.

### 9. 🔥 RedZoneIQ™ & SituationalIQ™
- Dedicated analytics for the money zones: High Red (20-11 yd line), Low Red (10-4 yd line), and Goal Line (3-1 yd line).
- Touchdown vs. Field Goal efficiency comparison.
- Two-minute drill clock management rules and time-saving algorithms.

### 10. 🎓 InstallIQ™, PlayerQuiz & Team Operations
- Day-by-day practice installation schedules (Monday Base, Tuesday 3rd Down, Wednesday Red Zone, Thursday Walkthrough).
- Interactive PlayerQuiz lab testing players on playbook knowledge, coverage recognition, and protection checks before taking the field.
- Full depth chart tracking, player availability boards, parent communication portal, and staff audit logs.

---

## 🧭 Interactive Guided Walkthrough

GridironIQ™ includes an interactive, multi-step guided tour directly within the web app:
- Click the **"Guided Tour"** button (Compass icon) in the top navigation bar.
- The tour walks through all 10 modules sequentially, explaining capabilities and coach pro tips, while actively switching the app screen to each corresponding module.

---

## 🛠️ Technology Stack

- **Frontend & App Framework**: Next.js 16.4.2 (Turbopack, App Router, React 19, TypeScript)
- **Styling & UI**: Tailwind CSS, Radix UI primitives, Lucide Icons, Framer Motion
- **Database & Storage**: Embedded SQLite database (`better-sqlite3`) with schema migrations
- **AI & LLM Routing**: 
  - Rick Jefferson Sovereign Cloudflare Free Router (`openrouter-free-router.rickjefferson.workers.dev`)
  - Direct OpenRouter free-tier fallback (`openrouter/free`)
  - Real-time models synchronization endpoint (`/api/models`)
- **Authentication**: NextAuth.js (Session-based with secure PIN/credential support)
- **Deployment & Edge**: Cloudflare Tunnel (`football.empirecontentstudios.com`), Node.js Standalone Runtime

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- `pnpm` (recommended package manager)

### Installation
```bash
# Clone the repository
git clone https://github.com/rjbizsolution23-wq/gridironiq-football-os.git
cd gridironiq-football-os

# Install dependencies
pnpm install

# Run database migrations / seed
pnpm run db:push # or node scripts/seed.js

# Start development server
pnpm dev
```

### Production Build
```bash
# Compile standalone optimized production build
pnpm run build

# Start production server on port 3002
NODE_ENV=production PORT=3002 node .next/standalone/server.js
```

---

## 🔒 Security & Data Privacy

GridironIQ™ enforces strict operational data sovereignty:
- Team playbook and scouting data remain isolated in dedicated local SQLite databases.
- AI prompts inject only necessary tactical context snapshots with zero persistent data leakage.
- Public traffic is routed through encrypted Cloudflare edge tunnels with HTTP/2 and TLS 1.3 encryption.

---

## 🏛️ Engineered by RJ Business Solutions
- **Founder & Architect**: Rick Jefferson (CEO @ RJ Business Solutions)
- **Website**: [https://rjbusinesssolutions.org](https://rjbusinesssolutions.org)
- **Support**: support@rjbusinesssolutions.org
- **License**: Commercial Proprietary / All Rights Reserved
