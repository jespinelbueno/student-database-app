import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Student } from '@/lib/students'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { STATUS_COLORS } from '@/lib/colors'

interface StudentTrendAnalysisProps {
  students: Student[]
}

export function StudentTrendAnalysis({ students }: StudentTrendAnalysisProps) {
  const trendData = useMemo(() => {
    // Group students by creation date (month/year)
    const studentsByMonth = students.reduce((acc, student) => {
      const createdAt = new Date(student.createdAt)
      const monthYear = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          count: 0,
          promising: 0,
          date: monthYear
        }
      }
      
      acc[monthYear].count++
      if (student.promisingStudent) {
        acc[monthYear].promising++
      }
      
      return acc
    }, {} as Record<string, { count: number, promising: number, date: string }>)
    
    // Convert to array and sort by date
    const sortedData = Object.values(studentsByMonth)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        date: item.date.split('-')[1] + '/' + item.date.split('-')[0].slice(2) // Format as MM/YY
      }))
    
    // Calculate growth metrics
    const last3MonthsStudents = sortedData.slice(-3).reduce((sum, item) => sum + item.count, 0)
    const previous3MonthsStudents = sortedData.slice(-6, -3).reduce((sum, item) => sum + item.count, 0)
    
    const growthRate = previous3MonthsStudents > 0 
      ? ((last3MonthsStudents - previous3MonthsStudents) / previous3MonthsStudents) * 100 
      : 0
    
    return {
      chartData: sortedData,
      growthRate: Math.round(growthRate),
      isPositiveGrowth: growthRate >= 0
    }
  }, [students])
  
  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-zinc-100">Student Growth Trend</CardTitle>
            <CardDescription className="text-zinc-400">
              Monthly student acquisition over time
            </CardDescription>
          </div>
          <div className={`flex items-center px-3 py-1 rounded-full ${
            trendData.isPositiveGrowth ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {trendData.isPositiveGrowth ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium">{Math.abs(trendData.growthRate)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData.chartData}>
            <XAxis
              dataKey="date"
              stroke="#e4e4e7"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#e4e4e7"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                color: '#e4e4e7'
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={STATUS_COLORS.success}
              strokeWidth={2}
              dot={{ fill: STATUS_COLORS.success, r: 4 }}
              activeDot={{ r: 6, fill: STATUS_COLORS.success }}
            />
            <Line
              type="monotone"
              dataKey="promising"
              stroke={STATUS_COLORS.warning}
              strokeWidth={2}
              dot={{ fill: STATUS_COLORS.warning, r: 4 }}
              activeDot={{ r: 6, fill: STATUS_COLORS.warning }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-between mt-4 text-sm">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS.success }}></div>
            <span className="text-zinc-400">Total Students</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS.warning }}></div>
            <span className="text-zinc-400">Promising Students</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 