'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Student } from '@/lib/students'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface StudentStateDistributionChartProps {
  students: Student[]
}

export function StudentCityDistributionChart({ students }: StudentStateDistributionChartProps) {
  const chartData = useMemo(() => {
    const cityCounts = students.reduce((acc, student) => {
      if (student.city) {
        acc[student.city] = (acc[student.city] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const data = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count) // Sort by count in descending order

    return data
  }, [students])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Students by City</CardTitle>
        <CardDescription>Distribution of students across different cities</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
            <XAxis type="number" />
            <YAxis dataKey="city" type="category" />
            <Tooltip />
            <Bar dataKey="count" fill="rgb(16 185 129)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}