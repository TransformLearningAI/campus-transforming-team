'use client'

import { useState, useEffect, useRef } from 'react'

const HEADLINES = [
  { text: 'Hampshire College faces accreditation withdrawal — NECHE review June 2026', source: 'Daily Hampshire Gazette' },
  { text: 'Oakland City University suspends all undergrad programs, employees miss 3+ paychecks', source: '14 News' },
  { text: '442 private colleges at risk of closing in the next decade — Huron Consulting', source: 'NPR' },
  { text: 'Anna Maria College ceasing academic operations end of spring 2026', source: 'Inside Higher Ed' },
  { text: 'Lourdes University closing at end of spring 2026 semester', source: 'Higher Ed Dive' },
  { text: 'American colleges closing at a rate of 2+ per week', source: 'The Hechinger Report' },
  { text: 'Christian Brothers University cuts 16 faculty positions after financial exigency', source: 'Higher Ed Dive' },
  { text: 'Penn State closing 7 campuses by 2027', source: 'Inside Higher Ed' },
  { text: 'Siena Heights University closing after enrollment drops by a third', source: 'Inside Higher Ed' },
  { text: 'Johnson C. Smith University on SACSCOC probation — June 2026 review upcoming', source: 'HBCU Buzz' },
  { text: 'Public confidence in higher education at historic low — 36% of Americans', source: 'Gallup' },
  { text: 'Anderson University outlook downgraded to negative by Fitch — enrollment halved since 2010', source: 'Higher Ed Dive' },
  { text: 'Albright College cuts 53 positions, considers selling property to close $20M deficit', source: 'Spotlight PA' },
  { text: 'Spring Hill College drops 6 majors due to under-enrollment and budget cuts', source: 'WKRG' },
  { text: '11 million unfilled jobs in America — employers will pay for training pipelines', source: 'BLS' },
  { text: 'Meta launches $115M America\'s Workforce Academy for skilled trades training', source: 'Fox Business' },
  { text: 'Northland College in Ashland, Wisconsin closes its doors', source: 'Inside Higher Ed' },
  { text: 'Federal Reserve models up to 80 more closures over the next 5 years', source: 'Fed Reserve Bank of Philadelphia' },
]

export default function NewsTicker() {
  const [isPaused, setIsPaused] = useState(false)
  const tickerRef = useRef(null)

  // Double the headlines for seamless loop
  const doubled = [...HEADLINES, ...HEADLINES]

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: '#0C1F3F' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center">
        {/* Label */}
        <div
          className="shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white z-10"
          style={{ background: '#DC2626' }}
        >
          Crisis Watch
        </div>

        {/* Scrolling area */}
        <div className="overflow-hidden flex-1">
          <div
            ref={tickerRef}
            className="flex whitespace-nowrap"
            style={{
              animation: `ticker ${HEADLINES.length * 4}s linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {doubled.map((h, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6 py-1.5">
                <span className="text-[11px] text-gray-300">{h.text}</span>
                <span className="text-[9px] text-gray-500 font-medium">— {h.source}</span>
                <span className="text-gray-600 mx-2">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
