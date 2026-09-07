import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, analyzeAll } = body

    let documents: { id: string; file_url: string | null; content_text: string | null; name: string }[] = []

    if (analyzeAll) {
      const { data } = await supabase
        .from('documents')
        .select('id, file_url, content_text, name')
        .eq('user_id', user.id)
        .eq('parsed', false)
      documents = data ?? []
    } else if (documentId) {
      const { data } = await supabase
        .from('documents')
        .select('id, file_url, content_text, name')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single()
      if (data) documents = [data]
    }

    let processed = 0

    for (const doc of documents) {
      if (!doc.file_url) continue

      try {
        const fileRes = await fetch(doc.file_url)
        if (!fileRes.ok) continue

        const buffer = Buffer.from(await fileRes.arrayBuffer())
        const contentType = fileRes.headers.get('content-type') ?? 'application/octet-stream'

        let text = ''

        if (contentType.includes('pdf')) {
          const pdfParseModule = await import('pdf-parse')
          const pdfParse = (pdfParseModule as unknown as { default: (b: Buffer) => Promise<{ text: string }> }).default ?? pdfParseModule
          const parsed = await pdfParse(buffer)
          text = parsed.text.trim()
        } else if (
          contentType.includes('msword') ||
          contentType.includes('wordprocessingml')
        ) {
          const mammoth = await import('mammoth')
          const result = await mammoth.extractRawText({ buffer })
          text = result.value.trim()
        } else {
          text = buffer.toString('utf-8').trim()
        }

        if (text) {
          await supabase
            .from('documents')
            .update({ content_text: text, parsed: true })
            .eq('id', doc.id)
          processed++
        }
      } catch (parseErr) {
        console.error(`Failed to parse document ${doc.id}:`, parseErr)
      }
    }

    return NextResponse.json({ processed })
  } catch (err) {
    console.error('Parse error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
