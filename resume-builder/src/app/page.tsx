import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  FileText,
  CheckCircle,
  Upload,
  Globe,
  Mail,
  ArrowRight,
  Star,
  Zap,
  Shield,
} from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'Upload All Your Materials',
    description:
      'Import existing resumes, recommendation letters, work samples, LinkedIn profiles, and portfolio websites.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description:
      'Our AI reads and synthesizes every piece of your career history to build a complete picture of your expertise.',
  },
  {
    icon: FileText,
    title: 'ATS-Optimized Resume',
    description:
      'Get a perfectly formatted, keyword-rich resume that passes Applicant Tracking Systems and impresses human reviewers.',
  },
  {
    icon: Mail,
    title: 'Tailored Cover Letters',
    description:
      'Upload any job description or email and get a highly personalized cover letter and response in seconds.',
  },
  {
    icon: Globe,
    title: 'Smart URL Parsing',
    description:
      'Paste your LinkedIn, portfolio, or any professional URL — we extract and use every relevant detail automatically.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'Your career data is encrypted and stays private. We never share your information with employers or third parties.',
  },
]

const stats = [
  { value: '94%', label: 'ATS pass rate' },
  { value: '3x', label: 'More interviews' },
  { value: '< 2 min', label: 'Resume generated' },
  { value: '10k+', label: 'Careers accelerated' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">ResumeAI</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm">
                  Get started free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-indigo-100/40 to-violet-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-sm text-indigo-700 font-medium mb-8">
            <Zap className="h-3.5 w-3.5" />
            Powered by GPT-4o
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight text-balance mb-6">
            Your entire career,{' '}
            <span className="gradient-text">one perfect resume</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl text-gray-500 mb-10 text-balance">
            Upload your resumes, LinkedIn, portfolio, and recommendation letters.
            ResumeAI synthesizes everything into a single ATS-optimized resume —
            and generates tailored cover letters for any job in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="gradient" size="xl" className="w-full sm:w-auto shadow-lg shadow-indigo-200">
                Build my resume free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-5 text-sm text-gray-400">
            {['No credit card required', 'Free forever plan', 'Export to PDF'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-3xl font-extrabold text-gray-900">{stat.value}</dt>
                <dd className="mt-1 text-sm text-gray-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to land your next role
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Stop starting from scratch. ResumeAI turns your full career history
              into polished materials that get results.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative group rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 mb-4 group-hover:bg-indigo-100 transition-colors">
                  <feature.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your job search?
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of professionals who landed their dream jobs with ResumeAI.
          </p>
          <Link href="/signup">
            <Button
              size="xl"
              className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl"
            >
              Get started — it&apos;s free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-indigo-600 to-violet-600">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">ResumeAI</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 ResumeAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
