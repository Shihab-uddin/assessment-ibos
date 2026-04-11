'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Check, CheckCircle2, Loader2, Undo, Redo, List, Trash2, Plus, ChevronDown, PenSquare, Edit2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';

interface Question {
  id: string; // temp client id
  title: string;
  type: string; // checkbox, radio, text
  options: string[]; // only for checkbox/radio
  score: number;
  correctAnswers: number[];
}

const RichTextEditorMock = ({ value, onChange, placeholder }: any) => (
  <div className="border border-[#E2E8F0] rounded-[8px] overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-shadow">
    <div className="flex items-center gap-4 px-4 py-2 border-b border-[#E2E8F0] bg-white">
      <div className="flex items-center gap-2 text-[#64748B]">
        <button className="hover:text-[#1B1C31] transition-colors"><Undo className="w-4 h-4" /></button>
        <button className="hover:text-[#1B1C31] transition-colors"><Redo className="w-4 h-4" /></button>
      </div>
      <div className="w-px h-4 bg-[#E2E8F0]" />
      <div className="flex items-center gap-1 text-[#64748B]">
        <button className="flex items-center gap-1 hover:text-[#1B1C31] transition-colors text-[13px] font-medium px-2">Normal text <ChevronDown className="w-3.5 h-3.5 ml-1" /></button>
      </div>
      <div className="w-px h-4 bg-[#E2E8F0]" />
      <div className="flex items-center gap-1 text-[#64748B]">
        <button className="flex items-center gap-1 hover:text-[#1B1C31] transition-colors px-2"><List className="w-4 h-4" /> <ChevronDown className="w-3.5 h-3.5" /></button>
      </div>
      <div className="w-px h-4 bg-[#E2E8F0]" />
      <div className="flex items-center gap-3 text-[#64748B] px-1">
        <button className="hover:text-[#1B1C31] transition-colors font-serif font-bold text-[14px]">B</button>
        <button className="hover:text-[#1B1C31] transition-colors font-serif italic text-[14px]">I</button>
      </div>
    </div>
    <textarea 
      className="w-full min-h-[90px] p-4 text-[14px] text-[#1B1C31] bg-white outline-none resize-y placeholder:text-[#cbd5e1]"
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Type here..."}
    />
  </div>
);


export default function ManageTestPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialFetchLoading, setInitialFetchLoading] = useState(true);

  // Step 1 Data
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    totalCandidates: '',
    totalSlots: '',
    questionSets: '',
    questionType: 'multiple_choice',
    startTime: '',
    endTime: '',
    duration: '',
  });

  // Flow State
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);

  // Step 2 Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const { token } = useAuthStore();

  // Modal Form State (Question)
  const [qTitle, setQTitle] = useState('');
  const [qType, setQType] = useState('checkbox');
  const [qOptions, setQOptions] = useState(['', '', '']);
  const [qScore, setQScore] = useState(1);
  const [qCorrect, setQCorrect] = useState<number[]>([]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`/api/employer/exams/${examId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = res.data.exam;
        
        setBasicInfo({
          title: d.title || '',
          totalCandidates: d.totalCandidates?.toString() || '',
          totalSlots: d.totalSlots?.toString() || '',
          questionSets: d.questionSets?.toString() || '',
          questionType: d.questionType || 'multiple_choice',
          startTime: d.startTime ? format(new Date(d.startTime), "yyyy-MM-dd'T'HH:mm") : '',
          endTime: d.endTime ? format(new Date(d.endTime), "yyyy-MM-dd'T'HH:mm") : '',
          duration: d.duration?.toString() || '',
        });

        const mappedQuestions = (d.questions || []).map((q: any) => ({
          id: q.id,
          title: q.title,
          type: q.type,
          options: JSON.parse(q.options || '[]'),
          score: q.score || 1,
          correctAnswers: JSON.parse(q.correctAnswers || '[]')
        }));
        
        setQuestions(mappedQuestions);

      } catch (err) {
        toast.error('Failed to load exam details');
        router.push('/employer/dashboard');
      } finally {
        setInitialFetchLoading(false);
      }
    };
    if (examId && token) {
      fetchExam();
    }
  }, [examId, token, router]);

  const handleNextStep = () => {
    if (!basicInfo.title || !basicInfo.duration || !basicInfo.startTime || !basicInfo.endTime) {
      toast.error('Please fill in or evaluate the required fields.');
      return;
    }
    setStep(2);
  };

  const saveBasicInfoEditsAndProceed = () => {
    setIsEditingBasicInfo(false);
    setStep(2);
  };

  const openAddModal = () => {
    setEditingQuestionId(null);
    setQTitle('');
    setQType('checkbox');
    setQOptions(['', '', '']);
    setQScore(1);
    setQCorrect([]);
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestionId(q.id);
    setQTitle(q.title);
    setQType(q.type);
    setQOptions(q.options.length ? q.options : ['', '', '']);
    setQScore(q.score || 1);
    setQCorrect(q.correctAnswers || []);
    setIsModalOpen(true);
  };

  const saveQuestion = () => {
    const newQuestion: Question = {
      id: editingQuestionId || Math.random().toString(36).substr(2, 9),
      title: qTitle || 'Sample Question',
      type: qType,
      options: qType === 'text' ? [] : qOptions,
      score: qScore,
      correctAnswers: qType === 'text' ? [] : qCorrect,
    };

    if (editingQuestionId) {
      setQuestions(questions.map((q) => (q.id === editingQuestionId ? newQuestion : q)));
    } else {
      setQuestions([...questions, newQuestion]);
    }
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      return toast.error('Please add at least one question.');
    }

    setLoading(true);
    try {
      const payload = { ...basicInfo, questions };
      await axios.put(`/api/employer/exams/${examId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Exam updated successfully!');
      router.push('/employer/dashboard');
    } catch (err) {
      toast.error('Failed to update exam.');
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...qOptions];
    newOptions[index] = value;
    setQOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setQOptions(qOptions.filter((_, i) => i !== index));
    setQCorrect(qCorrect.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const toggleCorrectAnswer = (index: number) => {
    if (qType === 'radio') {
      setQCorrect([index]);
    } else {
      if (qCorrect.includes(index)) {
        setQCorrect(qCorrect.filter(i => i !== index));
      } else {
        setQCorrect([...qCorrect, index]);
      }
    }
  };

  if (initialFetchLoading) {
    return (
      <DashboardLayout role="employer">
        <div className="flex justify-center items-center py-20 w-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="employer" title="Online Test">
      <div className="w-full py-2">
        {/* Banner */}
        <div className="bg-white rounded-[12px] border border-slate-200 py-5 lg:py-7 px-[40px] mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full shadow-sm">
          <div className="flex flex-col gap-5">
            <h1 className="text-[17px] font-bold text-[#4A4B68]">Manage Online Test</h1>
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-medium ${step === 1 || step === 2 ? 'bg-primary text-white' : ''}`}>
                  {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <span className={step >= 1 ? 'text-primary font-medium text-[14px]' : 'text-[#64748B] text-[14px]'}>Basic Info</span>
              </div>
              
              <div className="w-12 md:w-20 h-px bg-[#CBD5E1]" />
              
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-medium ${step === 2 ? 'bg-primary text-white' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}>
                  {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                </div>
                <span className={step === 2 ? 'text-[#4A4B68] font-medium text-[14px]' : 'text-[#94A3B8] text-[14px] font-medium'}>Questions Sets</span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-4 sm:mt-0 rounded-[8px] border-[#E2E8F0] text-[#4A4B68] font-semibold h-11 px-5" onClick={() => router.push('/employer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Step 1: Basic Info (View Mode defaults) */}
        {step === 1 && (
          <>
            <div className="bg-white rounded-[12px] border border-slate-200 p-[24px] mx-[24px] shadow-sm relative">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-[17px] font-bold text-[#4A4B68]">Basic Information</h2>
                <button 
                  onClick={() => setIsEditingBasicInfo(true)}
                  className="flex items-center gap-2 text-[#6633FF] text-[14px] font-semibold hover:underline"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-[#94A3B8] text-[13px] font-medium mb-1">Online Test Title</div>
                  <div className="text-[#4A4B68] font-semibold text-[15px]">{basicInfo.title}</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-[#94A3B8] text-[13px] font-medium mb-1">Total Candidates</div>
                    <div className="text-[#4A4B68] font-semibold text-[15px]">{basicInfo.totalCandidates}</div>
                  </div>
                  <div>
                    <div className="text-[#94A3B8] text-[13px] font-medium mb-1">Total Slots</div>
                    <div className="text-[#4A4B68] font-semibold text-[15px]">{basicInfo.totalSlots}</div>
                  </div>
                  <div>
                    <div className="text-[#94A3B8] text-[13px] font-medium mb-1">Total Question Set</div>
                    <div className="text-[#4A4B68] font-semibold text-[15px]">{basicInfo.questionSets}</div>
                  </div>
                  <div>
                    <div className="text-[#94A3B8] text-[13px] font-medium mb-1">Duration Per Slots (Minutes)</div>
                    <div className="text-[#4A4B68] font-semibold text-[15px]">{basicInfo.duration}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[#94A3B8] text-[13px] font-medium mb-1">Question Type</div>
                  <div className="text-[#4A4B68] font-semibold text-[15px] uppercase">{basicInfo.questionType === 'multiple_choice' ? 'MCQ' : basicInfo.questionType}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[12px] border border-slate-200 p-[24px] mx-[24px] mt-6 flex justify-between items-center shadow-sm mb-10">
              <Button variant="outline" className="h-12 w-32 md:w-40 rounded-[8px] border-[#CBD5E1] text-[#4A4B68] font-bold text-[15px]" onClick={() => router.push('/employer/dashboard')}>
                Cancel
              </Button>
              <Button className="h-12 w-48 md:w-56 rounded-[8px] bg-primary hover:bg-primary/90 text-white font-bold text-[15px]" onClick={handleNextStep}>
                Save & Continue
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Questions Set */}
        {step === 2 && (
          <div className="w-auto mx-[24px] space-y-6 pb-20">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-[12px] border border-slate-200 p-[24px] shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-[14px] font-bold text-[#1B1C31]">Question {i + 1}</h3>
                  <div className="flex gap-2 text-[12px]">
                    <span className="px-3 py-1 border border-slate-200 rounded-full font-medium text-[#64748B] bg-white text-[11px] uppercase">{q.type === 'radio' ? 'MCQ' : q.type === 'text' ? 'Text' : 'Checkbox'}</span>
                    <span className="px-3 py-1 border border-slate-200 rounded-full font-medium text-[#64748B] bg-white text-[11px]">{q.score || 1} pt</span>
                  </div>
                </div>
                
                <p className="text-[14px] font-bold text-[#1B1C31] mb-6 whitespace-pre-wrap">{q.title}</p>
                
                {q.type !== 'text' && q.options && q.options.length > 0 && (
                  <div className="space-y-4 mb-10">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex justify-between items-center p-4 rounded-lg bg-[#F8FAFC] border border-slate-100">
                        <span className="text-[14px] text-[#475569]">{String.fromCharCode(65 + oi)}. {opt || 'Empty Option'}</span>
                        {q.correctAnswers?.includes(oi) && <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />} 
                      </div>
                    ))}
                  </div>
                )}
                
                {q.type === 'text' && (
                  <p className="text-[13px] text-[#64748B] mb-10 leading-relaxed italic border border-slate-100 rounded-lg p-4 bg-[#F8FAFC]">
                    {q.options?.[0] || 'Lorem ipsum dolor sit amet...'}
                  </p>
                )}
                
                <div className="flex justify-between items-center pt-5 border-t border-slate-100">
                  <button onClick={() => openEditModal(q)} className="text-primary text-[14px] font-medium hover:underline">Edit</button>
                  <button onClick={() => deleteQuestion(q.id)} className="text-[#EF4444] text-[14px] font-medium hover:underline">Remove From Exam</button>
                </div>
              </div>
            ))}
            
            <div className="bg-white rounded-[12px] border border-slate-200 p-[24px] shadow-sm">
              <Button className="w-full h-[54px] rounded-[12px] bg-primary hover:bg-primary/90 text-white font-bold text-[15px] shadow-sm" onClick={openAddModal}>
                Add Question
              </Button>
            </div>
            
            {questions.length > 0 && (
              <div className="flex justify-between items-center mt-6 w-full pt-4 pb-10">
                <Button variant="outline" className="h-12 w-32 md:w-40 rounded-[8px] border-[#CBD5E1] text-[#4A4B68] font-bold" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button disabled={loading} className="h-12 w-48 md:w-56 rounded-[8px] bg-primary hover:bg-primary/90 text-white font-bold flex items-center justify-center shadow-md" onClick={handleSubmit}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Save Exam
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Editing Basic Info */}
      <Dialog open={isEditingBasicInfo} onOpenChange={setIsEditingBasicInfo}>
        <DialogContent className="sm:max-w-2xl bg-white p-6 rounded-[16px] border-0 shadow-2xl">
          <DialogHeader className="border-b border-[#E2E8F0] pb-4 mb-4">
            <DialogTitle className="text-[17px] font-bold text-[#4A4B68]">Edit Basic Information</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 py-2">
            <div className="space-y-2.5">
              <Label className="text-[#4A4B68] font-medium text-[14px]">Online Test Title <span className="text-red-500">*</span></Label>
              <Input className="h-[46px] border-[#CBD5E1] rounded-[8px] text-[14px] placeholder:text-[#94A3B8]" placeholder="Enter online test title" value={basicInfo.title} onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2.5">
                <Label className="text-[#4A4B68] font-medium text-[14px]">Total Candidates <span className="text-red-500">*</span></Label>
                <Input type="number" className="h-[46px] border-[#CBD5E1] rounded-[8px] text-[14px] placeholder:text-[#94A3B8]" placeholder="Enter total candidates" value={basicInfo.totalCandidates} onChange={(e) => setBasicInfo({ ...basicInfo, totalCandidates: e.target.value })} />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[#4A4B68] font-medium text-[14px]">Total Slots <span className="text-red-500">*</span></Label>
                <Select value={basicInfo.totalSlots} onValueChange={(val) => setBasicInfo({ ...basicInfo, totalSlots: val || '' })}>
                  <SelectTrigger className="w-full h-[46px] border-[#CBD5E1] rounded-[8px] text-[14px] text-[#94A3B8]"><SelectValue placeholder="Select total slots" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2.5">
                <Label className="text-[#4A4B68] font-medium text-[14px]">Total Question Set <span className="text-red-500">*</span></Label>
                <Select value={basicInfo.questionSets} onValueChange={(val) => setBasicInfo({ ...basicInfo, questionSets: val || '' })}>
                  <SelectTrigger className="w-full h-[46px] border-[#CBD5E1] rounded-[8px] text-[14px] text-[#94A3B8]"><SelectValue placeholder="Select total question set" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[#4A4B68] font-medium text-[14px]">Question Type <span className="text-red-500">*</span></Label>
                <Select value={basicInfo.questionType} onValueChange={(val) => setBasicInfo({ ...basicInfo, questionType: val || '' })}>
                  <SelectTrigger className="w-full h-[46px] border-[#CBD5E1] rounded-[8px] text-[14px] text-[#94A3B8]"><SelectValue placeholder="Select question type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                    <SelectItem value="mixed">Mixed Types</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2.5 relative">
                <Label className="text-[#4A4B68] font-medium text-[14px]">Start Time <span className="text-red-500">*</span></Label>
                <Input type="datetime-local" className="h-[46px] border-[#CBD5E1] rounded-[8px] text-[14px] text-[#4A4B68] placeholder:text-[#94A3B8]" placeholder="Enter start time" value={basicInfo.startTime} onChange={(e) => setBasicInfo({ ...basicInfo, startTime: e.target.value })} />
              </div>
              <div className="space-y-2.5 relative">
                <Label className="text-[#4A4B68] font-medium text-[14px]">End Time <span className="text-red-500">*</span></Label>
                <Input type="datetime-local" className="h-[46px] border-[#CBD5E1] rounded-[8px] text-[14px] text-[#4A4B68] placeholder:text-[#94A3B8]" placeholder="Enter end time" value={basicInfo.endTime} onChange={(e) => setBasicInfo({ ...basicInfo, endTime: e.target.value })} />
              </div>
            </div>
            
            <div className="space-y-2.5">
              <Label className="text-[#4A4B68] font-medium text-[14px]">Duration (Minutes)</Label>
              <Input type="number" className="h-[46px] border-[#CBD5E1] rounded-[8px] text-[14px] text-[#4A4B68] placeholder:text-[#94A3B8]" placeholder="Duration Time" value={basicInfo.duration} onChange={(e) => setBasicInfo({ ...basicInfo, duration: e.target.value })} />
            </div>
          </div>
          
          <DialogFooter className="mt-6 border-t border-[#E2E8F0] pt-4">
            <Button variant="outline" className="border-[#CBD5E1] text-[#4A4B68] font-semibold" onClick={() => setIsEditingBasicInfo(false)}>Cancel</Button>
            <Button className="bg-[#6633FF] hover:bg-[#6633FF]/90 text-white font-bold px-6" onClick={saveBasicInfoEditsAndProceed}>Save & Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Modal for Editing Questions (From Step 2) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden bg-white rounded-[16px] shadow-2xl border-0">
          
          {/* Header Row */}
          <div className="bg-white px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border border-[#CBD5E1] flex items-center justify-center text-[12px] font-medium text-[#64748B]">
                1
              </div>
              <h2 className="text-[15px] font-bold text-[#1B1C31]">Question Edit</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#4A4B68]">Score:</span>
                <Input type="number" min="1" value={qScore} onChange={(e) => setQScore(Number(e.target.value) || 1)} className="w-[50px] h-9 text-center border-[#CBD5E1] rounded-[6px]" />
              </div>
              <Select value={qType} onValueChange={(val) => setQType(val || 'checkbox')}>
                <SelectTrigger className="w-[125px] h-9 border-[#CBD5E1] rounded-[6px] text-[13px] font-bold text-[#4A4B68]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="radio">Radio</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
              <button className="text-[#94A3B8] hover:text-[#EF4444] transition-colors ml-1 p-1 rounded-md hover:bg-red-50" onClick={() => setIsModalOpen(false)}>
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Main Scrollable Content */}
          <div className="px-6 py-8 overflow-y-auto max-h-[60vh] bg-white space-y-6">
            <RichTextEditorMock value={qTitle} onChange={(e: any) => setQTitle(e.target.value)} placeholder="Type question prompt here..." />

            <div className="space-y-6 pb-4">
              {(qType === 'text' ? [''] : qOptions).map((opt, index) => (
                <div key={index} className="flex gap-4 items-start pt-2">
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="w-[22px] h-[22px] rounded-full border border-[#CBD5E1] flex items-center justify-center text-[11px] font-medium text-[#64748B] bg-white mt-2">
                      {String.fromCharCode(65 + index)}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      {qType !== 'text' ? (
                        <label className="flex items-center gap-2 cursor-pointer group">
                          {qType === 'checkbox' ? (
                            <input type="checkbox" checked={qCorrect.includes(index)} onChange={() => toggleCorrectAnswer(index)} className="w-4 h-4 rounded border-[#CBD5E1] text-primary focus:ring-primary/20 cursor-pointer" />
                          ) : (
                            <input type="radio" checked={qCorrect.includes(index)} onChange={() => toggleCorrectAnswer(index)} className="w-4 h-4 border-[#CBD5E1] text-primary focus:ring-primary/20 cursor-pointer" />
                          )}
                          <span className="text-[13px] text-[#64748B] group-hover:text-[#4A4B68] transition-colors">Set as correct answer</span>
                        </label>
                      ) : (
                        <div /> // spacer
                      )}
                      
                      <button className="text-[#94A3B8] hover:text-[#EF4444] transition-colors mr-1 p-1 rounded-md hover:bg-red-50" onClick={() => removeOption(index)}>
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                    
                    <RichTextEditorMock value={opt} onChange={(e: any) => updateOption(index, e.target.value)} placeholder="" />
                  </div>
                </div>
              ))}
            </div>

            {qType !== 'text' && (
              <div className="flex items-center pl-10 pb-4">
                <button className="flex items-center gap-2 text-[#6633FF] font-medium text-[13px] hover:underline transition-all group" onClick={() => setQOptions([...qOptions, ''])}>
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Another options
                </button>
              </div>
            )}
          </div>
          
          {/* Footer Row */}
          <div className="bg-white px-6 py-5 flex justify-end gap-4 sticky bottom-0 z-10 border-t border-[#F1F5F9]">
            <Button variant="outline" className="h-10 w-[120px] rounded-[8px] border-[#6633FF] text-[#6633FF] hover:bg-[#6633FF]/5 font-semibold text-[14px]" onClick={() => { setIsModalOpen(false); }}>
              Save
            </Button>
            <Button className="h-10 w-[160px] rounded-[8px] bg-[#6633FF] hover:bg-[#6633FF]/90 text-white font-semibold text-[14px]" onClick={() => { saveQuestion(); setIsModalOpen(false); }}>
              Save & Add More
            </Button>
          </div>
          
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
