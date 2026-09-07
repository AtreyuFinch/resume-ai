import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { buildCoverLetterPrompt } from '@/lib/ai/prompts'
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
    const { applicationId, jobDescription, companyName, jobTitle, type } = body

    if (!companyName || !jobTitle) {
      return NextResponse.json(
        { error: 'Company name and job title are required' },
        { status: 400 }
      )
    }

    // Get the most recent generated resume for profile data
    const { data: resume } = await supabase
      .from('generated_resumes')
      .select('content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let profile: ConsolidatedProfile

    if (resume?.content) {
      profile = resume.content as ConsolidatedProfile
    } else {
      // Build basic profile from documents if no resume exists
      const { data: docs } = await supabase
        .from('documents')
        .select('content_text, type')
        .eq('user_id', user.id)
        .not('content_text', 'is', null)
        .limit(5)

      const { data: { user: authUser } } = await supabase.auth.getUser()

      profile = {
        full_name: authUser?.user_metadata?.full_name ?? 'Candidate',
        email: authUser?.email ?? '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: '',
        summary: docs?.map((d) => d.content_text?.slice(0, 500)).join(' ') ?? '',
        experiences: [],
        education: [],
        skills: [],
        certifications: [],
        languages: [],
        awards: [],
      }
    }

    const prompt = buildCoverLetterPrompt({
      profile,
      jobDescription: jobDescription ?? '',
      companyName,
      jobTitle,
      type: type === 'email_response' ? 'email_response' : 'cover_letter',
    })

    const { text: content } = await generateText({
      model: google('gemini-2.5-pro'),
      system:
        'You are an expert professional writer specializing in career documents. Write compelling, authentic, and tailored career communications.',
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1000,
    })

    // Save to application
    if (applicationId) {
      const updateField =
        type === 'email_response' ? 'email_response' : 'cover_letter'
      await supabase
        .from('job_applications')
        .update({
          [updateField]: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ content })
  } catch (err) {
    console.error('Cover letter error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
