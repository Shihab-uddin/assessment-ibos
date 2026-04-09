'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from './ui/button'

export function DashboardLayout({ children, role }: { children: React.ReactNode, role: string }) {
  const { user, token, logout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && (!token || user?.role !== role)) {
      router.push(`/${role}/login`)
    }
  }, [mounted, token, user, role, router])

  if (!mounted || !token || user?.role !== role) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleLogout = () => {
    logout()
    router.push(`/${role}/login`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex h-16 items-center px-4 md:px-8 border-b bg-white shadow-sm">
        <div className="flex items-center">
          <Image src="/Resource-Logo-1.png" alt="Logo" width={140} height={45} className="object-contain" priority />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm font-medium hidden md:inline-block">Welcome, {user?.name}</span>
          <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
