'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { KEY_DOCUMENTS } from '@/lib/constants'

export default function DocumentsHub() {
  const { user } = useAuth()
  const [folders, setFolders] = useState([])
  const [docs, setDocs] = useState([])
  const [currentFolder, setCurrentFolder] = useState(null)
  const [breadcrumb, setBreadcrumb] = useState([])
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [showNewLink, setShowNewLink] = useState(false)
  const [showNewDoc, setShowNewDoc] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)
  const [folderName, setFolderName] = useState('')
  const [linkForm, setLinkForm] = useState({ title: '', description: '', url: '', category: 'General' })
  const [docForm, setDocForm] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    const [foldersRes, docsRes] = await Promise.all([
      supabase.from('team_folders').select('*, creator:team_members!team_folders_created_by_fkey(name)')
        .eq(currentFolder ? 'parent_id' : 'parent_id', currentFolder || 'is.null')
        .order('name', { ascending: true }),
      supabase.from('team_documents').select('*, creator:team_members!team_documents_created_by_fkey(name)')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false }),
    ])

    // Filter folders by current location
    const allFolders = foldersRes.data || []
    const filteredFolders = allFolders.filter(f =>
      currentFolder ? f.parent_id === currentFolder : !f.parent_id
    )
    setFolders(filteredFolders)

    // Filter docs by current folder
    const allDocs = docsRes.data || []
    const filteredDocs = allDocs.filter(d =>
      currentFolder ? d.folder_id === currentFolder : !d.folder_id
    )
    setDocs(filteredDocs)
  }, [currentFolder])

  useEffect(() => { load() }, [load])

  async function buildBreadcrumb(folderId) {
    const trail = []
    let id = folderId
    while (id) {
      const { data } = await supabase.from('team_folders').select('id, name, parent_id').eq('id', id).single()
      if (!data) break
      trail.unshift(data)
      id = data.parent_id
    }
    setBreadcrumb(trail)
  }

  function navigateToFolder(folderId) {
    setCurrentFolder(folderId)
    if (folderId) buildBreadcrumb(folderId)
    else setBreadcrumb([])
    closeAll()
  }

  function closeAll() {
    setShowNewFolder(false)
    setShowNewLink(false)
    setShowNewDoc(false)
    setEditingDoc(null)
    setErr('')
  }

  async function createFolder(e) {
    e.preventDefault()
    if (!folderName.trim()) return
    setSaving(true)
    await supabase.from('team_folders').insert({
      name: folderName.trim(),
      parent_id: currentFolder || null,
      created_by: user.id,
    })
    setFolderName('')
    setShowNewFolder(false)
    setSaving(false)
    load()
  }

  async function addLink(e) {
    e.preventDefault()
    setErr('')
    setSaving(true)
    const { error } = await supabase.from('team_documents').insert({
      ...linkForm,
      type: 'link',
      folder_id: currentFolder || null,
      created_by: user.id,
    })
    if (error) { setErr('Could not add the link.'); setSaving(false); return }
    setLinkForm({ title: '', description: '', url: '', category: 'General' })
    setShowNewLink(false)
    setSaving(false)
    load()
  }

  async function createDoc(e) {
    e.preventDefault()
    setErr('')
    setSaving(true)
    const { error } = await supabase.from('team_documents').insert({
      title: docForm.title,
      content: docForm.content,
      type: 'document',
      folder_id: currentFolder || null,
      created_by: user.id,
    })
    if (error) { setErr('Could not create the document.'); setSaving(false); return }
    setDocForm({ title: '', content: '' })
    setShowNewDoc(false)
    setSaving(false)
    load()
  }

  async function saveEditDoc(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('team_documents').update({
      title: editingDoc.title,
      content: editingDoc.content,
    }).eq('id', editingDoc.id)
    setEditingDoc(null)
    setSaving(false)
    load()
  }

  async function deleteDoc(id) {
    if (!confirm('Delete this document?')) return
    await supabase.from('team_documents').delete().eq('id', id)
    load()
  }

  async function deleteFolder(id) {
    if (!confirm('Delete this folder and everything inside it?')) return
    // Move docs out first, then delete folder
    await supabase.from('team_documents').update({ folder_id: null }).eq('folder_id', id)
    await supabase.from('team_folders').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-light" style={{ color: '#0C1F3F' }}>Documents</h1>
          <p className="text-sm text-gray-400">Folders, documents, and shared links.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { closeAll(); setShowNewFolder(true) }}
                  className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
            + Folder
          </button>
          <button onClick={() => { closeAll(); setShowNewDoc(true) }}
                  className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
            + Document
          </button>
          <button onClick={() => { closeAll(); setShowNewLink(true) }}
                  className="px-3 py-2 rounded-xl text-white text-xs font-bold"
                  style={{ background: '#00A8A8' }}>
            + Link
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-4 flex-wrap">
        <button onClick={() => navigateToFolder(null)}
                className="font-medium hover:underline" style={{ color: '#00A8A8' }}>
          All Documents
        </button>
        {breadcrumb.map(b => (
          <span key={b.id} className="flex items-center gap-1">
            <span className="text-gray-300">/</span>
            <button onClick={() => navigateToFolder(b.id)}
                    className="font-medium hover:underline" style={{ color: '#00A8A8' }}>
              {b.name}
            </button>
          </span>
        ))}
      </div>

      {/* Core Resources (only at root) */}
      {!currentFolder && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Core Resources</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {KEY_DOCUMENTS.map(d => (
              <a key={d.title} href={d.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-[#00A8A8] transition-colors">
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#0C1F3F' }}>{d.title}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{d.category}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* New Folder Form */}
      {showNewFolder && (
        <form onSubmit={createFolder} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3">
          <span className="text-xl mt-1">📁</span>
          <input type="text" required placeholder="Folder name" value={folderName}
                 onChange={e => setFolderName(e.target.value)} autoFocus
                 className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
          <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-50" style={{ background: '#00A8A8' }}>
            {saving ? '...' : 'Create'}
          </button>
          <button type="button" onClick={() => setShowNewFolder(false)} className="px-3 py-2.5 rounded-xl text-xs text-gray-500 border border-gray-200">Cancel</button>
        </form>
      )}

      {/* New Link Form */}
      {showNewLink && (
        <form onSubmit={addLink} className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Add External Link</p>
          <input type="text" required placeholder="Title" value={linkForm.title}
                 onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))}
                 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
          <input type="url" required placeholder="URL" value={linkForm.url}
                 onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))}
                 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
          <textarea placeholder="Description (optional)" rows={2} value={linkForm.description}
                    onChange={e => setLinkForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-none" />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-50" style={{ background: '#00A8A8' }}>{saving ? 'Adding...' : 'Add Link'}</button>
            <button type="button" onClick={() => setShowNewLink(false)} className="px-3 py-2.5 rounded-xl text-xs text-gray-500 border border-gray-200">Cancel</button>
          </div>
        </form>
      )}

      {/* New Document Form */}
      {showNewDoc && (
        <form onSubmit={createDoc} className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Create Document</p>
          <input type="text" required placeholder="Document title" value={docForm.title}
                 onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))}
                 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#00A8A8]" />
          <textarea required placeholder="Write your document here..." rows={10} value={docForm.content}
                    onChange={e => setDocForm(f => ({ ...f, content: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-vertical leading-relaxed" />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-50" style={{ background: '#00A8A8' }}>{saving ? 'Creating...' : 'Create Document'}</button>
            <button type="button" onClick={() => setShowNewDoc(false)} className="px-3 py-2.5 rounded-xl text-xs text-gray-500 border border-gray-200">Cancel</button>
          </div>
        </form>
      )}

      {/* Folders */}
      {folders.length > 0 && (
        <div className="mb-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {folders.map(f => (
              <div key={f.id} className="flex items-center bg-white rounded-xl border border-gray-200 hover:border-[#00A8A8] transition-colors group">
                <button onClick={() => navigateToFolder(f.id)}
                        className="flex-1 flex items-center gap-3 p-4 text-left">
                  <span className="text-xl">📁</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#0C1F3F' }}>{f.name}</p>
                    <p className="text-[10px] text-gray-400">{f.creator?.name}</p>
                  </div>
                </button>
                {f.created_by === user.id && (
                  <button onClick={() => deleteFolder(f.id)}
                          className="px-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents & Links */}
      {docs.length > 0 && (
        <div className="space-y-2">
          {docs.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 group">
              {/* Editing mode */}
              {editingDoc?.id === d.id ? (
                <form onSubmit={saveEditDoc} className="p-5 space-y-3">
                  <input type="text" value={editingDoc.title}
                         onChange={e => setEditingDoc(ed => ({ ...ed, title: e.target.value }))}
                         className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#00A8A8]" />
                  <textarea rows={10} value={editingDoc.content || ''}
                            onChange={e => setEditingDoc(ed => ({ ...ed, content: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-vertical leading-relaxed" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-white text-xs font-bold" style={{ background: '#00A8A8' }}>Save</button>
                    <button type="button" onClick={() => setEditingDoc(null)} className="px-3 py-2 rounded-lg text-xs text-gray-500 border border-gray-200">Cancel</button>
                  </div>
                </form>
              ) : d.type === 'document' ? (
                /* In-app document */
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📝</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#0C1F3F' }}>{d.title}</p>
                        <p className="text-[10px] text-gray-400">
                          {d.creator?.name} &middot; {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {d.created_by === user.id && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingDoc({ id: d.id, title: d.title, content: d.content })}
                                className="text-[10px] text-gray-400 hover:text-[#00A8A8]">edit</button>
                        <button onClick={() => deleteDoc(d.id)}
                                className="text-[10px] text-gray-400 hover:text-red-500">delete</button>
                      </div>
                    )}
                  </div>
                  {d.content && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-3">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{d.content}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* External link */
                <div className="flex items-center p-4">
                  <a href={d.url} target="_blank" rel="noopener noreferrer"
                     className="flex-1 flex items-center gap-3 hover:opacity-80">
                    <span className="text-lg">{d.pinned ? '📌' : '🔗'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#0C1F3F' }}>{d.title}</p>
                      {d.description && <p className="text-xs text-gray-400 mt-0.5">{d.description}</p>}
                    </div>
                    <p className="text-[10px] text-gray-400 shrink-0">
                      {d.creator?.name} &middot; {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </a>
                  {d.created_by === user.id && (
                    <button onClick={() => deleteDoc(d.id)}
                            className="ml-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {folders.length === 0 && docs.length === 0 && currentFolder && (
        <p className="text-sm text-gray-400 italic text-center py-8">This folder is empty.</p>
      )}
    </div>
  )
}
