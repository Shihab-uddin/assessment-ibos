'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, Search, Clock, FileText, XCircle, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface Exam {
  id: string;
  title: string;
  duration: number;
  negativeMarking: number | null;
  _count: {
    questions: number;
  };
}

export default function CandidateDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('/api/candidate/exams');
        setExams(res.data.exams);
      } catch (err: any) {
        toast.error('Failed to fetch assigned exams.');
        if (err.response?.status === 401) {
          router.push('/candidate/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [router]);

  return (
    <DashboardLayout role="candidate">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-2">
        <h1 className="text-[24px] md:text-[28px] font-bold text-[#4A4B68] whitespace-nowrap mr-6">Online Tests</h1>
        <div className="flex-1 w-full max-w-xl relative mt-4 md:mt-0 flex justify-end">
          <div className="relative w-full">
            <Input placeholder="Search by exam title" className="w-full h-11 rounded-[8px] border-[#CBD5E1] bg-white text-[14px] px-4" />
            <div className="absolute right-1.5 top-1.5 w-8 h-8 rounded shrink-0 bg-primary/10 flex items-center justify-center pointer-events-none">
              <Search className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
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
              <Card key={exam.id} className="shadow-none border border-[#E2E8F0] rounded-[12px] bg-white pt-6 px-6 pb-6 w-full relative flex flex-col justify-between">
                <div>
                  <div className="text-[17px] font-semibold text-[#1B1C31] mb-6 line-clamp-1">
                    {exam.title || 'Psychometric Test for Management Trainee Officer'}
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between text-[13px] text-[#475569] mb-8 gap-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-[18px] h-[18px] text-[#94A3B8]" />
                      <span>Duration: <span className="text-[#1B1C31] font-semibold">{exam.duration} min</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-[18px] h-[18px] text-[#94A3B8]" />
                      <span>Question: <span className="text-[#1B1C31] font-semibold">{exam._count?.questions || 20}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-[18px] h-[18px] text-[#94A3B8]" />
                      <span>Negative Marking: <span className="text-[#1B1C31] font-semibold">-0.25/wrong</span></span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button 
                    variant="outline" 
                    className="h-10 w-[140px] rounded-[8px] border-[#6633FF] text-[#6633FF] hover:bg-[#6633FF]/5 hover:text-[#6633FF] font-semibold text-[14px]"
                    onClick={() => router.push(`/candidate/exam/${exam.id}`)}
                  >
                    Start
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
