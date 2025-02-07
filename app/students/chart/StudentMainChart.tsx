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
    <div className="container bg-zinc-900 mx-auto">
      <Tabs defaultValue="graduationChart">
        <TabsList className="bg-zinc-800 p-1"> 
          <TabsTrigger value="graduationChart" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100">
            Graduation Year Chart
          </TabsTrigger>
          <TabsTrigger value="stateChart" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100">
            State Distribution Chart
          </TabsTrigger>
          <TabsTrigger value="cityChart" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100">
            City Distribution Chart
          </TabsTrigger>
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
