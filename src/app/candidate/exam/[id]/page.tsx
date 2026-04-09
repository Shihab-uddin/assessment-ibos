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
import { Loader2, AlertTriangle, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';

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
  const { token, user } = useAuthStore();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const res = await axios.get(`/api/candidate/exams/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const examData = res.data.exam;
        
        if (res.data.attempt.status === 'locked_out') {
           setIsLockedOut(true);
        } else if (res.data.attempt.status === 'completed') {
           setExam(examData);
           setSubmitted(true);
        } else {
           setExam(examData);
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
  }, [id, router, token]);

  useEffect(() => {
    if (loading || isLockedOut || submitted || timeLeft <= 0) return;

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [loading, isLockedOut, submitted, timeLeft]);

  const handleSubmit = useCallback(async (status: string = 'completed', isAuto: boolean = false) => {
    try {
      await axios.post(`/api/candidate/exams/${id}/submit`, {
        status,
        answers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (status === 'locked_out') {
        setIsLockedOut(true);
      } else {
        if (!isAuto) {
            setSubmitted(true);
            toast.success('Exam submitted successfully!');
        } else {
            setIsTimeout(true);
            toast.info('Time is up! Exam auto-submitted.');
        }
      }
    } catch (err) {
      toast.error('Error submitting exam.');
    }
  }, [answers, id, token]);

  useEffect(() => {
    if (timeLeft === 0 && exam && !submitted && !isLockedOut) {
      handleSubmit('completed', true);
    }
  }, [timeLeft, exam, submitted, isLockedOut, handleSubmit]);

  useEffect(() => {
    if (loading || isLockedOut || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error("You navigated away from the exam. You have been locked out.");
        handleSubmit('locked_out');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  const handleNext = () => {
    if (!exam) return;
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit('completed');
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

  if (submitted && !isTimeout && !isLockedOut) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
          <header className="flex h-[72px] items-center px-6 md:px-10 border-b border-[#E2E8F0] bg-white shadow-sm sticky top-0 z-10 w-full">
            <div className="flex-1 flex items-center">
              <Image src="/Resource-Logo-1.png" alt="Logo" width={110} height={35} className="object-contain" priority />
            </div>
            <div className="flex-1 flex justify-center items-center">
              <span className="text-[16px] font-bold text-[#4A4B68]">Akij Resource</span>
            </div>
            <div className="flex-1 flex justify-end items-center">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-9 h-9 rounded-full bg-[#E2E8F0] flex items-center justify-center overflow-hidden shrink-0">
                    <Image src="/candidate.png" width={24} height={24} alt="Avatar" className="opacity-50" />
                </div>
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-[13px] font-bold text-[#1B1C31] leading-tight">{user?.name || "Jhon Smith Doe."}</span>
                  <span className="text-[11px] font-medium text-[#94A3B8] leading-tight mt-0.5">Ref.ID: {user?.id?.substring(0,8).toUpperCase() || "12341341"}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] group-hover:text-[#4A4B68] transition-colors" />
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-[900px] w-full mx-auto p-4 md:p-8 flex items-center justify-center">
            <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center py-16 px-8 w-full mt-4 mb-8">
                <Image src="/test-complete.png" width={64} height={64} alt="Test Completed" className="mb-6 object-contain" />
                <h2 className="text-[20px] font-bold text-[#1B1C31] mb-4">Test Completed</h2>
                <p className="text-[14px] text-[#475569] text-center max-w-[650px] mb-8 leading-relaxed">
                   Congratulations! {user?.name}, You have completed your {exam?.title || 'exam'}. Thank you for participating.
                </p>
                <Button 
                    variant="outline"
                    className="h-11 px-8 rounded-[8px] border-[#CBD5E1] text-[#4A4B68] font-bold text-[14px] hover:bg-slate-50 shadow-sm" 
                    onClick={() => router.push('/candidate/dashboard')}
                >
                    Back to Dashboard
                </Button>
            </div>
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
      )
  }

  if (!exam || !exam.questions.length) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = exam.questions[currentQuestionIndex];
  const options = currentQ.type !== 'text' && typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="flex h-[72px] items-center px-6 md:px-10 border-b border-[#E2E8F0] bg-white shadow-sm sticky top-0 z-10 w-full">
        <div className="flex-1 flex items-center">
          <Image src="/Resource-Logo-1.png" alt="Logo" width={110} height={35} className="object-contain" priority />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <span className="text-[16px] font-bold text-[#4A4B68]">Akij Resource</span>
        </div>
        <div className="flex-1 flex justify-end items-center">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-[#E2E8F0] flex items-center justify-center overflow-hidden shrink-0">
                <Image src="/candidate.png" width={24} height={24} alt="Avatar" className="opacity-50" />
            </div>
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-[13px] font-bold text-[#1B1C31] leading-tight">{user?.name || "Jhon Smith Doe."}</span>
              <span className="text-[11px] font-medium text-[#94A3B8] leading-tight mt-0.5">Ref.ID: {user?.id.substring(0,8).toUpperCase() || "12341341"}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#94A3B8] group-hover:text-[#4A4B68] transition-colors" />
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-[800px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6 mt-4">
        
        {/* Top Progress and Timer Card */}
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] px-6 md:px-8 py-5 flex items-center justify-between shadow-sm">
            <h2 className="text-[15px] font-bold text-[#4A4B68]">
                Question ({currentQuestionIndex + 1}/{exam.questions.length})
            </h2>
            <div className="bg-[#F1F5F9] px-6 py-2 rounded-full flex items-center justify-center text-[14px] font-bold text-[#1B1C31]">
                {formatTime(timeLeft)} left
            </div>
        </div>

        {/* Question Panel */}
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm flex flex-col min-h-[400px]">
            <div className="p-6 md:p-8 flex-1">
                <h3 className="text-[16px] font-bold text-[#1B1C31] mb-8 leading-relaxed">
                    Q{currentQuestionIndex + 1}. {currentQ.title}
                </h3>

                {currentQ.type === 'text' && (
                    <Textarea 
                        className="min-h-[160px] border-[#CBD5E1] rounded-[8px] resize-none text-[14px] focus-visible:ring-[#6633FF]" 
                        placeholder="Type your answer here..." 
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    />
                )}

                {currentQ.type === 'radio' && (
                    <RadioGroup 
                        value={answers[currentQ.id] || ''} 
                        onValueChange={(val) => setAnswers({ ...answers, [currentQ.id]: val })}
                        className="space-y-4"
                    >
                        {options.map((opt: string, i: number) => {
                            const isChecked = answers[currentQ.id] === opt;
                            return (
                                <label 
                                    key={i} 
                                    htmlFor={`${currentQ.id}-${i}`}
                                    className={`flex items-center space-x-3 border ${isChecked ? 'border-[#6633FF] bg-[#6633FF]/5' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'} rounded-[8px] p-4 cursor-pointer transition-colors`}
                                >
                                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${isChecked ? 'border-[#6633FF]' : 'border-[#CBD5E1]'}`}>
                                        {isChecked && <div className="w-[10px] h-[10px] rounded-full bg-[#6633FF]" />}
                                    </div>
                                    <RadioGroupItem value={opt} id={`${currentQ.id}-${i}`} className="hidden" />
                                    <span className={`text-[14px] ${isChecked ? 'text-[#1B1C31] font-semibold' : 'text-[#475569] font-medium'}`}>{opt}</span>
                                </label>
                            )
                        })}
                    </RadioGroup>
                )}

                {currentQ.type === 'checkbox' && (
                    <div className="space-y-4">
                        {options.map((opt: string, i: number) => {
                            const isChecked = (answers[currentQ.id] || []).includes(opt);
                            return (
                                <label 
                                    key={i} 
                                    htmlFor={`${currentQ.id}-${i}`}
                                    className={`flex items-center space-x-3 border ${isChecked ? 'border-[#6633FF] bg-[#6633FF]/5' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'} rounded-[8px] p-4 cursor-pointer transition-colors`}
                                >
                                    <Checkbox 
                                        id={`${currentQ.id}-${i}`} 
                                        checked={isChecked}
                                        onCheckedChange={() => toggleCheckbox(currentQ.id, opt)}
                                        className={`w-5 h-5 rounded-[4px] border-2 ${isChecked ? 'border-[#6633FF] bg-[#6633FF] text-white' : 'border-[#CBD5E1]'}`}
                                    />
                                    <span className={`text-[14px] ${isChecked ? 'text-[#1B1C31] font-semibold' : 'text-[#475569] font-medium'}`}>{opt}</span>
                                </label>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="p-6 md:p-8 border-t border-[#F1F5F9] flex items-center justify-between mt-auto">
                <Button 
                    variant="outline" 
                    className="h-11 px-6 rounded-[8px] border-[#E2E8F0] text-[#4A4B68] font-bold text-[14px] hover:bg-slate-50"
                    onClick={() => {
                        if (currentQuestionIndex < exam.questions.length - 1) {
                            setCurrentQuestionIndex(prev => prev + 1);
                        }
                    }}
                    disabled={currentQuestionIndex === exam.questions.length - 1} // Hide/Disable if last question, usually better to show but whatever
                >
                    Skip this Question
                </Button>

                <Button 
                    className="h-11 px-8 rounded-[8px] bg-[#6633FF] hover:bg-[#6633FF]/90 text-white font-bold text-[14px] shadow-md transition-all active:scale-95"
                    onClick={handleNext}
                >
                    {currentQuestionIndex === exam.questions.length - 1 ? 'Submit Exam' : 'Save & Continue'}
                </Button>
            </div>
        </div>

      </main>

      {/* Powered By Footer Component Injection */}
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

      {/* Overlay Modals (Timeout & Locked Out) */}
      {(isTimeout || isLockedOut) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
            <div className="bg-white rounded-[16px] w-[500px] flex flex-col items-center justify-center py-12 px-8 shadow-2xl">
                {isTimeout ? (
                    <>
                        <Image src="/timeout.png" width={64} height={64} alt="Timeout" className="mb-4 object-contain" />
                        <h2 className="text-[20px] font-bold text-[#1B1C31] mb-2">Timeout!</h2>
                        <p className="text-[14.5px] text-[#475569] text-center mb-8 px-2 leading-relaxed">
                            Dear {user?.name}, Your exam time has been finished. Thank you for participating.
                        </p>
                    </>
                ) : (
                    <>
                        <Image src="/timeout.png" width={64} height={64} alt="Locked Out" className="mb-4 object-contain" />
                        <h2 className="text-[20px] font-bold text-[#1B1C31] mb-2">Locked Out!</h2>
                        <p className="text-[14.5px] text-[#475569] text-center mb-8 px-2 leading-relaxed">
                            Dear {user?.name}, You have been locked out of the assessment for violating the exam rules (leaving the window or tab switching). Thank you for participating.
                        </p>
                    </>
                )}
                
                <Button 
                    variant="outline"
                    className="h-[44px] px-8 rounded-[8px] border-[#CBD5E1] text-[#4A4B68] font-bold text-[14.5px] hover:bg-slate-50 shadow-sm" 
                    onClick={() => router.push('/candidate/dashboard')}
                >
                    Back to Dashboard
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
