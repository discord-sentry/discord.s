'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Server, ChevronDown, AlertCircle } from 'lucide-react'
import ServerConfigForm from '../components/config/GameServerSetup'
import { Toolbar } from './DashboardToolbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function DashboardContent() {
  const searchParams = useSearchParams()
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null)

  useEffect(() => {
    const serverId = searchParams.get('server')
    if (serverId) {
      setSelectedGuildId(serverId)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen p-8">
      <Alert className="mb-6 max-w-4xl mx-auto bg-[#2dd4bf] text-white border-[#2dd4bf]">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Loading Time Notice</AlertTitle>
        <AlertDescription>
          To avoid Discord API rate limits, loading your Discord channels may take 10 seconds or more. Please be patient.
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
          <Server className="h-8 w-8 text-primary" />
        </CardHeader>
        <CardContent>
          {selectedGuildId ? (
            <ServerConfigForm guildId={selectedGuildId} />
          ) : (
            <div className="text-center py-12">
              <Server className="h-16 w-16 text-primary mx-auto mb-4" />
              <CardDescription className="text-lg mb-2">
                No server selected
              </CardDescription>
              <p className="text-sm text-muted-foreground">
                Use the toolbar below to select a server to configure
              </p>
              <ChevronDown className="h-6 w-6 text-primary mx-auto mt-4 animate-bounce" />
            </div>
          )}
        </CardContent>
      </Card>
      <Toolbar/>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
