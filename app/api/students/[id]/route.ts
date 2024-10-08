import { NextResponse } from 'next/server'
import { updateStudent, deleteStudent } from '@/lib/students'
import { UpdateStudentInput } from '@/lib/students'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }
    const data: UpdateStudentInput = await request.json()
    const updatedStudent = await updateStudent(id, data)
    
    if (!updatedStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Error in PUT /api/students/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }
    const success = await deleteStudent(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/students/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}