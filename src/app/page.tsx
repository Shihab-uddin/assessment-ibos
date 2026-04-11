'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AuthForm } from '@/components/AuthForm';
import { Phone, Mail } from 'lucide-react';

export default function RootPage() {
  const [mode, setMode] = useState<'login'|'register'>('login');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="flex h-[80px] justify-between items-center px-6 md:px-[80px] border-b border-[#E2E8F0] bg-white shadow-sm sticky top-0 z-10 w-full relative">
        <div className="flex items-center">
          <Image src="/Resource-Logo-1.png" alt="Logo" width={116} height={32} className="object-contain w-[80px] md:w-[116px] h-auto" priority />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          <span className="text-[16px] md:text-[24px] font-[600] text-[#4A4B68]">Akij Resource</span>
        </div>
        <div className="hidden md:flex ml-auto flex items-center gap-4">
           {/* If they are on Login, show Register toggle button, and vice-versa */}
           {mode === 'login' ? (
              <button onClick={() => setMode('register')} className="text-[14px] font-bold text-[#6633FF] hover:underline">
                Register an Account
              </button>
           ) : (
              <button onClick={() => setMode('login')} className="text-[14px] font-bold text-[#6633FF] hover:underline">
                Sign In
              </button>
           )}
        </div>
      </header>

      <main className="flex-1 w-full mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        {mode === 'login' && <h1 className="text-[24px] font-bold text-[#4A4B68] mb-[24px]">Sign In</h1>}
        <AuthForm type={mode} onModeToggle={() => setMode(mode === 'login' ? 'register' : 'login')} />
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
  );
}
