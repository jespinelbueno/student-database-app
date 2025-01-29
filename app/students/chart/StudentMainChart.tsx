'use client'

import { TabsTrigger, Tabs, TabsList , TabsContent} from "@/components/ui/tabs";
import { StudentStateDistributionChart } from "./state/StudentStateDistributionChart";
import { StudentGraduationYearChart } from "./year/StudentGraduationYearChart";
import { Student } from '@/lib/students'
import { StudentCityDistributionChart } from "./city/StudentCityDistributionChart";


interface StudentMainChartProps {
    initialStudents: Student[]
  }
export function StudentMainChart({ initialStudents }: StudentMainChartProps) {
    console.log("Initial Students in StudentMainChart:", initialStudents);

  return (
    <div className="container bg-zinc-100 mx-auto">
      <Tabs defaultValue="graduationChart">
        <TabsList> 
        <TabsTrigger value="graduationChart">Graduation Year Chart</TabsTrigger>
        <TabsTrigger value="stateChart">State Distribution Chart</TabsTrigger>
        <TabsTrigger value="cityChart">City Distribution CHart</TabsTrigger>
        </TabsList>

        <TabsContent value="graduationChart">
          <StudentGraduationYearChart students={initialStudents} />
        </TabsContent>
        <TabsContent value="stateChart">
          <StudentStateDistributionChart students={initialStudents} />
        </TabsContent>
        <TabsContent value="cityChart">
          <StudentCityDistributionChart students={initialStudents}></StudentCityDistributionChart>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
