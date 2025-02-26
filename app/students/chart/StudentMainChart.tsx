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
import { GraduationCap, MapPin, Building2, Map, Network, BarChart } from "lucide-react";
import { StudentKPICards } from "@/components/StudentKPICards";
import { StudentTrendAnalysis } from "@/components/StudentTrendAnalysis";
import { StudentStateDistribution } from "@/components/StudentStateDistribution";
import { NEUTRAL_COLORS } from "@/lib/colors";

interface StudentMainChartProps {
  initialStudents: Student[]
}

export function StudentMainChart({ initialStudents }: StudentMainChartProps) {
  return (
    <div className="container bg-zinc-900 mx-auto space-y-8" style={{ backgroundColor: NEUTRAL_COLORS.background }}>
      {/* Header with Download Report Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100" style={{ color: NEUTRAL_COLORS.text.primary }}>Student Analytics Dashboard</h1>
          <p className="text-zinc-400 text-sm" style={{ color: NEUTRAL_COLORS.text.secondary }}>Comprehensive view of student data and metrics</p>
        </div>
        <Card className="bg-zinc-800 border-zinc-700 w-full md:w-auto" style={{ backgroundColor: NEUTRAL_COLORS.card, borderColor: NEUTRAL_COLORS.border }}>
          <CardContent className="p-4">
            <GenerateReport students={initialStudents} />
          </CardContent>
        </Card>
      </div>
      
      {/* KPI Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-zinc-100" style={{ color: NEUTRAL_COLORS.text.primary }}>Key Performance Indicators</h2>
          <div className="h-px flex-grow bg-zinc-700" style={{ backgroundColor: NEUTRAL_COLORS.border }}></div>
        </div>
        <StudentKPICards students={initialStudents} />
      </section>
      
      {/* Trend Analysis Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-zinc-100" style={{ color: NEUTRAL_COLORS.text.primary }}>Growth & Distribution</h2>
          <div className="h-px flex-grow bg-zinc-700" style={{ backgroundColor: NEUTRAL_COLORS.border }}></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StudentTrendAnalysis students={initialStudents} />
          <StudentStateDistribution students={initialStudents} />
        </div>
      </section>
      
      {/* Detailed Charts Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-zinc-100" style={{ color: NEUTRAL_COLORS.text.primary }}>Detailed Analytics</h2>
          <BarChart className="h-5 w-5 text-zinc-400" style={{ color: NEUTRAL_COLORS.text.secondary }} />
          <div className="h-px flex-grow bg-zinc-700" style={{ backgroundColor: NEUTRAL_COLORS.border }}></div>
        </div>
        
        <Tabs defaultValue="graduationChart">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 w-full h-auto p-1 bg-zinc-800 rounded-lg gap-1" 
                   style={{ backgroundColor: NEUTRAL_COLORS.card }}>
            <TabsTrigger 
              value="graduationChart" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
              style={{ 
                "--active-bg": NEUTRAL_COLORS.border,
                "--active-text": NEUTRAL_COLORS.text.primary
              } as React.CSSProperties}
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Graduation Year</span>
              <span className="sm:hidden">Year</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stateChart" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
              style={{ 
                "--active-bg": NEUTRAL_COLORS.border,
                "--active-text": NEUTRAL_COLORS.text.primary
              } as React.CSSProperties}
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">State Distribution</span>
              <span className="sm:hidden">States</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cityChart" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
              style={{ 
                "--active-bg": NEUTRAL_COLORS.border,
                "--active-text": NEUTRAL_COLORS.text.primary
              } as React.CSSProperties}
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">City Distribution</span>
              <span className="sm:hidden">Cities</span>
            </TabsTrigger>
            <TabsTrigger 
              value="usMap" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
              style={{ 
                "--active-bg": NEUTRAL_COLORS.border,
                "--active-text": NEUTRAL_COLORS.text.primary
              } as React.CSSProperties}
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">US Distribution</span>
              <span className="sm:hidden">Map</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sunburst" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
              style={{ 
                "--active-bg": NEUTRAL_COLORS.border,
                "--active-text": NEUTRAL_COLORS.text.primary
              } as React.CSSProperties}
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
      </section>
      
      {/* Footer with additional info */}
      <div className="text-center text-zinc-500 text-sm pb-8">
        <p>Data updated in real-time • Export reports for offline analysis</p>
      </div>
    </div>
  );
}
