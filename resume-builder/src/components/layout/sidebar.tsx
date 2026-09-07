'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/profile',
    label: 'My Profile',
    icon: User,
    description: 'Documents & sources',
  },
  {
    href: '/resume',
    label: 'Resume Builder',
    icon: FileText,
    description: 'ATS-optimized resume',
  },
  {
    href: '/applications',
    label: 'Applications',
    icon: Briefcase,
    description: 'Cover letters & responses',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">ResumeAI</p>
          <p className="text-xs text-gray-400">Career Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {active && (
                <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
