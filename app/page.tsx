import { getAllStudents } from '@/lib/students'
import StudentList from './students/list/StudentList'
import { StudentGraduationYearChart } from './students/chart/year/StudentGraduationYearChart'
import { StudentStateDistributionChart } from './students/chart/state/StudentStateDistributionChart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function HomePage() {
  const students = await getAllStudents()
  return (
    <div className="container bg-zinc-100 mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Student Management Dashboard</h1>
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Student List</TabsTrigger>
          <TabsTrigger value="graduationChart">Graduation Year Chart</TabsTrigger>
          <TabsTrigger value="stateChart">State Distribution Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <StudentList initialStudents={students} />
        </TabsContent>
        <TabsContent value="graduationChart">
          <StudentGraduationYearChart students={students} />
        </TabsContent>
        <TabsContent value="stateChart">
          <StudentStateDistributionChart students={students} />
        </TabsContent>
      </Tabs>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  )}
