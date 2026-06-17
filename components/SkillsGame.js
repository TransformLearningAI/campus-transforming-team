'use client'

import { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════
// UNDER THE SURFACE — Campus Transformation Skills Training
// ═══════════════════════════════════════════════════════════════

const MODES = [
  { id: 'talk', title: 'Who Do You Talk To First?', icon: '🎙️', desc: 'Pick 3 people. Order matters. See what you miss.', color: '#7C3AED' },
  { id: 'said', title: "What's Really Being Said?", icon: '👂', desc: 'Read between the lines. Spot what\'s underneath.', color: '#0891B2' },
  { id: 'missing', title: "What's Missing?", icon: '🔍', desc: 'The profile looks complete. It isn\'t. Find the gaps.', color: '#D97706' },
  { id: 'board', title: 'The Board Meeting', icon: '🪑', desc: 'You\'re in the room. Every word matters.', color: '#DC2626' },
]

// ── MODE 1: WHO DO YOU TALK TO FIRST ──────────────────────────

const TALK_SCENARIO = {
  setup: 'Greenfield College — a private institution in rural Ohio, enrollment 640, operating deficit of $3.1M. The president called you yesterday. The board meets Friday. You have time for three conversations before that meeting. Choose wisely.',
  people: [
    { id: 'president', name: 'Dr. Margaret Osei', role: 'President', age: 58, years: 3, photo: '👩🏾‍💼',
      surface: 'Hired to turn things around. Polished. Careful with words.',
      reveal: 'She\'s already been approached by two other schools. She\'s weighing whether to stay or leave before it gets worse. If you talk to her first, she\'ll tell you the board is divided — half want to sell, half want to fight. She won\'t tell anyone else that.',
      intel: ['Board is divided 50/50 on selling vs. fighting', 'She may leave within 6 months', 'She knows the real enrollment projections — they\'re worse than published'] },
    { id: 'boardchair', name: 'Frank DeLuca', role: 'Board Chair', age: 71, years: 15, photo: '👨🏻‍🦳',
      surface: 'Local businessman. His mother graduated Greenfield in 1962. Emotional about the school.',
      reveal: 'Frank has already had a quiet conversation with a developer about the campus. He hasn\'t told the full board. He\'ll deny it if confronted directly, but if you build trust first, he\'ll admit he\'s "exploring all options." This is the most important thing you can learn — and you can only get it from him.',
      intel: ['Has talked to a developer — hasn\'t told the board', 'Emotionally attached but pragmatic underneath', 'Controls the board vote'] },
    { id: 'cfo', name: 'Patricia Huang', role: 'CFO', age: 44, years: 6, photo: '👩🏻‍💼',
      surface: 'Sharp. Exhausted. The only person who knows exactly how bad the numbers are.',
      reveal: 'Patricia will give you the unvarnished truth in 20 minutes if you ask the right questions. The published financials are accurate but optimistic — the cash flow is worse than it looks because they\'re deferring vendor payments. She\'s been trying to tell the board for a year. They don\'t want to hear it.',
      intel: ['Cash flow is worse than the statements show', 'Vendor payments being deferred', 'Board has been ignoring her warnings for a year'] },
    { id: 'provost', name: 'Dr. William Park', role: 'Provost', age: 52, years: 1, photo: '👨🏻‍🏫',
      surface: 'New hire. Came from a larger university. Still learning the politics.',
      reveal: 'William is quietly updating his CV. He took this job thinking he could build something. Now he realizes he was hired to manage decline. He\'ll give you honest academic assessments but he doesn\'t know the financial picture — Patricia doesn\'t share numbers with him.',
      intel: ['Planning to leave', 'Honest about academic quality — three programs should have been cut years ago', 'Doesn\'t have access to real financial data'] },
    { id: 'facilities', name: 'Ray Tomczak', role: 'Facilities Director', age: 61, years: 28, photo: '👷🏻‍♂️',
      surface: 'Knows every building. Keeps things running with nothing. Terrified.',
      reveal: 'Ray will walk you through every building and tell you exactly what works, what\'s failing, and what\'s been patched so many times it could go any day. The science building roof has been leaking for three years. The boiler in the main hall needs $400K in repairs. He also knows which buildings could be repurposed — he\'s thought about it more than anyone realizes.',
      intel: ['Knows the true deferred maintenance number — it\'s higher than the audit says', 'Has ideas about repurposing buildings', 'If he leaves, institutional knowledge of the physical plant is gone'] },
    { id: 'enrollment', name: 'Diana Reyes', role: 'VP Enrollment', age: 39, years: 4, photo: '👩🏽‍💼',
      surface: 'Works 70-hour weeks. Discount rate keeps rising because it\'s the only way to fill seats.',
      reveal: 'Diana knows the fall numbers before anyone else. They\'re not good — deposits are down 18% from last year. She hasn\'t reported this to the president yet because she\'s hoping late deposits will close the gap. They won\'t. If you talk to her, you\'ll know the real fall picture before the board does.',
      intel: ['Fall deposits down 18% — not yet reported to leadership', 'Discount rate will hit 65% if they chase the deposits', 'She knows which programs are attracting students and which are dead'] },
    { id: 'mayor', name: 'Janet Kowalski', role: 'Town Mayor', age: 55, years: 8, photo: '👩🏼‍💼',
      surface: 'The college is the second-largest employer in town. She\'s worried.',
      reveal: 'Janet has been quietly talking to the county economic development office about what happens if Greenfield closes. They have WIOA funding available and a workforce board that\'s looking for training partners. She doesn\'t know the college is interested in transformation — nobody has asked her. She would be an immediate ally if someone would just pick up the phone.',
      intel: ['County has WIOA funding looking for a training partner', 'Economic development office has already been thinking about post-closure scenarios', 'Would be a powerful public ally if approached'] },
    { id: 'donor', name: 'Arthur Greenfield III', role: 'Largest Donor', age: 78, years: 50, photo: '👴🏻',
      surface: 'Family name is on the school. Gave $2M last year. Everyone is afraid to tell him the truth.',
      reveal: 'Arthur already knows. His financial advisor told him the endowment draw rate is unsustainable. He\'s angry — not at the institution, but at the fact that nobody has had the courage to have an honest conversation with him. He\'s willing to give more, but only if someone presents a credible plan for transformation, not just another ask to "keep the lights on." He will not fund decline.',
      intel: ['Already knows the situation is dire', 'Angry at leadership for not being honest', 'Will fund transformation but will not fund more of the same'] },
  ]
}

function TalkMode() {
  const [selected, setSelected] = useState([])
  const [revealed, setRevealed] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)

  function toggle(id) {
    if (revealed) return
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id))
    } else if (selected.length < 3) {
      setSelected([...selected, id])
    }
  }

  const notSelected = TALK_SCENARIO.people.filter(p => !selected.includes(p.id))

  return (
    <div>
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Scenario</p>
        <p className="text-sm leading-relaxed text-gray-300">{TALK_SCENARIO.setup}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {TALK_SCENARIO.people.map((p, i) => {
          const isSelected = selected.includes(p.id)
          const order = selected.indexOf(p.id)
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`text-left p-4 rounded-xl border-2 transition-all relative ${
                isSelected
                  ? 'border-purple-500 bg-purple-50'
                  : revealed ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                  {order + 1}
                </span>
              )}
              <div className="flex items-start gap-3">
                <span className="text-2xl">{p.photo}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: '#0C1F3F' }}>{p.name}</p>
                  <p className="text-xs text-gray-500">{p.role} &middot; {p.years} years &middot; Age {p.age}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{p.surface}</p>
                </div>
              </div>

              {/* Reveal panel */}
              {revealed && (
                <div className={`mt-3 pt-3 border-t ${isSelected ? 'border-purple-200' : 'border-gray-200'}`}>
                  <p className={`text-xs leading-relaxed ${isSelected ? 'text-purple-900' : 'text-gray-500'}`}>
                    {p.reveal}
                  </p>
                  <div className="mt-2 space-y-1">
                    {p.intel.map((info, j) => (
                      <div key={j} className="flex items-start gap-1.5">
                        <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-purple-500' : 'text-gray-400'}`}>&#9679;</span>
                        <p className={`text-[11px] ${isSelected ? 'text-purple-800 font-medium' : 'text-gray-400'}`}>{info}</p>
                      </div>
                    ))}
                  </div>
                  {!isSelected && (
                    <p className="text-[10px] text-red-400 font-bold mt-2 uppercase tracking-wider">You missed this</p>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selected.length === 3 && !revealed && (
        <button
          onClick={() => setRevealed(true)}
          className="w-full py-3 rounded-xl text-white font-bold text-sm"
          style={{ background: '#7C3AED' }}
        >
          Lock In My Choices — Reveal What I Missed
        </button>
      )}

      {revealed && (
        <div className="bg-gray-900 rounded-2xl p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">Debrief</p>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            You chose: <strong>{selected.map(id => TALK_SCENARIO.people.find(p => p.id === id)?.name).join(', ')}</strong>
          </p>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            You learned {selected.reduce((sum, id) => sum + (TALK_SCENARIO.people.find(p => p.id === id)?.intel.length || 0), 0)} pieces of critical intel
            out of {TALK_SCENARIO.people.reduce((sum, p) => sum + p.intel.length, 0)} total.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Look at what each person you didn't talk to would have told you. In campus transformation work, you never have the full picture. The skill is knowing which gaps matter most — and having the humility to know you're always missing something.
          </p>
          <button
            onClick={() => { setSelected([]); setRevealed(false) }}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-bold bg-purple-600 text-white"
          >
            Play Again
          </button>
        </div>
      )}

      {selected.length < 3 && !revealed && (
        <p className="text-center text-sm text-gray-400">
          Select {3 - selected.length} more {3 - selected.length === 1 ? 'person' : 'people'}. Order matters — who you talk to first shapes what you learn.
        </p>
      )}
    </div>
  )
}

// ── MODE 2: WHAT'S REALLY BEING SAID ──────────────────────────

const SAID_ROUNDS = [
  {
    quote: "We're cautiously optimistic about fall enrollment.",
    speaker: 'University President',
    context: 'Said to a local newspaper reporter, May 2026',
    options: [
      { text: 'Enrollment is trending up slightly from last year', score: 0, feedback: 'If enrollment were up, they\'d say "up." "Cautiously optimistic" is the language of someone who doesn\'t have good numbers yet and is buying time.' },
      { text: 'Deposits are down and they\'re hoping late applications close the gap', score: 3, feedback: 'This is it. "Cautiously optimistic" almost always means the numbers aren\'t in yet and leadership is hoping for a late surge that rarely comes. The word "cautiously" is doing all the work — it\'s the escape hatch for when the optimism doesn\'t pan out.' },
      { text: 'They genuinely feel good about where things are heading', score: 1, feedback: 'Possible, but presidents who feel genuinely good say things like "excited" or "strong." The word "cautiously" is a hedge. Something is worrying them.' },
      { text: 'They\'re preparing the community for bad news without saying it yet', score: 2, feedback: 'Close. This is pre-positioning language — soft enough to sound positive, careful enough to not be a lie when the numbers come in low. But the primary motivation is usually hope, not strategy.' },
    ],
  },
  {
    quote: "We've initiated expense realignment actions for the coming fiscal year.",
    speaker: 'From an audited financial statement, Risks and Uncertainties note',
    context: 'Annual audit, November 2025',
    options: [
      { text: 'They\'re reorganizing departments for efficiency', score: 1, feedback: '"Reorganizing" is what you say when the changes are structural. "Expense realignment" is what you say when you\'re cutting people and programs and want it to sound strategic.' },
      { text: 'People are losing their jobs and programs are being eliminated', score: 3, feedback: 'Yes. "Expense realignment" is the auditor-approved euphemism for cuts. The fact that it\'s in the Risks and Uncertainties section — not in a press release — tells you it\'s serious enough for the auditors to flag but management wanted to frame it as proactive.' },
      { text: 'They\'re reducing spending on supplies and travel', score: 0, feedback: 'You don\'t put supply cuts in the Risks and Uncertainties section of an audited financial statement. This is bigger than office supplies.' },
      { text: 'They\'re preparing for accreditation review', score: 0, feedback: 'Accreditation preparation would be described differently. This language is purely financial — it\'s about matching costs to revenue, which means revenue has dropped and costs need to follow.' },
    ],
  },
  {
    quote: "Our advancement team achieved record philanthropic performance this year, raising approximately $3.4 million.",
    speaker: 'From an audited financial statement note',
    context: 'University with a $2.5M operating deficit',
    options: [
      { text: 'The institution is on a path to financial stability', score: 0, feedback: 'They raised $3.4M and still lost $2.5M from operations. The fundraising is masking the deficit, not solving it. If the "record" fundraising can\'t close the gap, what happens in a normal year?' },
      { text: 'Alumni engagement is strong and growing — a genuine bright spot', score: 1, feedback: 'The engagement is real and it matters. But engagement without transformation is what happened at Hampshire — $50 million raised, nothing changed, school closed. Donations are fuel. Without a new engine, fuel just burns.' },
      { text: 'Record fundraising during an operating deficit means people care — but the money is going into a model that\'s still losing', score: 3, feedback: 'Exactly. This is the Hampshire pattern. The fundraising proves the community cares. But if every dollar goes to sustaining the same failing model, you\'re just funding a slower decline. The question isn\'t "can we raise money?" It\'s "what are we raising money FOR?"' },
      { text: 'The advancement team is performing well and deserves credit', score: 1, feedback: 'They do. But celebrating fundraising in the same document that reports a $2.5M operating loss is a tell. It\'s the institution finding something positive to say when the overall picture is bleak.' },
    ],
  },
  {
    quote: "The University was not in compliance with certain financial covenants as of June 30. The University entered into a forbearance agreement with the bondholders.",
    speaker: 'Audited financial statement, Note 6',
    context: 'Small university with $19M in bond debt',
    options: [
      { text: 'This is routine — lots of institutions renegotiate bond terms', score: 0, feedback: 'Forbearance is not renegotiation. Forbearance means the bondholders have the right to call the entire debt due and they\'re choosing not to — for now. This is a gun on the table.' },
      { text: 'The bondholders could demand all $19M at any time — the institution\'s survival depends on their patience', score: 3, feedback: 'This is the reality. A forbearance agreement means the institution broke its promises to its lenders. The lenders are giving them a window — usually 6-12 months — to fix it. If they don\'t, the lenders can accelerate the full amount. At that point, the institution either finds $19M or closes.' },
      { text: 'The university needs to refinance at better terms', score: 1, feedback: 'They probably can\'t. An institution in covenant violation with declining enrollment is not getting better terms from anyone. That\'s why they\'re in forbearance instead of refinancing.' },
      { text: 'This is a sign that leadership is proactively managing the debt situation', score: 0, feedback: 'Forbearance is reactive, not proactive. You enter forbearance when you\'ve already broken the covenants. Proactive would have been restructuring before the violation.' },
    ],
  },
  {
    quote: "I just want to say — this campus means everything to me. My kids grew up here. Whatever we decide, we need to honor that.",
    speaker: 'Board member, during an executive session',
    context: 'The board is discussing whether to explore transformation or sale',
    options: [
      { text: 'They\'re signaling they\'ll vote against any change', score: 1, feedback: 'Maybe, but not necessarily. People who lead with emotion are often asking for permission to grieve before they can think clearly. If you dismiss the emotion, you lose them. If you honor it, you might gain an ally.' },
      { text: 'They\'re asking someone to acknowledge what they\'re about to lose before they can move forward', score: 3, feedback: 'This is it. This person isn\'t blocking the decision. They\'re asking for the human moment before the strategic one. The skill is recognizing that this isn\'t an obstacle — it\'s a need. Honor it, sit with it, and then they can hear the plan.' },
      { text: 'They\'re not ready for this conversation and need more time', score: 1, feedback: 'They might need time, but more often what they need is acknowledgment. Delay doesn\'t help — it just extends the anxiety. What helps is someone saying "you\'re right, and that\'s exactly why we need to get this right."' },
      { text: 'This is a distraction from the real financial issues', score: 0, feedback: 'This is the most dangerous interpretation. If you treat someone\'s grief as a distraction, you\'ve told them their feelings don\'t matter. They will block everything you propose from that point forward. The emotional and the financial are not separate. They\'re the same conversation.' },
    ],
  },
]

function SaidMode() {
  const [round, setRound] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [totalScore, setTotalScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const current = SAID_ROUNDS[round]

  function choose(idx) {
    if (chosen !== null) return
    setChosen(idx)
    setTotalScore(s => s + current.options[idx].score)
  }

  function next() {
    if (round + 1 >= SAID_ROUNDS.length) {
      setFinished(true)
    } else {
      setRound(r => r + 1)
      setChosen(null)
    }
  }

  if (finished) {
    const max = SAID_ROUNDS.length * 3
    const pct = Math.round((totalScore / max) * 100)
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
        <p className="text-6xl font-light mb-2" style={{ color: '#00A8A8' }}>{totalScore}/{max}</p>
        <p className="text-sm text-gray-400 mb-4">{pct}% depth of reading</p>
        <p className="text-sm text-gray-300 leading-relaxed max-w-md mx-auto mb-6">
          {pct >= 80 ? 'You read people and language at a level that will serve you well in boardrooms and crisis conversations. You see what\'s underneath.'
            : pct >= 50 ? 'You\'re picking up signals but sometimes taking statements at face value. In this work, the surface is almost never the truth. Keep listening for what\'s NOT being said.'
            : 'You\'re reading the words, not the room. In campus transformation, what people say is almost never what they mean. The skill is hearing the fear, the hope, and the politics underneath every sentence.'}
        </p>
        <button onClick={() => { setRound(0); setChosen(null); setTotalScore(0); setFinished(false) }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background: '#00A8A8' }}>
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Round {round + 1} of {SAID_ROUNDS.length}</p>
        <p className="text-xs font-bold" style={{ color: '#00A8A8' }}>Score: {totalScore}</p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-6">
        <p className="text-xl text-white font-light leading-relaxed mb-3">&ldquo;{current.quote}&rdquo;</p>
        <p className="text-xs text-gray-500">&mdash; {current.speaker}</p>
        <p className="text-[10px] text-gray-600 mt-1">{current.context}</p>
      </div>

      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What's really going on?</p>

      <div className="space-y-2">
        {current.options.map((opt, i) => {
          const isChosen = chosen === i
          const isRevealed = chosen !== null
          const isBest = opt.score === 3
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={isRevealed}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isRevealed
                  ? isBest
                    ? 'border-green-400 bg-green-50'
                    : isChosen
                      ? opt.score === 0 ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-100 bg-gray-50 opacity-50'
                  : 'border-gray-200 bg-white hover:border-cyan-300 hover:shadow-sm cursor-pointer'
              }`}
            >
              <p className={`text-sm ${isRevealed && isBest ? 'text-green-900 font-medium' : isRevealed && isChosen ? 'font-medium' : 'text-gray-700'}`}>
                {opt.text}
              </p>
              {isRevealed && (isChosen || isBest) && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    {isBest && <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Deepest Read</span>}
                    {isChosen && !isBest && <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Your Answer &middot; +{opt.score}</span>}
                    {isChosen && isBest && <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Your Answer &middot; +{opt.score}</span>}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{opt.feedback}</p>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {chosen !== null && (
        <button onClick={next}
                className="w-full mt-4 py-3 rounded-xl text-white font-bold text-sm"
                style={{ background: '#0C1F3F' }}>
          {round + 1 >= SAID_ROUNDS.length ? 'See Final Score' : 'Next Quote'}
        </button>
      )}
    </div>
  )
}

// ── MODE 3: WHAT'S MISSING ────────────────────────────────────

const MISSING_SCENARIO = {
  name: 'Lakewood University',
  location: 'Small city in Pennsylvania, population 24,000',
  enrollment: '890 FTE, down from 1,400 five years ago',
  tuition: 'Net tuition revenue $14.2M',
  deficit: 'Operating deficit $1.8M',
  endowment: '$11M',
  debt: '$16M in bonds',
  campus: '45 acres, 8 buildings, 2 residence halls (capacity 400, occupancy 55%)',
  programs: '28 undergraduate, 6 graduate. Nursing is the largest.',
  headline: 'Board announces "strategic realignment" and "investment in high-demand programs"',
  items: [
    { id: 'discount', label: 'Discount rate', why: 'If they\'re discounting 60%+, the $14.2M in net tuition is being propped up by giving money away. A high discount rate means the sticker price is fiction — and it gets worse every year as you chase a shrinking pool of students.', critical: true },
    { id: 'covenants', label: 'Bond covenant compliance status', why: 'With $16M in bonds and a $1.8M deficit, they may already be in violation. Forbearance or acceleration changes everything — it\'s the difference between "we have time" and "we have months."', critical: true },
    { id: 'deferred', label: 'Deferred maintenance backlog', why: 'Eight buildings on 45 acres with declining revenue. The actual repair backlog could be $10-20M. At 55% dorm occupancy, some of those buildings may be deteriorating from underuse. This number determines whether the campus is an asset or a liability.', critical: true },
    { id: 'cashflow', label: 'Monthly cash flow and line of credit usage', why: 'The deficit tells you the annual picture. The cash flow tells you whether they can make payroll in March. Many colleges that "have money" on the balance sheet are actually scrambling month to month.', critical: false },
    { id: 'president', label: 'How long the president has been there and contract status', why: 'A president in year 1 might be willing to lead transformation. A president in year 7 with a contract expiring is protecting their exit. This context changes everything about who you\'re really talking to.', critical: false },
    { id: 'nearby', label: 'What the nearest community college offers', why: 'If there\'s a community college 20 minutes away with a nursing program, Lakewood\'s "largest program" has direct competition. If there isn\'t, the nursing program is a community asset worth building around.', critical: false },
    { id: 'faculty', label: 'Faculty turnover rate in the last 2 years', why: 'If your best faculty are leaving, they see something the financials don\'t show yet. Faculty departure is a leading indicator — it happens before the crisis becomes public.', critical: false },
    { id: 'population', label: 'County population trend over the last decade', why: 'A college in a growing county has a different future than one in a county losing population. The community\'s trajectory shapes whether transformation has a market.', critical: false },
  ]
}

function MissingMode() {
  const [selected, setSelected] = useState([])
  const [revealed, setRevealed] = useState(false)

  function toggle(id) {
    if (revealed) return
    if (selected.includes(id)) setSelected(selected.filter(s => s !== id))
    else if (selected.length < 3) setSelected([...selected, id])
  }

  const criticalFound = selected.filter(id => MISSING_SCENARIO.items.find(i => i.id === id)?.critical).length
  const criticalTotal = MISSING_SCENARIO.items.filter(i => i.critical).length

  return (
    <div>
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Profile: {MISSING_SCENARIO.name}</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-300">
          <p><span className="text-gray-500">Location:</span> {MISSING_SCENARIO.location}</p>
          <p><span className="text-gray-500">Enrollment:</span> {MISSING_SCENARIO.enrollment}</p>
          <p><span className="text-gray-500">Net Tuition:</span> {MISSING_SCENARIO.tuition}</p>
          <p><span className="text-gray-500">Deficit:</span> {MISSING_SCENARIO.deficit}</p>
          <p><span className="text-gray-500">Endowment:</span> {MISSING_SCENARIO.endowment}</p>
          <p><span className="text-gray-500">Debt:</span> {MISSING_SCENARIO.debt}</p>
          <p className="col-span-2"><span className="text-gray-500">Campus:</span> {MISSING_SCENARIO.campus}</p>
          <p className="col-span-2"><span className="text-gray-500">Programs:</span> {MISSING_SCENARIO.programs}</p>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">Recent headline:</p>
          <p className="text-sm text-gray-300 italic">&ldquo;{MISSING_SCENARIO.headline}&rdquo;</p>
        </div>
      </div>

      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">This profile looks complete. It isn't.</p>
      <p className="text-sm text-gray-500 mb-4">Pick the 3 pieces of missing information you'd need before making any recommendation.</p>

      <div className="space-y-2 mb-6">
        {MISSING_SCENARIO.items.map(item => {
          const isSelected = selected.includes(item.id)
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                revealed
                  ? item.critical
                    ? isSelected ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'
                    : isSelected ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100 bg-gray-50 opacity-50'
                  : isSelected
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-amber-300 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${isSelected ? 'text-amber-900' : 'text-gray-700'}`}>{item.label}</p>
                {revealed && item.critical && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-green-600' : 'text-red-500'}`}>
                    {isSelected ? 'Found' : 'Missed — Critical'}
                  </span>
                )}
              </div>
              {revealed && (isSelected || item.critical) && (
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{item.why}</p>
              )}
            </button>
          )
        })}
      </div>

      {selected.length === 3 && !revealed && (
        <button onClick={() => setRevealed(true)}
                className="w-full py-3 rounded-xl text-white font-bold text-sm"
                style={{ background: '#D97706' }}>
          Lock In — Show Me What Matters Most
        </button>
      )}

      {revealed && (
        <div className="bg-gray-900 rounded-2xl p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Debrief</p>
          <p className="text-sm text-gray-300 mb-3">
            You found <strong>{criticalFound}</strong> of <strong>{criticalTotal}</strong> critical gaps.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            {criticalFound === criticalTotal
              ? 'You identified all the critical unknowns. These are the pieces of information that separate a confident recommendation from a guess. In this work, what you don\'t know matters more than what you do.'
              : 'The items marked "Critical" are the ones that could completely change your recommendation. Every other piece of information is useful, but these determine whether you\'re dealing with a campus that has 3 years of runway or 6 months.'}
          </p>
          <button onClick={() => { setSelected([]); setRevealed(false) }}
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-bold bg-amber-600 text-white">
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}

// ── MODE 4: THE BOARD MEETING ─────────────────────────────────

const BOARD_STEPS = [
  {
    scene: 'You\'ve been invited to present to the board of a struggling college. You walk in. Eight people around a mahogany table. Coffee is cold. The board chair, a 68-year-old retired banker, looks at you and says:',
    quote: '"Before you start — I need you to understand something. This school is 94 years old. My wife\'s grandmother graduated from here. So did my daughter. When you talk about \'transformation,\' what exactly are you saying about the last 94 years?"',
    speaker: 'Robert, Board Chair',
    options: [
      { text: '"I\'m not saying the last 94 years were wrong. I\'m saying the next 94 need to look different — and the best way to honor what was built is to make sure it\'s still standing."', score: 3, reaction: 'Robert pauses. Nods slowly. "Okay. I\'m listening." The room relaxes slightly. You\'ve earned 60 seconds of goodwill.', next: 1 },
      { text: '"The data shows that the traditional model is no longer viable. Let me walk you through the enrollment projections."', score: 1, reaction: 'Robert\'s jaw tightens. "I didn\'t ask about data. I asked about 94 years." The CFO shifts uncomfortably. You\'ve made this about numbers when it was about identity. You can recover, but you\'re starting from behind.', next: 1 },
      { text: '"Transformation means the campus survives. The alternative is a developer buying this property and tearing it down. Which future do you want?"', score: 0, reaction: 'The room goes cold. A board member in the corner crosses her arms. Robert says quietly, "That felt like a threat." You didn\'t mean it that way — but that\'s how it landed. The meeting is now uphill.', next: 1 },
    ]
  },
  {
    scene: 'The CFO, a woman in her 40s who looks like she hasn\'t slept in a week, jumps in:',
    quote: '"Can I be frank? I\'ve been trying to tell this board for two years that we can\'t sustain this. Every time I present the numbers, someone changes the subject to homecoming or the new logo. If you can get them to actually look at the math, you\'ll have done more in one meeting than I\'ve done in two years."',
    speaker: 'Karen, CFO',
    options: [
      { text: 'You look at Karen and say: "Thank you for being honest. That took courage." Then you turn to the board: "Karen has been carrying something heavy alone. Part of why I\'m here is so she doesn\'t have to."', score: 3, reaction: 'Karen\'s eyes fill. She blinks it away. Robert looks at her — really looks at her — maybe for the first time in months. Two board members lean forward. You\'ve just changed the dynamic. Karen is no longer the messenger they ignore. She\'s the person they just failed.', next: 2 },
      { text: 'You say: "Let\'s look at those numbers now. Karen, can you walk us through the current financials?"', score: 1, reaction: 'Karen nods and pulls up the spreadsheet. The board listens, but you missed the moment. Karen offered you something personal and you pivoted to business. She\'ll be professional for the rest of the meeting, but she won\'t trust you completely.', next: 2 },
      { text: 'You say to the board: "If your CFO has been raising alarms for two years and no one has listened, that\'s the first thing we need to fix."', score: 0, reaction: 'Robert stiffens. "Are you saying we\'re not doing our jobs?" You\'re right — but you just accused the board of negligence in their own boardroom. The rest of the meeting will be defensive. Karen stares at the table. You meant to support her. Instead you made her the center of a confrontation.', next: 2 },
    ]
  },
  {
    scene: 'The conversation has moved to what transformation could look like. A board member who has been quiet — a retired school principal — finally speaks:',
    quote: '"I need to ask the question nobody wants to ask. If we do this... does the name stay? Is it still Meadowbrook College? Or does it become... something else?"',
    speaker: 'Dorothy, Board Member',
    options: [
      { text: '"That\'s not my decision to make — it\'s yours. But I\'ll tell you what I\'ve seen: the communities that keep the name tend to hold onto the identity and the loyalty that comes with it. The name is an asset. It carries 94 years of trust."', score: 3, reaction: 'Dorothy exhales. "Thank you. I needed to hear that." Robert adds: "The name stays. That\'s not negotiable." You didn\'t decide for them. You gave them permission to decide for themselves — and they made the right call instantly. That\'s the skill.', next: null },
      { text: '"The name is less important than the mission. What matters is whether the campus is still serving the community."', score: 1, reaction: 'Dorothy nods politely but you can see she\'s not satisfied. The name IS the mission to her. Every alumni letter, every diploma on a wall, every yard sign during homecoming — that\'s the name. You gave the right answer for a consultant. You gave the wrong answer for a retired principal who spent 35 years in schools where names and traditions are everything.', next: null },
      { text: '"Honestly, a rebrand might help. It signals a fresh start and distances the new model from the old one."', score: 0, reaction: 'The room goes silent. Dorothy looks down. Robert stares at you. You just told a table full of people who love this institution that its name — the name on the gate, on their diplomas, on the town signs — should be erased. You\'ve lost Dorothy permanently and damaged your credibility with the entire board.', next: null },
    ]
  },
]

function BoardMode() {
  const [step, setStep] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [totalScore, setTotalScore] = useState(0)
  const [history, setHistory] = useState([])
  const [finished, setFinished] = useState(false)

  const current = BOARD_STEPS[step]

  function choose(idx) {
    if (chosen !== null) return
    setChosen(idx)
    setTotalScore(s => s + current.options[idx].score)
    setHistory(h => [...h, { step, chosen: idx, score: current.options[idx].score }])
  }

  function next() {
    const nextStep = current.options[chosen]?.next
    if (nextStep === null || nextStep === undefined || step + 1 >= BOARD_STEPS.length) {
      setFinished(true)
    } else {
      setStep(nextStep)
      setChosen(null)
    }
  }

  if (finished) {
    const max = BOARD_STEPS.length * 3
    const pct = Math.round((totalScore / max) * 100)
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
        <p className="text-center text-5xl font-light mb-2" style={{ color: pct >= 80 ? '#00A8A8' : pct >= 50 ? '#D97706' : '#DC2626' }}>{totalScore}/{max}</p>
        <p className="text-center text-sm text-gray-400 mb-6">Board Room Effectiveness</p>
        <div className="space-y-4 mb-6">
          {history.map((h, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Moment {i + 1}</p>
              <p className="text-sm text-gray-300 italic mb-2">&ldquo;{BOARD_STEPS[h.step].options[h.chosen].text}&rdquo;</p>
              <p className="text-xs text-gray-400 leading-relaxed">{BOARD_STEPS[h.step].options[h.chosen].reaction}</p>
              <p className="text-[10px] font-bold mt-2" style={{ color: h.score === 3 ? '#00A8A8' : h.score >= 1 ? '#D97706' : '#DC2626' }}>
                +{h.score} points
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400 leading-relaxed text-center max-w-md mx-auto mb-4">
          {pct >= 80
            ? 'You read the room, honored the emotion, and earned trust at every turn. This is how engagements move forward.'
            : pct >= 50
              ? 'You made some right moves but missed key emotional moments. In a boardroom, tone matters as much as content.'
              : 'The room turned against you. This happens — and it\'s recoverable, but only if you understand why. Review each moment and notice where you prioritized being right over being heard.'}
        </p>
        <div className="text-center">
          <button onClick={() => { setStep(0); setChosen(null); setTotalScore(0); setHistory([]); setFinished(false) }}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-red-600 text-white">
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Moment {step + 1} of {BOARD_STEPS.length}</p>
        <p className="text-xs font-bold" style={{ color: '#DC2626' }}>Score: {totalScore}</p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-4">
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{current.scene}</p>
        <div className="border-l-4 pl-4" style={{ borderColor: '#DC2626' }}>
          <p className="text-lg text-white font-light leading-relaxed">&ldquo;{current.quote}&rdquo;</p>
          <p className="text-xs text-gray-500 mt-2">&mdash; {current.speaker}</p>
        </div>
      </div>

      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What do you say?</p>

      <div className="space-y-2">
        {current.options.map((opt, i) => {
          const isChosen = chosen === i
          const isRevealed = chosen !== null
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={isRevealed}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isRevealed
                  ? isChosen
                    ? opt.score === 3 ? 'border-green-400 bg-green-50' : opt.score >= 1 ? 'border-yellow-300 bg-yellow-50' : 'border-red-300 bg-red-50'
                    : 'border-gray-100 bg-gray-50 opacity-40'
                  : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm cursor-pointer'
              }`}
            >
              <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{opt.text}&rdquo;</p>
              {isRevealed && isChosen && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 leading-relaxed italic">{opt.reaction}</p>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {chosen !== null && (
        <button onClick={next}
                className="w-full mt-4 py-3 rounded-xl text-white font-bold text-sm"
                style={{ background: '#0C1F3F' }}>
          {step + 1 >= BOARD_STEPS.length ? 'See Results' : 'Next Moment'}
        </button>
      )}
    </div>
  )
}

// ── MAIN GAME HUB ─────────────────────────────────────────────

export default function SkillsGame() {
  const [activeMode, setActiveMode] = useState(null)

  if (activeMode) {
    const mode = MODES.find(m => m.id === activeMode)
    return (
      <div>
        <button onClick={() => setActiveMode(null)}
                className="text-sm font-medium mb-6 flex items-center gap-2 hover:text-[#00A8A8] transition-colors"
                style={{ color: '#94A3B8' }}>
          &larr; Back to Training Hub
        </button>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{mode.icon}</span>
          <div>
            <h2 className="font-serif text-xl font-light" style={{ color: '#0C1F3F' }}>{mode.title}</h2>
            <p className="text-xs text-gray-400">{mode.desc}</p>
          </div>
        </div>
        {activeMode === 'talk' && <TalkMode />}
        {activeMode === 'said' && <SaidMode />}
        {activeMode === 'missing' && <MissingMode />}
        {activeMode === 'board' && <BoardMode />}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-light" style={{ color: '#0C1F3F' }}>Under the Surface</h1>
        <p className="text-sm text-gray-400 mt-1">Skills training for campus transformation consultants. No textbooks. Just choices, consequences, and the human complexity of institutions in crisis.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className="text-left bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl group-hover:scale-110 transition-transform">{mode.icon}</span>
              <div>
                <h3 className="font-bold text-sm mb-1" style={{ color: '#0C1F3F' }}>{mode.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{mode.desc}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: mode.color }}>Play Now &rarr;</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-xl p-5 border border-gray-200">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">What This Builds</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
          {['Empathy', 'Analysis', 'Strategy', 'Communication', 'Community', 'Judgment'].map(skill => (
            <div key={skill} className="bg-white rounded-lg p-2 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-500">{skill}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
