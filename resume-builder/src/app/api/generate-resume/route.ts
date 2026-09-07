import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import {
  RESUME_SYSTEM_PROMPT,
  ATS_ANALYSIS_PROMPT,
  buildResumePrompt,
} from '@/lib/openai/prompts'
import type { ConsolidatedProfile } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { additionalContext } = body

    const { data: documents } = await supabase
      .from('documents')
      .select('type, content_text, name')
      .eq('user_id', user.id)
      .not('content_text', 'is', null)

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        {
          error:
            'No parsed documents found. Please upload documents and click "Analyze all documents" first.',
        },
        { status: 400 }
      )
    }

    const validDocs = documents.filter(
      (d) => d.content_text && d.content_text.length > 100
    )

    if (validDocs.length === 0) {
      return NextResponse.json(
        { error: 'Documents could not be read. Please check your uploaded files.' },
        { status: 400 }
      )
    }

    const prompt = buildResumePrompt(
      validDocs.map((d) => ({
        type: d.type,
        content: (d.content_text ?? '').slice(0, 4000),
        name: d.name,
      })),
      additionalContext
    )

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: RESUME_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 4000,
    })

    const rawContent = completion.choices[0].message.content
    if (!rawContent) {
      throw new Error('No content returned from AI')
    }

    const profile = JSON.parse(rawContent) as ConsolidatedProfile

    // ATS analysis
    let atsScore: number | null = null
    let atsFeedback: string[] | null = null

    try {
      const atsCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: ATS_ANALYSIS_PROMPT },
          {
            role: 'user',
            content: `Analyze this resume: ${JSON.stringify(profile)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 500,
      })

      const atsRaw = atsCompletion.choices[0].message.content
      if (atsRaw) {
        const atsData = JSON.parse(atsRaw)
        atsScore = atsData.score
        atsFeedback = atsData.feedback
      }
    } catch (atsErr) {
      console.warn('ATS analysis failed (non-critical):', atsErr)
    }

    const title = `Resume — ${profile.full_name} (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`

    const { data: resumeData, error: saveError } = await supabase
      .from('generated_resumes')
      .insert({
        user_id: user.id,
        title,
        content: profile,
        ats_score: atsScore,
        ats_feedback: atsFeedback,
        template: 'classic',
      })
      .select()
      .single()

    if (saveError) {
      console.error('Save resume error:', saveError)
      return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 })
    }

    return NextResponse.json({ resumeId: resumeData.id, atsScore })
  } catch (err) {
    console.error('Generate resume error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
