'use client'

import { TabsTrigger, Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import { StudentStateDistributionChart } from "./state/StudentStateDistributionChart";
import { StudentGraduationYearChart } from "./year/StudentGraduationYearChart";
import { Student } from '@/lib/students'
import { StudentCityDistributionChart } from "./city/StudentCityDistributionChart";
import { StudentUSMap } from "./map/StudentUSMap";
import { StudentSunburstChart } from "./sunburst/StudentSunburstChart";
import { GenerateReport } from "@/components/GenerateReport";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, MapPin, Building2, Map, Network } from "lucide-react";

interface StudentMainChartProps {
  initialStudents: Student[]
}

export function StudentMainChart({ initialStudents }: StudentMainChartProps) {
  return (
    <div className="container bg-zinc-900 mx-auto space-y-4">
      <Card className="bg-zinc-800 border-zinc-700">
        <CardContent className="pt-6">
          <GenerateReport students={initialStudents} />
        </CardContent>
      </Card>

      <Tabs defaultValue="graduationChart">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 w-full h-auto p-1 bg-zinc-800 rounded-lg gap-1">
          <TabsTrigger 
            value="graduationChart" 
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Graduation Year</span>
            <span className="sm:hidden">Year</span>
          </TabsTrigger>
          <TabsTrigger 
            value="stateChart" 
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">State Distribution</span>
            <span className="sm:hidden">States</span>
          </TabsTrigger>
          <TabsTrigger 
            value="cityChart" 
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">City Distribution</span>
            <span className="sm:hidden">Cities</span>
          </TabsTrigger>
          <TabsTrigger 
            value="usMap" 
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">US Distribution</span>
            <span className="sm:hidden">Map</span>
          </TabsTrigger>
          <TabsTrigger 
            value="sunburst" 
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
          >
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Hierarchy View</span>
            <span className="sm:hidden">Tree</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="graduationChart">
            <StudentGraduationYearChart students={initialStudents} />
          </TabsContent>
          <TabsContent value="stateChart">
            <StudentStateDistributionChart students={initialStudents} />
          </TabsContent>
          <TabsContent value="cityChart">
            <StudentCityDistributionChart students={initialStudents} />
          </TabsContent>
          <TabsContent value="usMap">
            <StudentUSMap students={initialStudents} />
          </TabsContent>
          <TabsContent value="sunburst">
            <StudentSunburstChart students={initialStudents} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
