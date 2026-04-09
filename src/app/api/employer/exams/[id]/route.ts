import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const user = await decrypt(token);
    
    if (!user || user.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 401 });
    }

    const { id } = await params;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: true
      }
    });

    if (!exam || exam.employerId !== user.id) {
      return NextResponse.json({ error: 'Exam not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const user = await decrypt(token);
    
    if (!user || user.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    const { title, totalCandidates, totalSlots, questionSets, questionType, startTime, endTime, duration, questions } = data;

    // Verify ownership
    const existingExam = await prisma.exam.findUnique({ where: { id } });
    if (!existingExam || existingExam.employerId !== user.id) {
      return NextResponse.json({ error: 'Exam not found or unauthorized' }, { status: 404 });
    }

    // Delete existing questions securely
    await prisma.question.deleteMany({
      where: { examId: id }
    });

    // Update existing exam
    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        title,
        totalCandidates: Number(totalCandidates),
        totalSlots: Number(totalSlots),
        questionSets: Number(questionSets),
        questionType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: Number(duration),
        questions: {
          create: questions.map((q: any) => ({
            title: q.title,
            type: q.type,
            options: JSON.stringify(q.options || []),
            score: q.score ? Number(q.score) : 1,
            correctAnswers: JSON.stringify(q.correctAnswers || []),
          }))
        }
      }
    });

    return NextResponse.json({ message: 'Exam updated', exam: updatedExam }, { status: 200 });
  } catch (err) {
    console.error('Update Exam Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
