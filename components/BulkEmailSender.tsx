import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Student } from '@/lib/students'
import { Loader2, Mail, Eye, Code } from 'lucide-react'

interface BulkEmailSenderProps {
  selectedStudents: Student[]
  onClose: () => void
}

const TEMPLATE_VARIABLES = [
  { key: '{firstName}', description: 'Student\'s first name' },
  { key: '{lastName}', description: 'Student\'s last name' },
  { key: '{email}', description: 'Student\'s email address' },
  { key: '{graduationYear}', description: 'Expected graduation year' },
  { key: '{schoolOrg}', description: 'School or organization' },
  { key: '{state}', description: 'State of residence' },
  { key: '{city}', description: 'City of residence' },
] as const;

const DEFAULT_SIGNATURE = `
<div style="font-family: Arial, sans-serif; color: #374151;">
  <p style="margin: 0;">Best regards,</p>
  <p style="margin: 8px 0;">
    <strong>Future Scholars Database</strong><br/>
    <span style="color: #6B7280;">Student Management System</span>
  </p>
</div>
`;

export function BulkEmailSender({ selectedStudents, onClose }: BulkEmailSenderProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState(DEFAULT_SIGNATURE)
  const [showSignatureEditor, setShowSignatureEditor] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both subject and message fields.')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const response = await fetch('/api/email/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudents.map(student => student.id),
          subject,
          message,
          signature,
          templateVariables: TEMPLATE_VARIABLES.map(v => v.key),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send emails')
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch {
      setError('Failed to send emails. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const getPreviewContent = (student: Student) => {
    let previewSubject = subject;
    let previewMessage = message;

    TEMPLATE_VARIABLES.forEach(({ key }) => {
      const value = key === '{firstName}' ? student.firstName
        : key === '{lastName}' ? student.lastName
        : key === '{email}' ? student.email
        : key === '{graduationYear}' ? student.graduationYear.toString()
        : key === '{schoolOrg}' ? student.schoolOrg
        : key === '{state}' ? student.state || ''
        : key === '{city}' ? student.city || ''
        : '';

      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      previewSubject = previewSubject.replace(regex, value);
      previewMessage = previewMessage.replace(regex, value);
    });

    return { previewSubject, previewMessage };
  }

  const nextPreview = () => {
    setPreviewIndex((prev) => (prev + 1) % selectedStudents.length);
  }

  const prevPreview = () => {
    setPreviewIndex((prev) => (prev - 1 + selectedStudents.length) % selectedStudents.length);
  }

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-zinc-100">Send Bulk Email</CardTitle>
        <CardDescription className="text-zinc-400">
          Sending email to {selectedStudents.length} selected student{selectedStudents.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-zinc-900/50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Available Template Variables:</h3>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATE_VARIABLES.map(({ key, description }) => (
              <div key={key} className="text-sm">
                <code className="bg-zinc-800 px-1 py-0.5 rounded text-emerald-400">{key}</code>
                <span className="text-zinc-400 ml-2">{description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Email Subject"
            value={subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-zinc-100"
          />
        </div>
        <div className="space-y-2">
          <Textarea
            placeholder="Email Message"
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            className="min-h-[200px] bg-zinc-900 border-zinc-700 text-zinc-100"
          />
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-zinc-300">Email Signature</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSignatureEditor(!showSignatureEditor)}
              className="bg-zinc-700 hover:bg-zinc-600"
            >
              <Code className="mr-2 h-4 w-4" />
              {showSignatureEditor ? 'Hide HTML Editor' : 'Edit HTML Signature'}
            </Button>
          </div>
          {showSignatureEditor ? (
            <Textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Paste your HTML signature here..."
              className="min-h-[150px] font-mono text-sm bg-zinc-900 border-zinc-700 text-zinc-100"
            />
          ) : (
            <div 
              className="p-4 bg-zinc-900 rounded-lg"
              dangerouslySetInnerHTML={{ __html: signature }}
            />
          )}
        </div>

        {showPreview && selectedStudents[previewIndex] && (
          <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-zinc-300">Preview</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPreview}
                  className="bg-zinc-700 hover:bg-zinc-600"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPreview}
                  className="bg-zinc-700 hover:bg-zinc-600"
                >
                  Next
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400 mb-1">From:</p>
                <p className="text-zinc-100">Future Scholars Database &lt;{process.env.SMTP_FROM || 'noreply@yourdomain.com'}&gt;</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Subject:</p>
                <p className="text-zinc-100">{getPreviewContent(selectedStudents[previewIndex]).previewSubject}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Message:</p>
                <div className="text-zinc-100">
                  <div className="whitespace-pre-wrap">{getPreviewContent(selectedStudents[previewIndex]).previewMessage}</div>
                  <div className="mt-4" dangerouslySetInnerHTML={{ __html: signature }} />
                </div>
              </div>
              <p className="text-sm text-zinc-400 mt-4">
                Previewing for: {selectedStudents[previewIndex].firstName} {selectedStudents[previewIndex].lastName}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-400 bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="text-emerald-400 bg-emerald-900/20 p-3 rounded-lg">
            Emails sent successfully!
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !selectedStudents.length}
            className="bg-emerald-600 hover:bg-emerald-700 text-zinc-100"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Emails
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 text-sm text-zinc-400">
          Recipients:
          <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
            {selectedStudents.map((student) => (
              <div key={student.id}>
                {student.firstName} {student.lastName} ({student.email})
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 