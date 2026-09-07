import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as cheerio from 'cheerio'

function detectUrlType(url: string): string {
  if (url.includes('linkedin.com')) return 'linkedin'
  if (url.includes('github.com')) return 'portfolio'
  if (url.includes('behance.net')) return 'portfolio'
  if (url.includes('dribbble.com')) return 'portfolio'
  return 'website'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    new URL(normalizedUrl)

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; ResumeAI/1.0; +https://resumeai.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Could not fetch URL (${response.status})` },
        { status: 400 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    $('script, style, nav, footer, header, [role="navigation"], .nav, .footer, .header, .ads, .advertisement').remove()

    const title = $('title').text().trim() || $('h1').first().text().trim() || url
    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000)

    const docType = detectUrlType(normalizedUrl)

    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: title.slice(0, 200) || normalizedUrl,
        type: docType,
        source_url: normalizedUrl,
        content_text: text,
        parsed: true,
      })
      .select()
      .single()

    if (docError) {
      return NextResponse.json({ error: 'Failed to save URL content' }, { status: 500 })
    }

    return NextResponse.json({ documentId: docData.id, title, preview: text.slice(0, 200) })
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('URL')) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }
    console.error('Scrape error:', err)
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 })
  }
}
