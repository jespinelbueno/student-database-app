'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Student } from '@/lib/students'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface StudentStateDistributionChartProps {
  students: Student[]
}

export function StudentStateDistributionChart({ students }: StudentStateDistributionChartProps) {
  const chartData = useMemo(() => {
    const stateCounts = students.reduce((acc, student) => {
      if (student.state) {
        acc[student.state] = (acc[student.state] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const data = Object.entries(stateCounts)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count) // Sort by count in descending order

    return data
  }, [students])

  console.log("Processed chartData in StudentStateDistributionChart:", chartData);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Students by State</CardTitle>
        <CardDescription>Distribution of students across different states</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
            <XAxis type="number" />
            <YAxis dataKey="state" type="category" />
            <Tooltip />
            <Bar dataKey="count" fill="rgb(16 185 129)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}