'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Student } from '@/lib/students'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps"
import { scaleLinear } from "d3-scale"
import { SECONDARY_COLORS, NEUTRAL_COLORS } from '@/lib/colors'

interface StudentUSMapProps {
  students: Student[]
}

// US States coordinates for markers
const stateCoordinates: { [key: string]: [number, number] } = {
  'AL': [-86.79113, 32.806671], 'AK': [-152.404419, 61.370716], 'AZ': [-111.431221, 33.729759],
  'AR': [-92.373123, 34.969704], 'CA': [-119.681564, 36.116203], 'CO': [-105.311104, 39.059811],
  'CT': [-72.755371, 41.597782], 'DE': [-75.507141, 39.318523], 'FL': [-81.686783, 27.664827],
  'GA': [-83.643074, 33.040619], 'HI': [-157.498337, 21.094318], 'ID': [-114.478828, 44.240459],
  'IL': [-88.986137, 40.349457], 'IN': [-86.258278, 39.849426], 'IA': [-93.210526, 42.011539],
  'KS': [-96.726486, 38.526600], 'KY': [-84.670067, 37.668140], 'LA': [-91.867805, 31.169546],
  'ME': [-69.381927, 44.693947], 'MD': [-76.802101, 39.063946], 'MA': [-71.530106, 42.230171],
  'MI': [-84.536095, 43.326618], 'MN': [-93.900192, 45.694454], 'MS': [-89.678696, 32.741646],
  'MO': [-92.288368, 38.456085], 'MT': [-110.454353, 46.921925], 'NE': [-98.268082, 41.125370],
  'NV': [-117.055374, 38.313515], 'NH': [-71.563896, 43.452492], 'NJ': [-74.521011, 40.298904],
  'NM': [-106.248482, 34.840515], 'NY': [-74.948051, 42.165726], 'NC': [-79.806419, 35.630066],
  'ND': [-99.784012, 47.528912], 'OH': [-82.764915, 40.388783], 'OK': [-96.928917, 35.565342],
  'OR': [-122.070938, 44.572021], 'PA': [-77.209755, 40.590752], 'RI': [-71.477429, 41.680893],
  'SC': [-80.945007, 33.856892], 'SD': [-99.438828, 44.299782], 'TN': [-86.692345, 35.747845],
  'TX': [-97.563461, 31.054487], 'UT': [-111.862434, 40.150032], 'VT': [-72.710686, 44.045876],
  'VA': [-78.169968, 37.769337], 'WA': [-121.490494, 47.400902], 'WV': [-80.954453, 38.491226],
  'WI': [-89.616508, 44.268543], 'WY': [-107.290284, 42.755966]
}

// Map colors
const MAP_BASE_COLOR = NEUTRAL_COLORS.border // zinc-700
const MAP_HOVER_COLOR = NEUTRAL_COLORS.card // zinc-800
const MARKER_COLOR = SECONDARY_COLORS[0] // amber-500
const MARKER_PROMISING_COLOR = SECONDARY_COLORS[2] // red-500

export function StudentUSMap({ students }: StudentUSMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Count students by state and track promising students
  const studentsByState = useMemo(() => {
    const counts: { [key: string]: { total: number, promising: number } } = {}
    
    students.forEach(student => {
      if (student.state) {
        if (!counts[student.state]) {
          counts[student.state] = { total: 0, promising: 0 }
        }
        counts[student.state].total++
        if (student.promisingStudent) {
          counts[student.state].promising++
        }
      }
    })
    
    return counts
  }, [students])

  // Create a scale for marker size based on student count
  const maxStudents = Math.max(...Object.values(studentsByState).map(data => data.total))
  const markerScale = scaleLinear()
    .domain([0, maxStudents])
    .range([5, 20])

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-zinc-100">Student Distribution Map</CardTitle>
        <CardDescription className="text-zinc-400">Geographic distribution of students across the United States</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full aspect-[1.75]">
          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{ scale: 1000 }}
          >
            <Geographies geography="/states-10m.json">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={geo.id === hoveredState ? MAP_HOVER_COLOR : MAP_BASE_COLOR}
                    stroke={NEUTRAL_COLORS.background}
                    strokeWidth={0.5}
                    onMouseEnter={() => setHoveredState(geo.id as string)}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                ))
              }
            </Geographies>
            {Object.entries(studentsByState).map(([state, data]) => {
              const coordinates = stateCoordinates[state]
              if (!coordinates) return null

              // Determine if this state has a significant number of promising students
              const hasPromisingStudents = data.promising > 0 && (data.promising / data.total) > 0.3
              const markerColor = hasPromisingStudents ? MARKER_PROMISING_COLOR : MARKER_COLOR

              return (
                <Marker key={state} coordinates={coordinates}>
                  <circle
                    r={markerScale(data.total)}
                    fill={markerColor}
                    fillOpacity={0.8}
                    stroke="#fff"
                    strokeWidth={1}
                    style={{ cursor: 'pointer' }}
                  />
                  <text
                    textAnchor="middle"
                    y={4}
                    style={{
                      fill: NEUTRAL_COLORS.text.primary,
                      fontSize: 8,
                      fontWeight: "bold",
                      textShadow: "0px 0px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {data.total}
                  </text>
                </Marker>
              )
            })}
          </ComposableMap>
        </div>
        <div className="flex justify-center gap-6 mt-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MARKER_COLOR }}></div>
            <span className="text-xs text-zinc-300">Regular Students</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MARKER_PROMISING_COLOR }}></div>
            <span className="text-xs text-zinc-300">High % Promising Students</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 