'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function CalendarView() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    meeting_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    const { data } = await supabase
      .from('team_events')
      .select('*, creator:team_members!team_events_created_by_fkey(name)')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
    setEvents(data || [])
  }

  async function createEvent(e) {
    e.preventDefault()
    setErr('')
    setSaving(true)
    const { error } = await supabase.from('team_events').insert({ ...form, created_by: user.id })
    if (error) {
      setErr('Could not create the event. Please try again.')
      setSaving(false)
      return
    }
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'created_event',
      detail: `Scheduled: ${form.title}`,
    })
    setForm({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      meeting_url: '',
    })
    setShowNew(false)
    setSaving(false)
    loadEvents()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-light" style={{ color: '#0C1F3F' }}>
            Calendar
          </h1>
          <p className="text-sm text-gray-400">Upcoming meetings, deadlines, and milestones.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-bold"
          style={{ background: '#00A8A8' }}
        >
          + Add Event
        </button>
      </div>

      {showNew && (
        <form onSubmit={createEvent} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <input
            type="text"
            required
            placeholder="Event title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]"
          />
          <textarea
            placeholder="Description (optional)"
            rows={2}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Start</label>
              <input
                type="datetime-local"
                required
                value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">End</label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
            <input
              type="url"
              placeholder="Meeting URL (Zoom, Meet)"
              value={form.meeting_url}
              onChange={e => setForm(f => ({ ...f, meeting_url: e.target.value }))}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50"
              style={{ background: '#00A8A8' }}
            >
              {saving ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {events.length === 0 && <p className="text-sm text-gray-400 italic py-8 text-center">No upcoming events.</p>}
        {events.map(ev => (
          <div key={ev.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="text-center shrink-0 w-14">
                <p className="text-xs font-bold uppercase text-gray-400">
                  {new Date(ev.start_time).toLocaleDateString('en-US', {
                    month: 'short',
                  })}
                </p>
                <p className="text-2xl font-bold" style={{ color: '#0C1F3F' }}>
                  {new Date(ev.start_time).getDate()}
                </p>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm" style={{ color: '#0C1F3F' }}>
                  {ev.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(ev.start_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {ev.end_time &&
                    ` — ${new Date(ev.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                </p>
                {ev.description && <p className="text-xs text-gray-500 mt-2">{ev.description}</p>}
                <div className="flex gap-3 mt-2">
                  {ev.location && <span className="text-xs text-gray-400">📍 {ev.location}</span>}
                  {ev.meeting_url && (
                    <a
                      href={ev.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium"
                      style={{ color: '#00A8A8' }}
                    >
                      Join Meeting →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
