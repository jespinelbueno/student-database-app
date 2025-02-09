'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { TripRoute, RouteSegment } from './types'

interface TripReportProps {
  route: TripRoute
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 15,
    color: '#4a4a4a',
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },
  summaryText: {
    fontSize: 12,
    marginBottom: 5,
    color: '#2a2a2a',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  segment: {
    marginBottom: 15,
    paddingLeft: 15,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e5e5',
  },
  segmentHeader: {
    fontSize: 12,
    marginBottom: 5,
    color: '#2a2a2a',
  },
  segmentDetail: {
    fontSize: 10,
    color: '#4a4a4a',
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
})

export function TripReport({ route }: TripReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Trip Itinerary</Text>
        
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Total Distance: {route.totalDistance} miles</Text>
          <Text style={styles.summaryText}>Total Travel Time: {route.totalTime}</Text>
          <Text style={styles.summaryText}>Students Covered: {route.totalStudents}</Text>
          <Text style={styles.summaryText}>Number of Stops: {route.locations.length}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          {route.segments.map((segment: RouteSegment, index: number) => (
            <View key={index} style={styles.segment}>
              <Text style={styles.segmentHeader}>
                Stop {index + 1}: {segment.from.state} → {segment.to.state}
              </Text>
              <Text style={styles.segmentDetail}>Distance: {segment.distance} miles</Text>
              <Text style={styles.segmentDetail}>Travel Time: {segment.eta}</Text>
              <Text style={styles.segmentDetail}>Students at Destination: {segment.to.studentCount}</Text>
              {segment.to.city && (
                <Text style={styles.segmentDetail}>Cities: {segment.to.city}</Text>
              )}
              {segment.to.schoolOrg && (
                <Text style={styles.segmentDetail}>Schools: {segment.to.schoolOrg}</Text>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  )
} 