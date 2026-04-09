import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const user = await decrypt(token);
    
    if (!user || user.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const attempt = await prisma.attempt.findFirst({
        where: { examId: id, candidateId: user.id }
    });

    if (!attempt) {
        return NextResponse.json({ error: 'No active attempt' }, { status: 404 });
    }

    if (attempt.status !== 'in_progress') {
        return NextResponse.json({ error: 'Attempt already processed' }, { status: 400 });
    }

    await prisma.attempt.update({
        where: { id: attempt.id },
        data: {
            status: body.status || 'completed',
            answers: JSON.stringify(body.answers || {}),
            endTime: new Date()
        }
    });

    return NextResponse.json({ message: 'Exam submitted successfully' });

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
