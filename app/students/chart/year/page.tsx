import { getAllStudents } from '@/lib/students'
import { StudentGraduationYearChart } from './StudentGraduationYearChart'

export default async function ChartPage() {
  const students = await getAllStudents()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Student Graduation Year Distribution</h1>
      <StudentGraduationYearChart students={students} />
    </div>
  )
}