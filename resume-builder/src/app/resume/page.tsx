'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Download,
  Copy,
  CheckCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import type { GeneratedResume } from '@/types'
import { cn, formatDate, getATSScoreColor, getATSScoreBg } from '@/lib/utils'
import { ResumePreview } from '@/components/resume/resume-preview'

export default function ResumePage() {
  const supabase = createClient()
  const [resumes, setResumes] = useState<GeneratedResume[]>([])
  const [selectedResume, setSelectedResume] = useState<GeneratedResume | null>(null)
  const [generating, setGenerating] = useState(false)
  const [additionalContext, setAdditionalContext] = useState('')
  const [copied, setCopied] = useState(false)
  const [showATSDetails, setShowATSDetails] = useState(false)

  useEffect(() => {
    loadResumes()
  }, [])

  async function loadResumes() {
    const { data } = await supabase
      .from('generated_resumes')
      .select('*')
      .order('created_at', { ascending: false })
    setResumes(data ?? [])
    if (data?.length) setSelectedResume(data[0])
  }

  async function generateResume() {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalContext }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Resume generated!', description: 'Your ATS-optimized resume is ready.' })
      loadResumes()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setGenerating(false)
    }
  }

  async function downloadResume() {
    if (!selectedResume) return
    try {
      const res = await fetch('/api/generate-resume/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: selectedResume.id }),
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume-${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Fall back to plain text download
      const text = formatResumeAsText(selectedResume)
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  function formatResumeAsText(resume: GeneratedResume): string {
    const c = resume.content
    return `${c.full_name}
${c.email} | ${c.phone} | ${c.location}
${c.linkedin} | ${c.portfolio}

PROFESSIONAL SUMMARY
${c.summary}

EXPERIENCE
${c.experiences
  .map(
    (e) =>
      `${e.title} — ${e.company} | ${e.location ?? ''} | ${e.start_date} – ${e.end_date ?? 'Present'}
${e.description}
${e.achievements.map((a) => `• ${a}`).join('\n')}`
  )
  .join('\n\n')}

EDUCATION
${c.education
  .map(
    (e) =>
      `${e.degree}${e.field ? ` in ${e.field}` : ''} — ${e.institution}${e.end_date ? ` (${e.end_date})` : ''}`
  )
  .join('\n')}

SKILLS
${c.skills.map((s) => s.name).join(', ')}

${c.certifications.length > 0 ? `CERTIFICATIONS\n${c.certifications.join('\n')}` : ''}
`
  }

  async function copyToClipboard() {
    if (!selectedResume) return
    await navigator.clipboard.writeText(formatResumeAsText(selectedResume))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Copied to clipboard' })
  }

  return (
    <div>
      <Header
        title="Resume Builder"
        description="Generate an ATS-optimized resume from all your career materials"
        action={
          <div className="flex items-center gap-2">
            {selectedResume && (
              <>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy text'}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadResume}>
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left: Controls */}
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Generate Resume</CardTitle>
                <CardDescription>
                  AI analyzes all your uploaded documents and URLs to create
                  your optimal ATS resume.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Additional context (optional)
                  </label>
                  <Textarea
                    placeholder="E.g., 'Focus on leadership experience' or 'I'm targeting senior engineering roles'"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    className="text-sm h-24"
                  />
                </div>
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={generateResume}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {generating ? 'Generating...' : resumes.length > 0 ? 'Regenerate' : 'Generate resume'}
                </Button>
              </CardContent>
            </Card>

            {/* ATS Score */}
            {selectedResume && (
              <Card className={cn('border', selectedResume.ats_score ? getATSScoreBg(selectedResume.ats_score) : '')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-500" />
                      ATS Score
                    </span>
                    <span className={cn('text-2xl font-extrabold', selectedResume.ats_score ? getATSScoreColor(selectedResume.ats_score) : 'text-gray-400')}>
                      {selectedResume.ats_score ?? '—'}
                      {selectedResume.ats_score ? '/100' : ''}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedResume.ats_score && (
                    <Progress value={selectedResume.ats_score} className="h-2 mb-3" />
                  )}

                  {selectedResume.ats_feedback && (
                    <>
                      <button
                        className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                        onClick={() => setShowATSDetails((v) => !v)}
                      >
                        {showATSDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {showATSDetails ? 'Hide details' : 'Show improvements'}
                      </button>

                      {showATSDetails && (
                        <ul className="mt-2 space-y-1">
                          {selectedResume.ats_feedback.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                              <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Previous versions */}
            {resumes.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Previous Versions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resumes.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedResume(r)}
                        className={cn(
                          'w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                          selectedResume?.id === r.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <span className="truncate">{r.title}</span>
                        {r.ats_score && (
                          <Badge variant="secondary" className="shrink-0 ml-2">
                            {r.ats_score}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Resume preview */}
          <div className="col-span-2">
            {generating ? (
              <div className="flex flex-col items-center justify-center h-96 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30">
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-3" />
                <p className="text-sm font-medium text-indigo-600">Analyzing your career history...</p>
                <p className="text-xs text-indigo-400 mt-1">This usually takes 15–30 seconds</p>
              </div>
            ) : selectedResume ? (
              <Tabs defaultValue="preview">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="raw">Plain text</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <ResumePreview resume={selectedResume} />
                </TabsContent>
                <TabsContent value="raw">
                  <Card>
                    <CardContent className="pt-6">
                      <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono leading-relaxed">
                        {formatResumeAsText(selectedResume)}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 mb-4">
                  <Sparkles className="h-7 w-7 text-indigo-400" />
                </div>
                <p className="text-base font-medium text-gray-700 mb-1">No resume yet</p>
                <p className="text-sm text-gray-400 text-center max-w-xs mb-4">
                  Upload your career documents in the Profile section, then generate your ATS resume here.
                </p>
                <Button variant="gradient" size="sm" onClick={generateResume}>
                  <Sparkles className="h-4 w-4" />
                  Generate my resume
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
