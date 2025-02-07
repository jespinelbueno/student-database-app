import { NextResponse } from "next/server"
import { DocumentAnalysis, StudentData } from "@/lib/students"

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

    // Mock data with variations based on file type
    const mockData = {
      firstName: file.name.includes("transcript") ? "John" : "Jane",
      lastName: file.name.includes("transcript") ? "Doe" : "Smith",
      email: file.name.includes("transcript") ? "john.doe@example" : "jane.smith@school.edu",
      graduationYear: file.name.includes("transcript") ? 2024 : 2026,
      phoneNumber: "123-456-789",  // Intentionally incorrect format
      promisingStudent: file.name.includes("honors"),
      schoolOrg: file.name.includes("transcript") ? "Sample High School" : "",
      state: file.name.includes("transcript") ? "California" : "CA",
    }

    // Validate the extracted data
    const { missingFields, suggestedActions, confidence } = validateExtractedData(mockData)

    const mockAnalysis: DocumentAnalysis = {
      extractedData: mockData,
      confidence,
      missingFields,
      suggestedActions,
    }

    // Simulate processing time based on file size
    await new Promise(resolve => setTimeout(resolve, Math.min(file.size / 1000, 3000)))

    return NextResponse.json(mockAnalysis)
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    )
  }
} 