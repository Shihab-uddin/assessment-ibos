import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const user = await decrypt(token);
    
    if (!user || user.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 401 });
    }

    const { id } = await params;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            title: true,
            type: true,
            options: true
            // we omit correct answers if any were stored, but we don't have those in schema yet
          }
        }
      }
    });

    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    // Ensure candidate has an attempt or create one
    let attempt = await prisma.attempt.findFirst({
      where: { examId: id, candidateId: user.id }
    });

    if (!attempt) {
      attempt = await prisma.attempt.create({
        data: {
          examId: id,
          candidateId: user.id,
          status: 'in_progress',
        }
      });
    }

    return NextResponse.json({ exam, attempt });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
