'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#10b981',
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 18,
    marginBottom: 10,
    color: '#10b981',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  boldText: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  column: {
    flexDirection: 'column',
    marginBottom: 10,
    width: '50%',
  },
  barContainer: {
    height: 15,
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    marginBottom: 5,
  },
  bar: {
    height: 15,
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  kpiItem: {
    width: '48%',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#4b5563',
  },
  trendSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  trendRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  trendLabel: {
    width: '20%',
    fontSize: 10,
  },
  trendBarContainer: {
    width: '60%',
    height: 12,
    backgroundColor: '#f3f4f6',
  },
  trendBar: {
    height: 12,
    backgroundColor: '#10b981',
  },
  trendValue: {
    width: '20%',
    fontSize: 10,
    textAlign: 'right',
  },
})

interface StudentReportProps {
  stateDistribution: { state: string; count: number }[]
  cityDistribution: { city: string; count: number }[]
  graduationYearDistribution: { year: number; count: number }[]
  totalStudents: number
  promisingStudentsCount: number
  userName: string
  trendData: { date: string; count: number; promising: number }[]
  uniqueStates: number
  uniqueSchools: number
  futureGrads: number
}

export function StudentReport({
  stateDistribution,
  cityDistribution,
  graduationYearDistribution,
  totalStudents,
  promisingStudentsCount,
  userName,
  trendData,
  uniqueStates,
  uniqueSchools,
  futureGrads,
}: StudentReportProps) {
  const currentDate = new Date().toLocaleDateString()
  const promisingPercentage = Math.round((promisingStudentsCount / totalStudents) * 100) || 0
  const futureGradsPercentage = Math.round((futureGrads / totalStudents) * 100) || 0

  const renderBarChart = (data: { label: string; count: number }[]) => {
    const maxCount = Math.max(...data.map(item => item.count))
    return data.map((item, index) => (
      <View key={index} style={styles.row}>
        <Text style={[styles.text, { width: '30%' }]}>{item.label}</Text>
        <View style={[styles.barContainer, { width: '50%' }]}>
          <View
            style={[
              styles.bar,
              { width: `${(item.count / maxCount) * 100}%` },
            ]}
          />
        </View>
        <Text style={[styles.text, { width: '20%', textAlign: 'right' }]}>
          {item.count} ({Math.round((item.count / totalStudents) * 100)}%)
        </Text>
      </View>
    ))
  }

  const renderGraduationYearChart = () => {
    const maxCount = Math.max(
      ...graduationYearDistribution.map(item => item.count)
    )
    return graduationYearDistribution.map((item, index) => (
      <View key={index} style={styles.row}>
        <Text style={[styles.text, { width: '30%' }]}>{item.year}</Text>
        <View style={[styles.barContainer, { width: '50%' }]}>
          <View
            style={[
              styles.bar,
              { width: `${(item.count / maxCount) * 100}%` },
            ]}
          />
        </View>
        <Text style={[styles.text, { width: '20%', textAlign: 'right' }]}>
          {item.count} ({Math.round((item.count / totalStudents) * 100)}%)
        </Text>
      </View>
    ))
  }

  const renderTrendChart = () => {
    if (!trendData || trendData.length === 0) return null;
    
    const maxCount = Math.max(...trendData.map(item => item.count));
    return trendData.map((item, index) => (
      <View key={index} style={styles.trendRow}>
        <Text style={styles.trendLabel}>{item.date}</Text>
        <View style={styles.trendBarContainer}>
          <View
            style={[
              styles.trendBar,
              { width: `${(item.count / maxCount) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.trendValue}>
          {item.count} ({item.promising} promising)
        </Text>
      </View>
    ));
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Student Analytics Report</Text>
        <Text style={styles.text}>
          Generated for: {userName} | Date: {currentDate}
        </Text>

        {/* KPI Section */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiValue}>{totalStudents}</Text>
            <Text style={styles.kpiLabel}>Total Students</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiValue}>{promisingStudentsCount} ({promisingPercentage}%)</Text>
            <Text style={styles.kpiLabel}>Promising Students</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiValue}>{uniqueStates}</Text>
            <Text style={styles.kpiLabel}>States Covered</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiValue}>{futureGrads} ({futureGradsPercentage}%)</Text>
            <Text style={styles.kpiLabel}>Future Graduates</Text>
          </View>
        </View>

        {/* Trend Analysis */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Student Growth Trend</Text>
          <Text style={styles.text}>Monthly student acquisition over time</Text>
          <View style={styles.trendSection}>
            {renderTrendChart()}
          </View>
        </View>

        {/* State Distribution */}
        <View style={styles.section}>
          <Text style={styles.subheader}>State Distribution</Text>
          <Text style={styles.text}>
            Top {Math.min(stateDistribution.length, 10)} states by student count
          </Text>
          {renderBarChart(
            stateDistribution
              .slice(0, 10)
              .map(item => ({ label: item.state, count: item.count }))
          )}
        </View>

        {/* City Distribution */}
        <View style={styles.section}>
          <Text style={styles.subheader}>City Distribution</Text>
          <Text style={styles.text}>
            Top {Math.min(cityDistribution.length, 10)} cities by student count
          </Text>
          {renderBarChart(
            cityDistribution
              .slice(0, 10)
              .map(item => ({ label: item.city, count: item.count }))
          )}
        </View>

        {/* Graduation Year Distribution */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Graduation Year Distribution</Text>
          {renderGraduationYearChart()}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Summary</Text>
          <Text style={styles.text}>
            This report shows a total of {totalStudents} students, with{' '}
            {promisingStudentsCount} ({promisingPercentage}%) identified as promising.
          </Text>
          <Text style={styles.text}>
            Students are distributed across {uniqueStates} states and {uniqueSchools} schools/organizations.
          </Text>
          <Text style={styles.text}>
            There are {futureGrads} students ({futureGradsPercentage}%) graduating in future years.
          </Text>
        </View>

        <Text style={styles.footer}>
          Generated by Future Scholars AI on {currentDate}
        </Text>
      </Page>
    </Document>
  )
} 