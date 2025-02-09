'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Student } from '@/lib/students'
import { ComposableMap, Geographies, Geography, Line, Marker } from "react-simple-maps"
import { FileDown, Loader2 } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { TripReport } from './TripReport'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { stateCoordinates } from '../map/coordinates'
import type { Location, TripRoute, UserLocation, StateGroup } from './types'

export function StudentTripPlanner({ students }: { students: Student[] }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [route, setRoute] = useState<TripRoute | null>(null)
  const [maxStops, setMaxStops] = useState(5)
  const [minStudents, setMinStudents] = useState(5)
  const [optimizationMethod, setOptimizationMethod] = useState("distance")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    const initLocation = async () => {
      setIsLoadingLocation(true)
      setLocationError(null)
      try {
        const location = await getUserLocation()
        if (location) {
          setUserLocation(location)
          calculateRoute(location)
        }
      } catch (error) {
        setLocationError('Unable to get your location. Please allow location access.')
        console.error('Error getting location:', error)
      } finally {
        setIsLoadingLocation(false)
      }
    }
    initLocation()
  }, [])

  const calculateRoute = (currentLocation: UserLocation) => {
    // Group students by state
    const stateGroups = students.reduce((acc, student) => {
      if (!student.state) return acc

      if (!acc[student.state]) {
        acc[student.state] = {
          state: student.state,
          studentCount: 0,
          coordinates: stateCoordinates[student.state],
          cities: new Set<string>(),
          schools: new Set<string>()
        }
      }

      acc[student.state].studentCount++
      if (student.city) acc[student.state].cities.add(student.city)
      if (student.schoolOrg) acc[student.state].schools.add(student.schoolOrg)

      return acc
    }, {} as Record<string, StateGroup>)

    // Convert to array and filter by minimum students
    const validStates = Object.values(stateGroups)
      .filter(group => group.studentCount >= minStudents)
      .map(group => ({
        state: group.state,
        studentCount: group.studentCount,
        coordinates: group.coordinates,
        city: Array.from(group.cities).join(", "),
        schoolOrg: Array.from(group.schools).join(", ")
      }))

    if (validStates.length === 0) {
      return
    }

    // Start from user's location
    const route: TripRoute = {
      locations: [],
      segments: [],
      totalDistance: 0,
      totalStudents: 0,
      totalTime: ""
    }

    const startLocation: Location = {
      state: currentLocation.state,
      studentCount: 0,
      coordinates: currentLocation.coordinates
    }

    const remainingStates = [...validStates]
    let totalTimeMinutes = 0
    let currentLoc = startLocation

    // Build route
    while (route.locations.length < maxStops && remainingStates.length > 0) {
      let nextStateIndex = -1
      let minDistance = Infinity

      // Find next state based on optimization method
      remainingStates.forEach((state, index) => {
        const distance = calculateDistance(
          currentLoc.coordinates[0],
          currentLoc.coordinates[1],
          state.coordinates[0],
          state.coordinates[1]
        )

        if (optimizationMethod === "distance" && distance < minDistance) {
          minDistance = distance
          nextStateIndex = index
        } else if (optimizationMethod === "coverage") {
          const score = state.studentCount / (distance + 1)
          if (score > minDistance) {
            minDistance = score
            nextStateIndex = index
          }
        }
      })

      if (nextStateIndex === -1) break

      const nextState = remainingStates[nextStateIndex]
      remainingStates.splice(nextStateIndex, 1)

      // Add segment
      const timeMinutes = Math.round((minDistance / 60) * 60) // Assuming 60mph average speed
      totalTimeMinutes += timeMinutes + 30 // Add 30 minutes for each stop

      route.segments.push({
        from: currentLoc,
        to: nextState,
        distance: Math.round(minDistance),
        eta: `${Math.floor(timeMinutes / 60)}h ${timeMinutes % 60}m`
      })

      route.locations.push(nextState)
      route.totalDistance += Math.round(minDistance)
      route.totalStudents += nextState.studentCount

      currentLoc = nextState
    }

    // Format total time
    const totalHours = Math.floor(totalTimeMinutes / 60)
    const remainingMinutes = totalTimeMinutes % 60
    route.totalTime = `${totalHours}h ${remainingMinutes}m`

    setRoute(route)
  }

  const getUserLocation = async (): Promise<UserLocation | null> => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'))
          return
        }
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude, longitude } = position.coords
      
      // Find the closest state to the user's location
      let closestState = ''
      let minDistance = Infinity

      Object.entries(stateCoordinates).forEach(([state, [stateLong, stateLat]]) => {
        const distance = calculateDistance(longitude, latitude, stateLong, stateLat)
        if (distance < minDistance) {
          minDistance = distance
          closestState = state
        }
      })

      return {
        coordinates: [longitude, latitude],
        state: closestState
      }
    } catch (error) {
      console.error('Error getting location:', error)
      return null
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-zinc-100">School Trip Planner</CardTitle>
          <CardDescription className="text-zinc-400">
            Plan your school visits based on student concentrations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-400">Minimum Students per Stop</Label>
                <Input
                  type="number"
                  value={minStudents}
                  onChange={(e) => setMinStudents(Number(e.target.value))}
                  min={1}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
              <div>
                <Label className="text-zinc-400">Maximum Stops</Label>
                <Input
                  type="number"
                  value={maxStops}
                  onChange={(e) => setMaxStops(Number(e.target.value))}
                  min={1}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
              <div>
                <Label className="text-zinc-400">Optimization Method</Label>
                <Select
                  value={optimizationMethod}
                  onValueChange={setOptimizationMethod}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="distance">Minimize Distance</SelectItem>
                    <SelectItem value="coverage">Maximize Coverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {locationError && (
                <div className="text-red-500 text-sm">{locationError}</div>
              )}
              {userLocation && (
                <div className="text-zinc-400 text-sm">
                  Starting from: {userLocation.state}
                </div>
              )}
              <Button 
                onClick={() => userLocation && calculateRoute(userLocation)}
                disabled={isLoadingLocation || !userLocation}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoadingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  'Recalculate Route'
                )}
              </Button>
            </div>

            {/* Map */}
            <div className="md:col-span-2">
              <div className="w-full aspect-[1.75] bg-zinc-900 rounded-lg overflow-hidden">
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
                          fill="#334155"
                          stroke="#1e293b"
                          strokeWidth={0.5}
                        />
                      ))
                    }
                  </Geographies>

                  {/* User's location marker */}
                  {userLocation && (
                    <Marker coordinates={userLocation.coordinates}>
                      <circle
                        r={6}
                        fill="#3b82f6"
                        stroke="#2563eb"
                        strokeWidth={2}
                      />
                    </Marker>
                  )}

                  {/* Route markers and lines */}
                  {route && (
                    <>
                      {route.segments.map((segment, index) => (
                        <Line
                          key={index}
                          from={segment.from.coordinates}
                          to={segment.to.coordinates}
                          stroke="#10b981"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      ))}

                      {route.locations.map((location, index) => (
                        <Marker key={index} coordinates={location.coordinates}>
                          <circle
                            r={8}
                            fill="#10b981"
                            fillOpacity={0.6}
                            stroke="#059669"
                            strokeWidth={2}
                          />
                          <text
                            textAnchor="middle"
                            y={4}
                            style={{
                              fill: "#fff",
                              fontSize: 8,
                              fontWeight: "bold",
                            }}
                          >
                            {index + 1}
                          </text>
                        </Marker>
                      ))}
                    </>
                  )}
                </ComposableMap>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Details */}
      {route && (
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-100">Route Details</CardTitle>
            <CardDescription className="text-zinc-400">
              Total Distance: {route.totalDistance.toFixed(0)} miles • Travel Time: {route.totalTime} • Students: {route.totalStudents}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {route.segments.map((segment, index) => (
                <div
                  key={index}
                  className="flex flex-col space-y-2 p-4 bg-zinc-900 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-zinc-100 font-medium">
                        Stop {index + 1}: {segment.to.state}
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        {segment.distance.toFixed(0)} miles • {segment.eta} • {segment.to.studentCount} students
                      </p>
                    </div>
                    <div className="text-right text-sm text-zinc-400">
                      {segment.to.city && <p>Cities: {segment.to.city}</p>}
                      {segment.to.schoolOrg && <p>Schools: {segment.to.schoolOrg}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Download Button */}
      {route && (
        <div className="flex justify-end">
          <PDFDownloadLink
            document={<TripReport route={route} />}
            fileName={`trip-plan-${new Date().toISOString().split('T')[0]}.pdf`}
          >
            {({ loading }) => (
              <Button
                disabled={loading}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
              >
                <FileDown className="mr-2 h-4 w-4" />
                {loading ? 'Generating PDF...' : 'Download Trip Report'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  )
}

// Helper function to calculate distance between coordinates using Haversine formula
function calculateDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
} 