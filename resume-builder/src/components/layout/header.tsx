'use client'

import { Bell, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action}
          <Button variant="ghost" size="icon" className="text-gray-400">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
