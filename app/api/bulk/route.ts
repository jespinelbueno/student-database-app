import { NextResponse } from 'next/server';
import { createStudents } from '@/lib/students';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || !Array.isArray(body)) {
      console.error('Invalid payload: Expected an array of students.');
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }

    // Optional: Log body structure for debugging
    console.log('Payload received:', body);

    const createdStudents = await createStudents(body);

    return NextResponse.json({
      message: 'Students created successfully!',
      data: createdStudents,
    });
  } catch (error) {
    console.error('Error in POST /api/bulk:', error);
    return NextResponse.json(
      { error: 'Failed to create students' },
      { status: 500 }
    );
  }
}
