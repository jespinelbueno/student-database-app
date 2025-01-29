import { NextRequest, NextResponse } from "next/server";
import { updateStudent, deleteStudent } from "@/lib/students";
import { UpdateStudentInput } from "@/lib/students";

// Correct PUT request handler
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Ensure ID is a valid number
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: "Invalid numeric ID" },
        { status: 400 }
      );
    }

    // Process update
    const data: UpdateStudentInput = await req.json();
    const updatedStudent = await updateStudent(studentId, data);
    
    if (!updatedStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Correct DELETE request handler
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Ensure ID is a valid number
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: "Invalid numeric ID" },
        { status: 400 }
      );
    }

    // Process deletion
    const success = await deleteStudent(studentId);
    if (!success) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
