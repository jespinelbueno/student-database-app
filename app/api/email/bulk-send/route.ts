import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// Create transporter with Gmail configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
})

// Get the sender email from environment variables
const SENDER_EMAIL = process.env.SMTP_FROM || 'noreply@yourdomain.com'
const SENDER_NAME = 'Future Scholars Database'

interface EmailRequest {
  studentIds: number[]
  subject: string
  message: string
  signature: string
  templateVariables: string[]
}

export async function POST(request: Request) {
  try {
    const { studentIds, subject, message, signature, templateVariables }: EmailRequest = await request.json()

    if (!studentIds?.length) {
      return NextResponse.json(
        { error: 'No students selected' },
        { status: 400 }
      )
    }

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Fetch students with their details
    const students = await prisma.student.findMany({
      where: {
        id: {
          in: studentIds
        }
      }
    })

    // Send emails in parallel with rate limiting
    const BATCH_SIZE = 5 // Process 5 emails at a time
    const DELAY_BETWEEN_BATCHES = 1000 // 1 second delay between batches

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE)
      
      await Promise.all(
        batch.map(async (student) => {
          let personalizedSubject = subject
          let personalizedMessage = message

          // Replace template variables with actual values
          templateVariables.forEach((variable) => {
            const value = variable === '{firstName}' ? student.firstName
              : variable === '{lastName}' ? student.lastName
              : variable === '{email}' ? student.email
              : variable === '{graduationYear}' ? student.graduationYear.toString()
              : variable === '{schoolOrg}' ? student.schoolOrg
              : variable === '{state}' ? student.state || ''
              : variable === '{city}' ? student.city || ''
              : '';

            const regex = new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
            personalizedSubject = personalizedSubject.replace(regex, value)
            personalizedMessage = personalizedMessage.replace(regex, value)
          })

          try {
            await transporter.sendMail({
              from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
              to: student.email,
              subject: personalizedSubject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  ${personalizedMessage.split('\n').map(line => `<p style="margin: 1em 0;">${line}</p>`).join('')}
                  <div style="margin-top: 40px;">
                    ${signature}
                  </div>
                  <div style="margin-top: 2em; padding-top: 1em; border-top: 2px solid #10b981; color: #374151;">
                    <p style="margin: 0;">Sent from ${SENDER_NAME}</p>
                    <p style="margin: 0; color: #6B7280;">${SENDER_EMAIL}</p>
                  </div>
                </div>
              `,
            })
          } catch (error) {
            console.error(`Failed to send email to ${student.email}:`, error)
            // Continue with other emails even if one fails
          }
        })
      )

      // Add delay between batches to avoid rate limits
      if (i + BATCH_SIZE < students.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Bulk email error:', error)
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    )
  }
} 