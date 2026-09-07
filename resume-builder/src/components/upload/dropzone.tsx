'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { DocumentType } from '@/types'

interface UploadedFile {
  name: string
  size: number
  status: 'uploading' | 'done' | 'error'
  documentId?: string
}

interface DropzoneProps {
  documentType: DocumentType
  onUploadComplete?: (documentId: string, fileName: string) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  label?: string
  description?: string
}

export function Dropzone({
  documentType,
  onUploadComplete,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
  },
  maxFiles = 5,
  label = 'Drop files here or click to browse',
  description = 'Supports PDF, DOC, DOCX, TXT',
}: DropzoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((f) => ({
        name: f.name,
        size: f.size,
        status: 'uploading' as const,
      }))
      setFiles((prev) => [...prev, ...newFiles])

      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', documentType)

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          const data = await res.json()

          if (!res.ok) throw new Error(data.error || 'Upload failed')

          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name
                ? { ...f, status: 'done', documentId: data.documentId }
                : f
            )
          )
          onUploadComplete?.(data.documentId, file.name)
          toast({
            variant: 'success' as never,
            title: 'File uploaded',
            description: `${file.name} has been added to your profile.`,
          })
        } catch (err) {
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, status: 'error' } : f
            )
          )
          toast({
            variant: 'destructive',
            title: 'Upload failed',
            description: err instanceof Error ? err.message : 'Please try again.',
          })
        }
      }
    },
    [documentType, onUploadComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
  })

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 mb-3">
          <Upload className={cn('h-6 w-6', isDragActive ? 'text-indigo-600' : 'text-gray-400')} />
        </div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 shrink-0">
                <File className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <div className="shrink-0">
                {file.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                )}
                {file.status === 'done' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {file.status === 'error' && (
                  <button onClick={() => removeFile(file.name)}>
                    <X className="h-4 w-4 text-red-400 hover:text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
