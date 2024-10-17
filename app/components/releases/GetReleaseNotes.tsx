// app/components/releases/GetReleaseNotes.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Tag, Calendar } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface Release {
  id: number
  name: string
  tag_name: string
  published_at: string
  body: string
}

const MarkdownComponents = {
  h1: (props: any) => <h1 className="text-2xl font-bold mt-6 mb-3" {...props} />,
  h2: (props: any) => <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />,
  h3: (props: any) => <h3 className="text-lg font-medium mt-3 mb-1" {...props} />,
  p: (props: any) => <p className="mb-3 text-gray-700 dark:text-gray-300" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside mb-3" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside mb-3" {...props} />,
  li: (props: any) => <li className="ml-4 mb-1" {...props} />,
  a: (props: any) => <a className="text-blue-500 hover:underline" {...props} />,
  code: (props: any) => <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm" {...props} />,
  pre: (props: any) => <pre className="bg-gray-100 dark:bg-gray-800 rounded p-3 overflow-x-auto my-3" {...props} />,
}

export function ReleaseNotesModal() {
  const [release, setRelease] = useState<Release | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchReleaseNotes = async () => {
      if (!open) return // Only fetch when the modal is opened
      setLoading(true)
      try {
        const response = await fetch('/api/get-releasenotes')
        if (!response.ok) {
          throw new Error('Failed to fetch release notes')
        }
        const data = await response.json()
        setRelease(data)
      } catch (err) {
        setError('Error fetching release notes')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchReleaseNotes()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Release Notes</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Release Notes</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[500px] pr-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : error ? (
            <div className="flex items-center space-x-2 text-red-500">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          ) : !release ? (
            <div className="text-center text-gray-500">No release notes available.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-start space-y-2">
                <h2 className="text-xl font-semibold">{release.name || release.tag_name}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Tag size={12} />
                    <span>{release.tag_name}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{new Date(release.published_at).toLocaleDateString()}</span>
                  </Badge>
                </div>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown components={MarkdownComponents}>
                  {release.body}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ReleaseNotesModal