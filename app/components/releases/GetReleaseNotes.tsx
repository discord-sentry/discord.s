// app/components/releases/GetReleaseNotes.tsx

'use client'

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface Release {
  id: number;
  name: string;
  tag_name: string;
  published_at: string;
  body: string;
}

export function GetReleaseNotes() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReleaseNotes = async () => {
      try {
        const response = await fetch('/api/get-releasenotes');
        if (!response.ok) {
          throw new Error('Failed to fetch release notes');
        }
        const data = await response.json();
        setReleases(data);
      } catch (err) {
        setError('Error fetching release notes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReleaseNotes();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Release Notes</CardTitle>
          <CardDescription>Loading latest releases...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-12 mb-2" />
          <Skeleton className="w-full h-12 mb-2" />
          <Skeleton className="w-full h-12 mb-2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Release Notes</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Release Notes</CardTitle>
        <CardDescription>Latest updates and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <Accordion type="single" collapsible className="w-full">
            {releases.map((release) => (
              <AccordionItem key={release.id} value={release.id.toString()}>
                <AccordionTrigger>
                  {release.name || release.tag_name} - {new Date(release.published_at).toLocaleDateString()}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="whitespace-pre-wrap">{release.body}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


export default GetReleaseNotes;