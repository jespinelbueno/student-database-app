import { NextResponse } from "next/server"
import { NLQueryResult, Student } from "@/lib/students"
import { prisma } from "@/lib/db"
import { processNaturalLanguageQuery } from "@/lib/ai-utils"
import { Prisma } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: "No query provided" },
        { status: 400 }
      )
    }

    // Process the query using our AI utilities
    const { queryInterpretation, filters, confidence } = processNaturalLanguageQuery(query)

    // Build the Prisma query based on the filters
    const where: Prisma.StudentWhereInput = {
      AND: filters.map(filter => {
        const field = filter.field as keyof Student
        switch (filter.operation) {
          case 'equals':
            return { [field]: filter.value }
          case 'contains':
            return { [field]: { contains: filter.value, mode: 'insensitive' } }
          case 'greaterThan':
            return { [field]: { gt: filter.value } }
          case 'lessThan':
            return { [field]: { lt: filter.value } }
          default:
            return {}
        }
      })
    }

    // Query the database
    const students = await prisma.student.findMany({ where })

    // Return the results
    const result: NLQueryResult = {
      queryInterpretation,
      filters,
      confidence,
      students,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing natural language query:", error)
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    )
  }
} 