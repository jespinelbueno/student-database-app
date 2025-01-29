// app/api/students/[id]/route.ts
import { NextResponse } from 'next/server';
import { updateStudent, deleteStudent } from '@/lib/students';
import { UpdateStudentInput } from '@/lib/students';

export async function PUT(
  request: Request,
  context: { params: { [key: string]: string | string[] } } // <-- Use dynamic typing
) {
  try {
    // Extract and validate the ID
    const { id } = context.params;
    if (!id || Array.isArray(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Process the update
    const data: UpdateStudentInput = await request.json();
    const updatedStudent = await updateStudent(studentId, data);
    
    if (!updatedStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Error in PUT /api/students/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { [key: string]: string | string[] } } // <-- Same fix here
) {
  try {
    // Extract and validate the ID
    const { id } = context.params;
    if (!id || Array.isArray(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Process the deletion
    const success = await deleteStudent(studentId);
    
    if (!success) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/students/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}