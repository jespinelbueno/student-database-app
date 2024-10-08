'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Student } from '@/lib/students'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Students by Graduation Year</CardTitle>
        <CardDescription>Distribution of students across different graduation years</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="year"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}