import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Student } from '@/lib/students'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { getPrimaryColor } from '@/lib/colors'

interface StudentStateDistributionProps {
  students: Student[]
}

export function StudentStateDistribution({ students }: StudentStateDistributionProps) {
  const stateData = useMemo(() => {
    // Group students by state
    const stateGroups = students.reduce((acc, student) => {
      const state = student.state || 'Unknown'
      
      if (!acc[state]) {
        acc[state] = {
          state,
          count: 0,
          promising: 0
        }
      }
      
      acc[state].count++
      if (student.promisingStudent) {
        acc[state].promising++
      }
      
      return acc
    }, {} as Record<string, { state: string, count: number, promising: number }>)
    
    // Convert to array and sort by count
    return Object.values(stateGroups)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 states
  }, [students])
  
  // Calculate total students in top states
  const totalInTopStates = stateData.reduce((sum, item) => sum + item.count, 0)
  const totalStudents = students.length
  const topStatesPercentage = Math.round((totalInTopStates / totalStudents) * 100)
  
  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-zinc-100">State Distribution</CardTitle>
        <CardDescription className="text-zinc-400">
          Top {stateData.length} states ({topStatesPercentage}% of students)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex h-[300px]">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={stateData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                label={({ state }) => state}
                labelLine={false}
              >
                {stateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPrimaryColor(index)} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [`${value} students`, props.payload.state]}
                contentStyle={{ 
                  backgroundColor: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  color: '#e4e4e7'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="w-1/2 overflow-auto max-h-[300px] pl-4">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-zinc-400 pb-2">State</th>
                  <th className="text-right text-zinc-400 pb-2">Students</th>
                  <th className="text-right text-zinc-400 pb-2">Promising</th>
                </tr>
              </thead>
              <tbody>
                {stateData.map((item, index) => (
                  <tr key={item.state} className="border-t border-zinc-700 text-white">
                    <td className="py-2 flex items-center">
                      <div 
                        className="h-3 w-3 rounded-full mr-2" 
                        style={{ backgroundColor: getPrimaryColor(index) }}
                      ></div>
                      {item.state}
                    </td>
                    <td className="py-2 text-right">{item.count}</td>
                    <td className="py-2 text-right text-amber-500">{item.promising}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 