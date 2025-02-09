import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to sanitize input strings
function sanitizeString(str: string | null): string | null {
  if (!str) return str;
  return str
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Helper function to sanitize student input
function sanitizeStudentInput<T extends Record<string, string | number | boolean | null>>(data: T): T {
  const sanitized = { ...data };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    }
  }
  return sanitized;
}

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
    // Sanitize input data
    const sanitizedData = sanitizeStudentInput(data);

    // Validate email format
    if (!sanitizedData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email format');
    }

    // Validate phone number format if provided
    if (sanitizedData.phoneNumber && !sanitizedData.phoneNumber.match(/^\d{3}-\d{3}-\d{4}$/)) {
      throw new Error('Invalid phone number format');
    }

    const student = await prisma.student.create({
      data: sanitizedData
    })

    return student
  } catch (error) {
    console.error('Error creating student:', error)
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
    // Sanitize input data
    const sanitizedData = sanitizeStudentInput(data);

    // Validate email format if provided
    if (sanitizedData.email && !sanitizedData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email format');
    }

    // Validate phone number format if provided
    if (sanitizedData.phoneNumber && !sanitizedData.phoneNumber.match(/^\d{3}-\d{3}-\d{4}$/)) {
      throw new Error('Invalid phone number format');
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: sanitizedData,
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

export interface DocumentAnalysis {
  extractedData: StudentData;
  confidence: number;
  missingFields: string[];
  suggestedActions: string[];
}

export interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  graduationYear: number;
  phoneNumber?: string;
  promisingStudent?: boolean;
  schoolOrg: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface NLQueryResult {
  students: Student[];
  queryInterpretation: string;
  filters: QueryFilter[];
  confidence: number;
}

export interface QueryFilter {
  field: keyof Student;
  operation: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
  confidence: number;
}