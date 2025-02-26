import React, { useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Student } from '@/lib/students'
import { GraduationCap, MapPin, Users, Star } from 'lucide-react'
import { STATUS_COLORS } from '@/lib/colors'

interface StudentKPICardsProps {
  students: Student[]
}

export function StudentKPICards({ students }: StudentKPICardsProps) {
  const metrics = useMemo(() => {
    // Total students
    const totalStudents = students.length
    
    // Promising students
    const promisingStudents = students.filter(s => s.promisingStudent).length
    const promisingPercentage = totalStudents > 0 
      ? Math.round((promisingStudents / totalStudents) * 100) 
      : 0
    
    // States covered
    const uniqueStates = new Set(students.map(s => s.state).filter(Boolean))
    const statesCovered = uniqueStates.size
    
    // Schools/Organizations
    const uniqueSchools = new Set(students.map(s => s.schoolOrg).filter(Boolean))
    const schoolsCovered = uniqueSchools.size
    
    // Graduation years span
    const graduationYears = students.map(s => s.graduationYear).filter(Boolean)
    const currentYear = new Date().getFullYear()
    const futureGrads = graduationYears.filter(year => year >= currentYear).length
    const futurePercentage = totalStudents > 0 
      ? Math.round((futureGrads / totalStudents) * 100) 
      : 0
    
    return {
      totalStudents,
      promisingStudents,
      promisingPercentage,
      statesCovered,
      schoolsCovered,
      futureGrads,
      futurePercentage
    }
  }, [students])
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-zinc-800 border-zinc-700">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium">Total Students</p>
              <h3 className="text-3xl font-bold text-zinc-100 mt-1">{metrics.totalStudents}</h3>
              <p className="text-emerald-500 text-sm mt-1" style={{ color: STATUS_COLORS.success }}>
                {metrics.promisingPercentage}% promising
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: `${STATUS_COLORS.success}20` }}>
              <Users className="h-6 w-6 text-emerald-500" style={{ color: STATUS_COLORS.success }} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-zinc-800 border-zinc-700">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium">Promising Students</p>
              <h3 className="text-3xl font-bold text-zinc-100 mt-1">{metrics.promisingStudents}</h3>
              <p className="text-emerald-500 text-sm mt-1" style={{ color: STATUS_COLORS.success }}>
                {metrics.promisingPercentage}% of total
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${STATUS_COLORS.success}20` }}>
              <Star className="h-6 w-6 text-emerald-500" style={{ color: STATUS_COLORS.success }} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-zinc-800 border-zinc-700">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium">Geographic Reach</p>
              <h3 className="text-3xl font-bold text-zinc-100 mt-1">{metrics.statesCovered}</h3>
              <p className="text-emerald-500 text-sm mt-1" style={{ color: STATUS_COLORS.success }}>
                states covered
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${STATUS_COLORS.success}20` }}>
              <MapPin className="h-6 w-6 text-emerald-500" style={{ color: STATUS_COLORS.success }} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-zinc-800 border-zinc-700">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium">Future Graduates</p>
              <h3 className="text-3xl font-bold text-zinc-100 mt-1">{metrics.futureGrads}</h3>
              <p className="text-emerald-500 text-sm mt-1" style={{ color: STATUS_COLORS.success }}>
                {metrics.futurePercentage}% of students
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${STATUS_COLORS.success}20` }}>
              <GraduationCap className="h-6 w-6 text-emerald-500" style={{ color: STATUS_COLORS.success }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 