'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { TASK_CATEGORIES, AREAS_OF_INTEREST, KEY_DOCUMENTS, ONBOARDING_STEPS } from '@/lib/constants'
import ProfileEditor from './ProfileEditor'
import TaskBoard from './TaskBoard'
import TeamDirectory from './TeamDirectory'
import ActivityFeed from './ActivityFeed'
import CalendarView from './CalendarView'
import Discussions from './Discussions'
import DocumentsHub from './DocumentsHub'
import HoursLog from './HoursLog'
import Timeline from './Timeline'
import BulletinBoard from './BulletinBoard'
import SuggestEdit from './SuggestEdit'

const TABS = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'timeline', label: 'Timeline', icon: '🗓️' },
  { id: 'tasks', label: 'Tasks', icon: '📋' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'discussions', label: 'Discuss', icon: '💬' },
  { id: 'documents', label: 'Docs', icon: '📁' },
  { id: 'hours', label: 'Hours', icon: '⏱️' },
  { id: 'suggest', label: 'Suggest', icon: '✏️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState({ members: 0, tasks: 0, hours: 0 })
  const [activity, setActivity] = useState([])
  const [checkedSteps, setCheckedSteps] = useState(() => {
    // Prefer the server-stored value (syncs across devices); fall back to localStorage.
    if (Array.isArray(user.onboarding_steps)) return user.onboarding_steps
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('onboarding_checked') || '[]')
      } catch {
        return []
      }
    }
    return []
  })

  function toggleStep(stepId) {
    setCheckedSteps(prev => {
      const next = prev.includes(stepId) ? prev.filter(s => s !== stepId) : [...prev, stepId]
      try {
        localStorage.setItem('onboarding_checked', JSON.stringify(next))
      } catch {
        /* ignore */
      }
      persistOnboarding(next)
      return next
    })
  }

  // Best-effort sync to Supabase. No-ops gracefully if the onboarding_steps column
  // hasn't been added yet (see supabase-onboarding.sql) — localStorage covers it.
  async function persistOnboarding(next) {
    const allDone = ONBOARDING_STEPS.every(s => next.includes(s.id))
    await supabase
      .from('team_members')
      .update({ onboarding_steps: next, onboarding_completed: allDone })
      .eq('id', user.id)
  }

  useEffect(() => {
    loadStats()
    loadActivity()
  }, [])

  async function loadStats() {
    const [members, tasks, hours] = await Promise.all([
      supabase.from('team_members').select('id', { count: 'exact', head: true }),
      supabase.from('team_tasks').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('team_hours').select('hours'),
    ])
    setStats({
      members: members.count || 0,
      tasks: tasks.count || 0,
      hours: (hours.data || []).reduce((sum, h) => sum + Number(h.hours), 0),
    })
  }

  async function loadActivity() {
    const { data } = await supabase
      .from('team_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    setActivity(data || [])
  }

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: '#00A8A8' }}>
              Campus Transformation
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-400 font-medium">Team Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-gray-600">{user.name}</p>
            <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar Nav */}
        <nav className="w-48 shrink-0 hidden md:block">
          <div className="sticky top-20 space-y-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  tab === t.id ? 'bg-[#0C1F3F] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-0 py-3 flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                tab === t.id ? 'text-[#00A8A8]' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {tab === 'dashboard' && (
            <div>
              <h1 className="font-serif text-2xl font-light mb-1" style={{ color: '#0C1F3F' }}>
                Welcome back, {user.name.split(' ')[0]}.
              </h1>
              <p className="text-sm text-gray-400 mb-6">Here&rsquo;s what&rsquo;s happening with the team.</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  {
                    label: 'Team Members',
                    value: stats.members,
                    color: '#00A8A8',
                  },
                  { label: 'Open Tasks', value: stats.tasks, color: '#3B82F6' },
                  {
                    label: 'Total Hours Logged',
                    value: stats.hours.toFixed(1),
                    color: '#8B5CF6',
                  },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="font-serif text-3xl font-light" style={{ color: s.color }}>
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bulletin Board */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <BulletinBoard compact />
              </div>

              {/* Onboarding Checklist */}
              {!user.onboarding_completed && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                  <h2 className="font-bold text-sm mb-4" style={{ color: '#0C1F3F' }}>
                    Getting Started Checklist
                  </h2>
                  <div className="space-y-3">
                    {ONBOARDING_STEPS.map(step => {
                      const done = checkedSteps.includes(step.id)
                      return (
                        <div key={step.id} className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleStep(step.id)}
                            role="checkbox"
                            aria-checked={done}
                            aria-label={step.label}
                            className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 cursor-pointer transition-all flex items-center justify-center ${
                              done
                                ? 'bg-[#00A8A8] border-[#00A8A8]'
                                : 'border-gray-300 hover:border-[#00A8A8] hover:bg-[#00A8A8]/10'
                            }`}
                          >
                            {done && <span className="text-white text-[10px] font-bold leading-none">&#10003;</span>}
                          </button>
                          <div className="min-w-0">
                            {/* Whole label is clickable — clicking the text toggles the step */}
                            <button type="button" onClick={() => toggleStep(step.id)} className="text-left">
                              <p
                                className={`text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700 hover:text-[#0C1F3F]'}`}
                              >
                                {step.label}
                              </p>
                            </button>
                            {step.url && (
                              <a
                                href={step.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium block"
                                style={{ color: '#00A8A8' }}
                              >
                                Open &rarr;
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Key Documents */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h2 className="font-bold text-sm mb-4" style={{ color: '#0C1F3F' }}>
                  Key Documents
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {KEY_DOCUMENTS.map(doc => (
                    <a
                      key={doc.title}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                    >
                      <span className="text-lg">📄</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{doc.title}</p>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{doc.category}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-sm mb-4" style={{ color: '#0C1F3F' }}>
                  Recent Activity
                </h2>
                <ActivityFeed activities={activity} />
              </div>
            </div>
          )}

          {tab === 'timeline' && <Timeline />}
          {tab === 'tasks' && <TaskBoard />}
          {tab === 'team' && <TeamDirectory />}
          {tab === 'calendar' && <CalendarView />}
          {tab === 'discussions' && <Discussions />}
          {tab === 'documents' && <DocumentsHub />}
          {tab === 'hours' && <HoursLog />}
          {tab === 'suggest' && <SuggestEdit />}
          {tab === 'profile' && <ProfileEditor />}
        </main>
      </div>
    </div>
  )
}
