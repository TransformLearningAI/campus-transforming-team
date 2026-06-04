'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { KEY_DOCUMENTS } from '@/lib/constants'

export default function DocumentsHub() {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', url: '', category: 'General' })

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    const { data } = await supabase.from('team_documents').select('*, creator:team_members!team_documents_created_by_fkey(name)')
      .order('pinned', { ascending: false }).order('created_at', { ascending: false })
    setDocs(data || [])
  }

  async function addDoc(e) {
    e.preventDefault()
    await supabase.from('team_documents').insert({ ...form, created_by: user.id })
    setForm({ title: '', description: '', url: '', category: 'General' })
    setShowNew(false)
    loadDocs()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-light" style={{ color: '#0C1F3F' }}>Documents</h1>
          <p className="text-sm text-gray-400">Key links, resources, and shared files.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="px-4 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: '#00A8A8' }}>
          + Add Link
        </button>
      </div>

      {/* Core Documents */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Core Resources</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {KEY_DOCUMENTS.map(d => (
            <a key={d.title} href={d.url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#00A8A8] transition-colors">
              <span className="text-xl">📄</span>
              <div>
                <p className="text-sm font-medium" style={{ color: '#0C1F3F' }}>{d.title}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{d.category}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {showNew && (
        <form onSubmit={addDoc} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <input type="text" required placeholder="Document title" value={form.title}
                 onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                 className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
          <input type="url" required placeholder="URL" value={form.url}
                 onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                 className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
          <textarea placeholder="Brief description" rows={2} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-none" />
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: '#00A8A8' }}>Add</button>
            <button type="button" onClick={() => setShowNew(false)} className="px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200">Cancel</button>
          </div>
        </form>
      )}

      {/* Team-Added Documents */}
      {docs.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Team Documents</h2>
          <div className="space-y-2">
            {docs.map(d => (
              <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#00A8A8] transition-colors">
                <span className="text-xl">{d.pinned ? '📌' : '🔗'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#0C1F3F' }}>{d.title}</p>
                  {d.description && <p className="text-xs text-gray-400 mt-0.5">{d.description}</p>}
                </div>
                <p className="text-[10px] text-gray-400 shrink-0">
                  {d.creator?.name} &middot; {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
