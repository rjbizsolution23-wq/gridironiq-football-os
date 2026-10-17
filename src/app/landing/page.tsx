import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GridironIQ™ — Autonomous Football Intelligence OS & AI Sideline Coordinator',
  description:
    'The premier AI-powered football coaching platform. Replaces 15+ weekly hours of manual card drawing, disjointed film tagging, and wristband printing with real-time sideline AI playcalling, opponent scouting tendency heatmaps, interactive 2D playbooks, and practice installation systems.',
  keywords: [
    'football coaching software',
    'AI football playcaller',
    'football playbook software',
    'football scouting software',
    'sideline playcalling software',
    'Hudl alternative',
    'high school football software',
    'college football intelligence OS',
    'football wristband creator',
    'opponent tendency scout card generator',
    'football installation schedule',
    'GridironIQ',
    'RJ Business Solutions',
  ],
  authors: [{ name: 'Rick Jefferson', url: 'https://rjbusinesssolutions.org' }],
  creator: 'Rick Jefferson',
  publisher: 'RJ Business Solutions',
  openGraph: {
    title: 'GridironIQ™ — Autonomous Football Intelligence OS',
    description:
      'Dominate every down with real-time AI playcalling, automatic scout cards, interactive playbook vector diagrams, and sideline intelligence.',
    url: 'https://football.empirecontentstudios.com/landing',
    siteName: 'GridironIQ™ Football OS',
    images: [
      {
        url: 'https://football.empirecontentstudios.com/screenshots/01-command-center.png',
        width: 1440,
        height: 900,
        alt: 'GridironIQ Sideline Command Center and AI Playcalling HUD',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GridironIQ™ — Football Intelligence OS & AI Sideline Coordinator',
    description:
      'Autonomous football sideline intelligence, playbook design, and scouting operations platform. Built by RJ Business Solutions.',
    images: ['https://football.empirecontentstudios.com/screenshots/01-command-center.png'],
    creator: '@ricksolutions1',
  },
  alternates: {
    canonical: 'https://football.empirecontentstudios.com/landing',
  },
}

const FAQ_DATA = [
  {
    q: 'How does GridironIQ™ replace 15+ hours of weekly coaching staff work?',
    a: 'Coaching staffs typically spend 15 to 22 hours each week hand-drawing offensive scout cards, building defensive front diagrams in PowerPoint, formatting call sheets in Excel, and sorting video tags. GridironIQ™ automates this workflow: opponent tendencies are mined into instant scout cards, plays are drawn once in 2D vector format and exported to wristbands or call sheets in seconds, and Coach AI recommends coverage beaters in real time.',
  },
  {
    q: 'Does GridironIQ™ work alongside our existing video software like Hudl?',
    a: 'Yes. Hudl is an archive and hosting tool; GridironIQ™ is your active tactical execution OS. Hudl stores your raw film, while GridironIQ™ breaks down opponent tendencies, recommends situational play calls on 3rd & 4, drafts your opening 15 scripted plays, and generates printable laminated sideline call sheets.',
  },
  {
    q: 'How does the AI model router provide 100% free, zero-token cost inference?',
    a: 'GridironIQ™ connects directly to Rick Jefferson’s Sovereign Cloudflare Free Models Router (openrouter-free-router.rickjefferson.workers.dev). It continuously discovers and routes prompts exclusively across top-tier verified free models (such as meta-llama/llama-3.3-70b-instruct:free, google/gemini-2.0-flash-exp:free, and deepseek/deepseek-r1:free) with sub-second fallback, ensuring zero API bills for athletic programs.',
  },
  {
    q: 'Is our team playbook, roster, and scouting data kept private?',
    a: 'Absolutely. GridironIQ™ utilizes sovereign local SQLite database isolation. Your plays, personnel availability boards, and scouting reports remain entirely within your program’s encrypted database. No opponent or public AI system ever trains on or has access to your playbook.',
  },
  {
    q: 'How are program licenses structured for high schools and colleges?',
    a: 'We offer flat, transparent seasonal licenses rather than per-user seat taxes. High School and Club programs pay $1,497 per season for unlimited coaches and athletes. College and Elite programs pay $3,997 per season, which includes a dedicated Cloudflare edge tunnel instance, full video ingestion, and concierge playbook digitization.',
  },
]

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://football.empirecontentstudios.com/landing#software',
        name: 'GridironIQ™ Football OS',
        operatingSystem: 'Web, iOS, Android, macOS, Windows',
        applicationCategory: 'SportsApplication',
        description:
          'Autonomous football tactical intelligence OS. Sideline playcalling, interactive playbook designer, opponent scouting tendencies, and practice installation.',
        url: 'https://football.empirecontentstudios.com',
        author: {
          '@type': 'Organization',
          name: 'RJ Business Solutions',
          url: 'https://rjbusinesssolutions.org',
          founder: 'Rick Jefferson',
        },
        offers: [
          {
            '@type': 'Offer',
            name: 'High School / Club Program License',
            price: '1497.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            validFrom: '2026-01-01',
          },
          {
            '@type': 'Offer',
            name: 'College / Elite Program License',
            price: '3997.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            validFrom: '2026-01-01',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://football.empirecontentstudios.com/landing#faq',
        mainEntity: FAQ_DATA.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Structured Data for SEO / AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Bar */}
      <aside aria-label="Announcement" className="bg-[#0f172a] text-[#bfdbfe] text-xs md:text-sm text-center py-2.5 px-4 font-medium border-b border-white/10">
        🏈 <strong className="text-white">SEASON 2026 ENROLLMENT OPEN:</strong> Complete Football Intelligence OS with Sovereign Free Edge AI Routing.
      </aside>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 no-underline">
            <img
              src="https://storage.googleapis.com/msgsndr/qQnxRHDtyx0uydPd5sRl/media/67eb83c5e519ed689430646b.jpeg"
              alt="RJ Business Solutions Logo"
              className="w-10 h-10 rounded-lg object-cover border border-blue-200"
            />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">GridironIQ™</span>
              <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Enterprise OS
              </span>
            </div>
          </a>
          <nav aria-label="Main Navigation" className="flex items-center gap-4">
            <a href="#showcase" className="hidden md:inline-block text-xs font-semibold text-slate-600 hover:text-blue-600">
              App Showcase
            </a>
            <a href="#features" className="hidden md:inline-block text-xs font-semibold text-slate-600 hover:text-blue-600">
              10 Core Modules
            </a>
            <a href="#faq" className="hidden md:inline-block text-xs font-semibold text-slate-600 hover:text-blue-600">
              FAQ
            </a>
            <a
              href="/"
              className="px-4 py-2 text-xs md:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              ⚡ Enter App
            </a>
            <a
              href="#pricing"
              className="px-4 py-2 text-xs md:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-sky-500 rounded-lg shadow hover:opacity-95 transition"
            >
              Get License
            </a>
          </nav>
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
              href="#showcase"
              className="px-8 py-4 text-base font-bold text-white bg-slate-900/60 border border-white/20 rounded-xl hover:bg-slate-900 transition"
            >
              View Actual System Screenshots
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

      {/* Hero Live Screenshot Display */}
      <section id="showcase" className="max-w-6xl mx-auto px-6 -mt-12 mb-20 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-3 md:p-5">
          <div className="flex items-center justify-between p-3 bg-slate-100/80 border border-slate-200 rounded-xl mb-4">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-xs font-mono text-slate-600 font-semibold bg-white px-4 py-1 rounded border border-slate-200">
              https://football.empirecontentstudios.com — Live Command Center HUD
            </div>
            <a href="/" className="text-xs font-bold text-blue-600 hover:underline">
              Launch App ↗
            </a>
          </div>
          
          <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-inner group">
            <img
              src="/screenshots/01-command-center.png"
              alt="GridironIQ Sideline Command Center and Real-Time Play Dialing"
              className="w-full h-auto object-cover transform transition duration-500 group-hover:scale-[1.01]"
              loading="eager"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md text-white p-4 rounded-xl border border-white/15 flex flex-col md:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-white">Live Sideline Command Center</h4>
                <p className="text-xs text-slate-300">Win probability, real-time momentum index, down & distance dials, and weather impact adjustments.</p>
              </div>
              <a href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold whitespace-nowrap">
                Start 10-Step Guided Tour Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Product Gallery (Actual App Screenshots) */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Real Software In Action
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Inside the Football Intelligence OS</h2>
          <p className="text-slate-600 text-sm">
            Inspect authentic screenshots captured directly from the live GridironIQ production system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: PlaybookIQ */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition group">
            <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src="/screenshots/02-playbook.png"
                alt="PlaybookIQ 2D Vector Play Designer"
                className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                PlaybookIQ™
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Interactive 2D Vector Designer</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Draw route trees, blocking angles, and progression reads with sub-yard precision. One-click export to wristband inserts.
              </p>
              <div className="text-[11px] font-medium text-blue-600">✓ Export to Vector SVG & PDF Wristbands</div>
            </div>
          </div>

          {/* Card 2: Coach AI */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition group">
            <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src="/screenshots/05-coach-ai.png"
                alt="Coach AI Sideline Assistant with Free Models"
                className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                Coach AI
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Zero-Cost AI Sideline Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Live coverage beaters and 4th-down decision math routed across sovereign free edge LLMs with sub-second response times.
              </p>
              <div className="text-[11px] font-medium text-blue-600">✓ Powered by Sovereign Cloudflare Router</div>
            </div>
          </div>

          {/* Card 3: Formation Lab */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition group">
            <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src="/screenshots/03-formation-lab.png"
                alt="Formation Lab Pre-Snap Alignment"
                className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                Formation Lab
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Pre-Snap Alignment & Spacing</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Configure personnel packages (11, 12, 21, Empty), hash mark boundaries, and defensive front counter-alignments.
              </p>
              <div className="text-[11px] font-medium text-blue-600">✓ Real-time Split & Hash Math</div>
            </div>
          </div>

          {/* Card 4: CallSheetIQ */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition group">
            <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src="/screenshots/07-callsheet.png"
                alt="CallSheetIQ Laminated Sideline Call Sheet Generator"
                className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                CallSheetIQ™
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Laminate-Ready Call Sheets</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                High-contrast situational call grids formatted specifically for clipboard holders under stadium lights with 1-click PDF download.
              </p>
              <div className="text-[11px] font-medium text-blue-600">✓ Stadium Light High-Contrast Print</div>
            </div>
          </div>

          {/* Card 5: ScoutIQ */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition group">
            <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src="/screenshots/04-scout.png"
                alt="ScoutIQ Opponent Tendency Mining"
                className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                ScoutIQ™
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">Opponent Tendency Heatmaps</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Mine opponent blitz percentages, coverage shells, and third-down run/pass ratios directly into printable scout cards.
              </p>
              <div className="text-[11px] font-medium text-blue-600">✓ Down & Distance Predictive Heatmaps</div>
            </div>
          </div>

          {/* Card 6: FilmIQ */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition group">
            <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src="/screenshots/08-film.png"
                alt="FilmIQ Video Analysis and Player Grading"
                className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                FilmIQ™
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-slate-900 mb-1">AI Video Breakdown & Grading</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Pre-snap formation detection, coverage shell recognition, and individual assignment plus/minus grade cards.
              </p>
              <div className="text-[11px] font-medium text-blue-600">✓ Automated Formation Tagging</div>
            </div>
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

      {/* Answer Engine Optimization (AEO) & FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Clear Answers for Athletic Directors & Coaches</h2>
          <p className="text-slate-600 text-sm">
            Everything you need to know about program deployment, data privacy, and sideline execution.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
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
