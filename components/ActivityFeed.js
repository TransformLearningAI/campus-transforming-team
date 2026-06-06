'use client'

export default function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return <p className="text-sm text-gray-400 italic">No activity yet. Be the first!</p>
  }

  const icons = {
    joined: '👋',
    created_task: '📋',
    claimed_task: '✋',
    completed_task: '✅',
    logged_hours: '⏱️',
    posted_discussion: '💬',
    posted_reply: '💬',
    added_timeline: '🗓️',
    posted_bulletin: '📢',
    created_event: '📅',
    created_doc: '📁',
    posted_suggestion: '✏️',
  }

  return (
    <div className="space-y-3">
      {activities.map(a => (
        <div key={a.id} className="flex items-start gap-3">
          <span className="text-lg">{icons[a.action] || '📌'}</span>
          <div className="flex-1">
            <p className="text-sm text-gray-700">{a.detail || a.action}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {new Date(a.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
