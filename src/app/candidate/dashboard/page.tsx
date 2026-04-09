'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, PlayCircle, Clock, FileQuestion, MinusCircle } from 'lucide-react';

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
      <div className="mb-8 pb-4 border-b border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Available Assessments</h1>
        <p className="text-muted-foreground mt-1 text-sm">Select an exam below to begin your assessment.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No exams available</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">You currently have no pending assessments assigned to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="shadow-sm hover:shadow-md transition-shadow group overflow-hidden border-slate-200 relative bg-white flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/80" />
              <CardHeader className="pb-3">
                <CardTitle className="text-xl line-clamp-1">{exam.title}</CardTitle>
                <CardDescription>Assessment Challenge</CardDescription>
              </CardHeader>
              <CardContent className="pb-6 flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium text-slate-900">{exam.duration} Min Duration</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                    <FileQuestion className="w-4 h-4 text-primary" />
                    <span className="font-medium text-slate-900">{exam._count.questions} Questions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                    <MinusCircle className="w-4 h-4 text-primary" />
                    <span className="font-medium text-slate-900">{exam.negativeMarking ? 'Yes' : 'No'} Negative Marking</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  className="w-full shadow-md gap-2 h-11"
                  onClick={() => router.push(`/candidate/exam/${exam.id}`)}
                >
                  <PlayCircle className="w-5 h-5" /> Start Assessment
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
