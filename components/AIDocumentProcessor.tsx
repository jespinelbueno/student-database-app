"use client"

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DocumentAnalysis, StudentData } from '@/lib/students'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface AIDocumentProcessorProps {
  onProcessComplete: (data: StudentData) => void;
}

export function AIDocumentProcessor({ onProcessComplete }: AIDocumentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);

  const processDocument = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ai/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      const result: DocumentAnalysis = await response.json();
      setAnalysis(result);

      if (result.confidence > 0.8 && result.missingFields.length === 0) {
        onProcessComplete(result.extractedData);
      }
    } catch (error) {
      console.error('Error processing document:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await processDocument(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  });

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-zinc-100">AI Document Processing</CardTitle>
        <CardDescription className="text-zinc-400">
          Upload a student document to automatically extract information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900/80'}`}
        >
          <input {...getInputProps()} />
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-zinc-400">Processing document...</p>
            </div>
          ) : (
            <p className="text-zinc-400">
              {isDragActive
                ? "Drop the document here"
                : "Drag and drop a document, or click to select"}
            </p>
          )}
        </div>

        {analysis && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-100">Confidence Score</span>
              <span className={`font-mono ${analysis.confidence > 0.8 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                {Math.round(analysis.confidence * 100)}%
              </span>
            </div>

            {analysis.missingFields.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Missing Fields</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {analysis.missingFields.map((field) => (
                    <li key={field} className="text-zinc-400">• {field}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestedActions.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <h3 className="text-zinc-100 font-medium mb-2">Suggested Actions</h3>
                <ul className="space-y-1">
                  {analysis.suggestedActions.map((action, index) => (
                    <li key={index} className="text-zinc-400">• {action}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.confidence > 0.8 && analysis.missingFields.length === 0 && (
              <div className="flex items-center justify-center space-x-2 text-emerald-500">
                <CheckCircle className="h-4 w-4" />
                <span>Document processed successfully</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 