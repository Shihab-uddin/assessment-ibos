'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, Plus, Users, LayoutList, Calendar, Clock } from 'lucide-react';

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
          router.push('/employer/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [router]);

  return (
    <DashboardLayout role="employer">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Online Tests List</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and review your created assessments.</p>
        </div>
        <Button onClick={() => router.push('/employer/create-test')} className="mt-4 md:mt-0 shadow-sm gap-2 h-11">
          <Plus className="h-4 w-4" /> Create Online Test
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tests created yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Get started by creating your first online assessment test.</p>
          <Button variant="outline" onClick={() => router.push('/employer/create-test')}>
            Create Test
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="shadow-sm hover:shadow-md transition-shadow group overflow-hidden border-slate-200 relative bg-white">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/80" />
              <CardHeader className="pb-3">
                <CardTitle className="text-xl line-clamp-1">{exam.title}</CardTitle>
                <div className="text-xs text-slate-400">Created: {new Date(exam.createdAt).toLocaleDateString()}</div>
              </CardHeader>
              <CardContent className="pb-4 border-b border-slate-50/50">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4 text-primary/70" />
                    <span>{exam.totalCandidates} Candidates</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <LayoutList className="w-4 h-4 text-primary/70" />
                    <span>{exam.questionSets} Q. Sets</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-primary/70" />
                    <span>{exam.totalSlots} Slots</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-primary/70" />
                    <span>{exam.duration} Min</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 bg-slate-50/50">
                <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5 font-medium transition-colors">
                  View Candidates
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
