'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { TASK_CATEGORIES } from '@/lib/constants'

export default function HoursLog() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], hours: '', description: '', category: TASK_CATEGORIES[0] })
  const [totalHours, setTotalHours] = useState(0)

  useEffect(() => { loadEntries() }, [])

  async function loadEntries() {
    const { data } = await supabase.from('team_hours')
      .select('*')
      .eq('member_id', user.id)
      .order('date', { ascending: false })
    setEntries(data || [])
    setTotalHours((data || []).reduce((sum, e) => sum + Number(e.hours), 0))
  }

  async function logHours(e) {
    e.preventDefault()
    await supabase.from('team_hours').insert({ member_id: user.id, ...form, hours: Number(form.hours) })
    await supabase.from('team_activity').insert({ member_id: user.id, member_name: user.name, action: 'logged_hours', detail: `Logged ${form.hours} hours: ${form.description || form.category}` })
    setForm({ date: new Date().toISOString().split('T')[0], hours: '', description: '', category: TASK_CATEGORIES[0] })
    loadEntries()
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-1" style={{ color: '#0C1F3F' }}>Hours Log</h1>
      <p className="text-sm text-gray-400 mb-6">Track your contributions. Total: <strong className="text-[#00A8A8]">{totalHours.toFixed(1)} hours</strong></p>

      <form onSubmit={logHours} className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Log Hours</p>
        <div className="flex gap-3 flex-wrap">
          <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                 className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
          <input type="number" required step="0.25" min="0.25" max="24" placeholder="Hours" value={form.hours}
                 onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                 className="w-24 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none">
            {TASK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" placeholder="What did you work on?" value={form.description}
                 onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                 className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
          <button type="submit" className="px-5 py-3 rounded-xl text-white text-sm font-bold shrink-0" style={{ background: '#00A8A8' }}>Log</button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hours</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                <td className="py-3 px-4 text-right font-bold" style={{ color: '#00A8A8' }}>{Number(e.hours).toFixed(1)}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">{e.category}</td>
                <td className="py-3 px-4 text-gray-600">{e.description || '—'}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={4} className="py-8 text-center text-gray-400 italic">No hours logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
