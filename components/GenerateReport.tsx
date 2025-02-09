'use client'

import React from 'react'
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
  const stateDistribution = students.reduce((acc, student) => {
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

  const cityDistribution = students.reduce((acc, student) => {
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

  const graduationYearDistribution = students.reduce((acc, student) => {
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

  const totalStudents = students.length
  const promisingStudentsCount = students.filter(s => s.promisingStudent).length

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <PDFDownloadLink
          document={
            <StudentReport
              stateDistribution={stateDistribution}
              cityDistribution={cityDistribution}
              graduationYearDistribution={graduationYearDistribution}
              totalStudents={totalStudents}
              promisingStudentsCount={promisingStudentsCount}
              userName={userName}
            />
          }
          fileName={`student-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`}
        >
          {({ loading }) => (
            <Button
              disabled={loading}
              className="bg-zinc-500 hover:bg-zinc-700 text-zinc-100"
            >
              <FileDown className="mr-2 h-4 w-4" />
              {loading ? 'Generating Report...' : 'Download Analytics Report'}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      <div className="text-sm text-zinc-400">
        {totalStudents} students • {promisingStudentsCount} promising
      </div>
    </div>
  )
} 