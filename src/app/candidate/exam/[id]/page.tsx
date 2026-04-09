'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle, Clock } from 'lucide-react';
import Image from 'next/image';

interface Question {
  id: string;
  title: string;
  type: string;
  options: string;
}

interface Exam {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
}

export default function ExamEngine() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const res = await axios.get(`/api/candidate/exams/${id}`);
        const examData = res.data.exam;
        
        if (res.data.attempt.status === 'locked_out') {
           setIsLockedOut(true);
        } else if (res.data.attempt.status === 'completed') {
           setSubmitted(true);
        } else {
           setExam(examData);
           // Calculate time left based on attempt start time and duration, but for simplicity we just load duration
           // Note: production would strictly check server time diff from attempt.startTime
           setTimeLeft(examData.duration * 60);
        }
      } catch (err: any) {
        toast.error('Failed to load exam.');
        router.push('/candidate/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, [id, router]);

  // Timer countdown
  useEffect(() => {
    if (loading || isLockedOut || submitted || timeLeft <= 0) return;

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [loading, isLockedOut, submitted, timeLeft]);

  // Auto Submit on Timeout
  useEffect(() => {
    if (timeLeft === 0 && exam && !submitted && !isLockedOut) {
      handleSubmit('completed', true);
    }
  }, [timeLeft, exam, submitted, isLockedOut]);

  const handleSubmit = useCallback(async (status: string = 'completed', isAuto: boolean = false) => {
    try {
      await axios.post(`/api/candidate/exams/${id}/submit`, {
        status,
        answers
      });
      if (status === 'locked_out') {
        setIsLockedOut(true);
      } else {
        setSubmitted(true);
        if (!isAuto) toast.success('Exam submitted successfully!');
        else toast.info('Time is up! Exam auto-submitted.');
      }
    } catch (err) {
      toast.error('Error submitting exam.');
    }
  }, [answers, id]);

  // Behavioral Tracking
  useEffect(() => {
    if (loading || isLockedOut || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error("You navigated away from the exam. You have been locked out.");
        handleSubmit('locked_out');
      }
    };

    const handleBlur = () => {
       // Only lock if we truly lose focus to another window
       toast.error("You navigated away from the exam. You have been locked out.");
       handleSubmit('locked_out');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // window.addEventListener('blur', handleBlur); // Sometimes causes issues on legit actions within window, omitting for safety or strictly using visibility map

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // window.removeEventListener('blur', handleBlur);
    };
  }, [loading, isLockedOut, submitted, handleSubmit]);

  const toggleCheckbox = (questionId: string, option: string) => {
    const currentLine = answers[questionId] || [];
    if (currentLine.includes(option)) {
      setAnswers({ ...answers, [questionId]: currentLine.filter((o: string) => o !== option) });
    } else {
      setAnswers({ ...answers, [questionId]: [...currentLine, option] });
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

  if (isLockedOut) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
            <Card className="max-w-md w-full border-red-200">
                <CardHeader>
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <CardTitle className="text-2xl text-red-600">Locked Out</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600">You have been locked out of the assessment for violating the exam rules (leaving the window or tab switching).</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={() => router.push('/candidate/dashboard')}>Return to Dashboard</Button>
                </CardFooter>
            </Card>
        </div>
      )
  }

  if (submitted) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
           <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-2xl text-green-600">Assessment Complete</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600">Your answers have been submitted successfully. The employer will review them shortly.</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={() => router.push('/candidate/dashboard')}>Return to Dashboard</Button>
                </CardFooter>
            </Card>
        </div>
      )
  }

  if (!exam) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex h-16 items-center px-4 md:px-8 border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <Image src="/Resource-Logo-1.png" alt="Logo" width={140} height={45} className="object-contain" priority />
        </div>
        <div className="ml-auto flex items-center space-x-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono font-medium ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
            </div>
          <Button variant="default" size="sm" onClick={() => handleSubmit('completed')}>Submit Exam</Button>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{exam.title}</h1>
            <p className="text-slate-500 mt-2">Please answer all questions carefully. Do not switch tabs or windows.</p>
        </div>

        <div className="space-y-6">
            {exam.questions.map((q, index) => {
                const options = q.type !== 'text' && typeof q.options === 'string' ? JSON.parse(q.options) : [];
                return (
                    <Card key={q.id} className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-lg font-medium tracking-normal text-slate-800 leading-snug">
                                <span className="text-slate-400 mr-2">{index + 1}.</span> {q.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {q.type === 'text' && (
                                <Textarea 
                                    className="min-h-[120px]" 
                                    placeholder="Type your answer here..." 
                                    value={answers[q.id] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                />
                            )}
                            
                            {q.type === 'radio' && (
                                <RadioGroup 
                                    value={answers[q.id] || ''} 
                                    onValueChange={(val) => setAnswers({ ...answers, [q.id]: val })}
                                    className="space-y-3"
                                >
                                    {options.map((opt: string, i: number) => (
                                        <div key={i} className="flex items-center space-x-3">
                                            <RadioGroupItem value={opt} id={`${q.id}-${i}`} />
                                            <Label htmlFor={`${q.id}-${i}`} className="font-normal cursor-pointer text-slate-700">{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}

                            {q.type === 'checkbox' && (
                                <div className="space-y-3">
                                    {options.map((opt: string, i: number) => {
                                        const isChecked = (answers[q.id] || []).includes(opt);
                                        return (
                                            <div key={i} className="flex items-center space-x-3">
                                                <Checkbox 
                                                    id={`${q.id}-${i}`} 
                                                    checked={isChecked}
                                                    onCheckedChange={() => toggleCheckbox(q.id, opt)}
                                                />
                                                <Label htmlFor={`${q.id}-${i}`} className="font-normal cursor-pointer text-slate-700">{opt}</Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
        
        <div className="flex justify-end pt-4 pb-12 mt-8 border-t border-slate-200">
            <Button size="lg" className="px-10 text-base h-12 shadow-md gap-2" onClick={() => handleSubmit('completed')}>
                Finish & Submit
            </Button>
        </div>
      </main>
    </div>
  );
}
