'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, LogOut, User, Phone, Mail } from 'lucide-react'

export function DashboardLayout({ children, role, title = "Dashboard" }: { children: React.ReactNode, role: string, title?: string }) {
  const { user, token, logout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && (!token || user?.role !== role)) {
      router.push('/')
    }
  }, [mounted, token, user, role, router])

  if (!mounted || !token || user?.role !== role) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex h-[80px] items-center px-[80px] border-b bg-white shadow-sm">
        <div className="flex items-center gap-[100px]">
          <Image src="/Resource-Logo-1.png" alt="Logo" width={116} height={32} className="object-contain" priority />
          <span className="text-[16px] font-[500] text-[#4A4B68] whitespace-nowrap hidden md:inline-block">{title}</span>
        </div>
        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-slate-50 py-1.5 px-3 rounded-md outline-none transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-slate-100 text-slate-500">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left hidden sm:flex">
                  <span className="text-[15px] font-semibold text-[#1B1C31] leading-tight">{user?.name}</span>
                  <span className="text-[12px] text-[#64748B]">Ref. ID - {user?.id?.substring(0, 8) || '16101121'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 w-full px-[80px] pt-8 pb-12">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-[#1C1833] text-white min-h-[80px] md:h-[80px] py-4 md:py-0 px-6 md:px-[80px] flex flex-col md:flex-row justify-between items-center text-[16px]">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <span className="text-gray-300 font-medium text-[20px]">Powered by</span>
          <Image src="/Resource-Logo-1.png" alt="Logo" width={116} height={32} className="brightness-0 invert object-contain" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center text-gray-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold hidden sm:inline-block">Helpline</span>
            <Phone className="w-4 h-4 ml-1" />
            <span>+88 011020202505</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>support@akij.work</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
