import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PRIORITY_COLORS = {
  urgent: { color: '#DC2626', label: 'URGENT', bg: '#FEF2F2' },
  important: { color: '#D97706', label: 'IMPORTANT', bg: '#FFFBEB' },
  info: { color: '#3B82F6', label: 'INFO', bg: '#EFF6FF' },
  celebration: { color: '#059669', label: 'CELEBRATION', bg: '#F0FDF4' },
}

export async function POST(request) {
  const { title, content, priority, authorName } = await request.json()
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  // Get all team member emails
  const { data: members } = await supabase
    .from('team_members')
    .select('email, name')

  if (!members || members.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const emails = members.map(m => m.email).filter(Boolean)
  const cfg = PRIORITY_COLORS[priority] || PRIORITY_COLORS.info

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send to all team members (Resend supports batch)
    await resend.emails.send({
      from: 'Campus Transformation Team <noreply@transformlearning.ai>',
      to: 'jeff@transformlearning.ai',
      bcc: emails,
      subject: `[${cfg.label}] ${title} — Campus Transformation Team`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#0C1F3F;padding:20px 24px;border-radius:12px 12px 0 0">
            <p style="color:#00A8A8;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 4px">
              Campus Transformation — Team Bulletin
            </p>
            <h1 style="color:white;font-size:20px;margin:0;font-weight:600">${title}</h1>
          </div>
          <div style="background:${cfg.bg};padding:4px 24px;border-left:1px solid #DDE5EF;border-right:1px solid #DDE5EF">
            <span style="display:inline-block;background:${cfg.color};color:white;font-size:10px;font-weight:800;padding:3px 10px;border-radius:20px;letter-spacing:0.1em">
              ${cfg.label}
            </span>
          </div>
          <div style="padding:20px 24px;border:1px solid #DDE5EF;border-top:none;background:white">
            ${content ? `<p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 16px;white-space:pre-wrap">${content}</p>` : ''}
            <p style="color:#94A3B8;font-size:12px;margin:0">Posted by <strong>${authorName}</strong></p>
          </div>
          <div style="padding:16px 24px;border:1px solid #DDE5EF;border-top:none;border-radius:0 0 12px 12px;background:#F8FAFC;text-align:center">
            <a href="https://team.transformlearning.ai" style="display:inline-block;background:#00A8A8;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600">
              Open Team Portal
            </a>
          </div>
          <p style="color:#94A3B8;font-size:10px;text-align:center;margin-top:12px">
            You're receiving this because you're a member of the Campus Transformation team.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true, sent: emails.length })
  } catch (err) {
    console.error('Bulletin notify error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
