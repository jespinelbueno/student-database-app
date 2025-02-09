'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Student } from '@/lib/students'
import { scaleLinear } from "d3-scale"

interface StudentHeatMapProps {
  students: Student[]
}

interface StateData {
  state: string
  count: number
  density: number
}

// State population data (2020 census) for density calculation
const statePopulations: { [key: string]: number } = {
  'CA': 39538223, 'TX': 29145505, 'FL': 21538187, 'NY': 20201249, 'IL': 12801989,
  'PA': 13002700, 'OH': 11799448, 'GA': 10711908, 'NC': 10439388, 'MI': 10077331,
  'NJ': 9288994, 'VA': 8631393, 'WA': 7705281, 'AZ': 7151502, 'MA': 7029917,
  'TN': 6910840, 'IN': 6785528, 'MD': 6177224, 'MO': 6154913, 'WI': 5893718,
  'CO': 5773714, 'MN': 5706494, 'SC': 5118425, 'AL': 5024279, 'LA': 4657757,
  'KY': 4505836, 'OR': 4237256, 'OK': 3959353, 'CT': 3605944, 'UT': 3271616,
  'IA': 3190369, 'NV': 3104614, 'AR': 3011524, 'MS': 2961279, 'KS': 2937880,
  'NM': 2117522, 'NE': 1961504, 'ID': 1839106, 'WV': 1793716, 'HI': 1455271,
  'NH': 1377529, 'ME': 1362359, 'MT': 1084225, 'RI': 1097379, 'DE': 989948,
  'SD': 886667, 'ND': 779094, 'AK': 733391, 'VT': 643077, 'WY': 576851
}

export function StudentHeatMap({ students }: StudentHeatMapProps) {
  const stateData = useMemo(() => {
    // Count students by state
    const counts: { [key: string]: number } = {}
    students.forEach(student => {
      if (student.state) {
        counts[student.state] = (counts[student.state] || 0) + 1
      }
    })

    // Calculate density (students per million population)
    const data: StateData[] = Object.entries(counts).map(([state, count]) => ({
      state,
      count,
      density: (count / (statePopulations[state] || 1)) * 1000000
    }))

    return data.sort((a, b) => b.density - a.density)
  }, [students])

  // Create color scale for heat map
  const maxDensity = Math.max(...stateData.map(d => d.density))
  const colorScale = scaleLinear<string>()
    .domain([0, maxDensity])
    .range(["#059669", "#10b981"])

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-zinc-100">Student Concentration Heat Map</CardTitle>
        <CardDescription className="text-zinc-400">
          Student density per million state residents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stateData.map(({ state, count, density }) => (
            <div
              key={state}
              className="flex items-center gap-2"
            >
              <div className="w-16 text-zinc-100">{state}</div>
              <div
                className="flex-1 h-6 rounded"
                style={{
                  backgroundColor: colorScale(density),
                  width: `${(density / maxDensity) * 100}%`
                }}
              />
              <div className="w-32 text-right text-zinc-400">
                {count} students
                <span className="ml-2 text-xs">
                  ({density.toFixed(1)} per 1M)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 