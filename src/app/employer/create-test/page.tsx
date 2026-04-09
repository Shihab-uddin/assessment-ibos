'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Edit2, Plus, ArrowLeft, Save } from 'lucide-react';

interface Question {
  id: string; // temp client id
  title: string;
  type: string; // checkbox, radio, text
  options: string[]; // only for checkbox/radio
}

export default function CreateTestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  // Step 2 Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Modal Form State
  const [qTitle, setQTitle] = useState('');
  const [qType, setQType] = useState('radio');
  const [qOptions, setQOptions] = useState(['', '', '', '']);

  const handleNextStep = () => {
    // Basic validation
    if (!basicInfo.title || !basicInfo.duration || !basicInfo.startTime || !basicInfo.endTime) {
      toast.error('Please fill in the required fields.');
      return;
    }
    setStep(2);
  };

  const openAddModal = () => {
    setEditingQuestionId(null);
    setQTitle('');
    setQType('radio');
    setQOptions(['', '', '', '']);
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestionId(q.id);
    setQTitle(q.title);
    setQType(q.type);
    setQOptions(q.options.length ? q.options : ['', '', '', '']);
    setIsModalOpen(true);
  };

  const saveQuestion = () => {
    if (!qTitle.trim()) return toast.error('Question title is required');

    const newQuestion: Question = {
      id: editingQuestionId || Math.random().toString(36).substr(2, 9),
      title: qTitle,
      type: qType,
      options: qType === 'text' ? [] : qOptions.filter(o => o.trim() !== ''),
    };

    if (editingQuestionId) {
      setQuestions(questions.map((q) => (q.id === editingQuestionId ? newQuestion : q)));
    } else {
      setQuestions([...questions, newQuestion]);
    }

    setIsModalOpen(false);
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
      const payload = {
        ...basicInfo,
        questions,
      };
      
      await axios.post('/api/employer/exams', payload);
      toast.success('Exam created successfully!');
      router.push('/employer/dashboard');
    } catch (err) {
      toast.error('Failed to create exam.');
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...qOptions];
    newOptions[index] = value;
    setQOptions(newOptions);
  };

  return (
    <DashboardLayout role="employer">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
        <Button variant="ghost" size="icon" onClick={() => (step === 2 ? setStep(1) : router.back())}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Online Test</h1>
          <p className="text-muted-foreground mt-1 text-sm">Follow the simplified steps to set up a new assessment.</p>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${step === 1 ? 'bg-primary text-white' : 'bg-green-100 text-green-600'}`}>
            1
          </div>
          <div className="h-1 w-16 bg-slate-200">
            <div className={`h-full ${step > 1 ? 'bg-primary' : ''} transition-all duration-300`} />
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${step === 2 ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
            2
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card className="max-w-4xl mx-auto border-none ring-1 ring-slate-100 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Step 1: Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label>Title (Required)</Label>
                <Input value={basicInfo.title} onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })} placeholder="e.g., Senior React Developer Assessment" />
              </div>
              <div className="space-y-2">
                <Label>Total Candidates</Label>
                <Input type="number" value={basicInfo.totalCandidates} onChange={(e) => setBasicInfo({ ...basicInfo, totalCandidates: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Total Slots</Label>
                <Input type="number" value={basicInfo.totalSlots} onChange={(e) => setBasicInfo({ ...basicInfo, totalSlots: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Question Sets</Label>
                <Input type="number" value={basicInfo.questionSets} onChange={(e) => setBasicInfo({ ...basicInfo, questionSets: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={basicInfo.questionType} onValueChange={(val) => setBasicInfo({ ...basicInfo, questionType: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                    <SelectItem value="mixed">Mixed Types</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Time (Required)</Label>
                <Input type="datetime-local" value={basicInfo.startTime} onChange={(e) => setBasicInfo({ ...basicInfo, startTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Time (Required)</Label>
                <Input type="datetime-local" value={basicInfo.endTime} onChange={(e) => setBasicInfo({ ...basicInfo, endTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Duration (Minutes) (Required)</Label>
                <Input type="number" value={basicInfo.duration} onChange={(e) => setBasicInfo({ ...basicInfo, duration: e.target.value })} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-slate-50 pt-6">
            <Button onClick={handleNextStep} className="px-8 shadow-md">Next Step</Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-4xl mx-auto border-none ring-1 ring-slate-100 shadow-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50 mb-6">
            <CardTitle className="text-xl">Step 2: Question Sets</CardTitle>
            <Button variant="outline" size="sm" onClick={openAddModal} className="text-primary border-primary gap-2">
              <Plus className="w-4 h-4" /> Add Question
            </Button>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No questions added yet. Click &apos;Add Question&apos; to begin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="p-4 border rounded-xl shadow-sm bg-slate-50 relative group flex align-middle justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800">Q{i + 1}. {q.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 uppercase font-medium bg-slate-200 inline-block px-2 py-0.5 rounded-full">{q.type}</p>
                      {q.options && q.options.length > 0 && (
                        <ul className="mt-3 space-y-1 pl-4 list-disc text-sm text-slate-600">
                          {q.options.map((opt, oi) => (
                            <li key={oi}>{opt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(q)} className="text-slate-400 hover:text-primary">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)} className="text-slate-400 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end border-t border-slate-50 pt-6 gap-4">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handleSubmit} disabled={loading} className="px-8 shadow-md gap-2.5">
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Exam'}
            </Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuestionId ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question Title</Label>
              <Input placeholder="Enter question..." value={qTitle} onChange={(e) => setQTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Answer Type</Label>
              <Select value={qType} onValueChange={(val) => setQType(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="radio">Radio (Single Choice)</SelectItem>
                  <SelectItem value="checkbox">Checkbox (Multiple Choice)</SelectItem>
                  <SelectItem value="text">Text (Descriptive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {qType !== 'text' && (
              <div className="space-y-3 pt-2">
                <Label>Options</Label>
                {qOptions.map((opt, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input placeholder={`Option ${index + 1}`} value={opt} onChange={(e) => updateOption(index, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={saveQuestion}>Save Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
