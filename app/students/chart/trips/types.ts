export interface Location {
  state: string
  studentCount: number
  coordinates: [number, number]
  city?: string
  schoolOrg?: string
}

export interface RouteSegment {
  from: Location
  to: Location
  distance: number
  eta: string
}

export interface TripRoute {
  locations: Location[]
  segments: RouteSegment[]
  totalDistance: number
  totalStudents: number
  totalTime: string
}

export interface UserLocation {
  coordinates: [number, number]
  state: string
}

export interface StateGroup {
  state: string
  studentCount: number
  coordinates: [number, number]
  cities: Set<string>
  schools: Set<string>
} 