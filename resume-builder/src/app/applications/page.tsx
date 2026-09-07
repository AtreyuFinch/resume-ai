'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
  Plus,
  Briefcase,
  FileText,
  Mail,
  Sparkles,
  Loader2,
  Copy,
  CheckCheck,
  Trash2,
  ChevronRight,
  X,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import type { JobApplication, ApplicationStatus } from '@/types'

const statusColors: Record<ApplicationStatus, string> = {
  draft: 'secondary',
  applied: 'default',
  screening: 'warning',
  interview: 'default',
  offer: 'success',
  rejected: 'destructive',
  accepted: 'success',
} as Record<ApplicationStatus, string>

export default function ApplicationsPage() {
  const supabase = createClient()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [selected, setSelected] = useState<JobApplication | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [generating, setGenerating] = useState<'cover_letter' | 'response' | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const [newForm, setNewForm] = useState({
    company_name: '',
    job_title: '',
    job_description: '',
    job_url: '',
  })

  useEffect(() => {
    loadApplications()
  }, [])

  async function loadApplications() {
    const { data } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false })
    setApplications(data ?? [])
    if (data?.length && !selected) setSelected(data[0])
  }

  async function createApplication() {
    if (!newForm.company_name || !newForm.job_title) {
      toast({ variant: 'destructive', title: 'Company and job title are required' })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: user!.id,
        ...newForm,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      toast({ variant: 'destructive', title: 'Failed to create application' })
      return
    }

    setApplications((prev) => [data, ...prev])
    setSelected(data)
    setShowNew(false)
    setNewForm({ company_name: '', job_title: '', job_description: '', job_url: '' })
    toast({ title: 'Application created' })
  }

  async function generateCoverLetter() {
    if (!selected) return
    setGenerating('cover_letter')
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selected.id,
          jobDescription: selected.job_description,
          companyName: selected.company_name,
          jobTitle: selected.job_title,
          type: 'cover_letter',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const updated = { ...selected, cover_letter: data.content }
      setSelected(updated)
      setApplications((prev) =>
        prev.map((a) => (a.id === selected.id ? updated : a))
      )
      toast({ title: 'Cover letter generated!' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setGenerating(null)
    }
  }

  async function generateResponse() {
    if (!selected) return
    setGenerating('response')
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selected.id,
          jobDescription: selected.job_description,
          companyName: selected.company_name,
          jobTitle: selected.job_title,
          type: 'email_response',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const updated = { ...selected, email_response: data.content }
      setSelected(updated)
      setApplications((prev) =>
        prev.map((a) => (a.id === selected.id ? updated : a))
      )
      toast({ title: 'Email response generated!' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setGenerating(null)
    }
  }

  async function updateStatus(status: ApplicationStatus) {
    if (!selected) return
    await supabase
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', selected.id)
    const updated = { ...selected, status }
    setSelected(updated)
    setApplications((prev) =>
      prev.map((a) => (a.id === selected.id ? updated : a))
    )
  }

  async function deleteApplication(id: string) {
    await supabase.from('job_applications').delete().eq('id', id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
    if (selected?.id === id) setSelected(null)
    toast({ title: 'Application deleted' })
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function saveContent(field: 'cover_letter' | 'email_response', value: string) {
    if (!selected) return
    await supabase
      .from('job_applications')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', selected.id)
    const updated = { ...selected, [field]: value }
    setSelected(updated)
    setApplications((prev) =>
      prev.map((a) => (a.id === selected.id ? updated : a))
    )
  }

  return (
    <div>
      <Header
        title="Applications"
        description="Generate tailored cover letters and responses for every job"
        action={
          <Button variant="gradient" size="sm" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" />
            New application
          </Button>
        }
      />

      <div className="flex h-[calc(100vh-65px)]">
        {/* Sidebar list */}
        <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {applications.length} Applications
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No applications yet</p>
                <button
                  onClick={() => setShowNew(true)}
                  className="text-sm text-indigo-600 hover:underline mt-1"
                >
                  Create one
                </button>
              </div>
            ) : (
              applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelected(app)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors group ${
                    selected?.id === app.id
                      ? 'bg-indigo-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {app.company_name}
                    </p>
                    <Badge variant={statusColors[app.status] as never} className="text-[10px] shrink-0 ml-1">
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{app.job_title}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {showNew ? (
            <div className="p-8 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">New Application</h2>
                <button onClick={() => setShowNew(false)}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Company name *</Label>
                    <Input
                      placeholder="Google"
                      value={newForm.company_name}
                      onChange={(e) => setNewForm({ ...newForm, company_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Job title *</Label>
                    <Input
                      placeholder="Senior Engineer"
                      value={newForm.job_title}
                      onChange={(e) => setNewForm({ ...newForm, job_title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Job URL (optional)</Label>
                  <Input
                    placeholder="https://careers.google.com/jobs/..."
                    value={newForm.job_url}
                    onChange={(e) => setNewForm({ ...newForm, job_url: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Job description or email content *</Label>
                  <Textarea
                    placeholder="Paste the full job description or email here. The more detail you provide, the more tailored your cover letter will be..."
                    value={newForm.job_description}
                    onChange={(e) => setNewForm({ ...newForm, job_description: e.target.value })}
                    className="h-48"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="gradient" onClick={createApplication}>
                    <Plus className="h-4 w-4" />
                    Create application
                  </Button>
                  <Button variant="outline" onClick={() => setShowNew(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : selected ? (
            <div className="p-8">
              {/* Application header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.company_name}</h2>
                  <p className="text-gray-500 mt-0.5">{selected.job_title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selected.status}
                    onValueChange={(v) => updateStatus(v as ApplicationStatus)}
                  >
                    <SelectTrigger className="w-36 text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['draft', 'applied', 'screening', 'interview', 'offer', 'rejected', 'accepted'].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500 h-8 w-8"
                    onClick={() => deleteApplication(selected.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="cover-letter">
                <TabsList>
                  <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                  <TabsTrigger value="response">Email Response</TabsTrigger>
                  <TabsTrigger value="job">Job Details</TabsTrigger>
                </TabsList>

                <TabsContent value="cover-letter">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        AI-generated cover letter tailored to this specific role
                      </p>
                      <div className="flex gap-2">
                        {selected.cover_letter && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copy(selected.cover_letter!, 'cl')}
                          >
                            {copied === 'cl' ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            {copied === 'cl' ? 'Copied' : 'Copy'}
                          </Button>
                        )}
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={generateCoverLetter}
                          disabled={generating !== null}
                        >
                          {generating === 'cover_letter' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          {selected.cover_letter ? 'Regenerate' : 'Generate cover letter'}
                        </Button>
                      </div>
                    </div>

                    {generating === 'cover_letter' ? (
                      <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30">
                        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin mb-2" />
                        <p className="text-sm text-indigo-600">Writing your cover letter...</p>
                      </div>
                    ) : selected.cover_letter ? (
                      <Textarea
                        value={selected.cover_letter}
                        onChange={(e) => setSelected({ ...selected, cover_letter: e.target.value })}
                        onBlur={(e) => saveContent('cover_letter', e.target.value)}
                        className="min-h-[500px] text-sm leading-relaxed font-serif"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                        <FileText className="h-8 w-8 text-gray-200 mb-2" />
                        <p className="text-sm text-gray-400">
                          Click &quot;Generate cover letter&quot; to get started
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="response">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Professional email response tailored to the job and your background
                      </p>
                      <div className="flex gap-2">
                        {selected.email_response && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copy(selected.email_response!, 'er')}
                          >
                            {copied === 'er' ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            {copied === 'er' ? 'Copied' : 'Copy'}
                          </Button>
                        )}
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={generateResponse}
                          disabled={generating !== null}
                        >
                          {generating === 'response' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          {selected.email_response ? 'Regenerate' : 'Generate response'}
                        </Button>
                      </div>
                    </div>

                    {generating === 'response' ? (
                      <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30">
                        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin mb-2" />
                        <p className="text-sm text-indigo-600">Crafting your response...</p>
                      </div>
                    ) : selected.email_response ? (
                      <Textarea
                        value={selected.email_response}
                        onChange={(e) => setSelected({ ...selected, email_response: e.target.value })}
                        onBlur={(e) => saveContent('email_response', e.target.value)}
                        className="min-h-[400px] text-sm leading-relaxed"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                        <Mail className="h-8 w-8 text-gray-200 mb-2" />
                        <p className="text-sm text-gray-400">
                          Click &quot;Generate response&quot; to create a tailored email
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="job">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      {selected.job_url && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Job URL</p>
                          <a
                            href={selected.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:underline truncate block"
                          >
                            {selected.job_url}
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Job Description</p>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                          {selected.job_description || 'No description provided.'}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 mb-4">
                <Briefcase className="h-8 w-8 text-indigo-400" />
              </div>
              <p className="text-base font-medium text-gray-700 mb-1">No application selected</p>
              <p className="text-sm text-gray-400 mb-4">
                Create a new application to generate a tailored cover letter
              </p>
              <Button variant="gradient" size="sm" onClick={() => setShowNew(true)}>
                <Plus className="h-4 w-4" />
                New application
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
