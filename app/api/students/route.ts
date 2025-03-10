import { NextResponse } from 'next/server'
import { createStudent, getAllStudents, getStudent, updateStudent, deleteStudent } from '@/lib/students'
import { CreateStudentInput, UpdateStudentInput } from '@/lib/students'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const parsedID = Number(id);
      if (isNaN(parsedID)) {
        return NextResponse.json({ error: 'Invalid student ID format' }, { status: 400 });
      }
      const student = await getStudent(parsedID);
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
      return NextResponse.json(student);
    } else {
      const students = await getAllStudents();
      return NextResponse.json(students);
    }
  } catch (error) {
    console.error('Error in GET /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data: CreateStudentInput = await request.json();
    const student = await createStudent(data);
    return NextResponse.json(student);
  } catch (error) {
    console.error('Error in POST /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing student ID' }, { status: 400 });
    }
    
    const parsedID = Number(id);
    if (isNaN(parsedID)) {
      return NextResponse.json({ error: 'Invalid student ID format' }, { status: 400 });
    }

    const data: UpdateStudentInput = await request.json();
    const student = await updateStudent(parsedID, data);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error) {
    console.error('Error in PUT /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing student ID' }, { status: 400 });
    }
    
    const parsedID = Number(id);
    if (isNaN(parsedID)) {
      return NextResponse.json({ error: 'Invalid student ID format' }, { status: 400 });
    }

    const student = await deleteStudent(parsedID);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
