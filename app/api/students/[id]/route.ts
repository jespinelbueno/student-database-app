// app/api/students/[id]/route.ts
import { NextResponse } from 'next/server';
import { updateStudent, deleteStudent } from '@/lib/students';
import { UpdateStudentInput } from '@/lib/students';

export async function PUT(
  request: Request,
  { params }: { params: Record<string, string | string[]> }
) {
  try {
    // Extract and validate ID
    const id = params.id;
    if (Array.isArray(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: "Invalid numeric ID" },
        { status: 400 }
      );
    }

    // Process update
    const data: UpdateStudentInput = await request.json();
    const updatedStudent = await updateStudent(studentId, data);
    
    if (!updatedStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Record<string, string | string[]> }
) {
  try {
    // Extract and validate ID
    const id = params.id;
    if (Array.isArray(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: "Invalid numeric ID" },
        { status: 400 }
      );
    }

    // Process deletion
    const success = await deleteStudent(studentId);
    if (!success) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Student deleted successfully" }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}