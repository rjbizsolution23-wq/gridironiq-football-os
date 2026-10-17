'use client'

import React, { useState, useEffect } from 'react'

interface ScreenshotItem {
  id: string
  title: string
  subtitle: string
  tag: string
  badgeColor: string
  src: string
  desc: string
  highlights: string[]
}

const SCREENSHOTS: ScreenshotItem[] = [
  {
    id: 'command-center',
    title: 'Sideline Command Center HUD',
    subtitle: 'Real-Time Win Probability & In-Game Drive Momentum',
    tag: 'Command Center',
    badgeColor: 'bg-blue-600',
    src: '/screenshots/01-command-center.png',
    desc: 'Live high-speed game day cockpit displaying real-time win probability curves, defensive leverage calculations, down & distance dials, and situational weather impact matrices.',
    highlights: ['Live Situational Momentum Index', 'Down & Distance Leverage Meters', 'Real-time Weather & Wind Adjustments']
  },
  {
    id: 'playbook',
    title: 'PlaybookIQ™ Vector Designer',
    subtitle: 'Sub-Yard Route Trees & Interactive Blocking Schemes',
    tag: 'PlaybookIQ™',
    badgeColor: 'bg-emerald-600',
    src: '/screenshots/02-playbook.png',
    desc: 'Interactive 2D vector chalkboard allowing coaches to draw pass concepts, run blocks, and receiver stems with snap precision. Exports directly to QB wristbands and laminate printouts.',
    highlights: ['Sub-Yard Route Tree Drawing', 'SVG Vector QB Wristband Exports', 'Automated Progression Read Tagging']
  },
  {
    id: 'coach-ai',
    title: 'Coach AI Sideline Coordinator',
    subtitle: 'Zero-Cost Free Model Routing for Instant Coverage Beaters',
    tag: 'Coach AI',
    badgeColor: 'bg-purple-600',
    src: '/screenshots/05-coach-ai.png',
    desc: 'Situational tactical AI assistant running on sovereign edge models with zero per-token cost. Instantly asks for 3rd & 7 beaters against Cover 2 match from the left hash.',
    highlights: ['Instant Coverage Beater Analysis', '100% Free Edge Model Cascade', 'Context-Aware of Your Entire Roster']
  },
  {
    id: 'formation-lab',
    title: 'Formation Lab & Alignment',
    subtitle: 'Personnel Splits, Motion Paths & Defensive Adjustments',
    tag: 'Formation Lab',
    badgeColor: 'bg-amber-600',
    src: '/screenshots/03-formation-lab.png',
    desc: 'Full personnel package manager (11, 12, 21, Empty) with precise boundary and field hash mark spacing rules, motion triggers, and defensive front counter-alignments.',
    highlights: ['11, 12, 20 & Empty Personnel Sets', 'Field/Boundary Hash Rules', 'Auto Defensive Front Check']
  },
  {
    id: 'callsheet',
    title: 'CallSheetIQ™ Sideline Laminate',
    subtitle: 'Color-Coded Situational Call Matrix & Wristband Creator',
    tag: 'CallSheetIQ™',
    badgeColor: 'bg-rose-600',
    src: '/screenshots/07-callsheet.png',
    desc: 'Professional laminated sideline call sheet builder organized by down, distance, field zone, and red zone packages. Generates 1-click printable cards for coaching headsets.',
    highlights: ['Red Zone & 2-Minute Drill Matrices', 'High-Visibility Color Coding', 'Printable PDF & Lamination Format']
  },
  {
    id: 'scout',
    title: 'ScoutIQ™ Opponent Tendency Mining',
    subtitle: 'Down & Distance Tendency Curves & Blitz Heatmaps',
    tag: 'ScoutIQ™',
    badgeColor: 'bg-cyan-600',
    src: '/screenshots/04-scout.png',
    desc: 'Eliminates 6 hours of Sunday night GA data entry. Ingests past opponent film and generates automated down-and-distance tendency cards, pass/run ratios, and blitz tell markers.',
    highlights: ['Automated Down/Distance Heatmaps', 'Personnel Tendency Breakdown', 'Formation Tell Detection']
  },
  {
    id: 'film',
    title: 'FilmIQ™ Video Grading Lab',
    subtitle: 'Video Cutup Synchronization & Player Assignment Grades',
    tag: 'FilmIQ™',
    badgeColor: 'bg-indigo-600',
    src: '/screenshots/08-film.png',
    desc: 'Built-in video analysis suite with instant play tagging, assignment plus/minus grading, and custom highlight reels for position group meetings.',
    highlights: ['Frame-by-Frame Video Scrubbing', 'Player Plus/Minus Grading', 'Exportable Position Group Reels']
  },
  {
    id: 'gameplan',
    title: 'GamePlanIQ™ Scripted Drives',
    subtitle: 'First 15 Scripted Plays, 2-Minute Drill & Red Zone Package',
    tag: 'GamePlanIQ™',
    badgeColor: 'bg-teal-600',
    src: '/screenshots/06-gameplan.png',
    desc: 'Script your opening drive sequences, shot plays, backed-up scenarios, and four-minute clock killing packages with situational analytics.',
    highlights: ['Opening 15 Scripted Sequence', 'Shot Play Frequency Counter', 'Clock Management Thresholds']
  },
  {
    id: 'install',
    title: 'InstallIQ™ & PlayerQuiz',
    subtitle: 'Digital Practice Install & Interactive Athlete Quiz',
    tag: 'InstallIQ™',
    badgeColor: 'bg-orange-600',
    src: '/screenshots/10-install.png',
    desc: 'Verify that your student-athletes actually know their assignments before taking the field. Kids take interactive mobile quizzes testing coverage recognition.',
    highlights: ['Mobile Comprehension Quizzing', 'Practice Period Timer & Scripts', 'Coach Retention Scoreboard']
  }
]

export default function InteractiveGalleryModal() {
  const [activeItem, setActiveItem] = useState<ScreenshotItem | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveItem(null)
      if (activeItem) {
        const currentIndex = SCREENSHOTS.findIndex((s) => s.id === activeItem.id)
        if (e.key === 'ArrowRight' && currentIndex < SCREENSHOTS.length - 1) {
          setActiveItem(SCREENSHOTS[currentIndex + 1])
        }
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          setActiveItem(SCREENSHOTS[currentIndex - 1])
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeItem])

  return (
    <div>
      {/* 6-Card Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCREENSHOTS.slice(0, 6).map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:border-blue-300 hover:-translate-y-1"
          >
            <div className="relative h-52 bg-slate-900 overflow-hidden border-b border-slate-100">
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition"></div>
              <span className={`absolute top-3 left-3 ${item.badgeColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm tracking-wide`}>
                {item.tag}
              </span>
              <div className="absolute top-3 right-3 bg-white/90 group-hover:bg-white text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow flex items-center gap-1 transition">
                <span>🔍 Click to Enlarge</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {item.desc}
              </p>
              <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                <span>✓ {item.highlights[0]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Full App Screenshots CTA */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setActiveItem(SCREENSHOTS[0])}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow"
        >
          <span>🖥️ Browse Full 9-Screen High-Resolution Gallery in Lightbox</span>
          <span className="text-blue-400">→</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <span className={`${activeItem.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                  {activeItem.tag}
                </span>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white leading-tight">
                    {activeItem.title}
                  </h3>
                  <p className="text-xs text-slate-400">{activeItem.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveItem(null)}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative flex-1 bg-black/60 overflow-auto flex items-center justify-center p-2 min-h-[350px]">
              <img
                src={activeItem.src}
                alt={activeItem.title}
                className="max-h-[70vh] w-auto max-w-full rounded-lg border border-slate-800 shadow-2xl object-contain"
              />
            </div>

            {/* Modal Footer / Feature Highlights */}
            <div className="px-6 py-4 bg-slate-950/95 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">{activeItem.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {activeItem.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded"
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Navigation & Action */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                <div className="flex items-center gap-1">
                  {SCREENSHOTS.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveItem(s)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        s.id === activeItem.id ? 'bg-blue-500 w-6' : 'bg-slate-700 hover:bg-slate-500'
                      }`}
                      title={s.title}
                    />
                  ))}
                </div>
                <a
                  href="/"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition whitespace-nowrap"
                >
                  ⚡ Test in Live App
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
