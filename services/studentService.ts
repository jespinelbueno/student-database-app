// src/services/studentService.ts
import { Student, CreateStudentInput, UpdateStudentInput } from '@/lib/students'

export const fetchStudents = async (): Promise<Student[]> => {
  const response = await fetch('/api/students')
  if (!response.ok) throw new Error('Failed to fetch students')
  return response.json()
}

export const createStudent = async (data: CreateStudentInput): Promise<Student> => {
  const response = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create student')
  return response.json()
}

export const updateStudent = async (
  id: number,
  data: UpdateStudentInput
): Promise<Student> => {
  const response = await fetch(`/api/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update student')
  }
  return response.json()
}

export const deleteStudent = async (id: number): Promise<void> => {
  const response = await fetch(`/api/students/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete student')
}
