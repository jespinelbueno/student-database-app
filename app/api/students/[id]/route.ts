import { NextResponse } from "next/server";
import { updateStudent, deleteStudent } from "@/lib/students";
import { UpdateStudentInput } from "@/lib/students";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ Await params inside the function
//changes 
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 Use Promise<{ id: string }>
) {
  try {
    const { id } = await context.params; // 👈 Await params

    const studentId = Number(id);
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid numeric ID" }, { status: 400 });
    }

    // Process update
    const data: UpdateStudentInput = await req.json();
    const updatedStudent = await updateStudent(studentId, data);
    
    if (!updatedStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ Apply the same fix for DELETE
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 Use Promise<{ id: string }>
) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only administrators can delete students." },
        { status: 401 }
      );
    }

    const { id } = await context.params; // 👈 Await params

    const studentId = Number(id);
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid numeric ID" }, { status: 400 });
    }

    const success = await deleteStudent(studentId);
    if (!success) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
