import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/security/rate-limit'

const reportSchema = z.object({
  slug: z.string().min(1, 'Short link or slug is required'),
  reason: z.enum(['spam', 'phishing', 'malware', 'scam', 'illegal', 'other'], {
    errorMap: () => ({ message: 'Please choose a valid reason' }),
  }),
  description: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request.headers)
  const rl = rateLimit(`report:${clientIp}`, 5, 300) // 5 reports per 5 minutes

  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Rate limit exceeded. Please wait ${rl.resetInSeconds} seconds before submitting another report.`,
      },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 })
  }

  const parseResult = reportSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Invalid report data',
      },
      { status: 400 }
    )
  }

  const { slug, reason, description } = parseResult.data

  // Clean slug if user provided full URL like https://domain.com/abc
  const cleanSlug = slug.includes('/') ? slug.split('/').filter(Boolean).pop() || slug : slug

  const supabase = createAdminClient()

  // Find corresponding link if it exists
  const { data: link } = await supabase
    .from('links')
    .select('id')
    .eq('slug', cleanSlug)
    .maybeSingle()

  const { error: insertError } = await supabase.from('reports').insert({
    slug: cleanSlug,
    link_id: link?.id || null,
    reason,
    description: description || null,
    status: 'pending',
  })

  if (insertError) {
    console.error('Report submission error:', insertError)
    return NextResponse.json(
      { success: false, error: 'Failed to submit report. Please try again later.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Report submitted successfully. Our safety team will review it shortly.',
  })
}
