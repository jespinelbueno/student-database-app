'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Student } from '@/lib/students'
import { ResponsiveSunburst } from '@nivo/sunburst'
import { PRIMARY_COLORS, STATUS_COLORS } from '@/lib/colors'

interface StudentSunburstChartProps {
  students: Student[]
}

interface SunburstData {
  id: string
  name: string
  children?: SunburstData[]
  value?: number
  color?: string
}

export function StudentSunburstChart({ students }: StudentSunburstChartProps) {
  const chartData = useMemo(() => {
    const data: SunburstData = {
      id: 'root',
      name: 'Students',
      value: students.length // Set total value
    }

    // Group by state
    const stateGroups = students.reduce((acc, student) => {
      const state = student.state || 'Unknown State'
      if (!acc[state]) {
        acc[state] = []
      }
      acc[state].push(student)
      return acc
    }, {} as Record<string, Student[]>)

    // Create hierarchy
    data.children = Object.entries(stateGroups).map(([state, stateStudents], stateIndex) => {
      // Group by city
      const cityGroups = stateStudents.reduce((acc, student) => {
        const city = student.city || 'Unknown City'
        if (!acc[city]) {
          acc[city] = []
        }
        acc[city].push(student)
        return acc
      }, {} as Record<string, Student[]>)

      const stateNode: SunburstData = {
        id: `state-${state}`,
        name: state,
        value: stateStudents.length, // Set state value
        color: PRIMARY_COLORS[stateIndex % PRIMARY_COLORS.length]
      }

      stateNode.children = Object.entries(cityGroups).map(([city, cityStudents]) => {
        // Group by school
        const schoolGroups = cityStudents.reduce((acc, student) => {
          const school = student.schoolOrg || 'Unknown School'
          if (!acc[school]) {
            acc[school] = []
          }
          acc[school].push(student)
          return acc
        }, {} as Record<string, Student[]>)

        const cityNode: SunburstData = {
          id: `city-${state}-${city}`,
          name: city,
          value: cityStudents.length // Set city value
        }

        cityNode.children = Object.entries(schoolGroups).map(([school, schoolStudents]) => {
          // Group by student type (promising/regular)
          const promisingCount = schoolStudents.filter(s => s.promisingStudent).length
          const regularCount = schoolStudents.length - promisingCount

          const schoolNode: SunburstData = {
            id: `school-${state}-${city}-${school}`,
            name: school,
            value: schoolStudents.length // Set school value
          }

          schoolNode.children = [
            {
              id: `promising-${state}-${city}-${school}`,
              name: 'Promising Students',
              value: promisingCount,
              color: STATUS_COLORS.warning // amber color for promising students
            },
            {
              id: `regular-${state}-${city}-${school}`,
              name: 'Regular Students',
              value: regularCount,
              color: STATUS_COLORS.info // blue color for regular students
            }
          ].filter(item => item.value > 0) // Only include non-zero values

          return schoolNode
        })

        return cityNode
      })

      return stateNode
    })

    return data
  }, [students])

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-zinc-100">Student Distribution Sunburst</CardTitle>
        <CardDescription className="text-zinc-400">
          Hierarchical view of students by State → City → School → Type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: '500px' }}>
          <ResponsiveSunburst
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            id="id"
            value="value"
            cornerRadius={2}
            borderWidth={1}
            borderColor={{ theme: 'background' }}
            colors={{ datum: 'data.color' }}
            childColor={{
              from: 'color',
              modifiers: [['brighter', 0.1]]
            }}
            enableArcLabels={true}
            arcLabel={node => `${node.data.name} (${node.value})`}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
              from: 'color',
              modifiers: [['darker', 1.4]]
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
} 