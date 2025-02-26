'use client'

import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Student } from '@/lib/students'
import { StudentReport } from './StudentReport'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileDown } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface GenerateReportProps {
  students: Student[]
}

export function GenerateReport({ students }: GenerateReportProps) {
  const { data: session } = useSession()
  const userName = session?.user?.name || session?.user?.email || 'Unknown User'

  // Calculate distributions and sort them
  const stateDistribution = useMemo(() => {
    return students.reduce((acc, student) => {
      const state = student.state || 'Unknown'
      const existing = acc.find(item => item.state === state)
      if (existing) {
        existing.count++
      } else {
        acc.push({ state, count: 1 })
      }
      return acc
    }, [] as { state: string; count: number }[])
      .sort((a, b) => b.count - a.count) // Sort by count in descending order
  }, [students])

  const cityDistribution = useMemo(() => {
    return students.reduce((acc, student) => {
      const city = student.city || 'Unknown'
      const existing = acc.find(item => item.city === city)
      if (existing) {
        existing.count++
      } else {
        acc.push({ city, count: 1 })
      }
      return acc
    }, [] as { city: string; count: number }[])
      .sort((a, b) => b.count - a.count) // Sort by count in descending order
  }, [students])

  const graduationYearDistribution = useMemo(() => {
    return students.reduce((acc, student) => {
      const year = student.graduationYear
      const existing = acc.find(item => item.year === year)
      if (existing) {
        existing.count++
      } else {
        acc.push({ year, count: 1 })
      }
      return acc
    }, [] as { year: number; count: number }[])
      .sort((a, b) => a.year - b.year) // Sort by year in ascending order
  }, [students])

  // Calculate trend data
  const trendData = useMemo(() => {
    // Group students by creation date (month/year)
    const studentsByMonth = students.reduce((acc, student) => {
      const createdAt = new Date(student.createdAt)
      const monthYear = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          count: 0,
          promising: 0,
          date: monthYear
        }
      }
      
      acc[monthYear].count++
      if (student.promisingStudent) {
        acc[monthYear].promising++
      }
      
      return acc
    }, {} as Record<string, { count: number, promising: number, date: string }>)
    
    // Convert to array and sort by date
    return Object.values(studentsByMonth)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        date: item.date.split('-')[1] + '/' + item.date.split('-')[0].slice(2) // Format as MM/YY
      }))
  }, [students])

  // Calculate metrics
  const totalStudents = students.length
  const promisingStudentsCount = students.filter(s => s.promisingStudent).length
  const uniqueStates = new Set(students.map(s => s.state).filter(Boolean)).size
  const uniqueSchools = new Set(students.map(s => s.schoolOrg).filter(Boolean)).size
  const futureGrads = students.filter(s => s.graduationYear >= new Date().getFullYear()).length

  return (
    <div className="flex justify-center w-full">
      <PDFDownloadLink
        document={
          <StudentReport
            stateDistribution={stateDistribution}
            cityDistribution={cityDistribution}
            graduationYearDistribution={graduationYearDistribution}
            totalStudents={totalStudents}
            promisingStudentsCount={promisingStudentsCount}
            userName={userName}
            trendData={trendData}
            uniqueStates={uniqueStates}
            uniqueSchools={uniqueSchools}
            futureGrads={futureGrads}
          />
        }
        fileName={`student-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`}
        className="w-full md:w-auto"
      >
        {({ loading }) => (
          <Button
            disabled={loading}
            variant="success"
            size="lg"
          >
            <FileDown className="mr-2 h-5 w-5" />
            {loading ? 'Generating Report...' : 'Download Complete Analytics Report'}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  )
} 