'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
  Upload,
  Globe,
  FileText,
  Award,
  Briefcase,
  Plus,
  X,
  Loader2,
  CheckCircle,
  Link2,
  RefreshCw,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Dropzone } from '@/components/upload/dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/types'

export default function ProfilePage() {
  const supabase = createClient()
  const [documents, setDocuments] = useState<Document[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [scrapingUrl, setScrapingUrl] = useState(false)
  const [analyzingAll, setAnalyzingAll] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    setDocuments(data ?? [])
  }

  async function handleAddUrl() {
    if (!urlInput.trim()) return
    setScrapingUrl(true)
    try {
      const res = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'URL added', description: `Content extracted from ${urlInput}` })
      setUrlInput('')
      loadDocuments()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to scrape URL',
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setScrapingUrl(false)
    }
  }

  async function handleAnalyzeAll() {
    setAnalyzingAll(true)
    try {
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyzeAll: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: 'Analysis complete',
        description: `${data.processed} documents analyzed and ready for resume generation.`,
      })
      loadDocuments()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setAnalyzingAll(false)
    }
  }

  async function handleDeleteDocument(id: string) {
    await supabase.from('documents').delete().eq('id', id)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    toast({ title: 'Document removed' })
  }

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'linkedin':
      case 'website':
        return Globe
      case 'recommendation_letter':
        return Award
      case 'work_sample':
      case 'portfolio':
        return Briefcase
      default:
        return FileText
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      resume: 'Resume',
      cover_letter: 'Cover Letter',
      recommendation_letter: 'Recommendation',
      work_sample: 'Work Sample',
      portfolio: 'Portfolio',
      linkedin: 'LinkedIn',
      website: 'Website',
      other: 'Other',
    }
    return labels[type] ?? type
  }

  const parsedCount = documents.filter((d) => d.parsed).length

  return (
    <div>
      <Header
        title="My Profile"
        description="Upload your career materials — the more you add, the better your resume"
        action={
          documents.length > 0 ? (
            <Button
              variant="gradient"
              size="sm"
              onClick={handleAnalyzeAll}
              disabled={analyzingAll}
            >
              {analyzingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Analyze all documents
            </Button>
          ) : undefined
        }
      />

      <div className="p-8">
        {documents.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700">
              <strong>{parsedCount}</strong> of <strong>{documents.length}</strong> documents analyzed.{' '}
              {parsedCount < documents.length && 'Click "Analyze all" to process remaining documents.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Upload panel */}
          <div className="col-span-2 space-y-6">
            <Tabs defaultValue="resumes">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="resumes">Resumes</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="work">Work Samples</TabsTrigger>
                <TabsTrigger value="urls">URLs & Links</TabsTrigger>
              </TabsList>

              <TabsContent value="resumes">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Upload Resumes</CardTitle>
                    <CardDescription>
                      Upload all versions of your resume. Our AI will extract every
                      role, achievement, and skill.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dropzone
                      documentType="resume"
                      label="Drop your resumes here"
                      description="PDF, DOC, DOCX or TXT files"
                      onUploadComplete={loadDocuments}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recommendation Letters</CardTitle>
                    <CardDescription>
                      Upload recommendation and reference letters. Key quotes and endorsements
                      will strengthen your profile summary.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dropzone
                      documentType="recommendation_letter"
                      label="Drop recommendation letters here"
                      description="PDF, DOC, DOCX or TXT"
                      onUploadComplete={loadDocuments}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="work">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Work Samples & Portfolio</CardTitle>
                    <CardDescription>
                      Upload project write-ups, case studies, or portfolio documents to
                      highlight specific accomplishments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dropzone
                      documentType="work_sample"
                      label="Drop work samples here"
                      description="PDF, DOC, DOCX or TXT"
                      onUploadComplete={loadDocuments}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="urls">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add URLs & Profiles</CardTitle>
                    <CardDescription>
                      Add your LinkedIn, portfolio, GitHub, or any professional website.
                      We&apos;ll extract your experience automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          className="pl-9"
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                        />
                      </div>
                      <Button
                        onClick={handleAddUrl}
                        disabled={scrapingUrl || !urlInput.trim()}
                      >
                        {scrapingUrl ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        Add URL
                      </Button>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-400">
                      <p>Supported: LinkedIn, GitHub, Behance, personal websites</p>
                      <p>Tip: Make sure your LinkedIn profile is set to &quot;Public&quot; for best results.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Document list */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Uploaded Documents</CardTitle>
                <CardDescription>{documents.length} total</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <Upload className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No documents yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => {
                      const Icon = getDocIcon(doc.type)
                      return (
                        <div
                          key={doc.id}
                          className="flex items-start gap-2.5 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 group"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 shrink-0 mt-0.5">
                            <Icon className="h-3.5 w-3.5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">
                              {doc.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {getTypeLabel(doc.type)}
                              </Badge>
                              {doc.parsed && (
                                <Badge variant="success" className="text-[10px] px-1.5 py-0">
                                  Analyzed
                                </Badge>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
