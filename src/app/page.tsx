'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AuthForm } from '@/components/AuthForm';

export default function RootPage() {
  const [mode, setMode] = useState<'login'|'register'>('login');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="flex h-[80px] items-center px-[80px] border-b border-[#E2E8F0] bg-white shadow-sm sticky top-0 z-10 w-full relative">
        <div className="flex items-center">
          <Image src="/Resource-Logo-1.png" alt="Logo" width={116} height={32} className="object-contain" priority />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          <span className="text-[24px] font-[500] text-[#4A4B68]">Akij Resource</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
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

      <footer className="mt-auto bg-[#1B1C31] text-white min-h-[80px] md:h-[80px] py-4 md:py-0 px-6 md:px-[80px] flex flex-col md:flex-row items-center justify-between text-[16px]">
         <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-[#94A3B8] text-[20px]">Powered by</span>
            <Image src="/Resource-Logo-1.png" width={116} height={32} alt="Powered by Logo" className="brightness-0 invert object-contain" />
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <span className="text-[#94A3B8]">Helpline</span>
                <div className="flex items-center gap-1.5 font-medium">
                    <span>📞</span> +88 011020202505
                </div>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
                <span>✉️</span> support@akij.work
            </div>
         </div>
      </footer>
    </div>
  );
}
