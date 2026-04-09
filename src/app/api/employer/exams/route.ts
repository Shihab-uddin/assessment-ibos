import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const user = await decrypt(token);
    
    if (!user || user.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 401 });
    }

    const exams = await prisma.exam.findMany({
      where: { employerId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ exams });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const user = await decrypt(token);
    
    if (!user || user.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 401 });
    }

    const data = await req.json();
    const { title, totalCandidates, totalSlots, questionSets, questionType, startTime, endTime, duration, questions } = data;

    const newExam = await prisma.exam.create({
      data: {
        title,
        totalCandidates: Number(totalCandidates),
        totalSlots: Number(totalSlots),
        questionSets: Number(questionSets),
        questionType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: Number(duration),
        employerId: user.id,
        questions: {
          create: questions.map((q: any) => ({
            title: q.title,
            type: q.type,
            options: JSON.stringify(q.options || []),
          }))
        }
      }
    });

    return NextResponse.json({ message: 'Exam created', exam: newExam }, { status: 201 });
  } catch (err) {
    console.error('Create Exam Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
