import { NextResponse } from 'next/server';
import { getAllStudentEmails } from '@/lib/students';

export async function GET() {
  try {
    const emails = await getAllStudentEmails();
    return NextResponse.json(emails);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch student emails' },
      { status: 500 }
    );
  }
}