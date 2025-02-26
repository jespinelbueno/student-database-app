import { NextResponse } from 'next/server';
import { PrismaClient, Student } from '@prisma/client';
import * as XLSX from 'xlsx';

// Initialize Prisma Client globally
const prisma = new PrismaClient();

interface DownloadStudentsRequest {
  studentIds: string[];
  visibleColumns?: {
    [key: string]: boolean;
  };
}

interface ApiError {
  message: string;
}

// Define a type for the filtered student data
type FilteredStudent = Partial<Student> & { id: number };

export async function POST(request: Request) {
  try {
    console.log('Received request to download students');

    // Parse and validate the request body
    const body: DownloadStudentsRequest = await request.json();
    const { studentIds, visibleColumns } = body;
    
    console.log('Student IDs:', studentIds);
    
    // Ensure the student IDs are valid and convert them to numbers
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || 
        !studentIds.every(id => !isNaN(Number(id)))) {
      return new NextResponse('Invalid or empty student IDs', { status: 400 });
    }

    // Convert string IDs to numbers
    const numericStudentIds = studentIds.map(id => Number(id));

    // Fetch students from the database using numeric IDs
    console.log('Fetching students from database');
    const students = await prisma.student.findMany({
      where: {
        id: { in: numericStudentIds }
      }
    });
    
    if (students.length === 0) {
      return new NextResponse('No students found with the provided IDs', { status: 404 });
    }

    // Filter student data based on visible columns if provided
    let processedStudents: Student[] | FilteredStudent[] = students;
    if (visibleColumns) {
      processedStudents = students.map(student => {
        const filteredStudent: FilteredStudent = {
          id: student.id
        };
        
        // Map column visibility to actual student fields
        if (visibleColumns.firstName) filteredStudent.firstName = student.firstName;
        if (visibleColumns.lastName) filteredStudent.lastName = student.lastName;
        if (visibleColumns.graduationYear) filteredStudent.graduationYear = student.graduationYear;
        if (visibleColumns.email) filteredStudent.email = student.email;
        if (visibleColumns.phoneNumber) filteredStudent.phoneNumber = student.phoneNumber;
        if (visibleColumns.state) filteredStudent.state = student.state;
        if (visibleColumns.schoolOrg) filteredStudent.schoolOrg = student.schoolOrg;
        if (visibleColumns.promisingStudent) filteredStudent.promisingStudent = student.promisingStudent;
        
        // Include other fields that might not be in the UI but are useful for exports
        filteredStudent.createdAt = student.createdAt;
        filteredStudent.updatedAt = student.updatedAt;
        
        // Include address fields if state is visible (assuming they're related)
        if (visibleColumns.state) {
          filteredStudent.address = student.address;
          filteredStudent.city = student.city;
          filteredStudent.zipCode = student.zipCode;
        }
        
        return filteredStudent;
      });
    }

    // Create Excel workbook
    console.log('Creating Excel workbook');
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(processedStudents);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Write workbook to buffer
    console.log('Writing workbook to buffer');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send response with content length
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="students.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Length': buffer.byteLength.toString(), // Explicit content length
      },
    });
  } catch (error: unknown) {
    console.error('Error generating spreadsheet:', error);
    
    const apiError: ApiError = {
      message: error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while generating the spreadsheet',
    };
    
    return new NextResponse(JSON.stringify(apiError), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
  }
}
