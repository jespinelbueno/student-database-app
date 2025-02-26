'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Student } from '@/lib/students'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { getPrimaryColor } from '@/lib/colors'

interface StudentGraduationYearChartProps {
  students: Student[]
}

export function StudentGraduationYearChart({ students }: StudentGraduationYearChartProps) {
  const chartData = useMemo(() => {
    const graduationYearCounts = students.reduce((acc, student) => {
      const year = student.graduationYear
      acc[year] = (acc[year] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    return Object.entries(graduationYearCounts)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year)
  }, [students])

  console.log("Processed chartData in StudentGraduationYearChart:", chartData);

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-zinc-100">Students by Graduation Year</CardTitle>
        <CardDescription className="text-zinc-400">Distribution of students across different graduation years</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="year"
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
            <Bar
              dataKey="count"
              fill={getPrimaryColor(2)}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}