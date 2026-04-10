import { AuthForm } from "@/components/AuthForm";
import Image from 'next/image';

export default function EmployerLoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="flex h-[72px] items-center px-6 md:px-10 border-b border-[#E2E8F0] bg-white shadow-sm sticky top-0 z-10 w-full">
        <div className="flex-1 flex items-center">
          <Image src="/Resource-Logo-1.png" alt="Logo" width={110} height={35} className="object-contain" priority />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <span className="text-[16px] font-bold text-[#4A4B68]">Akij Resource</span>
        </div>
        <div className="flex-1"></div>
      </header>

      <main className="flex-1 w-full mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <h1 className="text-[24px] font-bold text-[#4A4B68] mb-8">Sign In</h1>
        <AuthForm type="login" role="employer" />
      </main>

      <footer className="mt-auto bg-[#1B1C31] text-white py-4 px-6 flex flex-col md:flex-row items-center justify-between text-[13px]">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <span className="text-[#94A3B8]">Powered by</span>
          <Image src="/Resource-Logo-1.png" width={90} height={24} alt="Powered by Logo" className="brightness-0 invert object-contain" />
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
