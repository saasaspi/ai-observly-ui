import { NextRequest, NextResponse } from 'next/server'
import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { Resend } from 'resend'
import { readFileSync } from 'fs'
import { join } from 'path'
import { ReportPDF, type ReportPayload } from '@/lib/pdf/report-pdf'

// ── Rate limiter (in-memory, per-process) ─────────────────────────────────────
// Each key maps to an array of request timestamps.
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(key: string, limitPerHour = 5): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const prev = (rateLimitMap.get(key) ?? []).filter((t) => now - t < windowMs)
  if (prev.length >= limitPerHour) return true
  prev.push(now)
  rateLimitMap.set(key, prev)
  return false
}

// ── Email validator ───────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Logo (loaded once, cached in module scope) ────────────────────────────────
let logoDataUrl: string | null = null
function getLogoDataUrl(): string {
  if (logoDataUrl) return logoDataUrl
  try {
    const buf = readFileSync(join(process.cwd(), 'public', 'logo.png'))
    logoDataUrl = `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    logoDataUrl = '' // PDF renders without logo if file is missing
  }
  return logoDataUrl
}

// ── POST /napi/send-report ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Parse body
  let body: { email?: unknown; report?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const report = body.report as ReportPayload | undefined

  // 2. Validate email
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  // 3. Validate report shape
  if (!report || typeof report.totalSpend !== 'number') {
    return NextResponse.json({ error: 'Missing report data.' }, { status: 400 })
  }

  // 4. Rate-limit by email (5/hour) and IP (10/hour)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(`email:${email}`, 5) || isRateLimited(`ip:${ip}`, 10)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait an hour before requesting another report.' },
      { status: 429 },
    )
  }

  // 5. Check env
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[send-report] RESEND_API_KEY not set')
    return NextResponse.json({ error: 'Email sending is not configured.' }, { status: 500 })
  }

  // 6. Generate PDF
  let pdfBuffer: Buffer
  try {
    const now = new Date()
    const generatedAt = now.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
    const element = createElement(ReportPDF, {
      report,
      logoDataUrl: getLogoDataUrl(),
      generatedAt,
    })
    pdfBuffer = await renderToBuffer(element) as Buffer
  } catch (err) {
    console.error('[send-report] PDF generation failed:', err)
    return NextResponse.json({ error: 'Failed to generate the PDF. Please try again.' }, { status: 500 })
  }

  // 7. Send email via Resend
  try {
    const resend = new Resend(apiKey)
    const { error: sendError } = await resend.emails.send({
      from: 'noreply@aiobservly.com',
      to: email,
      subject: 'Your LLM Spend Analyzer Report',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
          <div style="background: #2563eb; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <p style="color: white; font-size: 18px; font-weight: 700; margin: 0;">AI Observly</p>
          </div>
          <div style="border: 1px solid #e2e8f0; border-top: none; padding: 32px; border-radius: 0 0 8px 8px;">
            <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 12px;">Your LLM Spend Analyzer Report</h1>
            <p style="color: #64748b; line-height: 1.6; margin: 0 0 16px;">
              Your spend report is attached as a PDF. It includes your health score, total spend,
              projections, and a per-model cost breakdown.
            </p>
            <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
              This was a one-time snapshot of your billing CSV. Want to track these numbers
              automatically — broken down by customer, feature, and pricing plan?
            </p>
            <a href="https://aiobservly.com/pricing"
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px;
                      border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
              See pricing at aiobservly.com
            </a>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'llm-spend-report.pdf',
          content: pdfBuffer.toString('base64'),
        },
      ],
    })

    if (sendError) {
      console.error('[send-report] Resend error:', sendError)
      return NextResponse.json({ error: 'Failed to send the email. Please try again.' }, { status: 500 })
    }
  } catch (err) {
    console.error('[send-report] Resend exception:', err)
    return NextResponse.json({ error: 'Failed to send the email. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
