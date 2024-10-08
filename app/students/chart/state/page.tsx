import { getAllStudents } from '@/lib/students'
import { StudentStateDistributionChart } from './StudentStateDistributionChart'

export default async function StateChartPage() {
  const students = await getAllStudents()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Student Graduation Year Distribution</h1>
      <StudentStateDistributionChart students={students} />
    </div>
  )
}