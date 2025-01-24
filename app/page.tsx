
import { getAllStudents } from "@/lib/students";
import StudentList from "./students/list/StudentList";
import { StudentMainChart } from "./students/chart/main/StudentMainChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function HomePage() {
  const students = await getAllStudents();
  return (
    <div className="container bg-zinc-100 mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Student Management Dashboard</h1>
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Student List</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>

        </TabsList>
        <TabsContent value="list">
          <StudentList initialStudents={students} />
        </TabsContent>
        <TabsContent value="charts">
          <StudentMainChart initialStudents={students}></StudentMainChart>
        </TabsContent>
      </Tabs>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );

  
}
