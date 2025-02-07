import { NextResponse } from "next/server"
import { DocumentAnalysis, StudentData } from "@/lib/students"
import { processDocument } from "@/lib/ai-utils"

function validateExtractedData(data: StudentData) {
  const missingFields = []
  const suggestedActions = []
  let confidence = 1.0

  // Validate required fields
  if (!data.firstName?.trim()) missingFields.push("First Name")
  if (!data.lastName?.trim()) missingFields.push("Last Name")
  if (!data.email?.includes("@")) {
    missingFields.push("Valid Email")
    suggestedActions.push("Verify email format")
    confidence *= 0.8
  }
  if (!data.graduationYear || data.graduationYear < new Date().getFullYear()) {
    suggestedActions.push("Confirm graduation year is in the future")
    confidence *= 0.9
  }
  if (!data.schoolOrg?.trim()) missingFields.push("School/Organization")

  // Validate data quality
  if (data.phoneNumber && !/^\d{3}-\d{3}-\d{4}$/.test(data.phoneNumber)) {
    suggestedActions.push("Format phone number as XXX-XXX-XXXX")
    confidence *= 0.95
  }
  if (data.state && data.state.length !== 2) {
    suggestedActions.push("Use two-letter state code")
    confidence *= 0.95
  }

  return { missingFields, suggestedActions, confidence }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Process the document using our AI utilities
    const extractedData = await processDocument(file)
    
    // Validate the extracted data
    const { missingFields, suggestedActions, confidence } = validateExtractedData(extractedData)

    const analysis: DocumentAnalysis = {
      extractedData,
      confidence,
      missingFields,
      suggestedActions,
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    )
  }
} 