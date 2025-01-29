import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type Student = {
  id: number
  firstName: string
  lastName: string
  email: string
  graduationYear: number
  phoneNumber?: string | null
  promisingStudent: boolean
  schoolOrg: string
  createdAt: Date
  updatedAt: Date
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
}

export type CreateStudentInput = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateStudentInput = Partial<CreateStudentInput>

export async function createStudent(data: CreateStudentInput): Promise<Student> {
  try {
    console.log('Creating student with data:', data);  // Log the data being passed to createStudent

    const student = await prisma.student.create({
      data: {
        ...data,
        state: data.state || null,  // Ensure this handles null values correctly
      }
    })

    console.log('Created student:', student);  // Log the created student object
    return student
  } catch (error) {
    console.error('Error creating student:', error)  // Log detailed error
    throw new Error('Failed to create student')
  }
}

export async function createStudents(data: CreateStudentInput[]): Promise<Student[]> {
  if (!Array.isArray(data)) {
    throw new TypeError('Expected data to be an array of CreateStudentInput');
  }

  return Promise.all(data.map((item) => createStudent(item)));
}


export async function updateStudent(id: number, data: UpdateStudentInput): Promise<Student | null> {
  try {
    const updatedStudent = await prisma.student.update({
      where: { id },
      data,
    })
    return updatedStudent
  } catch (error) {
    console.error('Error updating student:', error)
    return null
  }
}

export async function getStudent(id: number): Promise<Student | null> {
  return prisma.student.findUnique({ where: { id } })
}

export async function getAllStudents(): Promise<Student[]> {
  return prisma.student.findMany()
}

export async function deleteStudent(id: number): Promise<boolean> {
  try {
    await prisma.student.delete({ where: { id } })
    return true
  } catch (error) {
    console.error('Error deleting student:', error)
    return false
  }
}



export async function getAllStudentEmails(): Promise<string[]> {
  try {
    const students = await prisma.student.findMany({
      select: { email: true },
    });
    return students.map(student => student.email);
  } catch (error) {
    console.error('Error fetching student emails:', error);
    throw new Error('Failed to fetch student emails');
  }
}