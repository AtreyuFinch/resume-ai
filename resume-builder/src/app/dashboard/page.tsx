'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Upload,
  Briefcase,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'

interface StatsData {
  documentCount: number
  resumeCount: number
  applicationCount: number
  profileComplete: number
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('there')
  const [stats, setStats] = useState<StatsData>({
    documentCount: 0,
    resumeCount: 0,
    applicationCount: 0,
    profileComplete: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0])
      }

      const [{ count: docs }, { count: resumes }, { count: apps }] = await Promise.all([
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('generated_resumes').select('*', { count: 'exact', head: true }),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }),
      ])

      const docCount = docs ?? 0
      const progress = Math.min(100, Math.round((docCount / 5) * 60 + (resumes ?? 0 > 0 ? 40 : 0)))

      setStats({
        documentCount: docCount,
        resumeCount: resumes ?? 0,
        applicationCount: apps ?? 0,
        profileComplete: progress,
      })
    }
    load()
  }, [supabase])

  const steps = [
    {
      complete: stats.documentCount > 0,
      label: 'Upload career documents',
      href: '/profile',
      icon: Upload,
    },
    {
      complete: stats.resumeCount > 0,
      label: 'Generate your ATS resume',
      href: '/resume',
      icon: FileText,
    },
    {
      complete: stats.applicationCount > 0,
      label: 'Create your first cover letter',
      href: '/applications',
      icon: Briefcase,
    },
  ]

  const quickActions = [
    {
      href: '/profile',
      icon: Upload,
      label: 'Upload Documents',
      description: 'Add resumes, letters, links',
      color: 'from-blue-500 to-blue-600',
    },
    {
      href: '/resume',
      icon: Sparkles,
      label: 'Generate Resume',
      description: 'AI-powered ATS resume',
      color: 'from-indigo-500 to-violet-600',
    },
    {
      href: '/applications',
      icon: Briefcase,
      label: 'New Application',
      description: 'Cover letter & responses',
      color: 'from-violet-500 to-purple-600',
    },
  ]

  return (
    <div className="p-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {userName} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {stats.profileComplete < 60
            ? "Let's build your career profile to get started."
            : "Your profile is looking great. Keep it updated!"}
        </p>
      </div>

      {/* Profile completion */}
      {stats.profileComplete < 100 && (
        <Card className="mb-8 border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">Complete your profile</p>
                <p className="text-sm text-gray-500">
                  {stats.profileComplete}% complete — add more materials for a better resume
                </p>
              </div>
              <span className="text-2xl font-bold text-indigo-600">
                {stats.profileComplete}%
              </span>
            </div>
            <Progress value={stats.profileComplete} className="h-2.5" />

            <div className="mt-4 space-y-2">
              {steps.map((step) => (
                <Link key={step.href} href={step.href}>
                  <div
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-white/60 transition-colors ${
                      step.complete ? 'opacity-60' : ''
                    }`}
                  >
                    {step.complete ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        step.complete
                          ? 'line-through text-gray-400'
                          : 'text-gray-700 font-medium'
                      }`}
                    >
                      {step.label}
                    </span>
                    {!step.complete && (
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-400 ml-auto" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Documents uploaded', value: stats.documentCount, icon: Upload, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Resumes generated', value: stats.resumeCount, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Applications', value: stats.applicationCount, icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="group cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                <CardContent className="pt-6">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} mb-3 shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ATS tip */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-800">
            <TrendingUp className="h-4 w-4" />
            ATS Tip of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700">
            <strong>Use keywords from the job description.</strong> ATS systems scan for
            exact matches. When you generate a cover letter, ResumeAI automatically
            incorporates the right keywords from the job posting into your materials.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
