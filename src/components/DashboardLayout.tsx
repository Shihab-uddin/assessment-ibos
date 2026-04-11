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
      <header className="flex h-[80px] items-center justify-between px-6 md:px-[80px] border-b bg-white shadow-sm">
        <div className="flex items-center gap-4 md:gap-[100px]">
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
      <main className="flex-1 w-full px-6 md:px-[80px] pt-8 pb-12">
        {children}
      </main>
      
      <footer className="mt-auto bg-[#1A152E] text-white min-h-[80px] md:h-[80px] py-8 md:py-0 px-6 md:px-[80px] flex flex-col md:flex-row items-start md:items-center justify-between text-[14px]">
         <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 mb-8 md:mb-0">
            <span className="text-white text-[13px] md:text-[#94A3B8] md:text-[20px]">Powered by</span>
            <Image src="/Resource-Logo-1.png" width={116} height={32} alt="Powered by Logo" className="brightness-0 invert object-contain w-[100px] md:w-[116px] h-auto" />
         </div>
         <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-2">
                <span className="text-white text-[13px] md:text-[#94A3B8] mb-1 md:mb-0">Helpline</span>
                <div className="flex items-center gap-2 font-medium">
                    <Phone className="w-[18px] h-[18px]" /> +88 021051515510
                </div>
            </div>
            <div className="flex items-center gap-2 font-medium">
                <Mail className="w-[18px] h-[18px]" /> support@akiij.work
            </div>
         </div>
      </footer>
    </div>
  )
}
