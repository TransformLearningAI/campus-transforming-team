import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const ADMIN_EMAIL = 'jeff@transformlearning.ai'

function row(label, value) {
  if (!value) return ''
  return `
    <p style="color:#94A3B8;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:16px 0 2px">${label}</p>
    <p style="color:#334155;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap">${value}</p>`
}

export async function POST(request) {
  const { page, page_url, section, current_text, suggested_text, reason, authorName, authorEmail } =
    await request.json()

  if (!suggested_text) {
    return NextResponse.json({ error: 'Suggested text required.' }, { status: 400 })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Campus Transformation Team <noreply@transformlearning.ai>',
      to: ADMIN_EMAIL,
      replyTo: authorEmail || undefined,
      subject: `[Site Suggestion] ${page}${section ? ` — ${section}` : ''}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#0C1F3F;padding:20px 24px;border-radius:12px 12px 0 0">
            <p style="color:#00A8A8;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 4px">
              Campus Transformation — Site Suggestion
            </p>
            <h1 style="color:white;font-size:18px;margin:0;font-weight:600">${page}${section ? ` · ${section}` : ''}</h1>
          </div>
          <div style="padding:20px 24px;border:1px solid #DDE5EF;border-top:none;border-radius:0 0 12px 12px;background:white">
            ${page_url ? `<p style="margin:0 0 4px"><a href="${page_url}" style="color:#00A8A8;font-size:13px">${page_url}</a></p>` : ''}
            ${row('Current text', current_text)}
            ${row('Suggested change', suggested_text)}
            ${row('Why', reason)}
            <p style="color:#94A3B8;font-size:12px;margin:20px 0 0">Suggested by <strong>${authorName || 'a team member'}</strong></p>
          </div>
          <div style="text-align:center;padding:16px 0">
            <a href="https://team.transformlearning.ai" style="display:inline-block;background:#00A8A8;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600">
              Review in Team Portal
            </a>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Suggestion notify error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
