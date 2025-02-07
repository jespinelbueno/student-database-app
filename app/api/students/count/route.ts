import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const count = await prisma.student.count()
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Failed to get student count:", error)
    return NextResponse.json(
      { error: "Failed to get student count" },
      { status: 500 }
    )
  }
} 