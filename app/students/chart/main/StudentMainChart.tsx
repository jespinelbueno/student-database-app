'use client'

import { TabsTrigger, Tabs, TabsList , TabsContent} from "@/components/ui/tabs";
import { StudentStateDistributionChart } from "../state/StudentStateDistributionChart";
import { StudentGraduationYearChart } from "../year/StudentGraduationYearChart";
import { Student } from '@/lib/students'


interface StudentMainChartProps {
    initialStudents: Student[]
  }
export function StudentMainChart({ initialStudents }: StudentMainChartProps) {
    console.log("Initial Students in StudentMainChart:", initialStudents);

  return (
    <div className="container mx-auto py-10">
      <Tabs>
        <TabsList> 
        <TabsTrigger value="graduationChart">Graduation Year Chart</TabsTrigger>
        <TabsTrigger value="stateChart">State Distribution Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="graduationChart">
          <StudentGraduationYearChart students={initialStudents} />
        </TabsContent>
        <TabsContent value="stateChart">
          <StudentStateDistributionChart students={initialStudents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
