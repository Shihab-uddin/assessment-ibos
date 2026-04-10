'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Search, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import Image from 'next/image';

interface Exam {
  id: string;
  title: string;
  totalCandidates: number;
  questionSets: number;
  totalSlots: number;
  duration: number;
  createdAt: string;
}

export default function EmployerDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('/api/employer/exams');
        setExams(res.data.exams);
      } catch (err: any) {
        toast.error('Failed to fetch exams.');
        if (err.response?.status === 401) {
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [router]);

  return (
    <DashboardLayout role="employer">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-2">
        <h1 className="text-[24px] md:text-[28px] font-bold text-[#4A4B68] whitespace-nowrap mr-6">Online Tests</h1>
        <div 
          className="w-full max-w-[621px] rounded-[8px] p-[1px] relative mt-4 md:mt-0 flex-1 shrink-0"
          style={{ background: 'linear-gradient(to right, #A086F7, #ECDBFF, #BAA9F2, #B199FF)' }}
        >
          <Input 
            placeholder="Search by exam title" 
            className="w-full h-[46px] rounded-[7px] border-none bg-white text-[14px] px-4 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#94A3B8]" 
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded shrink-0 bg-[#F5F3FF] flex items-center justify-center pointer-events-none">
            <Search className="w-4 h-4 text-[#6633FF]" />
          </div>
        </div>
        <Button onClick={() => router.push('/employer/create-test')} className="mt-4 md:mt-0 h-11 px-6 rounded-[8px] bg-primary hover:bg-primary/90 text-white font-medium md:ml-6 shrink-0">
          Create Online Test
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm mt-4">
          <Image src="/empty.png" width={116} height={116} alt="Empty Box" className="mb-6 object-contain" />
          <h3 className="text-[18px] md:text-[20px] font-bold text-[#1B1C31] mb-2">No Online Test Available</h3>
          <p className="text-[14px] text-[#475569] max-w-sm text-center px-4 leading-relaxed">
             Currently, there are no online tests available. Please check back later for updates.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <Card key={exam.id} onClick={() => router.push(`/employer/manage-test/${exam.id}`)} className="shadow-none border border-[#E2E8F0] rounded-[12px] bg-white pt-[32px] pb-[40px] px-[32px] flex flex-col gap-[24px] w-full relative cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200">
                <div className="text-[20px] font-bold text-[#1B1C31] line-clamp-1 tracking-tight">
                  {exam.title || 'Psychometric Test for Management Trainee Officer'}
                </div>
                
                <div className="flex flex-wrap items-center justify-between text-[14px] text-[#475569]">
                  <div className="flex items-center gap-2">
                    <Image src="/candidate.png" alt="Candidate" width={16} height={16} />
                    <span>Candidates: <span className="font-bold text-[#4A4B68]">{exam.totalCandidates ? exam.totalCandidates.toLocaleString() : 'Not Set'}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image src="/set.png" alt="Set" width={16} height={16} />
                    <span>Question Set: <span className="font-bold text-[#4A4B68]">{exam.questionSets ? exam.questionSets : 'Not Set'}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image src="/slot.png" alt="Slot" width={16} height={16} />
                    <span>Exam Slots: <span className="font-bold text-[#4A4B68]">{exam.totalSlots ? exam.totalSlots : 'Not Set'}</span></span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); }} className="py-[10px] px-[24px] h-auto rounded-[8px] border-primary text-primary hover:bg-primary/5 hover:text-primary font-bold text-[14px] relative z-10 shadow-sm w-fit">
                    View Candidates
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between mt-10 mb-6">
            <div className="flex items-center gap-2">
              <button disabled className="flex items-center justify-center w-8 h-8 rounded border border-[#E2E8F0] bg-white text-[#94A3B8] disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center w-8 h-8 rounded border border-[#E2E8F0] bg-white text-[#4A4B68] text-sm font-medium">
                1
              </button>
              <button disabled className="flex items-center justify-center w-8 h-8 rounded border border-[#E2E8F0] bg-white text-[#94A3B8] disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0 text-[13px] text-[#64748B]">
              <span>Online Test Per Page</span>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#E2E8F0] bg-white text-[#4A4B68] font-medium outline-none shrink-0">
                8 <ChevronUp className="w-3 h-3 text-[#94A3B8]" />
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
