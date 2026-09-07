import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DocumentType } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as DocumentType

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('career-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('career-documents')
      .getPublicUrl(fileName)

    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: file.name,
        type: type || 'other',
        file_url: urlData.publicUrl,
        parsed: false,
      })
      .select()
      .single()

    if (docError) {
      return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 })
    }

    // Trigger async parse
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/parse-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') ?? '' },
      body: JSON.stringify({ documentId: docData.id }),
    }).catch(() => {})

    return NextResponse.json({ documentId: docData.id, fileUrl: urlData.publicUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
