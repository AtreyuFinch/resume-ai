import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import {
  RESUME_SYSTEM_PROMPT,
  ATS_ANALYSIS_PROMPT,
  buildResumePrompt,
} from '@/lib/ai/prompts'
import type { ConsolidatedProfile } from '@/types'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
})

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

    const { text: rawContent } = await generateText({
      model: google('gemini-2.5-pro'),
      system: RESUME_SYSTEM_PROMPT,
      prompt,
      temperature: 0.3,
      maxOutputTokens: 4000,
    })

    if (!rawContent) {
      throw new Error('No content returned from AI')
    }

    // Strip markdown code fences if present
    const cleaned = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const profile = JSON.parse(cleaned) as ConsolidatedProfile

    // ATS analysis
    let atsScore: number | null = null
    let atsFeedback: string[] | null = null

    try {
      const { text: atsRaw } = await generateText({
        model: google('gemini-2.0-flash'),
        system: ATS_ANALYSIS_PROMPT,
        prompt: `Analyze this resume: ${JSON.stringify(profile)}`,
        temperature: 0.1,
        maxOutputTokens: 500,
      })

      if (atsRaw) {
        const atsClean = atsRaw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
        const atsData = JSON.parse(atsClean)
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
