import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GridironIQ™ — Autonomous Football Intelligence OS & AI Sideline Coordinator',
  description: 'Enterprise football tactical intelligence OS. Replaces 15+ hours of manual card drawing and film tagging with real-time AI sideline intelligence.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased">
      {/* Top Bar */}
      <div className="bg-[#0f172a] text-[#bfdbfe] text-xs md:text-sm text-center py-2.5 px-4 font-medium border-b border-white/10">
        🏈 <strong className="text-white">SEASON 2026 ENROLLMENT OPEN:</strong> Complete Football Intelligence OS with Sovereign Free Edge AI Routing.
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 no-underline">
            <img
              src="https://storage.googleapis.com/msgsndr/qQnxRHDtyx0uydPd5sRl/media/67eb83c5e519ed689430646b.jpeg"
              alt="RJ Logo"
              className="w-10 h-10 rounded-lg object-cover border border-blue-200"
            />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">GridironIQ™</span>
              <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Enterprise OS
              </span>
            </div>
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="px-4 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              ⚡ Enter App
            </a>
            <a
              href="#pricing"
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-sky-500 rounded-lg shadow hover:opacity-95 transition"
            >
              Get Program License
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#2563eb] text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-blue-200/30 px-4 py-1.5 rounded-full text-xs font-bold text-blue-200 uppercase tracking-wider mb-6">
            🚀 Engineered by RJ Business Solutions Autonomous AI Architecture
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Dominate Every Down with Real-Time AI Playcalling & Sideline Intelligence
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed">
            The end-to-end tactical OS built for high school, college, and club football programs. Replace 15+ weekly hours of manual card drawing, disjointed film tagging, and wristband printing with instant, sovereign AI analysis.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <a
              href="/"
              className="px-8 py-4 text-base font-bold text-blue-700 bg-white rounded-xl shadow-lg hover:bg-slate-50 transition transform hover:-translate-y-0.5"
            >
              ▶ Test Drive Live OS with Interactive Tour
            </a>
            <a
              href="#features"
              className="px-8 py-4 text-base font-bold text-white bg-slate-900/60 border border-white/20 rounded-xl hover:bg-slate-900 transition"
            >
              Explore All 10 Core Modules
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-200 border-t border-white/15 pt-8 max-w-3xl mx-auto">
            <div>✓ 100% Free AI Edge Routing</div>
            <div>✓ Zero Per-Token API Costs</div>
            <div>✓ Encrypted Sideline Cloudflare Edge</div>
            <div>✓ High School & College Ready</div>
          </div>
        </div>
      </section>

      {/* Interactive Tour Preview Card */}
      <section className="max-w-6xl mx-auto px-6 -mt-12 mb-20 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-xs font-mono text-slate-500 font-semibold bg-white px-4 py-1 rounded border border-slate-200">
              https://football.empirecontentstudios.com — Guided Tour Active
            </div>
            <a href="/" className="text-xs font-bold text-blue-600 hover:underline">
              Launch App ↗
            </a>
          </div>
          <div className="bg-slate-900 rounded-xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">10-Step Interactive Walkthrough Included</h3>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-6">
              Inspect PlaybookIQ, Formation Lab, ScoutIQ, Coach AI, GamePlanIQ, CallSheetIQ, FilmIQ, RedZoneIQ, and InstallIQ live on the field.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-sky-500 rounded-lg shadow hover:opacity-95 transition"
            >
              Start 10-Step Guided Tour Now
            </a>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              Why Coaches Switch
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">The Sideline Paradigm Shift</h2>
            <p className="text-slate-600 text-sm">
              Stop wasting Sunday nights drawing scout cards and fighting bloated legacy subscriptions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-red-50/60 border border-red-200 rounded-xl">
              <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                ✕ The Legacy Manual Grind
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>15+ Hours Wasted:</strong> Hand-drawing offensive scout cards and defensive wristbands every week.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Disjointed Tool Stack:</strong> Video in one app, play diagrams in PowerPoint, call sheets in Excel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Expensive Seat Taxes:</strong> Thousands charged per coach or player account every season.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Slow Halftime Adjustments:</strong> Halftime adjustments rely on hasty clipboard scribbles and guesswork.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-blue-50/60 border border-blue-200 rounded-xl">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                ★ The GridironIQ™ Advantage
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Instant AI Card Generation:</strong> Generate full opponent scout cards and play scripts in under 4 seconds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Unified Sideline Command:</strong> Video analysis, interactive play designer, call sheets, and coach AI in one screen.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Zero Seat Taxes:</strong> Flat programmatic program licensing with unlimited coaches and athletes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Real-Time Down & Distance Math:</strong> Algorithmic call sheet recommendations matching opponent defensive tendencies.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Core Modules Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Complete Tactical Suite
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">10 Production-Grade Football Modules</h2>
          <p className="text-slate-600 text-sm">
            Everything your program needs from Monday morning installation to Friday night lights victory.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '📊',
              title: '1. Command Center',
              desc: 'Live sideline operational dashboard with high-tempo game state monitoring, quick play dialer, and weather impact adjustments.',
              points: ['Win probability & momentum index', 'Down, distance & field position tracker', 'Instant sideline emergency audible dials'],
            },
            {
              icon: '📖',
              title: '2. PlaybookIQ™',
              desc: 'Interactive 2D vector playbook designer with pass route trees, blocking schemes, motions, and automated SVG exports.',
              points: ['Custom route stem & break angles', 'Zone vs. Man progression reads', 'Vector wristbands & PDF export'],
            },
            {
              icon: '👥',
              title: '3. Formation Lab',
              desc: 'Visual pre-snap alignment lab with drag-and-drop personnel placement, split calculations, and defensive front counter-modeling.',
              points: ['11, 12, 21 & Empty personnel groups', 'Hash spacing & boundary splits', 'Defensive front alignment preview'],
            },
            {
              icon: '🕵️',
              title: '4. ScoutIQ™',
              desc: 'Autonomous opponent tendency mining with down-and-distance predictive heatmaps, blitz alerts, and formation cues.',
              points: ['Down & distance tendency heatmaps', 'Blitz packages & pressure cues', '1-click printable scout cards'],
            },
            {
              icon: '🧠',
              title: '5. Coach AI Sideline Assistant',
              desc: 'Real-time tactical intelligence powered by Sovereign Cloudflare Free Router with dynamic sub-second fallback.',
              points: ['Coverage beater recommendations', '4th-down go/punt/field-goal math', 'Audio-ready play verbalizations'],
            },
            {
              icon: '📋',
              title: '6. GamePlanIQ™',
              desc: 'Structured weekly gameplan builder for first 15 scripted plays, red zone packages, 2-minute drills, and personnel rotations.',
              points: ['Opening scripted drive (Plays 1-15)', 'Down & distance call menus', 'Personnel substitution management'],
            },
            {
              icon: '📑',
              title: '7. CallSheetIQ™',
              desc: 'Customizable laminate-ready sideline call sheet generator with high-contrast print layouts and laminated card PDF downloads.',
              points: ['Optimized clipboard grid layout', 'Stadium lights high-contrast print', '1-click high-resolution PDF download'],
            },
            {
              icon: '🎥',
              title: '8. FilmIQ™',
              desc: 'AI-assisted video breakdown with automatic formation tagging, defensive front detection, and player assignment grading.',
              points: ['Automated formation tagging', 'Coverage shell & blitz path overlay', 'Player assignment plus/minus cards'],
            },
            {
              icon: '🎯',
              title: '9. RedZoneIQ™ & 2-Minute Drill',
              desc: 'Situational master board for tight-field scoring efficiency and high-pressure clock management algorithms.',
              points: ['High/Low Red & Goal Line menus', 'TD vs. FG probability index', 'Clock run-off & timeout optimization'],
            },
            {
              icon: '🎓',
              title: '10. InstallIQ™ & PlayerQuiz',
              desc: 'Structured weekly practice schedule manager paired with interactive athlete quiz testing before taking the field.',
              points: ['Mon-Thu installation tracking', 'Play check & coverage quizzes', 'Comprehension grades & mastery cards'],
            },
          ].map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center text-2xl mb-4">
                {m.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{m.title}</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">{m.desc}</p>
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                {m.points.map((pt, pidx) => (
                  <div key={pidx} className="text-xs text-slate-700 flex items-center gap-1.5">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Transparent Program Licensing
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Enterprise Software. High School Friendly.</h2>
          <p className="text-slate-600 text-sm">
            No per-coach seat fees. No per-player subscriptions. Flat seasonal program access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* HS Tier */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">High School / Club Tier</h3>
              <p className="text-xs text-slate-500 mb-6">Complete tactical OS designed for Varsity, JV, and youth club programs.</p>
              <div className="text-4xl font-extrabold text-slate-900 mb-1 font-mono">
                $1,497 <span className="text-sm font-normal text-slate-500">/ season</span>
              </div>
              <div className="text-xs font-semibold text-blue-600 border-b border-slate-100 pb-4 mb-6">
                Flat program fee • Full 1-year access
              </div>
              <ul className="space-y-3 text-xs text-slate-700 mb-8">
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Full 10 Core Modules included</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Unlimited Coaches, Coordinators & Players</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> PlaybookIQ™ Vector Wristband & PDF Exports</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> ScoutIQ™ Opponent Tendency Mining</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Coach AI Sideline Assistant with Free Model Routing</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Interactive PlayerQuiz Comprehension Lab</li>
              </ul>
            </div>
            <a
              href="mailto:support@rjbusinesssolutions.org?subject=GridironIQ%20High%20School%20License%20Inquiry"
              className="w-full text-center py-3 px-4 font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition"
            >
              Secure High School License
            </a>
          </div>

          {/* Elite Tier */}
          <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
              Most Popular for Programs
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">College / Elite Program Tier</h3>
              <p className="text-xs text-slate-500 mb-6">Tactical intelligence suite for Collegiate, Prep, and Elite High School operations.</p>
              <div className="text-4xl font-extrabold text-slate-900 mb-1 font-mono">
                $3,997 <span className="text-sm font-normal text-slate-500">/ season</span>
              </div>
              <div className="text-xs font-semibold text-blue-600 border-b border-slate-100 pb-4 mb-6">
                Includes dedicated edge cloud instance & concierge setup
              </div>
              <ul className="space-y-3 text-xs text-slate-700 mb-8">
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Everything in High School Tier</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Dedicated Cloudflare Edge Tunnel Instance</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> FilmIQ™ High-Volume Video Ingestion & Tagging</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Custom Playbook Migration & Digitalization Service</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Sub-second In-Game AI Consultation Mode</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Priority 24/7 Game-Day Hotline with Rick Jefferson</li>
              </ul>
            </div>
            <a
              href="mailto:support@rjbusinesssolutions.org?subject=GridironIQ%20Elite%20College%20License%20Inquiry"
              className="w-full text-center py-3 px-4 font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-sky-500 rounded-lg shadow hover:opacity-95 transition"
            >
              Secure Elite Program License
            </a>
          </div>
        </div>


      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500">
          <div>
            © 2026 RJ Business Solutions. Rick Jefferson, CEO & Lead Architect.
            <div className="text-[11px] text-slate-400 mt-1">1342 NM 333, Tijeras, New Mexico 87059</div>
          </div>
          <div className="flex gap-6">
            <a href="https://rjbusinesssolutions.org" target="_blank" className="hover:text-blue-600">Company Site</a>
            <a href="https://github.com/rjbizsolution23-wq/gridironiq-football-os" target="_blank" className="hover:text-blue-600">GitHub Repo</a>
            <a href="https://football.empirecontentstudios.com" target="_blank" className="hover:text-blue-600">Live App</a>
            <a href="mailto:support@rjbusinesssolutions.org" className="hover:text-blue-600">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
