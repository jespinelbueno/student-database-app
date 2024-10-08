import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

// Initialize Prisma Client
const prisma = new PrismaClient()

// Define types for request body and error response
interface DownloadStudentsRequest {
  studentIds: string[];
}

interface ApiError {
  message: string;
}

export async function POST(request: Request) {
  try {
    console.log('Received request to download students')
    
    // Parse the request body
    const body: DownloadStudentsRequest = await request.json()
    const { studentIds } = body
    console.log('Student IDs:', studentIds)

    // Validate the input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      console.log('Invalid or empty student IDs')
      return new NextResponse('Invalid or empty student IDs', { status: 400 })
    }

    // Fetch students from the database
    console.log('Fetching students from database')
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds }
      }
    })
    console.log('Fetched students:', students)

    // Check if any students were found
    if (students.length === 0) {
      console.log('No students found with the provided IDs')
      return new NextResponse('No students found with the provided IDs', { status: 404 })
    }

    // Create Excel workbook
    console.log('Creating Excel workbook')
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(students)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

    // Write workbook to buffer
    console.log('Writing workbook to buffer')
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Send response
    console.log('Sending response')
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="students.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
  } catch (error: unknown) {
    console.error('Error generating spreadsheet:', error)
    
    const apiError: ApiError = {
      message: error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while generating the spreadsheet'
    }
    
    return new NextResponse(JSON.stringify(apiError), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    // Disconnect Prisma Client to prevent open handles
    await prisma.$disconnect()
  }
}